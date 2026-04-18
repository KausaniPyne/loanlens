import numpy as np
from app.schemas.borrower import BorrowerProfile
from app.ml.artifacts import ModelArtifacts

def compute_derived_metrics(profile: BorrowerProfile) -> dict:
    r = 0.085 / 12  # neutral rate for EMI computation
    n = profile.loan_tenure_months
    P = float(profile.loan_amount)
    emi = P * r * (1 + r)**n / ((1 + r)**n - 1)

    monthly_income = float(profile.annual_income) / 12
    dti = (float(profile.existing_obligations_monthly) + emi) / monthly_income
    dti = float(np.clip(dti, 0.05, 0.75))

    ltv = float(profile.loan_amount) / float(profile.property_value)
    ltv = float(np.clip(ltv, 0.30, 0.95))

    return {"dti_ratio": dti, "ltv_ratio": ltv, "computed_emi": emi}


def build_clustering_vector(profile: BorrowerProfile, derived: dict, artifacts: ModelArtifacts) -> np.ndarray:
    sb = artifacts.scaler_bundle
    cibil_s = sb["cibil"].transform([[profile.cibil_score]])[0][0]
    dti_s = sb["dti"].transform([[min(derived["dti_ratio"], 0.60)]])[0][0]
    ltv_s = sb["ltv"].transform([[derived["ltv_ratio"]]])[0][0]
    log_loan = np.log(float(profile.loan_amount))
    log_loan_s = sb["log_loan"].transform([[log_loan]])[0][0]
    emp_enc = float(sb["employment_map"][profile.employment_type])
    city_enc = float(sb["city_map"][profile.city_tier])

    return np.array([[cibil_s, dti_s, ltv_s, log_loan_s, emp_enc, city_enc]])


def build_catboost_frame(profile: BorrowerProfile, derived: dict):
    import pandas as pd
    return pd.DataFrame([{
        "cibil_score": profile.cibil_score,
        "dti_ratio": derived["dti_ratio"],
        "ltv_ratio": derived["ltv_ratio"],
        "loan_amount": float(profile.loan_amount),
        "annual_income": float(profile.annual_income),
        "loan_tenure_months": profile.loan_tenure_months,
        "employment_type": profile.employment_type,
        "city_tier": profile.city_tier,
        "lender_type": "PRIVATE_BANK",  # unknown at audit time, use modal default
        "disbursement_year": profile.loan_disbursement_date.year
    }])


def build_tabnet_vector(profile: BorrowerProfile, derived: dict, catboost_pred: float, artifacts: ModelArtifacts) -> np.ndarray:
    sb = artifacts.scaler_bundle
    cibil_s = sb["cibil"].transform([[profile.cibil_score]])[0][0]
    dti_s = sb["dti"].transform([[min(derived["dti_ratio"], 0.60)]])[0][0]
    ltv_s = sb["ltv"].transform([[derived["ltv_ratio"]]])[0][0]
    log_loan_s = sb["log_loan"].transform([[np.log(float(profile.loan_amount))]])[0][0]
    log_inc_s = sb["log_income"].transform([[np.log(float(profile.annual_income))]])[0][0]
    tenure_s = sb["tenure"].transform([[profile.loan_tenure_months]])[0][0]
    emp_enc = float(sb["employment_map"][profile.employment_type])
    city_enc = float(sb["city_map"][profile.city_tier])
    lender_enc = float(sb["lender_map"].get("PRIVATE_BANK", 1))

    return np.array([[cibil_s, dti_s, ltv_s, log_loan_s, log_inc_s, tenure_s,
                      emp_enc, city_enc, lender_enc, catboost_pred]])
