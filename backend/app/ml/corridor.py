import numpy as np
from dataclasses import dataclass

@dataclass
class Corridor:
    p10: float
    p25: float
    p50: float
    p75: float
    p90: float
    cohort_size: int

def compute_corridor(rates: list[float]) -> Corridor:
    arr = np.array(rates)
    return Corridor(
        p10=round(float(np.percentile(arr, 10)), 3),
        p25=round(float(np.percentile(arr, 25)), 3),
        p50=round(float(np.percentile(arr, 50)), 3),
        p75=round(float(np.percentile(arr, 75)), 3),
        p90=round(float(np.percentile(arr, 90)), 3),
        cohort_size=len(arr)
    )

def compute_verdict(current_rate: float, corridor: Corridor) -> str:
    if current_rate < corridor.p25:
        return "GREEN"
    elif current_rate <= corridor.p75:
        return "YELLOW"
    else:
        return "RED"
