# Phase 2 & Phase 3 Integration Walkthrough

The integration between **Phase 2 (MERN Core Backend & Geospatial DB)** and **Phase 3 (FastAPI AI Engine & Thermal Router)** is complete, thoroughly tested, and ready for immediate consumption by the Phase 1 frontend developer.

---

## 1. Integrated Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 PHASE 1: FRONTEND HUD & APP                │
│                 (Port 5173 - React / Vite)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            HTTP / REST / WS   ▼ (Single Unified Gateway: port 5000)
┌─────────────────────────────────────────────────────────────┐
│             PHASE 2: CORE MERN BACKEND & DB                 │
│              (Port 5000 - Express + MongoDB)                │
│                                                             │
│  - Micro-grid GIS features (/api/grid)                      │
│  - Cooling Shelters + Turf spatial queries (/api/cooling-centers)
│  - Citizen SOS Distress Feed + WebSocket (/api/reports)    │
│  - Municipal What-If Policy Commitments (/api/proposals)   │
│  - Live Open-Meteo Weather + WBGT (/api/weather/current)   │
│  - Reverse Proxy Gateway for AI Endpoints (/api/ai/*)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Internal HTTP RPC  ▼ (Port 8000)
┌─────────────────────────────────────────────────────────────┐
│             PHASE 3: AI ENGINE & ROUTER                     │
│               (Port 8000 - FastAPI + NetworkX)              │
│                                                             │
│  - Composite Heat Risk Score (CHRS) Engine                  │
│  - Explainable AI (XAI) Hotspot Factor Decomposition       │
│  - What-If Urban Simulation Engine (ΔLST, CAPEX, CO₂)       │
│  - CoolPath Microclimate A* Pedestrian Router               │
│  - NLP Distress Classifier & Automated Protocol Triage      │
└─────────────────────────────────────────────────────────────┘
```

The Phase 1 developer only interacts with `http://localhost:5000`. Phase 2 serves all core data, manages spatial indexes, persists state to MongoDB, and delegates analytical / AI queries directly to Phase 3 on port `8000`.

---

## 2. Completed Integration Endpoints

All endpoints are accessible directly on `http://localhost:5000`:

| Category | Method & Path | Downstream Handler | Description |
| :--- | :--- | :--- | :--- |
| **System Diagnostics** | `GET /api/health` | Phase 2 Express | Core API health and version. |
| **AI Gateway Link** | `GET /api/ai/status` | Phase 2 $\rightarrow$ Phase 3 | Pings Phase 3 `:8000/api/health`, measures round-trip latency, and confirms active AI engine status. |
| **Micro-grids** | `GET /api/grid` | Phase 2 MongoDB | GeoJSON FeatureCollection with 500m cells, CHRS risk scores, and ward filtering (`?ward=G/North`). |
| **Cooling Centers** | `GET /api/cooling-centers/nearby` | Phase 2 MongoDB + Turf.js | Computes geodesic distances using Turf.js and retrieves nearest cooling shelters sorted by distance. |
| **Distress SOS Reports** | `POST /api/reports` | Phase 2 $\rightarrow$ Phase 3 NLP | Accepts distress report, calls Phase 3 NLP triage to extract entities and compute urgency, stores in MongoDB, and emits WebSocket event. |
| **Distress Feed** | `GET /api/reports` | Phase 2 MongoDB | Returns community distress incident feed sorted by urgency and recency. |
| **Policy Commitments** | `POST /api/proposals` | Phase 2 MongoDB | Saves What-If simulation intervention commitments into MongoDB for municipal auditing. |
| **Live WBGT Weather** | `GET /api/weather/current`<br>`GET /api/weather/live` | Phase 2 Open-Meteo Service | Live ambient temp, relative humidity, solar radiation, calculated WBGT, and alert categorization. |
| **XAI Hotspot Drivers** | `GET /api/ai/explain/:zone_id` | Phase 2 $\rightarrow$ Phase 3 XAI | Returns dynamic factor decomposition and SDG alignments for the requested zone. |
| **What-If Simulation** | `POST /api/ai/simulate` | Phase 2 $\rightarrow$ Phase 3 Simulation | Evaluates tree canopy additions, cool roofs, and kiosks to compute $\Delta LST$, CAPEX, and CO₂ offset. |
| **CoolPath A\* Router** | `POST /api/ai/coolpath` | Phase 2 $\rightarrow$ Phase 3 NetworkX | Solves A* thermal cost function over street networks and returns Shortest vs. Coolest route polylines. |

---

## 3. End-to-End Verification Test Results

An automated integration suite ([test_integration.js](file:///c:/Users/LENOVO%20Z510/Downloads/Nexora/Nexora/phase-2/src/utils/test_integration.js)) was executed against concurrently running Phase 2 and Phase 3 instances:

```
=================================================
COOLNEIGHBOUR AI: PHASE 2 & 3 INTEGRATION SUITE
=================================================

[TEST 1] Checking Phase 3 FastAPI Health (:8000)...
  SUCCESS: Phase 3 AI Engine Online: CoolNeighbour AI Engine (Phase 3)

[TEST 2] Checking Phase 2 Express Health (:5000)...
  SUCCESS: Phase 2 Backend Online: CoolNeighbour Core API

[TEST 3] Checking Phase 2 -> Phase 3 Gateway Link (/api/ai/status)...
  SUCCESS: Phase 2 AI Gateway connected to Phase 3. Latency: 17 ms

[TEST 4] Testing Phase 2 -> Phase 3 XAI Explanation (/api/ai/explain/GRID_MUM_001)...
  SUCCESS: XAI Zone ID: GRID_MUM_001 CHRS Risk: 89.4 Top Driver: Severe Canopy Deficit (3.5% cover)

[TEST 5] Testing Phase 2 -> Phase 3 What-If Simulation (/api/ai/simulate)...
  SUCCESS: Baseline CHRS: 89.4 -> Simulated CHRS: 64.2
           LST Drop: 2.4 C, Budget: INR 2735000 , CO2 Offset: 12.5 tons/yr

[TEST 6] Testing Phase 2 -> Phase 3 CoolPath A* Thermal Router (/api/ai/coolpath)...
  SUCCESS: Shortest Route: 1090 m, High Danger (91/100)
           Coolest Route:  1488 m, Safe / Tolerable (38/100)
           Temp Relief:    -4.5 C, Waypoints: 5

[TEST 7] Testing Phase 2 Citizen SOS Distress Report with Phase 3 NLP Triage (/api/reports)...
  SUCCESS: Report ID: REP_933701
           AI Triage Urgency: Critical
           Entities:          [ 'collapsed', 'fainted', 'ambulance', 'vulnerable elderly', 'transit pedestrian hub' ]
           Recommended Action: Send 108 emergency ambulance and escort to nearest cooling center triage

[TEST 8] Testing Phase 2 Proposals Commitment (/api/proposals)...
  SUCCESS: Committed Proposal: PROP_933703 Status: Submitted

[TEST 9] Testing Phase 2 Turf.js Cooling Centers Query (/api/cooling-centers/nearby)...
  SUCCESS: Found 3 nearby cooling shelters within 3 km.
           Nearest Hub: Chhota Sion Hospital / Dharavi Urban Health Centre Distance: 420 meters

[TEST 10] Testing Phase 2 GeoJSON Micro-grid (/api/grid)...
  SUCCESS: Micro-grid FeatureCollection with 1 zones loaded.

[TEST 11] Testing Phase 2 Live Open-Meteo Weather Proxy (/api/weather/live)...
  SUCCESS: City: Mumbai Air Temp: 27.9 C, Live WBGT: 27.1 C, Alert Level: Normal (Green Alert)

=================================================
ALL 11 INTEGRATION TESTS PASSED WITH 100% SUCCESS
=================================================
```

---

## 4. How the Phase 1 Developer Runs the Services

1. **One-Click Launch**:
   Double-click or run:
   ```cmd
   start-services.bat
   ```
   This automatically launches Phase 3 (FastAPI on port `8000`) and Phase 2 (Express on port `5000`) in separate command windows.

2. **Frontend Configuration**:
   In `phase-1/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_USE_MOCK=false
   ```
   Run Phase 1:
   ```cmd
   npm run dev
   ```
   The frontend is immediately fully live with real database persistence, live Open-Meteo WBGT telemetry, NetworkX A* CoolPath navigation, and real-time WebSocket distress reporting.
