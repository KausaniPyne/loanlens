CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS loan_portfolio (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annual_income NUMERIC(15,2) NOT NULL,
    cibil_score INT NOT NULL,
    loan_amount NUMERIC(15,2) NOT NULL,
    property_value NUMERIC(15,2) NOT NULL,
    loan_tenure_months INT NOT NULL,
    employment_type VARCHAR(40) NOT NULL,
    city_tier VARCHAR(10) NOT NULL,
    lender_type VARCHAR(20) NOT NULL,
    interest_rate_offered NUMERIC(5,3) NOT NULL,
    disbursement_year INT NOT NULL,
    dti_ratio NUMERIC(5,4),
    ltv_ratio NUMERIC(5,4),
    cluster_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_cluster ON loan_portfolio(cluster_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_cibil ON loan_portfolio(cibil_score);

CREATE TABLE IF NOT EXISTS audits (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    annual_income NUMERIC(15,2),
    cibil_score INT,
    loan_amount NUMERIC(15,2),
    property_value NUMERIC(15,2),
    loan_tenure_months INT,
    employment_type VARCHAR(40),
    city_tier VARCHAR(10),
    current_interest_rate NUMERIC(5,3),
    remaining_tenure_months INT,
    dti_ratio NUMERIC(5,4),
    ltv_ratio NUMERIC(5,4),
    assigned_cluster_id INT,
    cohort_size INT,
    fair_rate_p10 NUMERIC(5,3),
    fair_rate_p25 NUMERIC(5,3),
    fair_rate_p50 NUMERIC(5,3),
    fair_rate_p75 NUMERIC(5,3),
    fair_rate_p90 NUMERIC(5,3),
    tabnet_predicted_rate NUMERIC(5,3),
    verdict VARCHAR(10),
    rate_gap NUMERIC(5,3),
    overpayment_total_inr NUMERIC(15,2),
    key_drivers JSONB,
    model_version VARCHAR(20),
    pipeline_latency_ms INT
);

CREATE TABLE IF NOT EXISTS model_versions (
    version_id VARCHAR(20) PRIMARY KEY,
    catboost_s3_path TEXT,
    tabnet_s3_path TEXT,
    kmeans_s3_path TEXT,
    scaler_s3_path TEXT,
    trained_at TIMESTAMPTZ,
    training_records INT,
    catboost_rmse NUMERIC(6,4),
    tabnet_rmse NUMERIC(6,4),
    is_active BOOLEAN DEFAULT FALSE
);
