from typing import Dict, Any, List
from app.data.mumbai_grid import get_zone, REGIONAL_MEDIANS
from app.models.schemas import XaiDriver, XaiExplanationResponse

def generate_xai_explanation(zone_id: str) -> XaiExplanationResponse:
    zone = get_zone(zone_id)
    if not zone:
        zone = {
            "zone_id": zone_id,
            "name": f"Zone {zone_id}",
            "lst_celsius": 41.5,
            "chrs_risk_score": 75.0,
            "risk_level": "High",
            "informal_housing_ratio": 0.60,
            "canopy_cover_pct": 6.5,
            "drinking_water_access_score": 4.5,
            "primary_hazard_driver": "Elevated surface heat and low canopy cover",
        }

    lst = float(zone.get("lst_celsius", 38.0))
    informal = float(zone.get("informal_housing_ratio", 0.5))
    canopy = float(zone.get("canopy_cover_pct", 10.0))
    water = float(zone.get("drinking_water_access_score", 5.0))

    w_lst = max(0.0, lst - REGIONAL_MEDIANS["lst_celsius"] + 5.0)
    w_informal = max(0.0, informal * 10.0)
    w_canopy = max(0.0, (REGIONAL_MEDIANS["canopy_cover_pct"] - canopy + 10.0))
    w_water = max(0.0, (REGIONAL_MEDIANS["drinking_water_access_score"] - water + 5.0))

    total_weight = w_lst + w_informal + w_canopy + w_water
    if total_weight <= 0:
        total_weight = 1.0

    pct_lst = round((w_lst / total_weight) * 100.0, 1)
    pct_informal = round((w_informal / total_weight) * 100.0, 1)
    pct_canopy = round((w_canopy / total_weight) * 100.0, 1)
    pct_water = round(100.0 - (pct_lst + pct_informal + pct_canopy), 1)

    status_lst = "severe" if lst >= 41.0 else ("warning" if lst >= 37.0 else "optimal")
    status_informal = "severe" if informal >= 0.6 else ("warning" if informal >= 0.3 else "optimal")
    status_canopy = "severe" if canopy <= 6.0 else ("warning" if canopy <= 15.0 else "optimal")
    status_water = "severe" if water <= 3.5 else ("warning" if water <= 6.5 else "optimal")

    water_dist_est = (max(150, round((10.0 - water) * 110)))

    drivers: List[XaiDriver] = [
        XaiDriver(
            factor=f"Surface Temp (LST {lst:.1f}°C)",
            impact_pct=pct_lst,
            status=status_lst,
        ),
        XaiDriver(
            factor=f"Informal Tin Roof Density ({int(informal * 100)}%)",
            impact_pct=pct_informal,
            status=status_informal,
        ),
        XaiDriver(
            factor=f"Severe Canopy Deficit ({canopy:.1f}% cover)",
            impact_pct=pct_canopy,
            status=status_canopy,
        ),
        XaiDriver(
            factor=f"Drinking Water Distance ({water_dist_est}m avg)",
            impact_pct=pct_water,
            status=status_water,
        ),
    ]

    drivers.sort(key=lambda d: d.impact_pct, reverse=True)

    return XaiExplanationResponse(
        zone_id=zone_id,
        chrs_risk_score=float(zone.get("chrs_risk_score", 80.0)),
        risk_category=str(zone.get("risk_level", "High")),
        top_drivers=drivers,
        sdg_alignment=["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"],
    )
