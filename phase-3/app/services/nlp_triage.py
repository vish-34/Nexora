import re
import json
from typing import List
from app.models.schemas import TriageRequest, TriageResponse
from app.services.grok_client import call_grok

EMERGENCY_KEYWORDS = [
    "no drinking water",
    "tap broken",
    "water cut",
    "tanker needed",
    "hydration crisis",
    "no water for",
    "water tap broken",
    "water shortage",
    "severe thirst",
    "dehydrated",
    "dizziness",
]

CRITICAL_KEYWORDS = [
    "collapsed",
    "fainting",
    "fainted",
    "heat stroke",
    "unconscious",
    "ambulance",
    "convulsion",
    "elderly collapsed",
    "vomiting blood",
    "high fever",
    "breathing difficulty",
]

MEDIUM_KEYWORDS = [
    "fan broken",
    "kiosk empty",
    "shade torn",
    "shade broken",
    "misting broken",
    "crowded shelter",
    "no seating",
    "water warm",
    "filter dirty",
    "dispenser leak",
]

def extract_entities(text: str) -> List[str]:
    entities = []
    lowered = text.lower()

    all_keys = CRITICAL_KEYWORDS + EMERGENCY_KEYWORDS + MEDIUM_KEYWORDS
    for key in all_keys:
        if key in lowered:
            entities.append(key)

    if "worker" in lowered or "construction" in lowered:
        entities.append("outdoor workers")
    if "elderly" in lowered or "senior" in lowered:
        entities.append("vulnerable elderly")
    if "child" in lowered or "baby" in lowered:
        entities.append("children present")
    if "station" in lowered or "bus" in lowered or "queue" in lowered:
        entities.append("transit pedestrian hub")

    return list(dict.fromkeys(entities))

def classify_with_grok(req: TriageRequest) -> TriageResponse | None:
    text = (req.description or "").strip()
    if not text:
        return None

    system_prompt = (
        "You are Grok, an emergency medical triage and urban heat distress classifier for BMC Disaster Management. "
        "Analyze the citizen report and return JSON with keys: 'urgency' ('Emergency', 'Critical', 'Medium', 'Low'), "
        "'confidence' (float 0.80 to 0.99), 'extracted_entities' (list of strings), and 'recommended_action' (string)."
    )

    user_prompt = f"Citizen Report: '{text}'\nCategory: '{req.category or 'General'}'"
    result = call_grok(prompt=user_prompt, system_prompt=system_prompt, json_mode=True)
    if not result:
        return None

    try:
        data = json.loads(result)
        urgency = data.get("urgency", "Medium")
        if urgency not in ["Emergency", "Critical", "Medium", "Low"]:
            urgency = "Medium"
        return TriageResponse(
            urgency=urgency,
            confidence=float(data.get("confidence", 0.92)),
            extracted_entities=list(data.get("extracted_entities", ["community report"])),
            recommended_action=str(data.get("recommended_action", "Log for municipal review")),
        )
    except Exception:
        return None

def classify_distress(req: TriageRequest) -> TriageResponse:
    grok_result = classify_with_grok(req)
    if grok_result:
        return grok_result

    text = (req.description or "").strip()
    lowered = text.lower()
    entities = extract_entities(text)

    has_critical = any(kw in lowered for kw in CRITICAL_KEYWORDS)
    has_emergency = any(kw in lowered for kw in EMERGENCY_KEYWORDS)
    has_medium = any(kw in lowered for kw in MEDIUM_KEYWORDS)

    category = (req.category or "").lower()

    if has_critical or "heat stroke" in category or "heat exhaustion" in category and ("collaps" in lowered or "faint" in lowered):
        urgency = "Critical"
        confidence = 0.98
        action = "Send 108 emergency ambulance and escort to nearest cooling center triage"
    elif has_emergency or "hydration" in category or "water" in category:
        urgency = "Emergency"
        confidence = 0.95
        action = "Dispatch emergency municipal water tanker & ORS distribution kit"
    elif has_medium or "infrastructure" in category or "broken" in lowered:
        urgency = "Medium"
        confidence = 0.88
        action = "Deploy ward engineering team for priority kiosk and shade repairs"
    else:
        urgency = "Low"
        confidence = 0.82
        action = "Log incident for routine ward sanitation and hydration monitoring"

    if not entities:
        words = [w for w in re.findall(r"\b\w{4,}\b", lowered) if w not in {"with", "that", "this", "from", "have"}]
        entities = words[:3] if words else ["community report"]

    return TriageResponse(
        urgency=urgency,
        confidence=confidence,
        extracted_entities=entities,
        recommended_action=action,
    )
