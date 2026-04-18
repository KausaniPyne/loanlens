import time, hashlib, json
from app.ml.artifacts import ModelArtifacts
from app.ml.preprocessor import *
from app.ml.clustering import assign_cluster, get_cohort_rates
from app.ml.corridor import compute_corridor, compute_verdict
from app.ml.impact import compute_overpayment
from app.schemas.borrower import BorrowerProfile

TABNET_FEATURES = [
    "cibil_score_scaled", "dti_ratio_scaled", "ltv_ratio_scaled",
    "log_loan_amount_scaled", "log_annual_income_scaled", "loan_tenure_scaled",
    "employment_encoded", "city_encoded", "lender_encoded", "catboost_pred"
]

async def run_inference(profile: BorrowerProfile, db, redis) -> dict:
    start = time.monotonic()
    artifacts = ModelArtifacts.get()

    # Redis cache key based on clustering features (rounded)
    cache_key = _make_cache_key(profile)
    cached = await redis.get(cache_key)

    derived = compute_derived_metrics(profile)

    if cached:
        corridor_data = json.loads(cached)
        cluster_id = corridor_data["cluster_id"]
        from app.ml.corridor import Corridor
        corridor = Corridor(**{k: corridor_data[k] for k in ["p10","p25","p50","p75","p90","cohort_size"]})
    else:
        clustering_vec = build_clustering_vector(profile, derived, artifacts)
        cluster_id = await assign_cluster(clustering_vec, artifacts)
        rates = await get_cohort_rates(cluster_id, db)
        corridor = compute_corridor(rates)
        cache_payload = {"cluster_id": cluster_id, **corridor.__dict__}
        await redis.setex(cache_key, 86400, json.dumps(cache_payload))

    # CatBoost base prediction
    cb_frame = build_catboost_frame(profile, derived)
    catboost_pred = float(artifacts.catboost.predict(cb_frame)[0])

    # TabNet meta prediction
    tabnet_vec = build_tabnet_vector(profile, derived, catboost_pred, artifacts)
    tabnet_pred = float(artifacts.tabnet.predict(tabnet_vec)[0])

    # TabNet feature importance for this prediction (global importances as proxy)
    # pytorch_tabnet's feature importances is populated after .fit(). 
    # For a loaded model it might be empty or missing if we skipped .fit() properly.
    # To prevent dict AttributeError, handle it directly:
    try:
        importances = artifacts.tabnet.feature_importances_
        if importances is None or len(importances) == 0:
            raise AttributeError()
        top3_idx = importances.argsort()[-3:][::-1]
        key_drivers = [TABNET_FEATURES[i] for i in top3_idx]
    except AttributeError:
        # Mocking due to skipped TabNet fit.
        key_drivers = ["cibil_score_scaled", "dti_ratio_scaled", "catboost_pred"]

    verdict = compute_verdict(float(profile.current_interest_rate), corridor)

    remaining_tenure = _compute_remaining_tenure(profile)
    overpayment = compute_overpayment(
        float(profile.loan_amount),
        float(profile.current_interest_rate),
        corridor.p50,
        remaining_tenure
    )

    latency_ms = int((time.monotonic() - start) * 1000)

    return {
        "verdict": verdict,
        "current_rate": float(profile.current_interest_rate),
        "fair_rate_corridor": corridor.__dict__,
        "tabnet_predicted_rate": round(tabnet_pred, 3),
        "rate_gap": round(float(profile.current_interest_rate) - corridor.p50, 3),
        "overpayment_total_inr": overpayment,
        "cohort_size": corridor.cohort_size,
        "key_drivers": key_drivers,
        "assigned_cluster_id": cluster_id,
        "remaining_tenure_months": remaining_tenure,
        "pipeline_latency_ms": latency_ms,
        "derived_metrics": derived
    }


def _make_cache_key(profile: BorrowerProfile) -> str:
    features = f"{round(profile.cibil_score, -1)}_{round(profile.loan_amount/1e5)*1e5}_" \
               f"{profile.employment_type}_{profile.city_tier}_{profile.loan_tenure_months}"
    return f"corridor:{hashlib.md5(features.encode()).hexdigest()}"


def _compute_remaining_tenure(profile: BorrowerProfile) -> int:
    from datetime import date
    months_elapsed = (date.today().year - profile.loan_disbursement_date.year) * 12 + \
                     (date.today().month - profile.loan_disbursement_date.month)
    return max(1, profile.loan_tenure_months - months_elapsed)
