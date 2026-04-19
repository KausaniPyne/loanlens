from sqlalchemy import text
from fastapi import HTTPException
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
    try:
        import uuid as _uuid
        _uuid.UUID(audit_id)  # validate format
    except ValueError:
        raise HTTPException(status_code=404, detail="Invalid audit ID format")

    result = await db.execute(text("SELECT * FROM audits WHERE audit_id = :aid"), {"aid": audit_id})
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    row_dict = dict(row._mapping)
    
    # Reconstruct nested objects to match the API response schema
    import json
    key_drivers = []
    if row_dict.get("key_drivers"):
        if isinstance(row_dict["key_drivers"], str):
            key_drivers = json.loads(row_dict["key_drivers"])
        else:
            key_drivers = row_dict["key_drivers"]
            
    transformed = {
        "audit_id": row_dict["audit_id"],
        "verdict": row_dict["verdict"],
        "current_rate": row_dict["current_interest_rate"],
        "fair_rate_corridor": {
            "p10": row_dict["fair_rate_p10"],
            "p25": row_dict["fair_rate_p25"],
            "p50": row_dict["fair_rate_p50"],
            "p75": row_dict["fair_rate_p75"],
            "p90": row_dict["fair_rate_p90"],
            "cohort_size": row_dict["cohort_size"]
        },
        "tabnet_predicted_rate": row_dict["tabnet_predicted_rate"],
        "rate_gap": row_dict["rate_gap"],
        "overpayment_total_inr": row_dict["overpayment_total_inr"],
        "cohort_size": row_dict["cohort_size"],
        "key_drivers": key_drivers,
        "pipeline_latency_ms": row_dict["pipeline_latency_ms"] or 0,
        "remaining_tenure_months": row_dict["remaining_tenure_months"],
        "derived_metrics": {
            "ltv_ratio": row_dict["ltv_ratio"],
            "dti_ratio": row_dict["dti_ratio"]
        }
    }
    
    # Reconstruct action playbook if it's RED (or fetch dynamically, but here we can just rebuild it or we omitted saving playbook to db?)
    # Wait, the playbook is generated dynamically if missing in the frontend or we can just regenerate it here
    if transformed["verdict"] == "RED":
        from app.schemas.borrower import BorrowerProfile
        from app.services.negotiation_service import build_playbook
        # We need a dummy profile with the basics we saved
        dummy_profile = BorrowerProfile(
            annual_income=row_dict["annual_income"],
            cibil_score=row_dict["cibil_score"],
            loan_amount=row_dict["loan_amount"],
            property_value=row_dict["property_value"],
            loan_tenure_months=row_dict["loan_tenure_months"],
            employment_type=row_dict["employment_type"],
            city_tier=row_dict["city_tier"],
            current_interest_rate=row_dict["current_interest_rate"],
            loan_disbursement_date="2020-01-01",  # dummy for signature
            existing_obligations_monthly=1000
        )
        transformed["action_playbook"] = build_playbook(dummy_profile, transformed)

    return transformed
