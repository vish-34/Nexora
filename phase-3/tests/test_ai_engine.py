import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.heat_index import calculate_chrs
from app.services.simulator import simulate_interventions
from app.services.coolpath_router import solve_coolpath
from app.services.nlp_triage import classify_distress
from app.services.rag_engine import generate_screen_explanation
from app.models.schemas import (
    SimulationRequest,
    InterventionsInput,
    CoolPathRequest,
    LocationPoint,
    TriageRequest,
    ScreenExplainRequest,
    ScreenContext,
)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "AI Engine" in data["service"]

def test_root_hud_html():
    response = client.get("/")
    assert response.status_code == 200
    assert "COOLNEIGHBOUR" in response.text or "CoolNeighbour" in response.text

def test_xai_explain_all_zones():
    zone_ids = [
        "GRID_MUM_001",
        "GRID_MUM_002",
        "GRID_MUM_003",
        "GRID_MUM_004",
        "GRID_MUM_005",
    ]
    for zid in zone_ids:
        res = client.get(f"/api/ai/explain/{zid}")
        assert res.status_code == 200
        payload = res.json()
        assert payload["zone_id"] == zid
        assert len(payload["top_drivers"]) == 4
        assert payload["risk_category"] in ["Low", "Moderate", "High", "Critical"]
        impact_sum = sum(d["impact_pct"] for d in payload["top_drivers"])
        assert 99.0 <= impact_sum <= 101.0

def test_xai_explain_unknown_zone():
    res = client.get("/api/ai/explain/GRID_UNKNOWN_999")
    assert res.status_code == 200
    payload = res.json()
    assert payload["zone_id"] == "GRID_UNKNOWN_999"
    assert len(payload["top_drivers"]) == 4

def test_simulate_interventions():
    payload = {
        "zone_id": "GRID_MUM_001",
        "interventions": {
            "canopy_trees_added": 250,
            "cool_roof_sqm": 8000,
            "water_kiosks_added": 3,
        },
    }
    response = client.post("/api/ai/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["zone_id"] == "GRID_MUM_001"
    assert data["original_chrs"] == 89.4
    assert data["simulated_chrs"] < data["original_chrs"]
    assert data["predicted_lst_drop_c"] >= 2.0
    assert data["co2_offset_tons_per_yr"] == 12.5
    assert data["estimated_budget_inr"] > 0
    assert data["payback_roi_rating"] == "High Priority"

def test_simulate_zero_interventions():
    payload = {
        "zone_id": "GRID_MUM_001",
        "interventions": {
            "canopy_trees_added": 0,
            "cool_roof_sqm": 0,
            "water_kiosks_added": 0,
        },
    }
    response = client.post("/api/ai/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_lst_drop_c"] == 0.0
    assert data["co2_offset_tons_per_yr"] == 0.0
    assert data["estimated_budget_inr"] == 0

def test_coolpath_routing():
    payload = {
        "origin": {"lat": 19.0405, "lng": 72.8525},
        "destination": {"lat": 19.0485, "lng": 72.8585},
        "mode": "pedestrian",
    }
    response = client.post("/api/ai/coolpath", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "shortest_route" in data
    assert "coolest_route" in data
    shortest = data["shortest_route"]
    coolest = data["coolest_route"]
    assert coolest["avg_exposure_temp_c"] < shortest["avg_exposure_temp_c"]
    assert coolest["shade_coverage_pct"] > shortest["shade_coverage_pct"]
    assert coolest["temp_relief_delta_c"] is not None
    assert coolest["temp_relief_delta_c"] < 0
    assert len(coolest["waypoints"]) >= 3
    assert len(shortest["waypoints"]) >= 3

def test_nlp_triage_emergency():
    payload = {
        "description": "Drinking water tap broken near transit camp crossroad, workers having severe dizziness and thirst",
        "reporter_name": "Ramesh Patil",
        "category": "Hydration Crisis",
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] in ["Emergency", "Critical"]
    assert data["confidence"] >= 0.85
    assert len(data["recommended_action"]) > 5

def test_nlp_triage_critical():
    payload = {
        "description": "Elderly person collapsed near bus station from extreme heat, unconscious and needs ambulance",
        "category": "Heat Exhaustion",
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] in ["Critical", "Emergency"]
    assert data["confidence"] >= 0.85

def test_nlp_triage_medium():
    payload = {
        "description": "The cooling kiosk misting fan broken and shelter shade torn near market square",
        "category": "Broken Infrastructure",
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] in ["Medium", "Low", "Critical", "Emergency"]

def test_direct_chrs_calculation():
    score, category = calculate_chrs(
        lst_celsius=43.8,
        wbgt_c=34.2,
        pop_density=68000,
        ndbi=0.78,
        informal_ratio=0.82,
        elderly_pct=14.5,
        canopy_pct=3.5,
        water_score=3.2,
    )
    assert 80.0 <= score <= 100.0
    assert category == "Critical"

def test_screen_explain_xai():
    payload = {
        "context": {
            "active_tab": "xai",
            "selected_zone_id": "GRID_MUM_001",
            "zone_metrics": {"name": "Dharavi Sector 3", "chrs": 89.4},
        },
        "user_prompt": "Why is Dharavi classified as critical?",
    }
    response = client.post("/api/ai/screen-explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Dharavi" in data["title"] or "GRID_MUM_001" in data["title"] or len(data["title"]) > 5
    assert len(data["summary"]) > 10
    assert len(data["detailed_explanation"]) > 20
    assert len(data["grounded_sources"]) >= 1
    assert len(data["actionable_recommendations"]) >= 1
    assert len(data["audio_transcript"]) > 10
    assert data["model_used"] in ["grok-2-latest", "local-rag-fallback"]

def test_screen_explain_simulate():
    payload = {
        "context": {
            "active_tab": "simulate",
            "selected_zone_id": "GRID_MUM_001",
            "simulation_params": {"trees": 250, "roofs_sqm": 8000, "kiosks": 3},
        }
    }
    response = client.post("/api/ai/screen-explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["actionable_recommendations"]) >= 1
    assert data["model_used"] in ["grok-2-latest", "local-rag-fallback"]

def test_screen_explain_coolpath():
    payload = {
        "context": {
            "active_tab": "coolpath",
            "selected_zone_id": "GRID_MUM_001",
            "route_metrics": {"shortest": "1090 m", "coolest": "1488 m"},
        }
    }
    response = client.post("/api/ai/screen-explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "CoolPath" in data["title"] or len(data["title"]) > 5
    assert len(data["audio_transcript"]) > 10
