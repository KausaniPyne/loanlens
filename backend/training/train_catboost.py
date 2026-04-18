import os
import json
import boto3
import pandas as pd
import psycopg2
from catboost import CatBoostRegressor, Pool
from sklearn.metrics import mean_squared_error

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

def main():
    print("Connecting to DB and loading data...")
    conn = psycopg2.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
    query = """
        SELECT record_id, cibil_score, dti_ratio, ltv_ratio, loan_amount, 
               annual_income, loan_tenure_months, employment_type, city_tier, 
               lender_type, interest_rate_offered, disbursement_year
        FROM loan_portfolio
    """
    df = pd.read_sql(query, conn)
    
    s3 = boto3.client(
        's3', endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY
    )
    
    # Load record IDs from MinIO
    print("Loading train/val split IDs from MinIO...")
    train_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/train_record_ids.json")
    val_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/val_record_ids.json")
    test_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/test_record_ids.json")
    
    train_ids = set(json.loads(train_resp['Body'].read().decode('utf-8')))
    val_ids = set(json.loads(val_resp['Body'].read().decode('utf-8')))
    test_ids = set(json.loads(test_resp['Body'].read().decode('utf-8')))

    df["record_id_str"] = df["record_id"].astype(str)
    train_df = df[df["record_id_str"].isin(train_ids)].copy()
    val_df = df[df["record_id_str"].isin(val_ids)].copy()
    test_df = df[df["record_id_str"].isin(test_ids)].copy()

    CATBOOST_FEATURES = [
        "cibil_score", "dti_ratio", "ltv_ratio", "loan_amount", 
        "annual_income", "loan_tenure_months", "employment_type", 
        "city_tier", "lender_type", "disbursement_year"
    ]
    CAT_FEATURES = ["employment_type", "city_tier", "lender_type"]
    TARGET = "interest_rate_offered"

    train_pool = Pool(
        data=train_df[CATBOOST_FEATURES],
        label=train_df[TARGET],
        cat_features=CAT_FEATURES
    )

    val_pool = Pool(
        data=val_df[CATBOOST_FEATURES],
        label=val_df[TARGET],
        cat_features=CAT_FEATURES
    )

    print("Training CatBoostRegressor...")
    model = CatBoostRegressor(
        iterations=1000,
        learning_rate=0.05,
        depth=6,
        loss_function="RMSE",
        eval_metric="RMSE",
        early_stopping_rounds=50,
        random_seed=42,
        verbose=100
    )

    model.fit(train_pool, eval_set=val_pool)

    print("Generating predictions...")
    train_df["catboost_pred"] = model.predict(train_df[CATBOOST_FEATURES])
    val_df["catboost_pred"] = model.predict(val_df[CATBOOST_FEATURES])
    test_df["catboost_pred"] = model.predict(test_df[CATBOOST_FEATURES])

    print("Saving predictions to MinIO...")
    train_df[["record_id_str", "catboost_pred"]].to_parquet("/tmp/catboost_train_preds.parquet")
    val_df[["record_id_str", "catboost_pred"]].to_parquet("/tmp/catboost_val_preds.parquet")
    test_df[["record_id_str", "catboost_pred"]].to_parquet("/tmp/catboost_test_preds.parquet")

    s3.upload_file("/tmp/catboost_train_preds.parquet", settings.S3_BUCKET, "predictions/catboost_train_preds.parquet")
    s3.upload_file("/tmp/catboost_val_preds.parquet", settings.S3_BUCKET, "predictions/catboost_val_preds.parquet")
    s3.upload_file("/tmp/catboost_test_preds.parquet", settings.S3_BUCKET, "predictions/catboost_test_preds.parquet")

    print("Saving model to MinIO...")
    model.save_model("/tmp/catboost_model.cbm")
    s3.upload_file("/tmp/catboost_model.cbm", settings.S3_BUCKET, "models/catboost_model.cbm")

    val_rmse = mean_squared_error(val_df[TARGET], val_df["catboost_pred"], squared=False)
    print(f"CatBoost Val RMSE: {val_rmse:.4f}%")

if __name__ == "__main__":
    main()
