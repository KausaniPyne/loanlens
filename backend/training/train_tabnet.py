import os
import io
import json
import boto3
import pickle
import pandas as pd
import numpy as np
import psycopg2
from sklearn.metrics import mean_squared_error
from pytorch_tabnet.tab_model import TabNetRegressor
import torch

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
    df["record_id_str"] = df["record_id"].astype(str)
    conn.close()

    s3 = boto3.client(
        's3', endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY
    )
    
    print("Loading train/val split IDs...")
    train_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/train_record_ids.json")
    val_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/val_record_ids.json")
    test_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="splits/test_record_ids.json")
    
    train_ids = set(json.loads(train_resp['Body'].read().decode('utf-8')))
    val_ids = set(json.loads(val_resp['Body'].read().decode('utf-8')))
    test_ids = set(json.loads(test_resp['Body'].read().decode('utf-8')))
    
    print("Loading CatBoost predictions...")
    s3.download_file(settings.S3_BUCKET, "predictions/catboost_train_preds.parquet", "/tmp/t.parquet")
    cb_train = pd.read_parquet("/tmp/t.parquet")
    
    s3.download_file(settings.S3_BUCKET, "predictions/catboost_val_preds.parquet", "/tmp/v.parquet")
    cb_val = pd.read_parquet("/tmp/v.parquet")
    
    s3.download_file(settings.S3_BUCKET, "predictions/catboost_test_preds.parquet", "/tmp/te.parquet")
    cb_test = pd.read_parquet("/tmp/te.parquet")

    cb_preds = pd.concat([cb_train, cb_val, cb_test], ignore_index=True)
    df = df.merge(cb_preds, on="record_id_str", how="inner")

    print("Loading Scalers...")
    scaler_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key="scalers/scaler_bundle.pkl")
    bundle = pickle.loads(scaler_resp['Body'].read())
    
    scaler_cibil = bundle["cibil"]
    scaler_dti = bundle["dti"]
    scaler_ltv = bundle["ltv"]
    scaler_log_loan = bundle["log_loan"]
    scaler_log_income = bundle["log_income"]
    scaler_tenure = bundle["tenure"]
    EMPLOYMENT_ORDER = bundle["employment_map"]
    CITY_ORDER = bundle["city_map"]
    LENDER_ORDER = bundle["lender_map"]

    df["employment_encoded"] = df["employment_type"].map(EMPLOYMENT_ORDER)
    df["city_encoded"] = df["city_tier"].map(CITY_ORDER)
    df["lender_encoded"] = df["lender_type"].map(LENDER_ORDER)
    df["log_loan_amount"] = np.log(df["loan_amount"].astype(float))
    df["log_annual_income"] = np.log(df["annual_income"].astype(float))
    df["dti_ratio_clipped"] = df["dti_ratio"].clip(upper=0.60)
    
    df["cibil_score_scaled"] = scaler_cibil.transform(df[["cibil_score"]])
    df["dti_ratio_scaled"] = scaler_dti.transform(df[["dti_ratio_clipped"]])
    df["ltv_ratio_scaled"] = scaler_ltv.transform(df[["ltv_ratio"]])
    df["log_loan_amount_scaled"] = scaler_log_loan.transform(df[["log_loan_amount"]])
    df["log_annual_income_scaled"] = scaler_log_income.transform(df[["log_annual_income"]])
    df["loan_tenure_scaled"] = scaler_tenure.transform(df[["loan_tenure_months"]])

    TABNET_FEATURES = [
        "cibil_score_scaled",
        "dti_ratio_scaled",
        "ltv_ratio_scaled",
        "log_loan_amount_scaled",
        "log_annual_income_scaled",
        "loan_tenure_scaled",
        "employment_encoded",
        "city_encoded",
        "lender_encoded",
        "catboost_pred"
    ]
    TARGET = "interest_rate_offered"

    train_df = df[df["record_id_str"].isin(train_ids)].copy()
    val_df = df[df["record_id_str"].isin(val_ids)].copy()
    
    # FULL dataset — no subsampling
    X_train = train_df[TABNET_FEATURES].astype(float)
    y_train = train_df[TARGET].astype(float)
    X_val = val_df[TABNET_FEATURES].astype(float)
    y_val = val_df[TARGET].astype(float)

    print(f"Training TabNet on {len(X_train):,} records, validating on {len(X_val):,}...")
    
    tabnet = TabNetRegressor(
        n_d=32,
        n_a=32,
        n_steps=5,
        gamma=1.5,
        n_independent=2,
        n_shared=2,
        lambda_sparse=1e-4,
        optimizer_fn=torch.optim.Adam,
        optimizer_params={"lr": 2e-3},
        scheduler_fn=torch.optim.lr_scheduler.StepLR,
        scheduler_params={"step_size": 15, "gamma": 0.9},
        mask_type="entmax",
        verbose=10,
        seed=42
    )

    tabnet.fit(
        X_train=X_train.values,
        y_train=y_train.values.reshape(-1, 1),
        eval_set=[(X_val.values, y_val.values.reshape(-1, 1))],
        eval_name=["val"],
        eval_metric=["rmse"],
        max_epochs=100,
        patience=15,
        batch_size=2048,
        virtual_batch_size=256,
        num_workers=0,
        drop_last=False
    )

    print("Saving TabNet model...")
    tabnet.save_model("/tmp/tabnet_model")
    s3.upload_file("/tmp/tabnet_model.zip", settings.S3_BUCKET, "models/tabnet_model.zip")

    print("Saving feature importances...")
    importances = tabnet.feature_importances_
    importance_dict = dict(zip(TABNET_FEATURES, importances.tolist()))
    s3.put_object(Bucket=settings.S3_BUCKET, Key="models/feature_importances.json", Body=json.dumps(importance_dict))

    # Evaluate on validation set
    val_preds = tabnet.predict(X_val.values).flatten()
    val_rmse = mean_squared_error(y_val.values, val_preds, squared=False)
    
    # Quick sanity check on prediction range
    print(f"\n{'='*50}")
    print(f"TabNet Stacked Val RMSE:  {val_rmse:.4f}%")
    print(f"Prediction range:        {val_preds.min():.2f}% – {val_preds.max():.2f}%")
    print(f"Actual range:            {y_val.min():.2f}% – {y_val.max():.2f}%")
    print(f"Mean prediction:         {val_preds.mean():.3f}%")
    print(f"Mean actual:             {y_val.mean():.3f}%")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
