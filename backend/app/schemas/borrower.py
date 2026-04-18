from pydantic import BaseModel, Field, field_validator
from enum import Enum
from datetime import date

class EmploymentType(str, Enum):
    SALARIED_PRIVATE = "SALARIED_PRIVATE"
    SALARIED_PSU = "SALARIED_PSU"
    SELF_EMPLOYED_BUSINESS = "SELF_EMPLOYED_BUSINESS"
    SELF_EMPLOYED_PROFESSIONAL = "SELF_EMPLOYED_PROFESSIONAL"
    GOVERNMENT = "GOVERNMENT"

class CityTier(str, Enum):
    TIER_1 = "TIER_1"
    TIER_2 = "TIER_2"
    TIER_3 = "TIER_3"

class BorrowerProfile(BaseModel):
    annual_income: float = Field(..., ge=100000, le=100000000)
    cibil_score: int = Field(..., ge=300, le=900)
    loan_amount: float = Field(..., ge=100000, le=50000000)
    property_value: float = Field(..., ge=100000, le=200000000)
    loan_tenure_months: int = Field(..., ge=12, le=360)
    employment_type: EmploymentType
    city_tier: CityTier
    current_interest_rate: float = Field(..., ge=5.0, le=20.0)
    loan_disbursement_date: date
    existing_obligations_monthly: float = Field(..., ge=0, le=10000000)
    lender_name: str | None = None

    @field_validator("property_value")
    @classmethod
    def property_must_exceed_loan(cls, v, info):
        if "loan_amount" in info.data and v < info.data["loan_amount"]:
            raise ValueError("property_value must be greater than or equal to loan_amount")
        return v

    @field_validator("loan_disbursement_date")
    @classmethod
    def date_must_be_past(cls, v):
        if v >= date.today():
            raise ValueError("loan_disbursement_date must be in the past")
        return v
