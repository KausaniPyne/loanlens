import os
import json
import uuid
from datetime import datetime
import psycopg2

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

def main():
    print("Loading evaluation results...")
    try:
        with open('/tmp/eval_results.json', 'r') as f:
            results = json.load(f)
    except FileNotFoundError:
        print("ERROR: /tmp/eval_results.json not found. Did you run evaluate.py?")
        return
        
    catboost_test_rmse = results["catboost_test_rmse"]
    tabnet_test_rmse = results["tabnet_test_rmse"]

    print("Connecting to DB...")
    conn = psycopg2.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
    cur = conn.cursor()

    version_id = f"v{datetime.utcnow().strftime('%Y%m%d%H%M')}"

    print("Deactivating old versions...")
    cur.execute("UPDATE model_versions SET is_active = FALSE WHERE is_active = TRUE")

    print(f"Registering version {version_id}...")
    cur.execute("""
        INSERT INTO model_versions
            (version_id, catboost_s3_path, tabnet_s3_path, kmeans_s3_path,
             scaler_s3_path, trained_at, training_records, catboost_rmse,
             tabnet_rmse, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
    """, (
        version_id,
        "models/catboost_model.cbm",
        "models/tabnet_model.zip",
        "models/kmeans.pkl",
        "scalers/scaler_bundle.pkl",
        datetime.utcnow(),
        50000,
        float(catboost_test_rmse),
        float(tabnet_test_rmse)
    ))

    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Model version {version_id} registered and marked active.")

if __name__ == "__main__":
    main()
