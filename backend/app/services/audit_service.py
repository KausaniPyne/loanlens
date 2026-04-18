from sqlalchemy import text
from app.ml.pipeline import run_inference
from app.services.negotiation_service import build_playbook
from app.schemas.borrower import BorrowerProfile
import uuid
import json

async def create_audit(profile: BorrowerProfile, db, redis) -> dict:
    result = await run_inference(profile, db, redis)
    audit_id = str(uuid.uuid4())

    if result["verdict"] == "RED":
        result["action_playbook"] = build_playbook(profile, result)

    # Persist to audits table
    await db.execute(text("""
        INSERT INTO audits
            (audit_id, annual_income, cibil_score, loan_amount, property_value,
             loan_tenure_months, employment_type, city_tier, current_interest_rate,
             remaining_tenure_months, dti_ratio, ltv_ratio, assigned_cluster_id,
             cohort_size, fair_rate_p10, fair_rate_p25, fair_rate_p50,
             fair_rate_p75, fair_rate_p90, tabnet_predicted_rate, verdict,
             rate_gap, overpayment_total_inr, key_drivers, pipeline_latency_ms)
        VALUES
            (:audit_id, :annual_income, :cibil_score, :loan_amount, :property_value,
             :loan_tenure_months, :employment_type, :city_tier, :current_interest_rate,
             :remaining_tenure_months, :dti_ratio, :ltv_ratio, :assigned_cluster_id,
             :cohort_size, :p10, :p25, :p50, :p75, :p90,
             :tabnet_predicted_rate, :verdict, :rate_gap, :overpayment_total_inr,
             :key_drivers, :latency_ms)
    """), {
        "audit_id": audit_id,
        "annual_income": profile.annual_income,
        "cibil_score": profile.cibil_score,
        "loan_amount": float(profile.loan_amount),
        "property_value": float(profile.property_value),
        "loan_tenure_months": profile.loan_tenure_months,
        "employment_type": profile.employment_type.value,
        "city_tier": profile.city_tier.value,
        "current_interest_rate": float(profile.current_interest_rate),
        "remaining_tenure_months": result["remaining_tenure_months"],
        "dti_ratio": result["derived_metrics"]["dti_ratio"],
        "ltv_ratio": result["derived_metrics"]["ltv_ratio"],
        "assigned_cluster_id": result["assigned_cluster_id"],
        "cohort_size": result["cohort_size"],
        "p10": result["fair_rate_corridor"]["p10"],
        "p25": result["fair_rate_corridor"]["p25"],
        "p50": result["fair_rate_corridor"]["p50"],
        "p75": result["fair_rate_corridor"]["p75"],
        "p90": result["fair_rate_corridor"]["p90"],
        "tabnet_predicted_rate": result["tabnet_predicted_rate"],
        "verdict": result["verdict"],
        "rate_gap": result["rate_gap"],
        "overpayment_total_inr": result["overpayment_total_inr"],
        "key_drivers": json.dumps(result["key_drivers"]),
        "latency_ms": result["pipeline_latency_ms"]
    })
    await db.commit()

    return {"audit_id": audit_id, **result}


async def fetch_audit(audit_id: str, db):
    result = await db.execute(text("SELECT * FROM audits WHERE audit_id = :aid"), {"aid": audit_id})
    row = result.fetchone()
    if not row:
        return {"error": "Audit not found"}
        
    return dict(row._mapping)
