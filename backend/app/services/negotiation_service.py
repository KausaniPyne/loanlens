from app.schemas.borrower import BorrowerProfile
from app.ml.impact import compute_balance_transfer_breakeven

BALANCE_TRANSFER_LENDERS = [
    {"lender": "SBI", "indicative_rate": 8.15, "processing_fee_pct": 0.35, "prepayment_penalty_pct": 0.0},
    {"lender": "HDFC Bank", "indicative_rate": 8.25, "processing_fee_pct": 0.50, "prepayment_penalty_pct": 0.0},
    {"lender": "ICICI Bank", "indicative_rate": 8.30, "processing_fee_pct": 0.50, "prepayment_penalty_pct": 0.0},
]

def build_playbook(profile: BorrowerProfile, inference_result: dict) -> dict:
    current_rate = float(profile.current_interest_rate)
    median_rate = float(inference_result["fair_rate_corridor"]["p50"])
    loan_amount = float(profile.loan_amount)
    remaining = inference_result["remaining_tenure_months"]

    negotiation_script = (
        f"Dear {profile.lender_name or 'Relationship Manager'},\n\n"
        f"I am writing to formally request a review of my current home loan interest rate of {current_rate}%. "
        f"A benchmarking analysis of {inference_result['cohort_size']} borrowers with profiles similar to mine "
        f"(CIBIL {profile.cibil_score}, LTV {round(inference_result['derived_metrics']['ltv_ratio']*100,1)}%, "
        f"{profile.employment_type.replace('_',' ').title()}) indicates a median market rate of {median_rate}%. "
        f"This represents a gap of {round(current_rate - median_rate, 2)}%, costing me approximately "
        f"INR {int(inference_result['overpayment_total_inr']):,} over my remaining tenure of {remaining} months. "
        f"I request an immediate rate revision to at least {median_rate}% failing which I will proceed with "
        f"a balance transfer to a competing lender offering rates in this range.\n\nRegards"
    )

    bt_options = []
    for lender_info in BALANCE_TRANSFER_LENDERS:
        if lender_info["indicative_rate"] < current_rate:
            bt = compute_balance_transfer_breakeven(
                loan_amount, current_rate, lender_info["indicative_rate"],
                remaining, lender_info["processing_fee_pct"], lender_info["prepayment_penalty_pct"]
            )
            bt_options.append({**lender_info, **bt})

    cibil_roadmap = _build_cibil_roadmap(profile.cibil_score)

    return {
        "negotiation_script": {"script_text": negotiation_script, "lender_name": profile.lender_name},
        "balance_transfer_options": bt_options,
        "cibil_roadmap": cibil_roadmap
    }

def _build_cibil_roadmap(current_score: int) -> dict:
    if current_score >= 800:
        return {"current_score": current_score, "message": "CIBIL is already in the excellent band."}
    target = min(current_score + 40, 800)
    steps = []
    if current_score < 750:
        steps.append("Reduce revolving credit utilization to below 30% of your credit limit within 30 days.")
    steps.append("Check your CIBIL report for any erroneous entries and dispute them via the TransUnion portal.")
    steps.append("Do not apply for any new credit products for the next 90 days.")
    steps.append("Ensure all existing EMIs and credit card dues are paid on or before the due date.")
    return {"current_score": current_score, "target_score": target, "steps": steps, "timeline_days": 90}
