# PHASE 2: CORE MERN BACKEND & GEOSPATIAL DATABASE
> **Developer 2 Instructions & AI Specification**
> Full documentation also available in [PHASE_2.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_2.md) at the project root.

Please refer to [PHASE_2.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_2.md) and [PROJECT_CONTEXT.md](file:///c:/Users/vishal/Desktop/Nexora/PROJECT_CONTEXT.md) for full architecture and algorithmic details.

### Quick Start for Developer 2:
1. Initialize Phase 2:
   ```bash
   cd phase-2
   npm init -y
   npm install express mongoose dotenv cors axios @turf/turf
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/coolneighbour
   AI_ENGINE_URL=http://localhost:8000
   ```
3. Use shared seed data from `../shared/` (`mumbai_heat_grid.json`, `cooling_centers.json`, `sample_reports.json`).
4. Ensure all routes adhere to `../shared/api-contract.json`.
