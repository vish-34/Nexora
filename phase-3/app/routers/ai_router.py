from typing import Optional
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    XaiExplanationResponse,
    SimulationRequest,
    SimulationResponse,
    CoolPathRequest,
    CoolPathResponse,
    TriageRequest,
    TriageResponse,
    ScreenExplainRequest,
    ScreenExplainResponse,
)
from app.services.xai_engine import generate_xai_explanation
from app.services.simulator import simulate_interventions
from app.services.coolpath_router import solve_coolpath
from app.services.nlp_triage import classify_distress
from app.services.rag_engine import generate_screen_explanation

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

@router.get("/explain/{zone_id}", response_model=XaiExplanationResponse)
def get_zone_explanation(
    zone_id: str,
    lst: Optional[float] = None,
    canopy: Optional[float] = None,
    chrs: Optional[float] = None,
    name: Optional[str] = None
):
    try:
        return generate_xai_explanation(zone_id, lst=lst, canopy=canopy, chrs=chrs, name=name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate", response_model=SimulationResponse)
def simulate_policy(req: SimulationRequest):
    try:
        return simulate_interventions(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coolpath", response_model=CoolPathResponse)
def get_coolpath_route(req: CoolPathRequest):
    try:
        return solve_coolpath(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/triage", response_model=TriageResponse)
def triage_report(req: TriageRequest):
    try:
        return classify_distress(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/screen-explain", response_model=ScreenExplainResponse)
def explain_screen(req: ScreenExplainRequest):
    try:
        return generate_screen_explanation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
