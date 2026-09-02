# PHASE 1: FRONTEND WEB APPLICATION (CLIENT TIER)
> **Developer 1 Instructions & AI Specification**
> **Tech Stack**: React 18, Vite, TypeScript, Vanilla CSS / Tailwind tokens, Leaflet & React-Leaflet, Recharts, Lucide React

---

## 1. Phase Objective

As **Developer 1**, you own the visual and interactive heart of the platform. Your goal is to build an aesthetically breathtaking, high-performance web application with two core views:
1. **City Heat Command Center (Admin/Planner HUD)**: High-tech dark tactical dashboard for municipal authorities.
2. **Citizen Heat Relief Portal (Mobile Web)**: Clean, high-contrast, accessible mobile interface for citizens, delivery workers, and vulnerable populations.

---

## 2. Key Components to Build

### A. Navigation & Top Bar (`Navbar.tsx`)
- App branding: **CoolNeighbour AI** / **ThermoShield** with a live animated pulse indicator.
- Persona Switcher toggle: `[Tactical Command HUD (Admin)]` $\longleftrightarrow$ `[Citizen Heat Relief (Public)]`.
- Live Heat Alert Ticker: Displays live WBGT index (e.g., *WBGT 33.8°C — RED ALERT: Extreme Danger in Dharavi & Kurla*).
- City Switcher dropdown (Defaults to **Mumbai**, with option to view wards).

### B. Tactical GIS Heat Map (`MapView.tsx`)
- High-performance Leaflet map centered on Mumbai (`[19.0500, 72.8600]`, zoom 13).
- Polygon layer for 500m micro-grids colored by CHRS Risk Score:
  - Critical (80–100): Ruby / Crimson `#ef4444`
  - High (65–79): Amber / Orange `#f97316`
  - Moderate (35–64): Yellow `#eab308`
  - Low (0–34): Emerald `#10b981`
- Layer switcher overlay:
  - `Heat Risk Index (CHRS)`
  - `Satellite LST (°C)`
  - `Vegetation Canopy (NDVI)`
  - `Cooling Shelters & Water Kiosks` (Pins with blue ice icons)
  - `Live Distress Reports` (Flashing SOS pulse pins)
- Clicking a grid cell opens the **Explainable AI (XAI) Drawer**!

### C. Explainable AI Drawer (`XaiDrawer.tsx`)
- Slides out when a hotspot cell is clicked.
- Shows Zone Name, Ward, and CHRS score.
- **Factor Attribution Breakdown** (Bar chart / progress gauges):
  - +36.2% High Surface Temp (LST 43.8°C)
  - +28.5% Informal Tin-Roof Density (82%)
  - +22.1% Severe Canopy Deficit (3.5% cover)
  - +13.2% Distance to Clean Drinking Water (750m)
- Action button: `Simulate Policy Interventions for this Zone`.

### D. Urban Policy "What-If" Simulator Sandbox (`WhatIfSimulator.tsx`)
- Allows urban planners to test interventions:
  - Slider 1: **Add Canopy Shade Trees** (0 to 1,000 trees)
  - Slider 2: **Paint Reflective Cool Roofs** (0 to 25,000 $m^2$)
  - Slider 3: **Deploy Hydration & Misting Kiosks** (0 to 10 kiosks)
- Live output gauges:
  - Predicted Temperature Drop (e.g., **-2.4°C**)
  - Updated Risk Score (e.g., **89.4 $\rightarrow$ 63.8**)
  - Estimated Budget in INR (e.g., ₹18.5 Lakhs)
  - Estimated Population Benefited (e.g., 42,000 residents)

### E. CoolPath Microclimate Route Modal (`CoolPathModal.tsx`)
- Side-by-side comparison modal:
  - **Route A: Shortest Path (High Exposure)**: Red path, 1.1 km, 94% sun exposure, 43.1°C perceived temperature, extreme heat strain.
  - **Route B: CoolPath (Thermal Comfort)**: Emerald path, 1.3 km, 74% tree canopy & shaded arcades, 38.6°C perceived temp (-4.5°C cooler), passes 2 water kiosks.
- Interactive map polyline rendering for both paths.

### F. Citizen Mobile Relief View (`CitizenMobileView.tsx`)
- Emergency SOS Button: `I Need Water / Help` opens `ReportModal.tsx`.
- `Find Nearest Cooling Shelter`: Lists closest 3 shelters with distance, AC status, and 1-tap navigation.
- Simple CoolPath search input: `From: My Location` $\rightarrow$ `To: Nearest Cooling Hub`.

### G. Crowdsourced Distress Report Modal (`ReportModal.tsx`)
- Simple form: Name, Phone, Category (Hydration Crisis, Heatstroke, Broken Shelter), Description, Geo-tagging.
- Upon submit, shows AI triage response: `Urgency: EMERGENCY — Water tanker dispatch notified`.
- Adds a live marker to the map instantly.

---

## 3. Zero-Dependency Offline Development (Mock Mode)

You do **NOT** need Phase 2 or Phase 3 running while developing the UI!
- `src/services/mockData.ts` contains full GeoJSON grids, cooling centers, sample reports, and simulation responses matching `shared/api-contract.json`.
- `src/services/api.ts` checks `import.meta.env.VITE_USE_MOCK`. If `true` (default), it serves mock responses with simulated 150ms network delay.
- When ready for final integration, setting `VITE_USE_MOCK=false` makes it call the real backend on `http://localhost:5000`.

---

## 4. Running and Verification Commands

```bash
# In /phase-1
npm install
npm run dev
# Open http://localhost:5173
```
