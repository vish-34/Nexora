# PHASE 3 PLAN: AI INTELLIGENCE, THERMAL MODELING & COOLPATH ROUTING ENGINE
> **Assigned to: Developer 3 (AI & Spatial Algorithms Lead)**
> **Folder**: `phase-3/`
> **Local Port**: `http://localhost:8000`
> **Primary Tech Stack**: Python 3.10+, FastAPI, Uvicorn, NetworkX, NumPy, Pydantic (or Node.js alternative)

---

## 1. Executive Mission & What Developer 3 Builds

Developer 3 builds the core computational brain and algorithms for **CoolNeighbour AI**. This service provides the critical scientific and analytical capabilities that win hackathons:
1. **Composite Heat Risk Score (CHRS)**: Multi-source index synthesizing satellite Land Surface Temperature (LST), vegetation canopy (NDVI), built-up index (NDBI), and socio-economic vulnerability.
2. **Explainable AI (XAI) Factor Diagnostics**: SHAP-like feature attribution breaking down the exact drivers of local heat risk so city officials understand *why* a neighborhood is dangerous.
3. **Urban Policy "What-If" Simulator**: Dynamic simulation engine calculating localized temperature drop ($\Delta LST$), risk reduction, municipal budget (INR), and carbon offset when planners add trees, cool roofs, or hydration kiosks.
4. **CoolPath Microclimate Thermal Routing**: Graph-based pathfinding engine optimizing for **thermal comfort and shade** instead of just shortest distance, reducing pedestrian heat exposure by up to 4.5°C!
5. **NLP Community Distress Triage**: Text intelligence pipeline that classifies citizen heat distress reports into actionable urgency levels with automated municipal dispatch recommendations.

---

## 2. End-to-End Component Blueprint

### A. Composite Heat Risk Score (CHRS) Algorithm (`app/services/heat_index.py`)
Computes normalized risk $0 \le \text{CHRS} \le 100$:
$$\text{Hazard} = 0.6 \cdot \text{norm}(LST) + 0.4 \cdot \text{norm}(WBGT)$$
$$\text{Exposure} = 0.5 \cdot \text{norm}(PopDensity) + 0.5 \cdot \text{norm}(NDBI)$$
$$\text{Vulnerability} = 0.6 \cdot InformalRatio + 0.4 \cdot ElderlyPct$$
$$\text{Mitigation} = 0.6 \cdot CanopyCover + 0.4 \cdot WaterAccess$$
$$\text{CHRS} = 100 \times \left(0.35 \cdot \text{Hazard} + 0.30 \cdot \text{Exposure} + 0.25 \cdot \text{Vulnerability} - 0.15 \cdot \text{Mitigation}\right)$$

### B. Explainable AI (XAI) Hotspot Diagnostics (`app/services/xai_engine.py`)
- Endpoint: `GET /api/ai/explain/{zone_id}`
- Analyzes the feature vector of the requested zone against regional baseline medians.
- Computes relative percentage contribution of each risk factor:
  - Surface Temperature (LST) impact: e.g. `+36.2%`
  - Low-albedo informal tin roofs: e.g. `+28.5%`
  - Canopy cover deficit: e.g. `+22.1%`
  - Distance to clean drinking water: e.g. `+13.2%`
- Maps findings to UN Sustainable Development Goals (**SDG 11: Sustainable Cities** & **SDG 13: Climate Action**).

### C. Urban Policy "What-If" Simulation Engine (`app/services/simulator.py`)
- Endpoint: `POST /api/ai/simulate`
- Input payload:
  ```json
  {
    "zone_id": "GRID_MUM_001",
    "interventions": {
      "canopy_trees_added": 250,
      "cool_roof_sqm": 8000,
      "water_kiosks_added": 3
    }
  }
  ```
- Mathematical simulation formulas:
  - $\Delta LST = -\left( \frac{\text{trees}}{100} \times 0.45^\circ\text{C} + \frac{\text{cool\_roof\_sqm}}{1000} \times 0.18^\circ\text{C} + \text{kiosks} \times 0.15^\circ\text{C} \right)$
  - Recalculates updated CHRS score using new effective canopy and surface temperature.
  - Computes Municipal Cost:
    - ₹3,500 per mature neem/banyan tree sapling + 2-year maintenance
    - ₹120 per $m^2$ high-albedo elastomeric cool roof coating
    - ₹3,00,000 per solar misting hydration kiosk
  - Computes Environmental Benefit: $\approx 50\text{ kg CO}_2 / \text{tree / yr}$.

### D. CoolPath Microclimate Routing Engine (`app/services/coolpath_router.py`)
- Endpoint: `POST /api/ai/coolpath`
- Builds a spatial pedestrian graph (using NetworkX or grid network) for the target area.
- Computes two distinct routes:
  1. **Route A (Shortest Route)**: Minimizes standard Euclidean/Manhattan distance. Reroutes directly through unshaded concrete arterial roads.
  2. **Route B (CoolPath)**: Minimizes the **Thermal Strain Cost Function**:
     $$\text{Cost}(e) = \text{Distance}(e) \times \left(1 + \alpha \cdot \frac{\text{LST}(e) - \text{LST}_{\min}}{\Delta \text{LST}} - \beta \cdot \text{Canopy}(e) - \gamma \cdot \text{WaterBonus}(e)\right)$$
- Output: Returns both polylines, average exposure temperatures (°C), shade coverage percentage (%), and thermal strain category.

### E. NLP Community Distress Triage Classifier (`app/services/nlp_triage.py`)
- Endpoint: `POST /api/ai/triage`
- Analyzes citizen report text using symptom and urgency keyword extraction + heuristic classification:
  - "collapsed", "fainting", "heat stroke", "ambulance" $\rightarrow$ **Critical (Confidence: 0.98)**
  - "no drinking water", "tanker needed", "dizziness" $\rightarrow$ **Emergency (Confidence: 0.95)**
  - "fan broken", "kiosk empty", "shade torn" $\rightarrow$ **Medium (Confidence: 0.88)**
- Generates recommended municipal relief action for instant operational dispatch.

---

## 3. Dedicated Folder & File Layout for Phase 3

```
Nexora/phase-3/
├── requirements.txt               # FastAPI, Uvicorn, NetworkX, NumPy, Pydantic
├── .env.example
├── .env
└── app/
    ├── main.py                    # FastAPI app entrypoint, CORS, route inclusion
    ├── models/
    │   └── schemas.py             # Pydantic input/output schemas matching API contract
    └── services/
        ├── heat_index.py          # CHRS formula calculator
        ├── xai_engine.py          # Hotspot factor attribution & explainability
        ├── simulator.py           # What-If policy simulation engine
        ├── coolpath_router.py     # Microclimate thermal comfort A* router
        └── nlp_triage.py          # Citizen distress urgency classifier
```

---

## 4. How Developer 3's Antigravity Agent Builds Independently

- **Zero-Block Autonomy**: Developer 3 does not need the frontend or MongoDB running.
- FastAPI automatically generates interactive documentation at:
  ```
  http://localhost:8000/docs
  ```
- Developer 3 can test all endpoints, input parameters, and algorithms directly through the Swagger web UI.
- All request and response schemas in `app/models/schemas.py` match `shared/api-contract.json` exactly.

---

## 5. Seamless Integration Protocol (Final Step)

When Developer 3 starts FastAPI on `http://localhost:8000`:
- Developer 2's Express backend proxies calls to `http://localhost:8000/api/ai/*`.
- Developer 1's frontend visualizes the simulation results, XAI breakdowns, and CoolPath routes seamlessly!

---

## 6. Phase 3 Verification Checklist

- [ ] `pip install -r requirements.txt` succeeds without conflicts.
- [ ] `uvicorn app.main:app --reload --port 8000` boots cleanly.
- [ ] Visiting `http://localhost:8000/docs` shows interactive Swagger interface.
- [ ] `GET /api/ai/explain/GRID_MUM_001` returns 4 factor drivers with percentage impacts.
- [ ] `POST /api/ai/simulate` returns predicted temperature drop, updated CHRS, and budget estimate.
- [ ] `POST /api/ai/coolpath` returns both Shortest and Coolest routes with coordinates and shade %.
- [ ] `POST /api/ai/triage` accurately classifies heat distress text into emergency urgency tiers.
