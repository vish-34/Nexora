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

    return build_fallback_explanation(zone_id, tab, zone, retrieved, ctx, req.user_prompt or "")

def build_fallback_explanation(
    zone_id: str,
    tab: str,
    zone: Dict[str, Any],
    retrieved: List[str],
    ctx: Any,
    user_prompt: str = ""
) -> ScreenExplainResponse:
    zone_metrics = getattr(ctx, "zone_metrics", None) or {}
    if isinstance(zone_metrics, dict) and zone_metrics:
        name = zone_metrics.get("name") or zone.get("name", "Maharashtra")
        lst = float(zone_metrics.get("lst_celsius") or zone.get("lst_celsius", 43.8))
        chrs = float(zone_metrics.get("chrs_risk_score") or zone.get("chrs_risk_score", 75.0))
        canopy = float(zone_metrics.get("canopy_cover_pct") or zone.get("canopy_cover_pct", 14.0))
        wbgt = float(zone_metrics.get("wbgt_c") or 33.8)
        level = zone_metrics.get("level") or "region"
    else:
        name = zone.get("name", "Dharavi Sector 3 / Transit Camp")
        lst = float(zone.get("lst_celsius", 43.8))
        chrs = float(zone.get("chrs_risk_score", 89.4))
        canopy = float(zone.get("canopy_cover_pct", 3.5))
        wbgt = 34.2
        level = "urban cluster"

    risk = "Critical" if chrs >= 80 else ("High" if chrs >= 65 else "Moderate")
    q = (user_prompt or "").strip().lower()

    # Dynamic Intent Classifier based on User Query
    if any(k in q for k in ["temp", "weather", "hot", "celsius", "degree", "heat level", "climate"]):
        title = f"Thermal Exposure Profile: {name}"
        summary = f"Satellite sensors register {lst}°C Land Surface Temperature in {name}, with an ambient wet-bulb index of {wbgt}°C."
        detailed = (
            f"Thermal calibration data for {name} ({level}) indicates elevated heat strain. "
            f"Direct solar radiation on unshaded surfaces pushes localized ground temperatures to {lst}°C. "
            f"The ambient wet-bulb globe temperature of {wbgt}°C indicates severe physiological thermal stress, "
            f"where evaporative sweating efficiency declines rapidly."
        )
        audio = (
            f"In {name}, ground surface temperatures have climbed to {lst} degrees Celsius, with an ambient wet bulb index of {wbgt} degrees. "
            f"High humidity and unshaded surfaces create intense heat stress, so please seek shade and stay hydrated."
        )
        actions = [
            f"Issue hydration alerts across {name} high-exposure transit nodes.",
            "Deploy emergency mobile cooling tankers to busy public corridors.",
            "Limit heavy outdoor labor during afternoon peak radiation."
        ]

    elif any(k in q for k in ["why", "cause", "reason", "driver", "risk", "factor", "attribution", "chrs", "danger"]):
        title = f"Heat Risk Factor Attribution: {name}"
        summary = f"The {risk} Heat Risk Score of {chrs}/100 in {name} is driven by {lst}°C surface heating and {canopy}% canopy deficit."
        detailed = (
            f"Explainable AI feature attribution for {name} highlights two primary climate hazard drivers: "
            f"an acute tree canopy deficit of only {canopy}% total vegetative cover, and high solar thermal absorption "
            f"on dense built-up and sheet-roof surfaces radiating heat upwards of {lst}°C. "
            f"Combined with regional humidity, these factors elevate the Composite Heat Risk Score to {chrs} out of 100."
        )
        audio = (
            f"The high heat risk in {name}, with a score of {chrs} out of 100, is primarily driven by two factors: "
            f"an acute tree canopy deficit of only {canopy} percent, and unshaded surface radiation reaching {lst} degrees Celsius."
        )
        actions = [
            "Target high-albedo cool roof coatings on informal sheet-metal structures.",
            "Accelerate urban greening corridors with indigenous shade trees.",
            "Deploy solar-powered misting hydration kiosks at key transit hubs."
        ]

    elif any(k in q for k in ["what can", "how to", "solution", "intervention", "simulate", "what if", "policy", "reduce", "cool roof", "tree"]):
        title = f"Urban Cooling & Policy Interventions: {name}"
        summary = f"Simulated thermodynamic interventions project a 2.4°C localized cooling drop and heat risk reduction for {name}."
        detailed = (
            f"Our microclimate intervention simulation demonstrates that coating informal sheet-metal roofs "
            f"with high-albedo elastomeric paint, combined with planting 250 mature canopy trees, drops localized surface heat "
            f"by 2.4°C and lowers the Composite Heat Risk Score from {chrs} down to {max(42.0, chrs - 25.0):.1f}. "
            f"This delivers verified thermodynamic relief within an accessible municipal budget."
        )
        audio = (
            f"To reduce heat in {name}, our simulations recommend applying reflective cool roof paint and planting broadleaf shade trees. "
            f"This strategy drops surface temperatures by over two degrees Celsius and significantly cuts heatstroke danger."
        )
        actions = [
            "Authorize municipal cool roof adoption subsidies.",
            "Plant mature Neem and Peepal saplings along high-traffic pedestrian roads.",
            "Establish municipal cooling center networks within 400 meters of transit clusters."
        ]

    elif any(k in q for k in ["route", "walk", "coolpath", "path", "shade", "kiosk", "direction", "navigation"]):
        title = f"CoolPath Microclimate Thermal Routing: {name}"
        summary = "Comparing high-exposure asphalt pedestrian navigation against tree-canopied thermal comfort corridors."
        detailed = (
            f"Standard GPS algorithms route pedestrians through unshaded asphalt corridors with 90%+ solar exposure in {name}. "
            f"CoolPath thermal routing minimizes physiological heat strain by navigating through tree-canopied greenways "
            f"and active hydration kiosks, achieving 4.5°C lower perceived temperature with only a 5-minute walking trade-off."
        )
        audio = (
            f"CoolPath calculates shaded walking routes through {name} that keep you out of direct sunlight. "
            f"The cool route adds only five extra minutes of walking while delivering four point five degrees of cooling relief and water kiosk stops."
        )
        actions = [
            "Open the CoolPath tab to view shaded walking waypoints on Leaflet.",
            "Avoid unshaded asphalt roadways during peak midday hours.",
            "Refill at marked municipal water kiosks along the route."
        ]

    elif any(k in q for k in ["citizen", "relief", "shelter", "hospital", "sos", "distress", "emergency", "help"]):
        title = f"Citizen Relief & Emergency Cooling Centers: {name}"
        summary = f"Designated municipal cooling shelters, hydration stations, and emergency triage are active for {name}."
        detailed = (
            f"Under the Municipal Heat Action Plan for {name}, air-conditioned public facilities, community triage clinics, "
            f"and emergency water distribution points are operating to protect citizens and outdoor workers from heat illness. "
            f"Citizens can submit geotagged SOS distress reports to trigger immediate municipal response."
        )
        audio = (
            f"Emergency cooling shelters are active with air conditioning and oral rehydration salts in {name}. "
            f"If you see someone suffering from heat exhaustion, tap the SOS button to submit a distress report for immediate medical dispatch."
        )
        actions = [
            "Direct vulnerable pedestrians to the nearest designated cooling center.",
            "Submit an SOS report for rapid emergency ambulance or water tanker dispatch.",
            "Distribute oral rehydration solution packets in high-density informal clusters."
        ]

    else:
        # Default on-screen contextual briefing tailored to the exact active zone
        title = f"Active Screen Telemetry Analysis: {name}"
        summary = f"{name} is currently selected, presenting a Composite Heat Risk Score of {chrs}/100 and surface heat of {lst}°C."
        detailed = (
            f"You are viewing live on-screen geospatial telemetry for {name} ({level}). "
            f"Landsat-8 thermal calibration registers a peak Land Surface Temperature of {lst}°C, with canopy coverage at {canopy}%. "
            f"The platform classifies this zone as {risk} heat risk. You can use the action buttons below to toggle choropleth map layers, "
            f"inspect feature diagnostics, or simulate urban cooling investments."
        )
        audio = (
            f"Currently on your screen, {name} shows a heat risk score of {chrs} out of 100, with surface temperatures reaching {lst} degrees Celsius "
            f"and {canopy} percent canopy shade. You can toggle map layers or launch What-If simulations to explore cooling actions."
        )
        actions = [
            f"Toggle the Heat Risk (CHRS) layer to inspect regional hotspot gradients in {name}.",
            "Open Hotspot Diagnostics for additive factor decomposition.",
            "Launch the What-If Policy Simulator to project cooling benefits."
        ]

    return ScreenExplainResponse(
        title=title,
        summary=summary,
        detailed_explanation=detailed,
        grounded_sources=["Mumbai Heat Action Plan 2024", "National Disaster Management Authority", "Landsat-8 Thermal Calibration"],
        actionable_recommendations=actions,
        audio_transcript=audio,
        model_used="grounded-local-rag",
    )