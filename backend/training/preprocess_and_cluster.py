import os
import json
import pickle
import io
import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split
import boto3

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

def main():
    print("Connecting to DB...")
    # use psycopg2 string mapping (remove asyncpg dialect part)
    db_url = settings.DATABASE_URL.replace('+asyncpg', '')
    conn = psycopg2.connect(db_url)
    
    query = """
        SELECT record_id, cibil_score, dti_ratio, ltv_ratio, loan_amount, 
               annual_income, loan_tenure_months, employment_type, city_tier, 
               lender_type, interest_rate_offered, disbursement_year
        FROM loan_portfolio
    """
    df = pd.read_sql(query, conn)
    
    # Feature engineering
    EMPLOYMENT_ORDER = {
        "GOVERNMENT": 0, "SALARIED_PSU": 1, "SALARIED_PRIVATE": 2,
        "SELF_EMPLOYED_PROFESSIONAL": 3, "SELF_EMPLOYED_BUSINESS": 4
    }
    CITY_ORDER = {"TIER_1": 0, "TIER_2": 1, "TIER_3": 2}
    LENDER_ORDER = {"PSU_BANK": 0, "PRIVATE_BANK": 1, "HFC": 2, "NBFC": 3}
    
    df["employment_encoded"] = df["employment_type"].map(EMPLOYMENT_ORDER)
    df["city_encoded"] = df["city_tier"].map(CITY_ORDER)
    df["lender_encoded"] = df["lender_type"].map(LENDER_ORDER)
    df["log_loan_amount"] = np.log(df["loan_amount"].astype(float))
    df["log_annual_income"] = np.log(df["annual_income"].astype(float))
    df["dti_ratio_clipped"] = df["dti_ratio"].clip(upper=0.60)
    
    print("Splitting data...")
    train_df, temp_df = train_test_split(df, test_size=0.30, stratify=df["lender_type"], random_state=42)
    val_df, test_df = train_test_split(temp_df, test_size=0.50, stratify=temp_df["lender_type"], random_state=42)

    s3 = boto3.client(
        's3', endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY
    )
    
    # Create bucket if it doesn't exist
    try:
        s3.head_bucket(Bucket=settings.S3_BUCKET)
    except:
        s3.create_bucket(Bucket=settings.S3_BUCKET)

    print("Saving split IDs...")
    s3.put_object(Bucket=settings.S3_BUCKET, Key="splits/train_record_ids.json", Body=json.dumps(train_df["record_id"].astype(str).tolist()))
    s3.put_object(Bucket=settings.S3_BUCKET, Key="splits/val_record_ids.json", Body=json.dumps(val_df["record_id"].astype(str).tolist()))
    s3.put_object(Bucket=settings.S3_BUCKET, Key="splits/test_record_ids.json", Body=json.dumps(test_df["record_id"].astype(str).tolist()))

    print("Fitting Scalers...")
    scaler_cibil = StandardScaler()
    scaler_dti = StandardScaler()
    scaler_ltv = StandardScaler()
    scaler_log_loan = StandardScaler()
    scaler_log_income = StandardScaler()
    scaler_tenure = StandardScaler()

    train_df["cibil_score_scaled"] = scaler_cibil.fit_transform(train_df[["cibil_score"]])
    train_df["dti_ratio_scaled"] = scaler_dti.fit_transform(train_df[["dti_ratio_clipped"]])
    train_df["ltv_ratio_scaled"] = scaler_ltv.fit_transform(train_df[["ltv_ratio"]])
    train_df["log_loan_amount_scaled"] = scaler_log_loan.fit_transform(train_df[["log_loan_amount"]])
    train_df["log_annual_income_scaled"] = scaler_log_income.fit_transform(train_df[["log_annual_income"]])
    train_df["loan_tenure_scaled"] = scaler_tenure.fit_transform(train_df[["loan_tenure_months"]])
    
    scaler_bundle = {
        "cibil": scaler_cibil, "dti": scaler_dti, "ltv": scaler_ltv,
        "log_loan": scaler_log_loan, "log_income": scaler_log_income, "tenure": scaler_tenure,
        "employment_map": EMPLOYMENT_ORDER, "city_map": CITY_ORDER, "lender_map": LENDER_ORDER
    }
    s3.put_object(Bucket=settings.S3_BUCKET, Key="scalers/scaler_bundle.pkl", Body=pickle.dumps(scaler_bundle))

    print("Running KMeans...")
    CLUSTERING_FEATURES = [
        "cibil_score_scaled", "dti_ratio_scaled", "ltv_ratio_scaled",
        "log_loan_amount_scaled", "employment_encoded", "city_encoded"
    ]
    train_clustering_matrix = train_df[CLUSTERING_FEATURES]

    K_RANGE = range(8, 21)
    best_k = None
    best_score = -1

    for k in K_RANGE:
        km = KMeans(n_clusters=k, init="k-means++", n_init=10, random_state=42)
        labels = km.fit_predict(train_clustering_matrix)
        score = silhouette_score(train_clustering_matrix, labels, sample_size=5000, random_state=42)
        print(f"K={k}, silhouette={score:.4f}")
        if score > best_score:
            best_score = score
            best_k = k
    print(f"Selected K={best_k} with silhouette={best_score:.4f}")

    km = KMeans(n_clusters=best_k, init="k-means++", n_init=10, random_state=42)
    km.fit(train_clustering_matrix)
    s3.put_object(Bucket=settings.S3_BUCKET, Key="models/kmeans.pkl", Body=pickle.dumps(km))

    print("Assigning clusters to complete dataset...")
    # apply scalers to full dataset for predicting clusters
    df["cibil_score_scaled"] = scaler_cibil.transform(df[["cibil_score"]])
    df["dti_ratio_scaled"] = scaler_dti.transform(df[["dti_ratio_clipped"]])
    df["ltv_ratio_scaled"] = scaler_ltv.transform(df[["ltv_ratio"]])
    df["log_loan_amount_scaled"] = scaler_log_loan.transform(df[["log_loan_amount"]])
    df["log_annual_income_scaled"] = scaler_log_income.transform(df[["log_annual_income"]])
    df["loan_tenure_scaled"] = scaler_tenure.transform(df[["loan_tenure_months"]])
    
    all_cluster_ids = km.predict(df[CLUSTERING_FEATURES])
    
    print("Writing cluster_ids to DB...")
    cur = conn.cursor()
    update_data = [(int(cid), str(rid)) for rid, cid in zip(df["record_id"], all_cluster_ids)]
    cur.executemany("UPDATE loan_portfolio SET cluster_id = %s WHERE record_id = %s", update_data)
    conn.commit()

    print("Validating clusters...")
    cur.execute('''
        SELECT cluster_id, COUNT(*) 
        FROM loan_portfolio 
        GROUP BY cluster_id 
        ORDER BY cluster_id
    ''')
    for row in cur.fetchall():
        if row[1] < 200:
            print(f"WARNING: Cluster {row[0]} has only {row[1]} records")
    
    cur.close()
    conn.close()
    print("preprocess_and_cluster.py finished.")

if __name__ == "__main__":
    main()
