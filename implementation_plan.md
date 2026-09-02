# Unified Implementation Plan: CoolNeighbour AI (Urban Heat Risk & Climate Resilience Platform)
> **Problem Statement**: PR•RESQ: AI & Geospatial Urban Heat Risk Management Platform
> **Testbed City**: Mumbai Metropolitan Area (Dharavi, Kurla, Mankhurd, BKC, Bandra)
> **Core Architecture**: MERN Stack + Python/FastAPI Spatial AI Microservice
> **Team Division**: 3 Independent Builders / Phases (Phase 1 Frontend, Phase 2 Core Backend & DB, Phase 3 AI & CoolPath Engine)

---

## 1. Executive Summary & Hackathon Winning Strategy

Extreme urban heat is a silent killer in dense, developing urban environments. While generic weather apps report uniform ambient temperatures (e.g. 36°C), localized ground surface temperatures in dense informal settlements frequently surge to **44°C–48°C** due to tin-sheet roofing, high building density, absence of tree canopy, and lack of hydration points.

To build an undisputed **1st place winning solution**, **CoolNeighbour AI (ThermoShield)** is structured as an end-to-end climate resilience platform combining:
1. **Multi-source Geospatial Heat Risk Engine**: Fusion of Satellite Land Surface Temperature (LST), Normalized Difference Vegetation Index (NDVI), Built-up Index (NDBI), real-time Wet Bulb Globe Temperature (WBGT), and Socio-Economic Vulnerability Index (SEVI).
2. **Explainable AI (XAI) Hotspot Diagnostics**: SHAP-like factor contribution explaining *why* a micro-grid cell is hazardous (+36% surface heat, +28% informal tin roofs, +22% canopy deficit).
3. **Interactive "What-If" Policy Simulator**: Municipal sandbox enabling urban planners to simulate policy interventions (*add 250 canopy trees, 8,000 m² cool roofs, 3 misting kiosks*) and view the immediate predicted temperature drop and risk score reduction in real time.
4. **"CoolPath" Microclimate Route Optimizer**: The killer citizen feature — side-by-side comparison of the **Shortest Route (High Heat Exposure)** vs **Coolest Route (Shaded Canopy & Water Waypoints)** with shade percentage and metabolic strain metrics.
5. **Crowdsourced Ground-Truth & NLP Auto-Triage**: Citizens submit geo-tagged heat distress reports (*"no drinking water", "elderly heat stroke risk"*), classified by AI into urgency levels that dynamically update hotspot priority.
6. **Dual Persona Interface**:
   - **City Heat Command Center (Admin/Planner)**: Tactical HUD for municipal corporations and disaster authorities.
   - **Citizen Heat Relief Portal (Public Mobile-Optimized)**: Instant "Find nearest cooling center with cool route", hydration alerts, and heat-safe navigation.

---

## 2. 3-Phase Unified Team Partitioning

To ensure that **3 developers can build concurrently without blocking each other or causing merge conflicts**, the platform is strictly divided into 3 modular phases with a shared contract layer:

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
│ Plan: PHASE_1.md           │  │ Plan: PHASE_2.md             │  │ Plan: PHASE_3.md                  │
└──────────────┬─────────────┘  └──────────────┬───────────────┘  └─────────────────┬─────────────────┘
               │                               │                                    │
               └──────────────────────► SHARED CONTRACTS ◄──────────────────────────┘
                         (shared/api-contract.json, mumbai_heat_grid.json)
```

### Phase Summary Matrix

| Phase | Developer Role | Scope & Deliverables | Tech Stack | Dedicated Plan File |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Developer 1**<br>*(Frontend Lead)* | Command Center HUD, Citizen Mobile View, Leaflet GIS map with 500m heat polygons, XAI Drawer, What-If Policy Sliders, CoolPath Route Comparison Modal, SOS Report Form, offline mock data layer. | React 18, Vite, TypeScript, Vanilla CSS / Tailwind tokens, Leaflet, Recharts, Lucide Icons, Axios | [PHASE_1.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_1.md) |
| **Phase 2** | **Developer 2**<br>*(MERN Backend & DB Lead)* | Express REST API server, MongoDB schemas (HeatGrid, Shelters, Reports, Interventions), 2dsphere spatial queries, Open-Meteo live WBGT weather ingestion, seed data ingestion, reverse proxy to Phase 3. | Node.js, Express.js, MongoDB / Mongoose, Turf.js, Axios, CORS, Dotenv | [PHASE_2.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_2.md) |
| **Phase 3** | **Developer 3**<br>*(AI & Spatial Routing Lead)* | Composite Heat Risk Score (CHRS) algorithm, XAI feature attribution diagnostics, What-If urban intervention mathematical model, CoolPath A* microclimate thermal router, NLP distress report triage. | Python 3.10+, FastAPI, Uvicorn, NetworkX, NumPy, Pydantic | [PHASE_3.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_3.md) |

---

## 3. Unified Directory Structure

```
Nexora/
├── PROJECT_CONTEXT.md             # Master platform context for all 3 developers & their AI agents
├── implementation_plan.md         # This unified master plan
├── PHASE_1.md                     # Dedicated instruction plan for Developer 1 (Frontend)
├── PHASE_2.md                     # Dedicated instruction plan for Developer 2 (Backend & DB)
├── PHASE_3.md                     # Dedicated instruction plan for Developer 3 (AI & Algorithms)
│
├── shared/                        # Single source of truth for schemas & seed data
│   ├── api-contract.json          # Complete REST API specification (endpoints, params, schemas)
│   ├── mumbai_heat_grid.json      # Realistic 500m micro-grid GeoJSON for Mumbai testbed
│   ├── cooling_centers.json       # Cooling shelters, misting kiosks, and emergency clinics
│   └── sample_reports.json        # Seed citizen distress reports with AI triage tags
│
├── phase-1/                       # DEVELOPER 1 WORKSPACE (Frontend)
│   ├── README.md                  # Quick reference pointing to PHASE_1.md
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── .env.example
│   ├── .env                       # Pre-configured with VITE_USE_MOCK=true
│   └── src/
│       ├── types/index.ts         # TypeScript definitions strictly matching shared/api-contract.json
│       ├── services/mockData.ts   # Instant zero-backend mock data layer
│       ├── services/api.ts        # Resilient Axios client (auto-switchable mock vs live API)
│       ├── styles/index.css       # Dark tactical glassmorphic styling & heat gradients
│       ├── components/            # UI components (Navbar, MapView, XaiDrawer, WhatIf, CoolPath, etc.)
│       └── App.tsx                # Shell with Persona Switcher (Command HUD vs Citizen View)
│
├── phase-2/                       # DEVELOPER 2 WORKSPACE (MERN Backend)
│   ├── README.md                  # Quick reference pointing to PHASE_2.md
│   ├── package.json
│   ├── .env.example
│   ├── .env                       # PORT=5000, MONGO_URI, AI_ENGINE_URL=http://localhost:8000
│   └── src/
│       ├── server.js              # Express entrypoint & middleware
│       ├── config/db.js           # Mongoose MongoDB connection
│       ├── models/                # HeatGrid, CoolingCenter, CitizenReport, Intervention
│       ├── services/              # weatherService.js (Open-Meteo WBGT), aiGatewayService.js
│       ├── controllers/           # gridController, shelterController, reportController, aiProxyController
│       ├── routes/                # Express router mounts matching shared/api-contract.json
│       └── utils/seedData.js      # npm run seed (seeds MongoDB from shared/*.json)
│
└── phase-3/                       # DEVELOPER 3 WORKSPACE (AI Engine)
    ├── README.md                  # Quick reference pointing to PHASE_3.md
    ├── requirements.txt           # fastapi, uvicorn, networkx, numpy, pydantic
    ├── .env.example
    ├── .env                       # PORT=8000, CORS_ORIGINS
    └── app/
        ├── main.py                # FastAPI entrypoint with interactive Swagger docs (/docs)
        ├── models/schemas.py      # Pydantic schemas matching shared/api-contract.json
        └── services/
            ├── heat_index.py      # CHRS mathematical calculation
            ├── xai_engine.py      # Hotspot factor attribution diagnostics
            ├── simulator.py       # What-If policy simulation engine
            ├── coolpath_router.py # Microclimate thermal comfort routing algorithm
            └── nlp_triage.py      # Community report urgency classifier
```

---

## 4. Shared API Contracts & Communication Protocol

All three phases strictly communicate through the endpoints defined in [shared/api-contract.json](file:///c:/Users/vishal/Desktop/Nexora/shared/api-contract.json):

| Endpoint | Method | Primary Handler | Responsibility |
| :--- | :--- | :--- | :--- |
| `/api/grid` | `GET` | Phase 2 (MongoDB) | Returns GeoJSON FeatureCollection of 500m micro-grids with risk scores. |
| `/api/cooling-centers` | `GET` | Phase 2 (MongoDB) | Geospatial `$near` search for nearest shelters and hydration stations. |
| `/api/reports` | `GET` / `POST` | Phase 2 (MongoDB + Phase 3) | Submits citizen distress report, auto-triages with NLP, saves to MongoDB. |
| `/api/weather/current` | `GET` | Phase 2 (Open-Meteo) | Fetches ambient metrics, computes live WBGT index and municipal heat alert tier. |
| `/api/ai/explain/:zone_id` | `GET` | Phase 3 (FastAPI via Phase 2 proxy) | Returns factor attribution breakdown for Explainable AI drawer. |
| `/api/ai/simulate` | `POST` | Phase 3 (FastAPI via Phase 2 proxy) | Simulates policy interventions (trees, cool roofs, kiosks), returns $\Delta LST$ and $\Delta CHRS$. |
| `/api/ai/coolpath` | `POST` | Phase 3 (FastAPI via Phase 2 proxy) | Solves dual routing: Shortest Route vs Coolest Route with shade metrics. |

---

## 5. Independent Development Protocol (Zero-Block Workflow)

1. **Developer 1 (Frontend)**:
   - Operates with `VITE_USE_MOCK=true` in `phase-1/.env`.
   - Uses `phase-1/src/services/mockData.ts` and `phase-1/src/services/api.ts`.
   - Builds, styles, and verifies the entire UI without waiting for Phase 2 or Phase 3.
2. **Developer 2 (Core Backend)**:
   - Runs MongoDB and Express on port `5000`.
   - Seeds database with `npm run seed` using shared JSON files.
   - Forwards AI requests to Phase 3; if Phase 3 is not yet active, returns fallback data defined in `aiGatewayService.js`.
3. **Developer 3 (AI Engine)**:
   - Runs FastAPI on port `8000`.
   - Verifies all math, routing, and NLP triage using the interactive Swagger UI at `http://localhost:8000/docs`.

---

## 6. The 10-Minute Seamless Integration Procedure

When each developer finishes their phase:
1. **Developer 2** runs MongoDB and starts Express (`npm run dev` in `/phase-2`).
2. **Developer 3** starts FastAPI (`uvicorn app.main:app --reload --port 8000` in `/phase-3`).
3. **Developer 1** edits `phase-1/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_USE_MOCK=false
   ```
4. **Developer 1** runs `npm run dev` in `/phase-1`.
5. **Done!** The frontend instantly visualizes live MongoDB data, live Open-Meteo weather, and live FastAPI algorithms with zero code changes.

---

## 7. Hackathon Winning Demo Script (Judges Pitch Flow)

1. **The Problem & Hook (30s)**:
   *"Judges, extreme urban heat is a silent killer. Traditional weather apps report 36°C, but in dense informal settlements like Dharavi, surface temperatures hit 46°C with zero shade. CoolNeighbour AI bridges earth observation, municipal urban planning, and citizen survival."*
2. **City Command Center & XAI (60s)**:
   - Display the tactical GIS map. Toggle layers: Heat Risk Index $\rightarrow$ Satellite LST $\rightarrow$ Vegetation Canopy $\rightarrow$ Cooling Shelters.
   - Click **Zone 1 (Dharavi Hotspot)**: Show the **Explainable AI (XAI)** drawer diagnosing the root causes (+36.2% surface heat, +28.5% informal tin roofs, +22.1% canopy deficit).
3. **The Urban Planner "What-If" Sandbox (60s)**:
   - Open What-If Simulator: Drag sliders to add *250 canopy trees*, *8,000 m² cool roofs*, and *3 misting kiosks*.
   - Watch the predicted temperature drop live by **-2.4°C** and the risk score plunge from **89.4 (Critical) to 63.8 (Moderate)** with budget and CO₂ offset metrics.
4. **The Citizen Killer Feature: "CoolPath" Navigation (60s)**:
   - Switch persona to **Citizen Relief Portal**.
   - Select origin and destination: View **Route A (Shortest: 1.1 km, 94% sun exposure, extreme danger)** vs **Route B (CoolPath: 1.3 km, 74.5% shade canopy, 4.5°C cooler perceived temperature, 2 water kiosks)**.
5. **Crowdsourced Ground Truth & Rapid AI Triage (45s)**:
   - Submit a distress report: *"Drinking water tap broken near transit camp crossroad, workers dizzy."*
   - Show the AI automatically tag it as **EMERGENCY / HYDRATION CRISIS**, recommend municipal water tanker dispatch, and pin it to the live map.
6. **Closing Impact & SDG Alignment (15s)**:
   - Show direct alignment with UN SDG 11 (Sustainable Cities) and SDG 13 (Climate Action).

---

## 8. Verification & Validation Plan

### Phase 1 Verification:
- Run `npm run dev` in `/phase-1`. Verify responsive UI, Leaflet map rendering, layer toggles, What-If sliders, CoolPath modal, and citizen report form.
- Run `npm run build` to verify zero TypeScript errors.

### Phase 2 Verification:
- Run `npm run seed` in `/phase-2` to populate MongoDB.
- Run `npm run dev` in `/phase-2`. Test endpoints:
  - `GET http://localhost:5000/api/grid`
  - `GET http://localhost:5000/api/cooling-centers`
  - `GET http://localhost:5000/api/weather/current`
  - `POST http://localhost:5000/api/reports`

### Phase 3 Verification:
- Run `uvicorn app.main:app --reload --port 8000` in `/phase-3`.
- Open `http://localhost:8000/docs` in browser. Test endpoints:
  - `GET /api/ai/explain/GRID_MUM_001`
  - `POST /api/ai/simulate`
  - `POST /api/ai/coolpath`
  - `POST /api/ai/triage`

### Unified Integration Verification:
- Switch `VITE_USE_MOCK=false` in `/phase-1/.env`.
- Ensure end-to-end data flow: Frontend (5173) $\longleftrightarrow$ Backend (5000) $\longleftrightarrow$ AI Engine (8000).
