# Implementation Plan: Three.js Hierarchical Geographic Focus Map

This plan details replacing the standard 2D Leaflet map in **Phase 1** with a custom, high-performance **Three.js 3D Hierarchical Geographic Focus System**.

The system implements the exact visual and interaction paradigm:
> 🌍 **World View** (All countries visible, muted dark-moss aesthetic)  
> 　　↓ *Zooming / clicking toward India*  
> 🇮🇳 **India Isolated** (Surrounding world countries smoothly fade out to opacity 0, India centered & stabilized)  
> 　　↓ *Zooming / clicking toward Maharashtra*  
> 🏛️ **Maharashtra Isolated** (Other Indian states fade out, Maharashtra centered)  
> 　　↓ *Zooming / clicking toward Mumbai*  
> 🏙️ **Mumbai Micro-Grid Hotspots** (500m micro-grids render in the exact tonal choropleth palette: deep moss to luminous lime, interactive cell diagnostics)  
> 　　🔙 *Zooming back out* smoothly reverses every step!

---

## User Review Required

> [!IMPORTANT]
> **Dependencies to Add in Phase 1**:
> We will add `three`, `gsap`, and `d3-geo` to `phase-1`:
> - `three`: High-performance WebGL rendering engine.
> - `gsap`: Production-grade tweening library for buttery-smooth camera movements and material opacity transitions.
> - `d3-geo`: Ultra-fast projection math converting GeoJSON coordinates (longitude, latitude) into planar Three.js `ShapeGeometry`.

> [!NOTE]
> **GeoJSON Data Strategy**:
> To keep initial load under 300ms without lag:
> 1. We will use a lightweight, simplified **World GeoJSON** (~180 KB) for country boundaries.
> 2. An **India States GeoJSON** (~120 KB) for national state boundaries.
> 3. Our existing **Mumbai 500m Heat Grid GeoJSON** with realistic LST, NDVI, and CHRS heat risk data.
> All GeoJSON files will reside locally in `phase-1/src/data/` for zero-network-latency offline instant rendering.

---

## System Architecture: Three.js Focus Engine

```
                                  THREE.JS SCENE GRAPH
                                           │
  ┌────────────────────────────────────────┼────────────────────────────────────────┐
  │                                        │                                        │
┌─▼──────────────────────────┐  ┌──────────▼───────────────────┐  ┌─────────────────▼─────────────────┐
│       LEVEL 1: WORLD       │  │      LEVEL 2: INDIA          │  │  LEVEL 3: MAHARASHTRA / MUMBAI    │
├────────────────────────────┤  ├──────────────────────────────┤  ├───────────────────────────────────┤
│ • World Countries Meshes   │  │ • Indian States Meshes       │  │ • Maharashtra Boundary Mesh       │
│ • Deep moss base color     │  │ • Maharashtra highlighted    │  │ • Mumbai 500m Heat Grid Polygons  │
│ • Muted opacity (0.4-0.8)  │  │ • Other states fade out      │  │ • Exact Tonal Scale: Moss -> Lime │
│ • Fades to 0 when near IND │  │ • Fades to 0 when entering MH│  │ • Interactive Hotspot Raycasting  │
└────────────────────────────┘  └──────────────────────────────┘  └───────────────────────────────────┘
                                           ▲
                                           │
                             ┌─────────────┴─────────────┐
                             │    MapFocusManager &      │
                             │ Camera Stabilization GSAP │
                             └───────────────────────────┘
```

---

## Proposed Changes & File Breakdown

### Component 1: GeoJSON Datasets & Geometry Builders

#### [NEW] [world.json](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/data/world.json)
- Lightweight simplified GeoJSON of world countries for Level 1.

#### [NEW] [india.json](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/data/india.json)
- GeoJSON of Indian states (Maharashtra, Gujarat, Karnataka, etc.) for Level 2.

#### [NEW] [geoToThree.js](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/utils/geoToThree.js)
- Utility converting GeoJSON Polygons and MultiPolygons into `THREE.ShapeGeometry` using `d3-geo` projection.
- Generates wireframe edge outlines for crisp vector boundaries.
- Returns bounding box and geographic centroids for camera target calculations.

---

### Component 2: Focus State Machine & Camera Stabilization

#### [NEW] [MapFocusManager.js](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/utils/MapFocusManager.js)
- Manages 4 discrete focus states:
  - `LEVEL_WORLD` (Camera distance > 85 units)
  - `LEVEL_INDIA` (Distance 40–85 units, centered on `[78.96, 20.59]`)
  - `LEVEL_MAHARASHTRA` (Distance 18–40 units, centered on `[75.71, 19.75]`)
  - `LEVEL_MUMBAI` (Distance < 18 units, centered on `[72.86, 19.05]`)
- Monitors camera distance and user look-at target continuously in the render loop.
- Triggers smooth GSAP transitions:
  - Gently tweens `camera.position` and `controls.target` to lock into the detected region.
  - Cross-fades materials: fades unrelated regions to `opacity: 0` while bringing the active region to `opacity: 1`.
  - Seamlessly reversible when user zooms back out.

---

### Component 3: 3D Scene Viewport & Raycasting

#### [NEW] [ThreeMapView.jsx](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/components/ThreeMapView.jsx)
- Complete Three.js canvas replacing Leaflet:
  - `PerspectiveCamera`, `WebGLRenderer` (transparent background matching `#132820`), and `OrbitControls` with zoom/damping limits.
  - Renders the 3 hierarchical levels:
    - Level 1: World meshes in muted forest green (`#1b3a2e`, opacity 0.5).
    - Level 2: Indian states in olive-moss (`#2f523c`), Maharashtra highlighted in lime-tinted sage.
    - Level 3: Mumbai 500m micro-grids in the reference photo's exact natural choropleth scale:
      - Low Risk / High Canopy: Deep forest green (`#2f523c`)
      - Moderate: Medium olive (`#5a7d4a`)
      - High: Warm olive (`#8fae58`)
      - Critical Hotspot: Radiant pale lime (`#dff279`)
  - Raycaster mouse interaction:
    - Hovering a country/state/hotspot cell illuminates its border.
    - Clicking a hotspot cell selects it, highlights the cell with a crisp white boundary, updates the Left Column narrative, and triggers XAI inspection!
  - UI Overlay Elements:
    - Bottom-right: Minimalist horizontal gradient legend bar (`LOW ────── HIGH`).
    - Level indicator badge: e.g. `CURRENT FOCUS: MAHARASHTRA / MUMBAI`.
    - Floating reset camera button (`↺ RESET VIEW`).

---

### Component 4: Integration with Main App & Navbar

#### [MODIFY] [Navbar.jsx](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/components/Navbar.jsx)
- Top tabs (`WORLD`, `INDIA`, `MAHARASHTRA`, `MUMBAI`, `DHARAVI`, `KURLA`):
  - Clicking any tab triggers a smooth GSAP camera fly-to directly to that hierarchical level!

#### [MODIFY] [App.jsx](file:///c:/Users/vishal/Desktop/Nexora/phase-1/src/App.jsx)
- Replace `MapView` with `ThreeMapView`.
- Pass `selectedZone`, `onSelectZone`, and `activeLevel` props.
- Keep the exact editorial layout from the reference photo:
  - Left column: Region spotlight, narrative, and action links (`XAI DETAILS ↗`, `SIMULATE INTERVENTIONS ↗`, `COOLPATH ↗`).
  - Center: The 3D Three.js canvas.
  - Right column: Clean vertical telemetry metrics (`194 K`, `44.2°C`, etc.) and `+ / -` zoom buttons wired to the Three.js camera.

---

## Verification Plan

### Automated Tests:
1. Install dependencies:
   ```bash
   cd phase-1
   npm install three gsap d3-geo
   ```
2. Build verification:
   ```bash
   npm run build
   ```
   *Threshold: 0 syntax or bundling errors.*

### Manual & Interactive Verification:
1. Start dev server:
   ```bash
   npm run dev
   ```
2. Test hierarchical focus transitions:
   - [ ] Initial state: World map rendered in deep moss green.
   - [ ] Zoom toward India: Verify surrounding world countries smoothly fade to opacity 0, India locks into center.
   - [ ] Zoom toward Maharashtra: Verify other Indian states fade out, Maharashtra isolates.
   - [ ] Zoom toward Mumbai: Verify Mumbai 500m heat micro-grids render in the exact moss-to-lime choropleth palette.
   - [ ] Click a hotspot cell (e.g. Dharavi): Verify highlight boundary, left column updates, and clicking `HOTSPOT XAI DIAGNOSTICS ↗` opens the factor drawer.
   - [ ] Zoom backwards: Verify reverse transition (Mumbai $\rightarrow$ Maharashtra $\rightarrow$ India $\rightarrow$ World) works with buttery-smooth opacity restoration.
   - [ ] Click top navbar tabs (`INDIA`, `MUMBAI`, `DHARAVI`): Verify programmatic camera fly-to transitions.
