# PHASE 1 PLAN: FRONTEND APPLICATION & DUAL-PERSONA INTERFACE
> **Assigned to: Developer 1 (Frontend Lead)**
> **Folder**: `phase-1/`
> **Local Port**: `http://localhost:5173`
> **Primary Tech Stack**: React 18 + Vite + TypeScript + Tailwind CSS / Vanilla CSS tokens + Leaflet / React-Leaflet + Recharts + Lucide Icons + Axios

---

## 1. Executive Mission & What Developer 1 Builds

Developer 1 builds the entire visual, interactive, and geospatial presentation layer for **CoolNeighbour AI (ThermoShield)**. The app must immediately captivate judges with a sleek, dark-mode, tactical glassmorphic HUD, offering two distinct user experiences:

1. **City Heat Command Center (Admin/Planner View)**: A high-density tactical interface for municipal disaster management (e.g., BMC / Disaster Management Cell) featuring live GIS multi-layer maps, Explainable AI (XAI) hotspot factor breakdowns, and an interactive "What-If" policy intervention simulator.
2. **Citizen Heat Relief Portal (Public Mobile Web View)**: An accessible, high-contrast mobile interface for gig workers, pedestrians, and vulnerable citizens to locate nearby cooling centers and navigate safely using **CoolPath** microclimate thermal routing.

---

## 2. End-to-End Component Blueprint

### A. Navigation & Telemetry Header (`Navbar.tsx`)
- **Brand Title**: *CoolNeighbour AI / ThermoShield* with an animated glowing pulse badge.
- **Persona Toggle**: Instant switch between `[City Command HUD (Admin)]` and `[Citizen Heat Relief (Public)]`.
- **Live WBGT Alert Banner**: Color-coded banner showing live Wet Bulb Globe Temperature (e.g., `WBGT 33.8°C — RED ALERT: Extreme Danger`).
- **City / Ward Selector**: Dropdown defaults to **Mumbai** (with filters for Dharavi, Kurla, Mankhurd, BKC, Bandra).
- **Backend Sync Status**: Indicator showing `[Live API Connected]` or `[Resilient Offline Mode]`.

### B. Tactical GIS Heat Map (`MapView.tsx`)
- High-performance Leaflet canvas centered on Mumbai (`[19.0500, 72.8600]`, zoom level 13).
- **500m Micro-Grid Polygons** colored dynamically by Composite Heat Risk Score (CHRS):
  - **Critical Hotspot (80–100)**: Ruby / Crimson (`#ef4444`)
  - **High Alert (65–79)**: Amber / Orange (`#f97316`)
  - **Moderate (35–64)**: Yellow (`#eab308`)
  - **Low Risk (0–34)**: Emerald (`#10b981`)
- **Interactive Layer Switcher Controls**:
  - `Heat Risk Index (CHRS)`
  - `Satellite LST (°C)`
  - `Vegetation Canopy Cover (NDVI)`
  - `Cooling Shelters & Water Kiosks` (Pins with blue icons)
  - `Live SOS Reports` (Flashing beacon pins)
- **Cell Click Event**: Clicking any grid cell triggers the **Explainable AI (XAI) Drawer**.

### C. Explainable AI Hotspot Drawer (`XaiDrawer.tsx`)
- Slide-out tactical inspection panel displaying:
  - Selected Zone Name, Ward, Population Density, and CHRS Score.
  - **Factor Contribution Breakdown** (Recharts bar chart / visual telemetry bars):
    - Surface Temp (+36.2% impact)
    - Informal Tin-Roof Density (+28.5% impact)
    - Canopy Deficit (+22.1% impact)
    - Drinking Water Proximity (+13.2% impact)
  - CTA Button: `Simulate Policy Interventions for this Zone` (opens What-If Sandbox).

### D. Urban Policy "What-If" Simulator Sandbox (`WhatIfSimulator.tsx`)
- Policy slider sandbox for municipal decision-makers:
  - **Slider 1**: *Add Canopy Trees* (0 to 1,000 trees)
  - **Slider 2**: *Paint Cool Roofs* (0 to 25,000 $m^2$)
  - **Slider 3**: *Deploy Water & Misting Kiosks* (0 to 10 kiosks)
- Real-time responsive telemetry cards:
  - **Predicted Temperature Drop** (e.g., `-2.4°C`)
  - **Updated Heat Risk Score** (e.g., `89.4` $\rightarrow$ `63.8`)
  - **Estimated Budget (INR)** (e.g., `₹18,50,000`)
  - **CO₂ Offset** (e.g., `12.5 tons/year`)
  - **Payback & Priority Rating** (`High Priority - High ROI`)

### E. CoolPath Microclimate Route Visualizer (`CoolPathModal.tsx`)
- A-to-B pedestrian thermal comfort navigation comparison:
  - **Route A (Shortest Path - High Exposure)**: Red polyline, 1.1 km, 14 mins, 94% sun exposure, 43.1°C perceived temp, high heat strain.
  - **Route B (CoolPath - Shaded Comfort)**: Emerald polyline, 1.3 km, 16 mins, 74.5% tree canopy, 38.6°C perceived temp (-4.5°C cooler), 2 water kiosks en route.
- Interactive polyline rendering on map with toggleable waypoints.

### F. Citizen Mobile Relief View (`CitizenMobileView.tsx`)
- Mobile-first quick-action grid:
  - `🚨 I Need Water / Emergency SOS`: Triggers instant distress report modal.
  - `❄️ Find Nearest Cooling Center`: Shows distance, AC availability, open status, and directions.
  - `🚶 CoolPath Route Finder`: One-click route to nearest shelter with shade metrics.

### G. Crowdsourced Distress Report Modal (`ReportModal.tsx`)
- Streamlined form: Name, Phone, Category (Hydration Crisis, Heat Exhaustion, Broken Kiosk), Description, Location auto-detect.
- On submit, displays AI triage badge (e.g., `Urgency: EMERGENCY — Water tanker dispatch notified`) and immediately pins to the map.

---

## 3. Dedicated Folder & File Layout for Phase 1

```
Nexora/phase-1/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .env
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── index.ts               # Shared data types matching API contract
│   ├── styles/
│   │   └── index.css              # Dark tactical glassmorphic styling
│   ├── services/
│   │   ├── api.ts                 # Unified Axios client with mock fallback
│   │   └── mockData.ts            # Complete zero-backend offline test dataset
│   └── components/
│       ├── Navbar.tsx             # Header, persona toggle, live alert ticker
│       ├── MapView.tsx            # Leaflet GIS heat grid & marker overlays
│       ├── XaiDrawer.tsx          # Explainable AI factor breakdown
│       ├── WhatIfSimulator.tsx    # Urban policy intervention sandbox
│       ├── CoolPathModal.tsx      # A/B thermal comfort route comparison
│       ├── CitizenMobileView.tsx  # Mobile-first citizen relief portal
│       ├── ReportModal.tsx        # SOS distress report submission form
│       └── CommandStats.tsx       # KPI metrics for municipal dashboard
```

---

## 4. How Developer 1's Antigravity Agent Builds Independently

- **Zero-Wait Development**: Developer 1 does **NOT** wait for Phase 2 or Phase 3.
- All mock data is already defined in `phase-1/src/services/mockData.ts` adhering precisely to `shared/api-contract.json`.
- `phase-1/src/services/api.ts` has a built-in switch:
  ```ts
  const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
  ```
- While developing, `VITE_USE_MOCK=true` simulates instantaneous REST responses.
- Developer 1 can style, test, and polish the UI, animations, Leaflet polygons, and modals completely offline.

---

## 5. Seamless Integration Protocol (Final Step)

When Developer 2 (Backend) and Developer 3 (AI Engine) are up:
1. In `phase-1/.env`, change:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_USE_MOCK=false
   ```
2. Restart Vite (`npm run dev`).
3. The frontend will now stream live data from MongoDB, Open-Meteo, and the FastAPI AI engine without altering a single line of React code!

---

## 6. Phase 1 Verification Checklist

- [ ] `npm run dev` starts on `http://localhost:5173` with zero console errors.
- [ ] Switching between Command Center HUD and Citizen Relief Portal works seamlessly.
- [ ] Leaflet map renders Mumbai micro-grids with smooth zoom and color-coded risk levels.
- [ ] Clicking a grid cell displays the XAI factor breakdown drawer.
- [ ] What-If sliders dynamically update predicted temperature drop and risk score.
- [ ] CoolPath modal displays Shortest vs Coolest routes with comparative thermal strain.
- [ ] Citizen report submission successfully shows AI triage response and places a new pin.
