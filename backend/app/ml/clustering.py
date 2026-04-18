import numpy as np
from sqlalchemy import text

async def assign_cluster(clustering_vector: np.ndarray, artifacts) -> int:
    return int(artifacts.kmeans.predict(clustering_vector)[0])


async def get_cohort_rates(cluster_id: int, db) -> list[float]:
    result = await db.execute(
        text("SELECT interest_rate_offered FROM loan_portfolio WHERE cluster_id = :cid"),
        {"cid": cluster_id}
    )
    rates = [float(row[0]) for row in result.fetchall()]

    # Fallback: merge adjacent clusters if cohort is too small
    if len(rates) < 30:
        result = await db.execute(
            text("""SELECT interest_rate_offered FROM loan_portfolio
                    WHERE cluster_id IN (
                        SELECT cluster_id FROM loan_portfolio
                        ORDER BY ABS(cluster_id - :cid) LIMIT 3
                    )"""),
            {"cid": cluster_id}
        )
        rates = [float(row[0]) for row in result.fetchall()]

    return rates
