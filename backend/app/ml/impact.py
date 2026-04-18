import numpy as np

def compute_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    r = annual_rate / 12 / 100
    n = tenure_months
    return principal * r * (1 + r)**n / ((1 + r)**n - 1)

def compute_total_interest(principal: float, annual_rate: float, tenure_months: int) -> float:
    emi = compute_emi(principal, annual_rate, tenure_months)
    return round(emi * tenure_months - principal, 2)

def compute_overpayment(
    loan_amount: float,
    current_rate: float,
    fair_rate: float,
    remaining_tenure: int
) -> float:
    interest_current = compute_total_interest(loan_amount, current_rate, remaining_tenure)
    interest_fair = compute_total_interest(loan_amount, fair_rate, remaining_tenure)
    return round(max(0.0, interest_current - interest_fair), 2)

def compute_balance_transfer_breakeven(
    loan_amount: float,
    current_rate: float,
    target_rate: float,
    remaining_tenure: int,
    processing_fee_pct: float,
    prepayment_penalty_pct: float
) -> dict:
    monthly_saving = (
        compute_emi(loan_amount, current_rate, remaining_tenure) -
        compute_emi(loan_amount, target_rate, remaining_tenure)
    )
    total_switching_cost = loan_amount * (processing_fee_pct + prepayment_penalty_pct) / 100
    breakeven_months = int(np.ceil(total_switching_cost / monthly_saving)) if monthly_saving > 0 else 999
    total_savings = monthly_saving * remaining_tenure - total_switching_cost

    return {
        "monthly_saving": round(monthly_saving, 2),
        "total_switching_cost": round(total_switching_cost, 2),
        "breakeven_months": breakeven_months,
        "total_savings_post_breakeven": round(max(0.0, total_savings), 2)
    }
