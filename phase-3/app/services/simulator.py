from app.data.mumbai_grid import get_zone
from app.models.schemas import SimulationRequest, SimulationResponse
from app.services.heat_index import calculate_chrs

def simulate_interventions(req: SimulationRequest) -> SimulationResponse:
    zone = get_zone(req.zone_id)
    if not zone:
        zone = {
            "zone_id": req.zone_id,
            "lst_celsius": 43.8,
            "wbgt_c": 34.2,
            "chrs_risk_score": 89.4,
            "population_density_per_sqkm": 68000,
            "informal_housing_ratio": 0.82,
            "elderly_percentage": 14.5,
            "canopy_cover_pct": 3.5,
            "drinking_water_access_score": 3.2,
            "ndbi": 0.78,
            "area_sqkm": 0.25,
        }

    trees = req.interventions.canopy_trees_added
    cool_roof = req.interventions.cool_roof_sqm
    kiosks = req.interventions.water_kiosks_added

    lst_drop = round(
        (trees / 100.0) * 0.40 + (cool_roof / 1000.0) * 0.15 + kiosks * 0.07, 1
    )

    orig_lst = float(zone.get("lst_celsius", 43.8))
    orig_wbgt = float(zone.get("wbgt_c", 34.2))
    orig_chrs = float(zone.get("chrs_risk_score", 89.4))
    orig_canopy = float(zone.get("canopy_cover_pct", 3.5))
    orig_water = float(zone.get("drinking_water_access_score", 3.2))
    pop_density = float(zone.get("population_density_per_sqkm", 60000))
    informal = float(zone.get("informal_housing_ratio", 0.7))
    elderly = float(zone.get("elderly_percentage", 14.0))
    ndbi = float(zone.get("ndbi", 0.75))
    area_sqkm = float(zone.get("area_sqkm", 0.25))

    new_lst = max(26.0, orig_lst - lst_drop)
    new_wbgt = max(22.0, orig_wbgt - (lst_drop * 0.55))

    canopy_gain = min(25.0, (trees * 15.0) / (area_sqkm * 1000000.0) * 100.0)
    new_canopy = min(50.0, orig_canopy + canopy_gain)

    water_gain = min(4.0, kiosks * 0.8)
    new_water = min(10.0, orig_water + water_gain)

    sim_chrs, _ = calculate_chrs(
        lst_celsius=new_lst,
        wbgt_c=new_wbgt,
        pop_density=pop_density,
        ndbi=max(0.1, ndbi - (cool_roof / (area_sqkm * 1000000.0))),
        informal_ratio=informal,
        elderly_pct=elderly,
        canopy_pct=new_canopy,
        water_score=new_water,
    )

    if orig_chrs > 0:
        chrs_reduction = min(orig_chrs - 10.0, orig_chrs - sim_chrs)
        sim_chrs = round(max(15.0, orig_chrs - max(lst_drop * 10.5, chrs_reduction)), 1)
    else:
        sim_chrs = round(sim_chrs, 1)

    budget_inr = int(trees * 3500 + cool_roof * 120 + kiosks * 300000)

    co2_offset = round(trees * 0.05, 1)

    pop_benefited = int(min(pop_density * area_sqkm, max(15000, trees * 70 + int(cool_roof * 2.5) + kiosks * 5000)))

    chrs_delta = orig_chrs - sim_chrs
    if chrs_delta >= 18.0 or orig_chrs >= 80.0:
        roi_rating = "High Priority"
    elif chrs_delta >= 8.0:
        roi_rating = "Optimal Intervention"
    else:
        roi_rating = "Moderate Return"

    return SimulationResponse(
        zone_id=req.zone_id,
        original_chrs=orig_chrs,
        simulated_chrs=sim_chrs,
        predicted_lst_drop_c=lst_drop,
        population_benefited=pop_benefited,
        estimated_budget_inr=budget_inr,
        co2_offset_tons_per_yr=co2_offset,
        payback_roi_rating=roi_rating,
    )
