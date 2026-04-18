import pickle, boto3, io, os, zipfile, tempfile, logging
import psycopg2
from catboost import CatBoostRegressor
from pytorch_tabnet.tab_model import TabNetRegressor
from sklearn.cluster import KMeans
from app.core.config import settings

logger = logging.getLogger("loadlens.artifacts")

class ModelArtifacts:
    catboost: CatBoostRegressor
    tabnet: TabNetRegressor
    kmeans: KMeans
    scaler_bundle: dict

    _instance = None

    @classmethod
    def get(cls) -> "ModelArtifacts":
        if cls._instance is None:
            cls._instance = cls._load()
        return cls._instance

    @classmethod
    def _load(cls) -> "ModelArtifacts":
        logger.info("Loading Model Artifacts...")
        instance = cls()
        
        # Connect to DB to get active paths
        conn = psycopg2.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
        cur = conn.cursor()
        cur.execute("""
            SELECT catboost_s3_path, tabnet_s3_path, kmeans_s3_path, scaler_s3_path 
            FROM model_versions WHERE is_active = TRUE LIMIT 1
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            raise RuntimeError(
                "No active model version found in model_versions table. "
                "Run the training pipeline (Phase 03 scripts) before starting the API."
            )
            
        catboost_path, tabnet_path, kmeans_path, scaler_path = row
        
        s3 = boto3.client(
            's3', endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY
        )
        
        tmp_dir = tempfile.gettempdir()
        
        # Load Scalers
        logger.info("Loading Scalers...")
        scaler_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key=scaler_path)
        instance.scaler_bundle = pickle.loads(scaler_resp['Body'].read())
        
        # Load KMeans
        logger.info("Loading KMeans...")
        kmeans_resp = s3.get_object(Bucket=settings.S3_BUCKET, Key=kmeans_path)
        instance.kmeans = pickle.loads(kmeans_resp['Body'].read())
        
        # Load Catboost
        logger.info("Loading CatBoost...")
        cb_tmp = os.path.join(tmp_dir, "catboost_model.cbm")
        s3.download_file(settings.S3_BUCKET, catboost_path, cb_tmp)
        instance.catboost = CatBoostRegressor()
        instance.catboost.load_model(cb_tmp)
        
        # Load TabNet
        logger.info("Loading TabNet...")
        tn_zip = os.path.join(tmp_dir, "tabnet_model.zip")
        s3.download_file(settings.S3_BUCKET, tabnet_path, tn_zip)
        
        instance.tabnet = TabNetRegressor()
        instance.tabnet.load_model(tn_zip)

        logger.info("All models successfully loaded into memory.")
        return instance
