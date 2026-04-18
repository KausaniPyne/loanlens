import numpy as np
import psycopg2
from psycopg2.extras import execute_values

N = 50000

# 1. annual_income
mu = 8.5      # log-space mean (approx 8.5L)
sigma = 0.55
annual_income = np.random.lognormal(mu, sigma, N)
annual_income = np.clip(annual_income, 300000, 10000000)

# 2. cibil_score
cibil_score = np.random.normal(730, 60, N).astype(int)
cibil_score = np.clip(cibil_score, 300, 900)

# 3. loan_amount
multiplier = np.random.lognormal(1.5, 0.4, N)
multiplier = np.clip(multiplier, 2.0, 7.0)
loan_amount = annual_income * multiplier
loan_amount = np.clip(loan_amount, 1000000, 50000000)

# 4. property_value
ltv = np.random.uniform(0.50, 0.85, N)
property_value = loan_amount / ltv

# 5. loan_tenure_months
tenures = [120, 180, 240]
weights = [0.20, 0.50, 0.30]
loan_tenure_months = np.random.choice(tenures, size=N, p=weights)

# 6. employment_type
employment_types = [
    "SALARIED_PRIVATE",
    "SALARIED_PSU",
    "SELF_EMPLOYED_BUSINESS",
    "SELF_EMPLOYED_PROFESSIONAL",
    "GOVERNMENT"
]
emp_weights = [0.45, 0.10, 0.25, 0.12, 0.08]
employment_type = np.random.choice(employment_types, size=N, p=emp_weights)

# 7. city_tier
city_tiers = ["TIER_1", "TIER_2", "TIER_3"]
city_weights = [0.35, 0.40, 0.25]
city_tier = np.random.choice(city_tiers, size=N, p=city_weights)

# 8. lender_type
lender_types = ["PSU_BANK", "PRIVATE_BANK", "HFC", "NBFC"]
lender_weights = [0.30, 0.40, 0.20, 0.10]
lender_type = np.random.choice(lender_types, size=N, p=lender_weights)

# 9. disbursement_year
disbursement_year = np.random.choice(range(2019, 2025), size=N,
                                      p=[0.10, 0.12, 0.15, 0.20, 0.25, 0.18])

# 10. Derived Metrics
monthly_income = annual_income / 12
existing_emi_ratio = np.random.uniform(0.05, 0.30, N)
existing_obligations = monthly_income * existing_emi_ratio

r = 0.085 / 12  
n = loan_tenure_months
new_emi = loan_amount * r * (1 + r)**n / ((1 + r)**n - 1)

dti_ratio = (existing_obligations + new_emi) / monthly_income
dti_ratio = np.clip(dti_ratio, 0.05, 0.75)

ltv_ratio = loan_amount / property_value
ltv_ratio = np.clip(ltv_ratio, 0.30, 0.95)

# 11. Interest Rate Generation
def generate_interest_rate(cibil, dti, ltv, employment, city, lender, year):
    base_rate = 8.50

    cibil_penalty = max(0, (750 - cibil) / 50) * 0.15
    dti_penalty = max(0, (dti - 0.35) / 0.05) * 0.10
    ltv_penalty = max(0, (ltv - 0.75) / 0.05) * 0.08

    emp_premium = {
        "GOVERNMENT": -0.10,
        "SALARIED_PSU": -0.05,
        "SALARIED_PRIVATE": 0.00,
        "SELF_EMPLOYED_PROFESSIONAL": 0.15,
        "SELF_EMPLOYED_BUSINESS": 0.20
    }[employment]

    city_premium = {"TIER_1": 0.00, "TIER_2": 0.05, "TIER_3": 0.10}[city]

    lender_spread = {
        "PSU_BANK": -0.15,
        "PRIVATE_BANK": 0.00,
        "HFC": 0.15,
        "NBFC": 0.35
    }[lender]

    year_adj = {2019: 0.10, 2020: 0.00, 2021: -0.15, 2022: 0.20, 2023: 0.40, 2024: 0.25}[year]

    rate = (base_rate + cibil_penalty + dti_penalty + ltv_penalty
            + emp_premium + city_premium + lender_spread + year_adj)

    noise = np.random.normal(0, 0.12)
    rate += noise

    return float(np.clip(rate, 6.50, 14.00))

print("Generating interest rates...")
interest_rate = np.array([
    generate_interest_rate(cibil_score[i], dti_ratio[i], ltv_ratio[i], 
                           employment_type[i], city_tier[i], lender_type[i], 
                           disbursement_year[i])
    for i in range(N)
])

# 12. Database Insertion
print("Connecting to database...")
conn = psycopg2.connect(
    host="postgres", port=5432,
    dbname="loadlens", user="loadlens", password="loadlens_secret"
)

records = [
    (
        float(annual_income[i]),
        int(cibil_score[i]),
        float(loan_amount[i]),
        float(property_value[i]),
        int(loan_tenure_months[i]),
        employment_type[i],
        city_tier[i],
        lender_type[i],
        float(interest_rate[i]),
        int(disbursement_year[i]),
        float(dti_ratio[i]),
        float(ltv_ratio[i])
    )
    for i in range(N)
]

INSERT_SQL = """
    INSERT INTO loan_portfolio
        (annual_income, cibil_score, loan_amount, property_value,
         loan_tenure_months, employment_type, city_tier, lender_type,
         interest_rate_offered, disbursement_year, dti_ratio, ltv_ratio)
    VALUES %s
"""

BATCH_SIZE = 1000
cur = conn.cursor()

# Clear table for idempotency
cur.execute("TRUNCATE TABLE loan_portfolio;")

for start in range(0, len(records), BATCH_SIZE):
    batch = records[start:start + BATCH_SIZE]
    execute_values(cur, INSERT_SQL, batch)
    conn.commit()
    print(f"Inserted {min(start + BATCH_SIZE, len(records))} / {len(records)}")

cur.close()
conn.close()
print("Data generation complete.")
