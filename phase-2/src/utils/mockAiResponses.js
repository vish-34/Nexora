function seededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 1 | h);
    h ^= h + Math.imul(h ^ (h >>> 7), 61 | h);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== "number")) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mockCHRS(cellId, inputs = {}) {
  const rand = seededRandom(cellId || "default");
  const base = 35 + rand() * 45;
  const wbgtBoost = inputs.wbgtC ? Math.max(0, inputs.wbgtC - 25) * 1.8 : 0;
  const ndviPenalty = inputs.ndvi != null ? (1 - Math.max(inputs.ndvi, 0)) * 8 : 0;
  const score = Math.min(100, Math.round((base + wbgtBoost + ndviPenalty) * 10) / 10);

  let band = "Moderate";
  if (score >= 81) band = "Critical";
  else if (score >= 66) band = "High";
  else if (score < 36) band = "Low";

  return {
    cellId: cellId || "GRID_MUM_001",
    zone_id: cellId || "GRID_MUM_001",
    score,
    band,
    computedAt: new Date().toISOString(),
    source: "mock",
  };
}

function mockXAI(zoneId = "GRID_MUM_001") {
  const xaiDb = {
    GRID_MUM_001: {
      zone_id: "GRID_MUM_001",
      chrs_risk_score: 89.4,
      risk_category: "Critical",
      top_drivers: [
        { factor: "Surface Temp (LST 44.8°C)", impact_pct: 36.2, status: "severe" },
        { factor: "Informal Tin Roof Density (84%)", impact_pct: 28.5, status: "severe" },
        { factor: "Severe Canopy Deficit (3.5% cover)", impact_pct: 22.1, status: "severe" },
        { factor: "Drinking Water Distance (750m avg)", impact_pct: 13.2, status: "warning" },
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"],
    },
    GRID_MUM_002: {
      zone_id: "GRID_MUM_002",
      chrs_risk_score: 82.7,
      risk_category: "Critical",
      top_drivers: [
        { factor: "Transit Asphalting Radiation", impact_pct: 38.4, status: "severe" },
        { factor: "High Congestion Density", impact_pct: 26.1, status: "severe" },
        { factor: "Tree Canopy Deficit (5.2%)", impact_pct: 21.0, status: "warning" },
        { factor: "Water Access Barrier", impact_pct: 14.5, status: "warning" },
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 3 - Good Health and Well-Being"],
    },
    GRID_MUM_003: {
      zone_id: "GRID_MUM_003",
      chrs_risk_score: 52.3,
      risk_category: "Moderate",
      top_drivers: [
        { factor: "Commercial Building Reflection", impact_pct: 35.0, status: "warning" },
        { factor: "Elevated Surface Heat", impact_pct: 30.0, status: "warning" },
        { factor: "Moderate Canopy Buffering (18.0%)", impact_pct: 20.0, status: "optimal" },
        { factor: "High Drinking Water Access", impact_pct: 15.0, status: "optimal" },
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities"],
    },
    GRID_MUM_004: {
      zone_id: "GRID_MUM_004",
      chrs_risk_score: 31.0,
      risk_category: "Low",
      top_drivers: [
        { factor: "Coastal Sea Breeze Moderation", impact_pct: 42.0, status: "optimal" },
        { factor: "Dense Tree Canopy Cover (32.5%)", impact_pct: 34.0, status: "optimal" },
        { factor: "Low Built-up Thermal Index", impact_pct: 14.0, status: "optimal" },
        { factor: "High Water Infrastructure Access", impact_pct: 10.0, status: "optimal" },
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"],
    },
    GRID_MUM_005: {
      zone_id: "GRID_MUM_005",
      chrs_risk_score: 93.6,
      risk_category: "Critical",
      top_drivers: [
        { factor: "Surface Temp (LST 45.4°C)", impact_pct: 39.5, status: "severe" },
        { factor: "Informal Tin Roof Ratio (89%)", impact_pct: 29.8, status: "severe" },
        { factor: "Severe Tree Canopy Deficit (2.1%)", impact_pct: 21.2, status: "severe" },
        { factor: "Acute Drinking Water Scarcity", impact_pct: 9.5, status: "severe" },
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action", "SDG 6 - Clean Water and Sanitation"],
    },
  };

  if (xaiDb[zoneId]) return xaiDb[zoneId];

  return {
    zone_id: zoneId,
    chrs_risk_score: 75.0,
    risk_category: "High",
    top_drivers: [
      { factor: "Elevated Surface Temp", impact_pct: 35.0, status: "severe" },
      { factor: "Built-up Thermal Mass", impact_pct: 30.0, status: "warning" },
      { factor: "Canopy Deficit", impact_pct: 20.0, status: "warning" },
      { factor: "Hydration Distance", impact_pct: 15.0, status: "warning" },
    ],
    sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"],
  };
}

function mockWhatIf(zoneId = "GRID_MUM_001", payload = {}) {
  const interventions = payload.interventions || payload || {};
  const treesAdded = Number(
    interventions.canopy_trees_added || interventions.trees_added || 0
  );
  const coolRoofSqm = Number(
    interventions.cool_roof_sqm || interventions.coolRoofAdoptionPct || 0
  );
  const kiosksAdded = Number(
    interventions.water_kiosks_added || interventions.kiosks_added || 0
  );

  const baselineChrsMap = {
    GRID_MUM_001: 89.4,
    GRID_MUM_002: 82.7,
    GRID_MUM_003: 52.3,
    GRID_MUM_004: 31.0,
    GRID_MUM_005: 93.6,
  };
  const originalChrs = baselineChrsMap[zoneId] || 85.0;

  const lstDrop = Math.min(
    6.5,
    Math.round((treesAdded * 0.006 + coolRoofSqm * 0.00025 + kiosksAdded * 0.15) * 10) / 10
  );
  const chrsReduction = Math.min(
    45.0,
    Math.round((lstDrop * 6.5 + kiosksAdded * 2.8 + (treesAdded > 0 ? 3.0 : 0)) * 10) / 10
  );
  const simulatedChrs = Math.max(15.0, Math.round((originalChrs - chrsReduction) * 10) / 10);
  const estimatedBudget = treesAdded * 3500 + coolRoofSqm * 95 + kiosksAdded * 180000;
  const co2Offset = Math.round((treesAdded * 0.022 + coolRoofSqm * 0.0012) * 10) / 10;

  return {
    zone_id: zoneId,
    original_chrs: originalChrs,
    simulated_chrs: simulatedChrs,
    predicted_lst_drop_c: Math.max(0.2, lstDrop || 1.8),
    population_benefited: 42000,
    estimated_budget_inr: Math.max(150000, estimatedBudget || 850000),
    co2_offset_tons_per_yr: Math.max(1.2, co2Offset || 5.5),
    payback_roi_rating: simulatedChrs < 65 ? "High Priority" : "Moderate Priority",
  };
}

function mockCoolPath(origin = { lat: 19.0405, lng: 72.8525 }, destination = { lat: 19.0485, lng: 72.8585 }) {
  const oLat = Number(origin.lat) || 19.0405;
  const oLng = Number(origin.lng) || 72.8525;
  const dLat = Number(destination.lat) || 19.0485;
  const dLng = Number(destination.lng) || 72.8585;

  const distDirect = haversineKm(oLat, oLng, dLat, dLng) || 1.0;
  const shortestM = Math.round(distDirect * 1000 * 1.15);
  const coolestM = Math.round(distDirect * 1000 * 1.32);

  const midLat = (oLat + dLat) / 2;
  const midLng = (oLng + dLng) / 2;

  const shortestRoute = {
    distance_meters: shortestM,
    duration_minutes: Math.round(shortestM / 80),
    avg_exposure_temp_c: 43.1,
    shade_coverage_pct: 8.0,
    thermal_strain_index: "High Danger (91/100)",
    waypoints: [
      [oLng, oLat],
      [midLng, midLat],
      [dLng, dLat],
    ],
  };

  const coolestRoute = {
    distance_meters: coolestM,
    duration_minutes: Math.round(coolestM / 80),
    avg_exposure_temp_c: 38.6,
    shade_coverage_pct: 74.5,
    thermal_strain_index: "Safe / Tolerable (38/100)",
    water_points_enroute: 2,
    temp_relief_delta_c: -4.5,
    waypoints: [
      [oLng, oLat],
      [oLng + 0.0007, oLat + 0.0025],
      [midLng - 0.0015, midLat + 0.001],
      [dLng, dLat],
    ],
  };

  return {
    shortest_route: shortestRoute,
    coolest_route: coolestRoute,
  };
}

function mockTriage(description = "", category = "Hydration Crisis") {
  const text = (description || "").toLowerCase();
  const isEmergency =
    text.includes("unconscious") ||
    text.includes("fainted") ||
    text.includes("seizure") ||
    text.includes("collapsed") ||
    text.includes("dying") ||
    text.includes("ambulance");

  const isCritical =
    text.includes("dizzy") ||
    text.includes("dizziness") ||
    text.includes("vomiting") ||
    text.includes("no water") ||
    text.includes("broken") ||
    text.includes("crisis") ||
    text.includes("tap") ||
    text.includes("heat exhaustion");

  let urgency = "Medium";
  let action = "Suggest visiting nearest municipal cooling shelter.";
  const entities = [];

  if (isEmergency) {
    urgency = "Emergency";
    action = "Dispatch emergency 108 ambulance and medical heat resuscitation team immediately.";
    entities.push("unconscious / collapsed", "severe heat trauma");
  } else if (isCritical) {
    urgency = "Critical";
    action = "Dispatch emergency municipal water tanker and ORS hydration distribution kit.";
    entities.push("dehydration crisis", "drinking water deficit");
  } else if (text.includes("shelter") || text.includes("ac") || text.includes("cool")) {
    urgency = "Medium";
    action = "Direct individuals to nearest open air-conditioned relief shelter.";
    entities.push("cooling shelter request");
  } else {
    urgency = "Low";
    action = "Log for city heat vulnerability record and local monitoring.";
    entities.push("mild heat distress");
  }

  return {
    urgency,
    confidence: 0.94,
    extracted_entities: entities,
    recommended_action: action,
  };
}

function mockScreenExplain(context = {}, userPrompt = "") {
  return {
    title: "Active Screen Urban Heat Risk Assessment",
    summary: "High localized surface temperature and informal density observed across Dharavi and Kurla transit clusters.",
    detailed_explanation: "Satellite thermal data indicates ground surface temperatures exceeding 44°C due to low-albedo tin roofing and severe canopy deficit. Recommended cool roof paint and misting kiosk interventions can lower localized thermal strain by up to 4.5°C.",
    grounded_sources: ["Mumbai Climate Action Plan 2022", "NASA Landsat 8 Surface Temperature Index"],
    actionable_recommendations: [
      "Target cool roof coating subsidies for dense informal settlements",
      "Erect solar-powered misting hydration kiosks at major transit junctions",
      "Deploy localized CoolPath shade pedestrian corridors",
    ],
    audio_transcript: "Thermal telemetry indicates critical heat stress in informal settlements with low canopy. Recommended interventions can reduce surface temperature by 4.5 degrees.",
    model_used: "phase2-mock-engine",
  };
}

module.exports = {
  mockCHRS,
  mockXAI,
  mockWhatIf,
  mockCoolPath,
  mockTriage,
  mockScreenExplain,
  haversineKm,
};
