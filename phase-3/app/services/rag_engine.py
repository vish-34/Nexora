import json
from typing import List, Dict, Any, Tuple
from app.data.mumbai_grid import get_zone
from app.models.schemas import ScreenExplainRequest, ScreenExplainResponse
from app.services.grok_client import call_grok

KNOWLEDGE_CORPUS: Dict[str, List[str]] = {
    "GRID_MUM_001": [
        "Dharavi Sector 3 testbed exhibits microclimate extreme heat caused by dense corrugated galvanized iron (tin) sheet roofs with solar reflectance albedo below 0.12.",
        "Ground land surface temperatures (LST) frequently exceed 44°C to 47°C during afternoon hours, despite ambient weather stations reporting 36°C to 38°C.",
        "Vegetation canopy coverage is critically deficient at only 3.5%, leaving transit camps and pedestrian alleys with zero shade buffering.",
        "Drinking water access score is 3.2/10, requiring residents to walk over 700 meters to reach municipal clean hydration posts.",
    ],
    "GRID_MUM_002": [
        "Kurla West Station Hub suffers from concentrated asphalt thermal radiation and pedestrian congestion at bus terminal junctions.",
        "Population density reaches 54,000 per km² with a high percentage of elderly commuters exposed to direct radiation during peak transit hours.",
        "LST is recorded at 42.1°C with Wet Bulb Globe Temperature (WBGT) crossing 33.5°C, triggering high risk of heat exhaustion.",
    ],
    "GRID_MUM_003": [
        "Bandra Kurla Complex (BKC) G-Block experiences solar reflection from glass building facades, partially mitigated by landscaped arterial avenues.",
        "Canopy cover stands at 18.0% and drinking water score is 8.8/10, keeping the Composite Heat Risk Score (CHRS) in the Moderate tier (52.3).",
    ],
    "GRID_MUM_004": [
        "Bandra West and Carter Road coastal fringe benefit from marine sea breeze circulation and mature roadside banyan and rain tree canopy (32.5% cover).",
        "LST averages 33.2°C, providing a natural urban cool island baseline with CHRS of 31.0 (Low Risk).",
    ],
    "GRID_MUM_005": [
        "Govandi - Mankhurd slum cluster is a critical hotspot (CHRS 93.6) due to proximity to the Deonar dumping area, informal tin housing ratio of 0.89, and only 2.1% canopy.",
        "Water access score of 2.7/10 creates severe hydration vulnerability for outdoor workers and children.",
    ],
    "HAP_PROTOCOLS": [
        "Brihanmumbai Municipal Corporation (BMC) Heat Action Plan classifies WBGT over 32.2°C as Red Alert Extreme Danger.",
        "Mandated emergency protocols include deploying mobile ORS hydration tankers, extending community AC shelter hours, and halt of outdoor construction from 12:00 to 15:30.",
    ],
    "INTERVENTIONS_SCIENCE": [
        "High-albedo elastomeric cool roof coatings reflect over 80% of solar radiation, reducing indoor temperatures by up to 4°C and lowering localized LST by 0.18°C per 1,000 m².",
        "Mature Neem and Banyan trees provide up to 20 m² canopy shade per sapling, providing localized air cooling of 0.45°C per 100 trees through evapotranspirative cooling.",
        "High-pressure solar misting kiosks provide flash evaporative cooling, dropping immediate ambient microclimate by 1.5°C to 2.5°C within a 15-meter radius.",
    ],
    "COOLPATH_BIOMECHANICS": [
        "Standard shortest path algorithms route pedestrians onto unshaded asphalt corridors with 90%+ solar exposure, exacerbating core body heat strain.",
        "CoolPath optimization routes pedestrians along tree-lined parkways and water kiosks, achieving -4.5°C lower perceived temperature with only ~15% distance increase.",
    ],
}

def retrieve_knowledge(zone_id: str, tab: str, query: str = "") -> List[str]:
    chunks = []
    if zone_id in KNOWLEDGE_CORPUS:
        chunks.extend(KNOWLEDGE_CORPUS[zone_id])
    else:
        chunks.extend(KNOWLEDGE_CORPUS["GRID_MUM_001"])

    if tab == "simulate":
        chunks.extend(KNOWLEDGE_CORPUS["INTERVENTIONS_SCIENCE"])
    elif tab == "coolpath":
        chunks.extend(KNOWLEDGE_CORPUS["COOLPATH_BIOMECHANICS"])
    elif tab == "triage":
        chunks.extend(KNOWLEDGE_CORPUS["HAP_PROTOCOLS"])
    else:
        chunks.extend(KNOWLEDGE_CORPUS["HAP_PROTOCOLS"][:1])
        chunks.extend(KNOWLEDGE_CORPUS["INTERVENTIONS_SCIENCE"][:1])

    if query:
        lowered = query.lower()
        if "tree" in lowered or "roof" in lowered or "kiosk" in lowered:
            chunks.extend(KNOWLEDGE_CORPUS["INTERVENTIONS_SCIENCE"])
        if "route" in lowered or "walk" in lowered or "shade" in lowered:
            chunks.extend(KNOWLEDGE_CORPUS["COOLPATH_BIOMECHANICS"])

    return list(dict.fromkeys(chunks))[:6]

def generate_screen_explanation(req: ScreenExplainRequest) -> ScreenExplainResponse:
    ctx = req.context
    zone_id = ctx.selected_zone_id or "GRID_MUM_001"
    tab = ctx.active_tab or "xai"
    zone = get_zone(zone_id) or {}

    retrieved = retrieve_knowledge(zone_id, tab, req.user_prompt or "")

    system_prompt = (
        "You are Grok, the advanced climate intelligence AI for CoolNeighbour AI (ThermoShield). "
        "You are explaining what the user currently sees on their screen to municipal authorities and citizens. "
        "Ground your response strictly in the provided domain knowledge and the active on-screen telemetry. "
        "Return a valid JSON object matching this schema:\n"
        "{\n"
        '  "title": "Clear concise header",\n'
        '  "summary": "1-2 sentence executive summary of the active screen",\n'
        '  "detailed_explanation": "Comprehensive paragraph explaining what the metrics mean, why the risk is elevated, and how the models work",\n'
        '  "grounded_sources": ["Source 1", "Source 2"],\n'
        '  "actionable_recommendations": ["Action 1", "Action 2"],\n'
        '  "audio_transcript": "Natural spoken briefing for Text-to-Speech audio narration, concise and conversational without formatting symbols"\n'
        "}"
    )

    user_prompt = f"""
Current User Screen Context:
- Active HUD Tab: {tab.upper()}
- Selected Micro-Grid Zone: {zone_id} ({zone.get('name', 'Mumbai Urban Cluster')})
- Zone Baseline Metrics: LST={zone.get('lst_celsius', 43.8)}°C, CHRS Risk Score={zone.get('chrs_risk_score', 89.4)}, Canopy Cover={zone.get('canopy_cover_pct', 3.5)}%, Informal Housing Ratio={zone.get('informal_housing_ratio', 0.82)}
- On-Screen Simulation Parameters: {ctx.simulation_params or 'Default (250 trees, 8000m² cool roofs, 3 kiosks)'}
- On-Screen Route Metrics: {ctx.route_metrics or 'N/A'}
- User Specific Question: {req.user_prompt or 'Explain what is currently displayed on my screen and its climate significance.'}

Retrieved Domain Knowledge:
{chr(10).join('- ' + c for c in retrieved)}
"""

    grok_response = call_grok(prompt=user_prompt, system_prompt=system_prompt, json_mode=True)
    if grok_response:
        try:
            data = json.loads(grok_response)
            return ScreenExplainResponse(
                title=data.get("title", f"Urban Heat Analysis: {zone_id}"),
                summary=data.get("summary", "Analysis of active screen telemetry."),
                detailed_explanation=data.get("detailed_explanation", ""),
                grounded_sources=data.get("grounded_sources", ["BMC Disaster Management Cell", "Mumbai HAP 2024"]),
                actionable_recommendations=data.get("actionable_recommendations", ["Prioritize cool roof deployment."]),
                audio_transcript=data.get("audio_transcript", data.get("summary", "")),
                model_used="grok-2-latest",
            )
        except Exception:
            pass

    return build_fallback_explanation(zone_id, tab, zone, retrieved, ctx)

def build_fallback_explanation(
    zone_id: str,
    tab: str,
    zone: Dict[str, Any],
    retrieved: List[str],
    ctx: Any,
) -> ScreenExplainResponse:
    name = zone.get("name", "Dharavi Sector 3 / Transit Camp")
    lst = zone.get("lst_celsius", 43.8)
    chrs = zone.get("chrs_risk_score", 89.4)
    canopy = zone.get("canopy_cover_pct", 3.5)
    risk = zone.get("risk_level", "Critical")

    if tab == "simulate":
        title = f"What-If Policy Simulation: {name}"
        summary = f"Simulating targeted urban cooling interventions to mitigate {lst}°C surface heat and reduce CHRS risk score from {chrs}."
        detailed = (
            f"You are currently viewing the Urban Policy Simulation sandbox for {name}. "
            f"The model calculates localized thermodynamic relief from adding canopy trees, cool roof coatings, and hydration misting kiosks. "
            f"High-albedo elastomeric cool roofs reflect over 80% of solar radiation on tin roofs, while mature neem tree saplings provide evapotranspirative cooling. "
            f"This intervention achieves a predicted ground temperature drop of over 2°C, transitioning this neighborhood out of the Critical risk category."
        )
        audio = (
            f"You are viewing the policy simulation for {name}. By adding canopy trees and cool roofs, "
            f"we project a localized surface temperature drop of over 2 degrees Celsius, significantly reducing heatstroke hazards."
        )
        actions = [
            "Submit high-albedo cool roof proposal to BMC Disaster Management Cell.",
            "Deploy solar misting hydration booths along primary transit pedestrian corridors.",
            "Enact 2-year maintenance contract for mature neem saplings.",
        ]
    elif tab == "coolpath":
        title = "CoolPath Microclimate Thermal Routing"
        summary = "Comparing high-exposure asphalt pedestrian navigation against tree-canopied thermal comfort corridors."
        detailed = (
            "You are viewing the CoolPath thermal comfort routing analysis. Standard GPS algorithms minimize distance, "
            "forcing pedestrians onto scorching asphalt arterial roads with surface temperatures above 43°C and less than 10% shade. "
            "In contrast, CoolPath minimizes a thermal strain cost function, rerouting pedestrians through shaded greenways and water kiosks, "
            "delivering 4.5°C lower perceived temperature and 78% tree shade with only a 5-minute walking trade-off."
        )
        audio = (
            "CoolPath compares the shortest route with the shaded route. The cool route adds only 5 minutes of walking "
            "while providing four point five degrees of temperature relief and passing two clean drinking water kiosks."
        )
        actions = [
            "Encourage gig workers and pedestrians to utilize the Shaded CoolPath during peak afternoon hours.",
            "Install additional drinking water dispensers along the designated CoolPath waypoints.",
        ]
    elif tab == "triage":
        title = "NLP Citizen Distress Triage & Dispatch"
        summary = "Classifying crowdsourced ground reports to trigger rapid municipal emergency interventions."
        detailed = (
            "You are viewing the NLP community distress triage screen. Citizen reports are analyzed in real time to extract symptom entities "
            "such as dehydration, fainting, and broken drinking water taps. Reports are categorized into Emergency, Critical, and Medium urgency tiers, "
            "automatically generating actionable municipal directives for water tanker deployment and ambulance dispatch."
        )
        audio = (
            "The NLP triage screen analyzes citizen distress reports in real time, automatically categorizing emergencies "
            "and recommending immediate dispatch of water tankers or medical teams."
        )
        actions = [
            "Dispatch emergency water tankers to transit camp crossroads.",
            "Alert 108 emergency ambulance response units to station bus queues.",
        ]
    else:
        title = f"Explainable AI Hotspot Factor Audit: {name}"
        summary = f"{name} is classified as a {risk} Hotspot with a Composite Heat Risk Score of {chrs}/100 and surface heat of {lst}°C."
        detailed = (
            f"You are viewing the Explainable AI (XAI) diagnostic breakdown for {name}. "
            f"The extreme heat hazard is primarily driven by dense tin-sheet informal roofing with low solar albedo, combined with a severe tree canopy deficit ({canopy}% coverage). "
            f"Ground surface temperatures exceed 43°C, while drinking water access is restricted. "
            f"This zone strongly correlates with UN Sustainable Development Goals 11 (Sustainable Cities) and 13 (Climate Action)."
        )
        audio = (
            f"This is the Explainable AI audit for {name}. The zone has a critical heat risk score of {chrs}, "
            f"primarily caused by unshaded tin roofs and an acute canopy deficit of only {canopy} percent."
        )
        actions = [
            "Prioritize reflective cool roof paint on all informal tin roofs.",
            "Install emergency solar misting kiosks near transit camp intersections.",
        ]

    return ScreenExplainResponse(
        title=title,
        summary=summary,
        detailed_explanation=detailed,
        grounded_sources=["Mumbai Heat Action Plan 2024", "BMC Disaster Management Cell", "Landsat-8 Thermal IR Data"],
        actionable_recommendations=actions,
        audio_transcript=audio,
        model_used="local-rag-fallback",
    )
