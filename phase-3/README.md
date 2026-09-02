# PHASE 3: AI INTELLIGENCE, THERMAL MODELING & COOLPATH ROUTING ENGINE
> **Developer 3 Instructions & AI Specification**
> Full documentation also available in [PHASE_3.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_3.md) at the project root.

Please refer to [PHASE_3.md](file:///c:/Users/vishal/Desktop/Nexora/PHASE_3.md) and [PROJECT_CONTEXT.md](file:///c:/Users/vishal/Desktop/Nexora/PROJECT_CONTEXT.md) for full architecture and algorithmic details.

### Quick Start for Developer 3:
1. Initialize Phase 3:
   ```bash
   cd phase-3
   uv venv
   .\.venv\Scripts\activate
   uv pip install -r requirements.txt
   ```
2. Configure `.env`:
   ```env
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=http://localhost:5173,http://localhost:5000
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Test and verify via Swagger UI at `http://localhost:8000/docs`.
5. Ensure all responses adhere to `../shared/api-contract.json`.
