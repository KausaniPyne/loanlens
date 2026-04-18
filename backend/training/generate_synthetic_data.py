import numpy as np
import psycopg2
from psycopg2.extras import execute_values

N = 100000
np.random.seed(42)

print(f"Generating {N:,} synthetic loan portfolio records...")

# ──────────────────────────────────────────────────────────────
# 1. annual_income — Lognormal, mirrors Indian home loan borrowers
#    Median ~8.5L, range 3L–1Cr
# ──────────────────────────────────────────────────────────────
mu_income = np.log(850000)  # log-space mean → ~8.5L
sigma_income = 0.55
annual_income = np.random.lognormal(mu_income, sigma_income, N)
annual_income = np.clip(annual_income, 300000, 10000000)

# ──────────────────────────────────────────────────────────────
# 2. cibil_score — Mixture of two normals (prime + subprime borrowers)
#    ~75% prime cluster centered at 750, ~25% subprime centered at 650
# ──────────────────────────────────────────────────────────────
n_prime = int(N * 0.75)
n_subprime = N - n_prime
cibil_prime = np.random.normal(750, 40, n_prime)
cibil_subprime = np.random.normal(650, 50, n_subprime)
cibil_score = np.concatenate([cibil_prime, cibil_subprime])
np.random.shuffle(cibil_score)
cibil_score = np.clip(cibil_score, 300, 900).astype(int)

# ──────────────────────────────────────────────────────────────
# 3. loan_amount — Income multiplier (2x–7x annual income)
# ──────────────────────────────────────────────────────────────
multiplier = np.random.lognormal(1.5, 0.4, N)
multiplier = np.clip(multiplier, 2.0, 7.0)
loan_amount = annual_income * multiplier
loan_amount = np.clip(loan_amount, 500000, 50000000)

# ──────────────────────────────────────────────────────────────
# 4. property_value — Derived from LTV (50%–85%)
# ──────────────────────────────────────────────────────────────
ltv = np.random.beta(5, 2, N) * 0.40 + 0.50  # Beta-shaped, peaks ~72%
ltv = np.clip(ltv, 0.50, 0.90)
property_value = loan_amount / ltv

# ──────────────────────────────────────────────────────────────
# 5. loan_tenure_months — Categorical with realistic weights
# ──────────────────────────────────────────────────────────────
tenures = [120, 180, 240, 300]
weights = [0.15, 0.40, 0.35, 0.10]
loan_tenure_months = np.random.choice(tenures, size=N, p=weights)

# ──────────────────────────────────────────────────────────────
# 6. employment_type
# ──────────────────────────────────────────────────────────────
employment_types = [
    "SALARIED_PRIVATE", "SALARIED_PSU",
    "SELF_EMPLOYED_BUSINESS", "SELF_EMPLOYED_PROFESSIONAL", "GOVERNMENT"
]
emp_weights = [0.42, 0.10, 0.25, 0.13, 0.10]
employment_type = np.random.choice(employment_types, size=N, p=emp_weights)

# ──────────────────────────────────────────────────────────────
# 7. city_tier
# ──────────────────────────────────────────────────────────────
city_tiers = ["TIER_1", "TIER_2", "TIER_3"]
city_weights = [0.35, 0.40, 0.25]
city_tier = np.random.choice(city_tiers, size=N, p=city_weights)

# ──────────────────────────────────────────────────────────────
# 8. lender_type — Market share distribution
# ──────────────────────────────────────────────────────────────
lender_types = ["PSU_BANK", "PRIVATE_BANK", "HFC", "NBFC"]
lender_weights = [0.32, 0.38, 0.18, 0.12]
lender_type = np.random.choice(lender_types, size=N, p=lender_weights)

# ──────────────────────────────────────────────────────────────
# 9. disbursement_year — Recent years weighted
# ──────────────────────────────────────────────────────────────
disbursement_year = np.random.choice(
    range(2019, 2025), size=N,
    p=[0.08, 0.10, 0.14, 0.22, 0.28, 0.18]
)

# ──────────────────────────────────────────────────────────────
# 10. Derived metrics — EMI, DTI, LTV
# ──────────────────────────────────────────────────────────────
monthly_income = annual_income / 12
existing_emi_ratio = np.random.beta(2, 8, N) * 0.35 + 0.02  # Beta-shaped, most <15%
existing_obligations = monthly_income * existing_emi_ratio

r = 0.085 / 12  # proxy monthly rate for EMI estimation
n = loan_tenure_months
new_emi = loan_amount * r * (1 + r)**n / ((1 + r)**n - 1)

dti_ratio = (existing_obligations + new_emi) / monthly_income
dti_ratio = np.clip(dti_ratio, 0.05, 0.75)

ltv_ratio = loan_amount / property_value
ltv_ratio = np.clip(ltv_ratio, 0.30, 0.95)

# ──────────────────────────────────────────────────────────────
# 11. INTEREST RATE GENERATION — Multi-factor realistic pricing model
#     This is the ground-truth label the ML will learn to predict.
#     It mirrors how Indian banks actually price home loans.
# ──────────────────────────────────────────────────────────────

def generate_interest_rate(cibil, dti, ltv, emp, city, lender, year, income, loan_amt):
    # Base rate follows RBI repo rate + bank spread
    base_rate = 8.50

    # CIBIL Score — Primary determinant (nonlinear impact)
    if cibil >= 800:
        cibil_adj = -0.25
    elif cibil >= 750:
        cibil_adj = -0.10
    elif cibil >= 700:
        cibil_adj = 0.10
    elif cibil >= 650:
        cibil_adj = 0.35
    else:
        cibil_adj = 0.65 + max(0, (600 - cibil) / 50) * 0.20

    # DTI Ratio — Risk of overextension
    if dti <= 0.30:
        dti_adj = -0.05
    elif dti <= 0.40:
        dti_adj = 0.05
    elif dti <= 0.50:
        dti_adj = 0.15
    else:
        dti_adj = 0.30 + (dti - 0.50) * 2.0  # steep penalty above 50%

    # LTV Ratio — Skin in the game
    if ltv <= 0.60:
        ltv_adj = -0.10
    elif ltv <= 0.75:
        ltv_adj = 0.00
    elif ltv <= 0.80:
        ltv_adj = 0.08
    else:
        ltv_adj = 0.18 + (ltv - 0.80) * 1.5

    # Employment premium — Stability-based pricing
    emp_premium = {
        "GOVERNMENT": -0.15,
        "SALARIED_PSU": -0.08,
        "SALARIED_PRIVATE": 0.00,
        "SELF_EMPLOYED_PROFESSIONAL": 0.12,
        "SELF_EMPLOYED_BUSINESS": 0.22
    }[emp]

    # City tier — Metro discount
    city_premium = {"TIER_1": -0.05, "TIER_2": 0.03, "TIER_3": 0.10}[city]

    # Lender spread — Competitive pricing tiers
    lender_spread = {
        "PSU_BANK": -0.15,
        "PRIVATE_BANK": 0.00,
        "HFC": 0.18,
        "NBFC": 0.40
    }[lender]

    # Year adjustment — Rate cycle simulation
    year_adj = {
        2019: 0.15,   # Higher rates pre-COVID
        2020: -0.10,  # COVID cuts
        2021: -0.25,  # Deepest cuts
        2022: 0.10,   # Repo rate hike cycle begins
        2023: 0.35,   # Peak tightening
        2024: 0.20    # Slight easing
    }[year]

    # Loan ticket size impact — Large loans get slight negotiating power
    if loan_amt > 10000000:
        ticket_adj = -0.08
    elif loan_amt > 5000000:
        ticket_adj = -0.03
    elif loan_amt < 2000000:
        ticket_adj = 0.05
    else:
        ticket_adj = 0.00

    # Income strength — High earners negotiate harder
    if income > 3000000:
        income_adj = -0.06
    elif income > 1500000:
        income_adj = -0.02
    elif income < 600000:
        income_adj = 0.08
    else:
        income_adj = 0.00

    # Cross-factor interaction: Low CIBIL + High LTV = extra penalty
    if cibil < 700 and ltv > 0.80:
        interaction_penalty = 0.15
    elif cibil < 650 and dti > 0.45:
        interaction_penalty = 0.12
    else:
        interaction_penalty = 0.00

    rate = (base_rate + cibil_adj + dti_adj + ltv_adj
            + emp_premium + city_premium + lender_spread
            + year_adj + ticket_adj + income_adj + interaction_penalty)

    # Add realistic noise (~12bps std dev = bank-level discretion)
    noise = np.random.normal(0, 0.12)
    rate += noise

    return float(np.clip(rate, 6.50, 14.50))


print("Generating interest rates with multi-factor pricing model...")
interest_rate = np.array([
    generate_interest_rate(
        cibil_score[i], dti_ratio[i], ltv_ratio[i],
        employment_type[i], city_tier[i], lender_type[i],
        disbursement_year[i], annual_income[i], loan_amount[i]
    )
    for i in range(N)
])

# ──────────────────────────────────────────────────────────────
# 12. DATABASE INSERTION
# ──────────────────────────────────────────────────────────────
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

BATCH_SIZE = 2000
cur = conn.cursor()

# Clear existing data for idempotency
cur.execute("TRUNCATE TABLE loan_portfolio;")

for start in range(0, len(records), BATCH_SIZE):
    batch = records[start:start + BATCH_SIZE]
    execute_values(cur, INSERT_SQL, batch)
    conn.commit()
    if (start + BATCH_SIZE) % 10000 == 0 or start + BATCH_SIZE >= len(records):
        print(f"Inserted {min(start + BATCH_SIZE, len(records)):,} / {len(records):,}")

cur.close()
conn.close()

# Print distribution summary
print(f"\n{'='*60}")
print(f"DATA GENERATION SUMMARY")
print(f"{'='*60}")
print(f"Total records:     {N:,}")
print(f"Income range:      ₹{annual_income.min():,.0f} – ₹{annual_income.max():,.0f}")
print(f"CIBIL range:       {cibil_score.min()} – {cibil_score.max()}")
print(f"Interest rates:    {interest_rate.min():.2f}% – {interest_rate.max():.2f}% (mean {interest_rate.mean():.2f}%)")
print(f"Rate std dev:      {interest_rate.std():.3f}%")
print(f"LTV mean:          {ltv_ratio.mean():.2f}")
print(f"DTI mean:          {dti_ratio.mean():.2f}")
print(f"{'='*60}")
print("Data generation complete.")
