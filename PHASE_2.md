# PHASE 2 PLAN: CORE MERN BACKEND & GEOSPATIAL DATABASE
> **Assigned to: Developer 2 (MERN Backend & DB Lead)**
> **Folder**: `phase-2/`
> **Local Port**: `http://localhost:5000`
> **Primary Tech Stack**: Node.js, Express.js, MongoDB (Mongoose), Turf.js, Axios, CORS, Dotenv

---

## 1. Executive Mission & What Developer 2 Builds

Developer 2 builds the core server, database persistence, and geospatial API gateway for **CoolNeighbour AI**. This service acts as the central hub of the MERN architecture:
- Stores and queries 500m GeoJSON micro-grids, cooling shelters, citizen distress reports, and municipal policy interventions in **MongoDB**.
- Performs spatial `$near` and bounding-box queries to find nearest cooling shelters and high-risk zones.
- Ingests live satellite/weather data from **Open-Meteo Weather API** to compute real-time **Wet Bulb Globe Temperature (WBGT)** and trigger Red/Orange municipal heat alerts.
- Provides a unified REST API for Phase 1 (Frontend) while cleanly proxying/delegating complex simulation and routing requests to Phase 3 (AI Engine).

---

## 2. End-to-End Component Blueprint

### A. MongoDB Database Models (`src/models/`)
1. **`HeatGrid.js`**:
   - `zone_id` (String, unique, indexed)
   - `name` (String), `ward` (String)
   - `geometry` (GeoJSON Polygon with `2dsphere` index)
   - `lst_celsius` (Number), `ndvi` (Number), `ndbi` (Number)
   - `population_density_per_sqkm` (Number)
   - `elderly_percentage` (Number), `informal_housing_ratio` (Number)
   - `canopy_cover_pct` (Number), `drinking_water_access_score` (Number)
   - `chrs_risk_score` (Number 0-100), `risk_level` (String: 'Low', 'Moderate', 'High', 'Critical')
   - `primary_hazard_driver` (String)

2. **`CoolingCenter.js`**:
   - `id` (String, unique)
   - `name` (String), `category` (String), `ward` (String)
   - `location` (GeoJSON Point with `2dsphere` index)
   - `address` (String), `operating_hours` (String)
   - `capacity` (Number), `current_occupancy` (Number)
   - `amenities` ([String]), `contact` (String)
   - `status` (String: 'Open', 'Crowded', 'Full', 'Closed')
   - `verified` (Boolean)

3. **`CitizenReport.js`**:
   - `id` (String, auto-generated)
   - `reporter_name` (String), `phone` (String)
   - `category` (String: 'Hydration Crisis', 'Heat Exhaustion', 'Broken Infrastructure', 'Shelter Needed')
   - `description` (String)
   - `location` (GeoJSON Point with `2dsphere` index)
   - `zone_id` (String, ref to HeatGrid)
   - `urgency` (String: 'Emergency', 'Critical', 'Medium', 'Low')
   - `status` (String: 'Pending', 'In-Progress', 'Dispatched', 'Resolved')
   - `ai_triage` (Object: `{ confidence: Number, extracted_entities: [String], recommended_action: String }`)
   - `created_at` (Date, default: now)

4. **`Intervention.js`**:
   - Stores saved What-If simulation runs created by urban planners for auditing and municipal budget proposals.

### B. Seed Data Ingestion Script (`src/utils/seedData.js`)
- An automated CLI script (`npm run seed`) that reads:
  - `../shared/mumbai_heat_grid.json`
  - `../shared/cooling_centers.json`
  - `../shared/sample_reports.json`
- Clears and populates the MongoDB database in 2 seconds so the entire testbed is instantly populated.

### C. Live Weather & WBGT Calculation Service (`src/services/weatherService.js`)
- Queries Open-Meteo Free Weather API for Mumbai coordinates (`lat=19.0760&lng=72.8777`).
- Fetches: ambient temperature $T_a$, relative humidity $RH$, and solar radiation $S$.
- Computes **Wet Bulb Globe Temperature (WBGT)**:
  $$\text{WBGT} \approx 0.7 \cdot T_w + 0.2 \cdot T_g + 0.1 \cdot T_a$$
- Categorizes Municipal Alert Level:
  - $\text{WBGT} \ge 32.2^\circ\text{C}$: **Extreme Danger (Red Alert)**
  - $30.1^\circ\text{C} \le \text{WBGT} < 32.2^\circ\text{C}$: **High Heat Danger (Orange Alert)**
  - $27.8^\circ\text{C} \le \text{WBGT} < 30.1^\circ\text{C}$: **Heat Caution (Yellow Alert)**
  - $\text{WBGT} < 27.8^\circ\text{C}$: **Normal (Green Alert)**

### D. REST API Endpoints (`src/routes/`)
1. **Heat Grid Routes (`/api/grid`)**:
   - `GET /api/grid`: Return GeoJSON FeatureCollection. Optional filters: `?ward=G/North&minRisk=70`.
   - `GET /api/grid/:zone_id`: Return single cell details.
2. **Cooling Centers Routes (`/api/cooling-centers`)**:
   - `GET /api/cooling-centers`: Return all centers, or find nearest with `?lat=19.04&lng=72.85&radius_km=3` using MongoDB `$near`.
3. **Citizen Reports Routes (`/api/reports`)**:
   - `GET /api/reports`: Return community distress feed sorted by urgency and date.
   - `POST /api/reports`: Accept new distress report, call Phase 3 NLP triage (or use internal rule-based triage fallback), save to MongoDB, and return enriched report.
4. **Live Weather Route (`/api/weather/current`)**:
   - `GET /api/weather/current`: Returns live Mumbai temperature, humidity, WBGT, and alert status.
5. **Phase 3 Reverse Proxy & Gateway Routes (`/api/ai/*`)**:
   - `GET /api/ai/explain/:zone_id`: Forwards to Phase 3 (`http://localhost:8000/api/ai/explain/:zone_id`). If Phase 3 is not yet running, returns realistic fallback explanation!
   - `POST /api/ai/simulate`: Forwards to Phase 3 (`http://localhost:8000/api/ai/simulate`). If Phase 3 is offline, returns fallback simulation!
   - `POST /api/ai/coolpath`: Forwards to Phase 3 (`http://localhost:8000/api/ai/coolpath`). If Phase 3 is offline, returns fallback dual-route profile!

---

## 3. Dedicated Folder & File Layout for Phase 2

```
Nexora/phase-2/
├── package.json
├── .env.example
├── .env
├── src/
│   ├── server.js                  # Express entrypoint, middleware, and route mounting
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection handler
│   ├── models/
│   │   ├── HeatGrid.js            # GeoJSON micro-grid schema
│   │   ├── CoolingCenter.js       # Cooling shelter & hydration schema (2dsphere)
│   │   ├── CitizenReport.js       # Heat distress incident schema
│   │   └── Intervention.js        # Saved simulation scenarios
│   ├── services/
│   │   ├── weatherService.js      # Open-Meteo live WBGT calculator
│   │   └── aiGatewayService.js    # Resilient bridge to Phase 3 FastAPI microservice
│   ├── controllers/
│   │   ├── gridController.js      # Handlers for /api/grid
│   │   ├── shelterController.js   # Handlers for /api/cooling-centers
│   │   ├── reportController.js    # Handlers for /api/reports
│   │   └── aiProxyController.js   # Handlers for /api/ai/*
│   ├── routes/
│   │   ├── gridRoutes.js
│   │   ├── shelterRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── weatherRoutes.js
│   │   └── aiRoutes.js
│   └── utils/
│       └── seedData.js            # One-click seed script from shared data
```

---

## 4. How Developer 2's Antigravity Agent Builds Independently

- **Zero-Block Resilience**: Developer 2 does **NOT** need Phase 3 running.
- `aiGatewayService.js` includes an automatic fallback:
  ```js
  try {
    const res = await axios.get(`${process.env.AI_ENGINE_URL}/api/ai/explain/${zoneId}`, { timeout: 1500 });
    return res.data;
  } catch (err) {
    // Fallback: return pre-calculated XAI data from seed
    return getFallbackExplanation(zoneId);
  }
  ```
- Developer 2 can spin up MongoDB, run `npm run seed`, and test all REST endpoints via curl or Postman independently.

---

## 5. Seamless Integration Protocol (Final Step)

When Developer 3 starts the FastAPI AI service on `http://localhost:8000`:
- Developer 2's `aiGatewayService.js` automatically forwards requests to `http://localhost:8000` without any changes.
- Developer 1's frontend points to `http://localhost:5000` and receives a unified API surface!

---

## 6. Phase 2 Verification Checklist

- [ ] `npm run seed` connects to MongoDB and inserts Mumbai heat grid, shelters, and sample reports.
- [ ] `npm run dev` starts Express server on `http://localhost:5000`.
- [ ] `curl http://localhost:5000/api/health` returns `{ status: "ok", service: "CoolNeighbour Core API" }`.
- [ ] `curl http://localhost:5000/api/grid` returns valid GeoJSON FeatureCollection with 5 zones.
- [ ] `curl http://localhost:5000/api/cooling-centers` returns cooling hubs with capacity and coordinates.
- [ ] `curl http://localhost:5000/api/weather/current` returns live calculated WBGT and alert level.
- [ ] `POST /api/reports` successfully saves a distress report and returns urgency classification.
