# COOLNEIGHBOUR AI (THERMOSHIELD) - MASTER PROJECT CONTEXT
> **Unified Architecture, Role Assignments & Multi-Agent Development Guide**
> Target Problem Statement: **PR•RESQ: AI & Geospatial Urban Heat Risk Management Platform**
> Target Testbed: **Mumbai Metropolitan Area** (High-heat informal clusters: Dharavi, Kurla, Mankhurd, BKC, Bandra)

---

## 1. Executive Mission & What We Are Building

Urban heat islands and extreme heat waves are a silent disaster in dense developing cities. While ambient weather reports state 35°C–38°C, localized ground surface temperatures in dense tin-roofed informal settlements often exceed **45°C–48°C** with zero tree canopy and no drinking water access.

**CoolNeighbour AI** is an award-winning, end-to-end climate resilience platform with two core personas:
1. **City Heat Command Center (Admin/Planner HUD)**: A tactical GIS dashboard for municipal authorities (e.g., BMC / Disaster Management Cell) providing 500m micro-grid risk heatmaps, Explainable AI (XAI) hotspot factor audits, and a real-time "What-If" urban policy simulation sandbox (simulate adding trees, cool roofs, water kiosks with instant risk reduction calculations).
2. **Citizen Heat Relief Portal (Public Mobile Web)**: A life-saving mobile interface for gig delivery riders, pedestrians, and elderly citizens to find nearby cooling centers/misting shelters, navigate using **"CoolPath"** (thermal comfort pedestrian routing that prioritizes shaded roads and drinking water over scorching asphalt), and crowdsource real-time heat distress reports.

---

## 2. Team Division: 3 Independent Builders / Phases

To enable **3 teammates to build simultaneously without code conflicts**, the project is partitioned into **3 concrete phases**. Each phase lives in its own dedicated directory and can be developed, run, and verified **100% independently** before seamless integration.

```
                                    COOLNEIGHBOUR AI
                                           │
  ┌────────────────────────────────────────┼────────────────────────────────────────┐
  │                                        │                                        │
┌─▼──────────────────────────┐  ┌──────────▼───────────────────┐  ┌─────────────────▼─────────────────┐
│ PHASE 1: FRONTEND HUD      │  │ PHASE 2: CORE MERN BACKEND   │  │ PHASE 3: AI & COOLPATH ENGINE     │
│ (Developer 1)              │  │ (Developer 2)                │  │ (Developer 3)                     │
│ Location: /phase-1         │  │ Location: /phase-2           │  │ Location: /phase-3                │
│ Port: 5173                 │  │ Port: 5000                   │  │ Port: 8000                        │
│ Tech: React 18 + Vite + TS │  │ Tech: Node + Express + Mongo │  │ Tech: Python FastAPI + NetworkX   │
│ Leaflet + Recharts         │  │ Mongoose + Turf + Open-Meteo │  │ CHRS + XAI + What-If + NLP Triage │
└──────────────┬─────────────┘  └──────────────┬───────────────┘  └─────────────────┬─────────────────┘
               │                               │                                    │
               └──────────────────────► SHARED CONTRACTS ◄──────────────────────────┘
                                (Location: /shared/api-contract.json)
```

| Phase & Folder | Developer Role | Core Responsibilities | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Phase 1**<br>`/phase-1` | **Developer 1 (Frontend Lead)** | Tactical Command Center GIS HUD, Citizen Mobile Web Portal, Leaflet interactive map, What-If policy sliders, CoolPath A/B route visualizer, XAI drawer, SOS distress submission modal, mock data fallback. | React 18, Vite, TypeScript, Vanilla CSS / Tailwind tokens, Leaflet, Recharts, Lucide Icons |
| **Phase 2**<br>`/phase-2` | **Developer 2 (MERN Backend & DB Lead)** | MongoDB database models (HeatGrid, Shelters, Reports, Interventions), Express REST API gateway, spatial GeoJSON endpoints, live Open-Meteo weather & WBGT calculator, reverse proxy to Phase 3. | Node.js, Express.js, MongoDB / Mongoose, Turf.js, Axios, CORS, Dotenv |
| **Phase 3**<br>`/phase-3` | **Developer 3 (AI & Spatial Routing Lead)** | Composite Heat Risk Score (CHRS) algorithm, Explainable AI (XAI) feature diagnostics, What-If simulation engine, CoolPath microclimate thermal routing (A* algorithm), NLP community triage classifier. | Python 3.10+, FastAPI, Uvicorn, NetworkX, NumPy, Pydantic (or Node.js microservice) |

---

## 3. How Each Person's Antigravity Agent Operates Independently

Each developer has their own Antigravity assistant. Here is the operational protocol so nobody gets blocked:

1. **Phase 1 Agent**:
   - Reads `phase-1/README.md` and `shared/api-contract.json`.
   - Uses `phase-1/src/services/mockData.ts` and `phase-1/src/services/api.ts` (configured with `VITE_USE_MOCK=true` by default).
   - Phase 1 can build all UI screens, Leaflet layers, What-If sliders, and CoolPath visualizers with rich data **without waiting for the backend or database to be ready**.
   - When Phase 2 and 3 are running, flipping `VITE_USE_MOCK=false` immediately connects to live APIs!

2. **Phase 2 Agent**:
   - Reads `phase-2/README.md` and `shared/api-contract.json`.
   - Seeds MongoDB with `shared/mumbai_heat_grid.json`, `shared/cooling_centers.json`, and `shared/sample_reports.json`.
   - Implements the Express endpoints on port `5000`. Exposes proxy endpoints to Phase 3 (`/api/ai/*`) or forwards requests.
   - Verifies all endpoints using curl or Postman independently.

3. **Phase 3 Agent**:
   - Reads `phase-3/README.md` and `shared/api-contract.json`.
   - Implements the mathematical models for CHRS, CoolPath thermal routing, What-If simulation, and NLP triage on port `8000`.
   - Tests via FastAPI interactive Swagger docs (`http://localhost:8000/docs`).

---

## 4. Port Allocations & Environment Configuration

| Service | Port | Base URL | Health Check / Entrypoint |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite)** | `5173` | `http://localhost:5173` | UI Dashboard |
| **Backend Core (Express/Mongo)** | `5000` | `http://localhost:5000` | `GET http://localhost:5000/api/health` |
| **AI Engine (FastAPI)** | `8000` | `http://localhost:8000` | `GET http://localhost:8000/docs` |

### Environment Variables Template:

**Phase 1 (`phase-1/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK=true  # Set to 'false' during final integration
```

**Phase 2 (`phase-2/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/coolneighbour
AI_ENGINE_URL=http://localhost:8000
OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast
```

**Phase 3 (`phase-3/.env`):**
```env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

---

## 5. Mathematical & Algorithmic Foundations (Winning Edge)

### A. Composite Heat Risk Score (CHRS 0–100)
$$\text{CHRS} = w_1 \cdot \text{Hazard}(\text{LST}, \text{WBGT}) + w_2 \cdot \text{Exposure}(\text{Built-up}, \text{Pop}) + w_3 \cdot \text{Vulnerability}(\text{Elderly}, \text{Informal Housing}) - w_4 \cdot \text{Mitigation}(\text{Canopy}, \text{Water Access})$$
- **0–35 (Green)**: Low Risk (Resilient residential with mature canopy & sea breeze).
- **36–65 (Yellow)**: Moderate Risk (Commercial core, elevated surface temp, moderate canopy).
- **66–80 (Orange)**: High Alert (Dense transit hubs, asphalt radiation, high footfall).
- **81–100 (Red)**: Critical Hotspot (Informal tin-roof settlements, severe canopy deficit, low hydration access).

### B. CoolPath Microclimate Cost Function
Standard GPS navigation minimizes distance: $\min \sum \text{Distance}(e)$.
CoolPath minimizes thermal strain:
$$\text{Cost}_{\text{CoolPath}}(e) = \text{Distance}(e) \times \left(1 + \alpha \cdot \frac{\text{LST}(e) - \text{LST}_{\min}}{\text{LST}_{\max} - \text{LST}_{\min}} - \beta \cdot \text{Canopy}(e) - \gamma \cdot \text{WaterBonus}(e)\right)$$
Where $\alpha = 1.5$, $\beta = 0.8$, $\gamma = 0.4$. This reroutes pedestrians along shaded parkways and drinking kiosks with only ~10–15% added distance but **-4.5°C lower perceived temperature**!

### C. What-If Urban Intervention Simulator
$$\Delta \text{LST} = - \left( k_{\text{tree}} \cdot \frac{\text{TreesAdded}}{\text{Area}} + k_{\text{roof}} \cdot \frac{\text{CoolRoofArea}}{\text{TotalRoofArea}} \right)$$
Recalculates updated CHRS dynamically and estimates budget (INR) and CO₂ offset.

---

## 6. Seamless Integration Step (Final 10 Minutes)

1. Teammate 2 starts MongoDB and Express on `localhost:5000`.
2. Teammate 3 starts FastAPI on `localhost:8000`.
3. Teammate 1 toggles `VITE_USE_MOCK=false` in `phase-1/.env` and starts Vite on `localhost:5173`.
4. The system is instantly fully live! If any backend service is unreachable, Phase 1 gracefully falls back to mock mode so the pitch presentation never crashes.
