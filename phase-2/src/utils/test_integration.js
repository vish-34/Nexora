const http = require("http");

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      })
      .on("error", reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runIntegrationVerification() {
  console.log("=================================================");
  console.log("COOLNEIGHBOUR AI: PHASE 2 & 3 INTEGRATION SUITE");
  console.log("=================================================");

  console.log("\n[TEST 1] Checking Phase 3 FastAPI Health (:8000)...");
  const p3Health = await get("http://localhost:8000/api/health");
  if (p3Health.status !== 200 || p3Health.data?.status !== "ok") {
    throw new Error(`Phase 3 health check failed: ${JSON.stringify(p3Health)}`);
  }
  console.log("  SUCCESS: Phase 3 AI Engine Online:", p3Health.data.service);

  console.log("\n[TEST 2] Checking Phase 2 Express Health (:5000)...");
  const p2Health = await get("http://localhost:5000/api/health");
  if (p2Health.status !== 200 || p2Health.data?.status !== "ok") {
    throw new Error(`Phase 2 health check failed: ${JSON.stringify(p2Health)}`);
  }
  console.log("  SUCCESS: Phase 2 Backend Online:", p2Health.data.service);

  console.log("\n[TEST 3] Checking Phase 2 -> Phase 3 Gateway Link (/api/ai/status)...");
  const aiStatus = await get("http://localhost:5000/api/ai/status");
  if (!aiStatus.data?.aiEngineOnline) {
    throw new Error(`Phase 2 cannot reach Phase 3: ${JSON.stringify(aiStatus.data)}`);
  }
  console.log("  SUCCESS: Phase 2 AI Gateway connected to Phase 3. Latency:", aiStatus.data.latencyMs, "ms");

  console.log("\n[TEST 4] Testing Phase 2 -> Phase 3 XAI Explanation (/api/ai/explain/GRID_MUM_001)...");
  const xai = await get("http://localhost:5000/api/ai/explain/GRID_MUM_001");
  if (xai.status !== 200 || !xai.data?.top_drivers?.length) {
    throw new Error(`XAI call failed: ${JSON.stringify(xai)}`);
  }
  console.log("  SUCCESS: XAI Zone ID:", xai.data.zone_id, "CHRS Risk:", xai.data.chrs_risk_score, "Top Driver:", xai.data.top_drivers[0]?.factor);

  console.log("\n[TEST 5] Testing Phase 2 -> Phase 3 What-If Simulation (/api/ai/simulate)...");
  const sim = await post("http://localhost:5000/api/ai/simulate", {
    zone_id: "GRID_MUM_001",
    interventions: {
      canopy_trees_added: 250,
      cool_roof_sqm: 8000,
      water_kiosks_added: 3,
    },
  });
  if (sim.status !== 200 || sim.data?.simulated_chrs == null) {
    throw new Error(`Simulation call failed: ${JSON.stringify(sim)}`);
  }
  console.log("  SUCCESS: Baseline CHRS:", sim.data.original_chrs, "-> Simulated CHRS:", sim.data.simulated_chrs);
  console.log("           LST Drop:", sim.data.predicted_lst_drop_c, "C, Budget: INR", sim.data.estimated_budget_inr, ", CO2 Offset:", sim.data.co2_offset_tons_per_yr, "tons/yr");

  console.log("\n[TEST 6] Testing Phase 2 -> Phase 3 CoolPath A* Thermal Router (/api/ai/coolpath)...");
  const coolpath = await post("http://localhost:5000/api/ai/coolpath", {
    origin: { lat: 19.0405, lng: 72.8525 },
    destination: { lat: 19.0485, lng: 72.8585 },
    mode: "pedestrian",
  });
  if (coolpath.status !== 200 || !coolpath.data?.shortest_route || !coolpath.data?.coolest_route) {
    throw new Error(`CoolPath call failed: ${JSON.stringify(coolpath)}`);
  }
  console.log("  SUCCESS: Shortest Route:", coolpath.data.shortest_route.distance_meters, "m,", coolpath.data.shortest_route.thermal_strain_index);
  console.log("           Coolest Route: ", coolpath.data.coolest_route.distance_meters, "m,", coolpath.data.coolest_route.thermal_strain_index);
  console.log("           Temp Relief:   ", coolpath.data.coolest_route.temp_relief_delta_c, "C, Waypoints:", coolpath.data.coolest_route.waypoints?.length);

  console.log("\n[TEST 7] Testing Phase 2 Citizen SOS Distress Report with Phase 3 NLP Triage (/api/reports)...");
  const distressReport = await post("http://localhost:5000/api/reports", {
    reporter_name: "Anita Deshmukh",
    phone: "+91 98200 99999",
    category: "Heat Exhaustion",
    description: "Elderly person collapsed near bus station, severely dizzy and fainted due to scorching 43 degree heat, ambulance urgently needed",
    location: { lat: 19.067, lng: 72.8715 },
  });
  if (distressReport.status !== 201 || !distressReport.data?.ai_triage) {
    throw new Error(`Distress report creation failed: ${JSON.stringify(distressReport)}`);
  }
  console.log("  SUCCESS: Report ID:", distressReport.data.id);
  console.log("           AI Triage Urgency:", distressReport.data.ai_triage.urgency);
  console.log("           Entities:         ", distressReport.data.ai_triage.extracted_entities);
  console.log("           Recommended Action:", distressReport.data.ai_triage.recommended_action);

  console.log("\n[TEST 8] Testing Phase 2 Proposals Commitment (/api/proposals)...");
  const proposal = await post("http://localhost:5000/api/proposals", {
    proposal_id: `PROP_${Date.now().toString().slice(-6)}`,
    zone_id: "GRID_MUM_001",
    trees_added: 250,
    cool_roof_sqm: 8000,
    kiosks_added: 3,
    original_chrs: 89.4,
    simulated_chrs: 63.8,
    predicted_lst_drop_c: 2.4,
    estimated_budget_inr: 1850000,
    co2_offset_tons_per_yr: 12.5,
    submitted_by: "BMC Disaster Cell Planner",
  });
  if (proposal.status !== 201 || proposal.data?.status !== "success") {
    throw new Error(`Proposal commitment failed: ${JSON.stringify(proposal)}`);
  }
  console.log("  SUCCESS: Committed Proposal:", proposal.data.proposal?.proposal_id, "Status:", proposal.data.proposal?.status);

  console.log("\n[TEST 9] Testing Phase 2 Turf.js Cooling Centers Query (/api/cooling-centers/nearby)...");
  const nearby = await get("http://localhost:5000/api/cooling-centers/nearby?lat=19.0425&lng=72.8545&radius_km=3");
  if (nearby.status !== 200 || !Array.isArray(nearby.data)) {
    throw new Error(`Nearby cooling centers failed: ${JSON.stringify(nearby)}`);
  }
  console.log("  SUCCESS: Found", nearby.data.length, "nearby cooling shelters within 3 km.");
  console.log("           Nearest Hub:", nearby.data[0]?.name, "Distance:", nearby.data[0]?.distance_meters, "meters");

  console.log("\n[TEST 10] Testing Phase 2 GeoJSON Micro-grid (/api/grid)...");
  const grid = await get("http://localhost:5000/api/grid?ward=G/North");
  if (grid.status !== 200 || grid.data?.type !== "FeatureCollection") {
    throw new Error(`Grid call failed: ${JSON.stringify(grid)}`);
  }
  console.log("  SUCCESS: Micro-grid FeatureCollection with", grid.data.total_cells, "zones loaded.");

  console.log("\n[TEST 11] Testing Phase 2 Live Open-Meteo Weather Proxy (/api/weather/live)...");
  const weather = await get("http://localhost:5000/api/weather/live");
  if (weather.status !== 200 || weather.data?.wbgt_c == null) {
    throw new Error(`Weather live call failed: ${JSON.stringify(weather)}`);
  }
  console.log("  SUCCESS: City:", weather.data.city, "Air Temp:", weather.data.air_temp_c, "C, Live WBGT:", weather.data.wbgt_c, "C, Alert Level:", weather.data.heat_alert_level);

  console.log("\n=================================================");
  console.log("ALL 11 INTEGRATION TESTS PASSED WITH 100% SUCCESS");
  console.log("Phase 2 & 3 are fully integrated and ready for Phase 1!");
  console.log("=================================================");
}

runIntegrationVerification().catch((err) => {
  console.error("\nINTEGRATION TEST FAILED:", err.message);
  process.exit(1);
});
