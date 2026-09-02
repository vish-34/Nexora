from typing import Tuple

def clamp(val: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    return max(min_val, min(max_val, val))

def normalize(val: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.0
    return clamp((val - min_val) / (max_val - min_val))

def calculate_chrs(
    lst_celsius: float,
    wbgt_c: float,
    pop_density: float,
    ndbi: float,
    informal_ratio: float,
    elderly_pct: float,
    canopy_pct: float,
    water_score: float,
) -> Tuple[float, str]:
    hazard = 0.6 * normalize(lst_celsius, 30.0, 45.0) + 0.4 * normalize(wbgt_c, 26.0, 36.0)
    exposure = 0.5 * normalize(pop_density, 12000.0, 75000.0) + 0.5 * normalize(ndbi, 0.30, 0.85)
    vulnerability = 0.65 * clamp(informal_ratio, 0.0, 1.0) + 0.35 * normalize(elderly_pct, 6.0, 20.0)
    mitigation = 0.6 * normalize(canopy_pct, 0.0, 35.0) + 0.4 * normalize(water_score, 0.0, 10.0)

    composite = (0.35 * hazard + 0.30 * exposure + 0.25 * vulnerability - 0.15 * mitigation)
    raw_score = (composite / 0.78) * 100.0
    score = round(max(0.0, min(100.0, raw_score)), 1)

    if score <= 35.0:
        category = "Low"
    elif score <= 65.0:
        category = "Moderate"
    elif score <= 80.0:
        category = "High"
    else:
        category = "Critical"

    return score, category
