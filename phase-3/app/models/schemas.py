from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class XaiDriver(BaseModel):
    factor: str
    impact_pct: float
    status: str

class XaiExplanationResponse(BaseModel):
    zone_id: str
    chrs_risk_score: float
    risk_category: str
    top_drivers: List[XaiDriver]
    sdg_alignment: List[str]

class InterventionsInput(BaseModel):
    canopy_trees_added: int = Field(default=0, ge=0)
    cool_roof_sqm: float = Field(default=0.0, ge=0.0)
    water_kiosks_added: int = Field(default=0, ge=0)

class SimulationRequest(BaseModel):
    zone_id: str
    interventions: InterventionsInput

class SimulationResponse(BaseModel):
    zone_id: str
    original_chrs: float
    simulated_chrs: float
    predicted_lst_drop_c: float
    population_benefited: int
    estimated_budget_inr: int
    co2_offset_tons_per_yr: float
    payback_roi_rating: str

class LocationPoint(BaseModel):
    lat: float
    lng: float

class CoolPathRequest(BaseModel):
    origin: LocationPoint
    destination: LocationPoint
    mode: str = "pedestrian"

class RouteProfile(BaseModel):
    distance_meters: int
    duration_minutes: int
    avg_exposure_temp_c: float
    shade_coverage_pct: float
    thermal_strain_index: str
    waypoints: List[List[float]]
    water_points_enroute: Optional[int] = None
    temp_relief_delta_c: Optional[float] = None

class CoolPathResponse(BaseModel):
    shortest_route: RouteProfile
    coolest_route: RouteProfile

class TriageRequest(BaseModel):
    description: str
    reporter_name: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    location: Optional[LocationPoint] = None

class TriageResponse(BaseModel):
    urgency: str
    confidence: float
    extracted_entities: List[str]
    recommended_action: str

class ScreenContext(BaseModel):
    active_tab: str
    selected_zone_id: Optional[str] = None
    zone_metrics: Optional[Dict[str, Any]] = None
    simulation_params: Optional[Dict[str, Any]] = None
    simulation_results: Optional[Dict[str, Any]] = None
    route_metrics: Optional[Dict[str, Any]] = None
    user_query: Optional[str] = None

class ScreenExplainRequest(BaseModel):
    context: ScreenContext
    user_prompt: Optional[str] = None

class ScreenExplainResponse(BaseModel):
    title: str
    summary: str
    detailed_explanation: str
    grounded_sources: List[str]
    actionable_recommendations: List[str]
    audio_transcript: str
    model_used: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
