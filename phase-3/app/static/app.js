let map;
let polygonLayers = {};
let shelterMarkers = [];
let sosMarkers = [];
let routeLayers = [];
let activeLayer = "chrs";
let activePersona = "admin";
let currentAudioTranscript = "";
let isSpeaking = false;
let recognition = null;
let isRecording = false;

const ZONE_DATA = {
  GRID_MUM_001: {
    name: "Dharavi Sector 3 / Transit Camp",
    ward: "G/North",
    coords: [
      [19.0400, 72.8520],
      [19.0400, 72.8570],
      [19.0450, 72.8570],
      [19.0450, 72.8520]
    ],
    chrs: 89.4,
    lst: 43.8,
    canopy: 3.5,
    risk: "Critical"
  },
  GRID_MUM_002: {
    name: "Kurla West Station Hub & Bus Depot",
    ward: "L Ward",
    coords: [
      [19.0650, 72.8700],
      [19.0650, 72.8750],
      [19.0700, 72.8750],
      [19.0700, 72.8700]
    ],
    chrs: 82.7,
    lst: 42.1,
    canopy: 5.2,
    risk: "Critical"
  },
  GRID_MUM_003: {
    name: "Bandra Kurla Complex (BKC) G-Block",
    ward: "H/East",
    coords: [
      [19.0600, 72.8600],
      [19.0600, 72.8680],
      [19.0660, 72.8680],
      [19.0660, 72.8600]
    ],
    chrs: 52.3,
    lst: 39.5,
    canopy: 18.0,
    risk: "Moderate"
  },
  GRID_MUM_004: {
    name: "Bandra West / Carter Road Fringe",
    ward: "H/West",
    coords: [
      [19.0550, 72.8250],
      [19.0550, 72.8330],
      [19.0620, 72.8330],
      [19.0620, 72.8250]
    ],
    chrs: 31.0,
    lst: 33.2,
    canopy: 32.5,
    risk: "Low"
  },
  GRID_MUM_005: {
    name: "Govandi - Mankhurd Slum Cluster",
    ward: "M/East",
    coords: [
      [19.0450, 72.9250],
      [19.0450, 72.9330],
      [19.0520, 72.9330],
      [19.0520, 72.9250]
    ],
    chrs: 93.6,
    lst: 44.2,
    canopy: 2.1,
    risk: "Critical"
  }
};

const SHELTER_DATA = [
  {
    id: "SHELTER_01",
    name: "Dharavi Community AC Hall & Health Post",
    ward: "G/North",
    coords: [19.0425, 72.8545],
    capacity: 180,
    occupancy: 64,
    status: "Open",
    amenities: "AC, ORS, Cold Water, First Aid"
  },
  {
    id: "SHELTER_02",
    name: "Kurla West Railway Hydration Kiosk",
    ward: "L Ward",
    coords: [19.0665, 72.8722],
    capacity: 45,
    occupancy: 18,
    status: "Open",
    amenities: "High-Pressure Misting, Cold Water"
  },
  {
    id: "SHELTER_03",
    name: "BKC Urban Green Oasis & Canopy Zone",
    ward: "H/East",
    coords: [19.0630, 72.8640],
    capacity: 300,
    occupancy: 82,
    status: "Open",
    amenities: "Dense Shade, Water Fountains"
  },
  {
    id: "SHELTER_04",
    name: "Govandi Maternity & Heatstroke Clinic",
    ward: "M/East",
    coords: [19.0490, 72.9295],
    capacity: 90,
    occupancy: 52,
    status: "Open",
    amenities: "IV Saline, ICU Heat Beds, Ice Packs"
  }
];

function getApiBase() {
  const select = document.getElementById("api-base-select");
  return select ? select.value : "http://localhost:8000";
}

function formatINR(val) {
  return "₹" + Number(val).toLocaleString("en-IN");
}

function getChrsColor(score) {
  if (score >= 80) return "#ef4444";
  if (score >= 65) return "#f97316";
  if (score >= 35) return "#eab308";
  return "#10b981";
}

function getLstColor(lst) {
  if (lst >= 43) return "#ef4444";
  if (lst >= 41) return "#f97316";
  if (lst >= 38) return "#eab308";
  return "#06b6d4";
}

function getCanopyColor(canopy) {
  if (canopy >= 25) return "#10b981";
  if (canopy >= 15) return "#06b6d4";
  if (canopy >= 5) return "#eab308";
  return "#ef4444";
}

function initMap() {
  map = L.map("map-view", {
    zoomControl: false
  }).setView([19.0550, 72.8650], 13);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: "&copy; OpenStreetMap &copy; CARTO"
  }).addTo(map);

  renderGridPolygons();
  renderShelterMarkers();
}

function renderGridPolygons() {
  Object.keys(ZONE_DATA).forEach(zoneId => {
    const data = ZONE_DATA[zoneId];
    let color = getChrsColor(data.chrs);
    if (activeLayer === "lst") color = getLstColor(data.lst);
    if (activeLayer === "ndvi") color = getCanopyColor(data.canopy);

    if (polygonLayers[zoneId]) {
      polygonLayers[zoneId].setStyle({
        fillColor: color,
        color: color
      });
      return;
    }

    const polygon = L.polygon(data.coords, {
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.45
    }).addTo(map);

    polygon.bindPopup(`
      <div class="custom-popup">
        <div class="popup-title">${data.name}</div>
        <div class="popup-chrs" style="color: ${getChrsColor(data.chrs)}">CHRS: ${data.chrs} (${data.risk})</div>
        <div style="font-size: 0.72rem; color: #94a3b8">LST: ${data.lst}°C &bull; Canopy: ${data.canopy}%</div>
      </div>
    `);

    polygon.on("click", () => {
      document.getElementById("xai-zone-select").value = zoneId;
      document.getElementById("sim-zone-select").value = zoneId;
      switchTab("xai");
      loadXaiExplanation(zoneId);
    });

    polygonLayers[zoneId] = polygon;
  });
}

function renderShelterMarkers() {
  shelterMarkers.forEach(m => map.removeLayer(m));
  shelterMarkers = [];

  SHELTER_DATA.forEach(s => {
    const icon = L.divIcon({
      className: "shelter-div-icon",
      html: `<div style="background:#0284c7; width:28px; height:28px; border-radius:50%; border:2px solid #38bdf8; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(56,189,248,0.6); color:#fff; font-size:12px; font-weight:bold;">❄</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(s.coords, { icon: icon }).addTo(map);
    marker.bindPopup(`
      <div class="custom-popup">
        <div class="popup-title">${s.name}</div>
        <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 600;">${s.status} &bull; Capacity: ${s.occupancy}/${s.capacity}</div>
        <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 4px;">${s.amenities}</div>
      </div>
    `);
    shelterMarkers.push(marker);
  });
}

function renderRoutePolylines(shortestWaypoints, coolestWaypoints) {
  routeLayers.forEach(l => map.removeLayer(l));
  routeLayers = [];

  const shortCoords = shortestWaypoints.map(pt => [pt[1], pt[0]]);
  const coolCoords = coolestWaypoints.map(pt => [pt[1], pt[0]]);

  const shortLine = L.polyline(shortCoords, {
    color: "#ef4444",
    weight: 4,
    opacity: 0.85,
    dashArray: "6, 6"
  }).addTo(map);
  shortLine.bindTooltip("Route A: Shortest / Unshaded Asphalt (43.5°C)");
  routeLayers.push(shortLine);

  const coolLine = L.polyline(coolCoords, {
    color: "#06b6d4",
    weight: 5,
    opacity: 0.95
  }).addTo(map);
  coolLine.bindTooltip("Route B: CoolPath AI Shaded Parkway (38.4°C &bull; -4.5°C Relief)");
  routeLayers.push(coolLine);

  const group = new L.featureGroup([shortLine, coolLine]);
  map.fitBounds(group.getBounds(), { padding: [40, 40] });
}

async function checkApiConnection() {
  const base = getApiBase();
  const statusPill = document.getElementById("conn-status-pill");
  const statusText = document.getElementById("conn-status-text");

  try {
    const res = await fetch(`${base}/api/health`, { method: "GET" });
    if (res.ok) {
      statusPill.style.background = "rgba(16, 185, 129, 0.08)";
      statusPill.style.borderColor = "rgba(16, 185, 129, 0.25)";
      statusText.textContent = "AI Engine Online";
      statusText.style.color = "#a7f3d0";
    } else {
      throw new Error();
    }
  } catch {
    statusPill.style.background = "rgba(249, 115, 22, 0.08)";
    statusPill.style.borderColor = "rgba(249, 115, 22, 0.25)";
    statusText.textContent = "Proxy / Port Offline";
    statusText.style.color = "#fed7aa";
  }
}

async function loadXaiExplanation(zoneId) {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/ai/explain/${zoneId}`);
    if (!res.ok) throw new Error("XAI API Failed");
    const data = await res.json();
    renderXaiData(data);
  } catch (err) {
    const fallback = {
      zone_id: zoneId,
      chrs_risk_score: (ZONE_DATA[zoneId] || {}).chrs || 85.0,
      risk_category: (ZONE_DATA[zoneId] || {}).risk || "Critical",
      top_drivers: [
        { factor: "Surface Temp (LST)", impact_pct: 36.2, status: "severe" },
        { factor: "Informal Tin Roof Density", impact_pct: 28.5, status: "severe" },
        { factor: "Severe Canopy Deficit", impact_pct: 22.1, status: "severe" },
        { factor: "Drinking Water Distance", impact_pct: 13.2, status: "warning" }
      ],
      sdg_alignment: ["SDG 11 - Sustainable Cities", "SDG 13 - Climate Action"]
    };
    renderXaiData(fallback);
  }
}

function renderXaiData(data) {
  document.getElementById("xai-hero-score").textContent = Number(data.chrs_risk_score).toFixed(1);
  const catElem = document.getElementById("xai-hero-category");
  catElem.textContent = data.risk_category;

  if (data.risk_category === "Critical") {
    catElem.className = "badge badge-crit";
  } else if (data.risk_category === "High") {
    catElem.className = "badge badge-alert";
  } else if (data.risk_category === "Moderate") {
    catElem.className = "badge badge-subtle";
  } else {
    catElem.className = "badge badge-green";
  }

  const metaZone = ZONE_DATA[data.zone_id] || { name: data.zone_id, ward: "Mumbai" };
  document.getElementById("xai-hero-name").textContent = `${metaZone.name} (${metaZone.ward})`;

  const listElem = document.getElementById("xai-drivers-list");
  listElem.innerHTML = "";

  (data.top_drivers || []).forEach(driver => {
    const fillClass = driver.status === "severe" ? "fill-severe" : (driver.status === "warning" ? "fill-warning" : "fill-optimal");
    const item = document.createElement("div");
    item.className = "driver-item";
    item.innerHTML = `
      <div class="driver-info-row">
        <span class="driver-name">${driver.factor}</span>
        <span class="driver-pct-badge">${Number(driver.impact_pct).toFixed(1)}%</span>
      </div>
      <div class="driver-bar-track">
        <div class="driver-bar-fill ${fillClass}" style="width: ${Math.min(100, driver.impact_pct)}%"></div>
      </div>
    `;
    listElem.appendChild(item);
  });
}

let simDebounceTimer;
function onSimulationInput() {
  clearTimeout(simDebounceTimer);
  const trees = Number(document.getElementById("slider-trees").value);
  const roofs = Number(document.getElementById("slider-roofs").value);
  const kiosks = Number(document.getElementById("slider-kiosks").value);

  document.getElementById("val-trees").textContent = trees.toLocaleString();
  document.getElementById("val-roofs").textContent = roofs.toLocaleString();
  document.getElementById("val-kiosks").textContent = kiosks.toLocaleString();

  simDebounceTimer = setTimeout(() => {
    executeSimulation(trees, roofs, kiosks);
  }, 120);
}

async function executeSimulation(trees, roofs, kiosks) {
  const base = getApiBase();
  const zoneId = document.getElementById("sim-zone-select").value;

  const payload = {
    zone_id: zoneId,
    interventions: {
      canopy_trees_added: trees,
      cool_roof_sqm: roofs,
      water_kiosks_added: kiosks
    }
  };

  try {
    const res = await fetch(`${base}/api/ai/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Simulation Failed");
    const data = await res.json();
    renderSimulationResult(data);
  } catch {
    const drop = ((trees / 100) * 0.40 + (roofs / 1000) * 0.15 + kiosks * 0.07).toFixed(1);
    const orig = (ZONE_DATA[zoneId] || {}).chrs || 89.4;
    const sim = Math.max(25, (orig - drop * 10.5)).toFixed(1);
    const budget = trees * 3500 + roofs * 120 + kiosks * 300000;
    renderSimulationResult({
      zone_id: zoneId,
      original_chrs: orig,
      simulated_chrs: sim,
      predicted_lst_drop_c: drop,
      estimated_budget_inr: budget,
      co2_offset_tons_per_yr: (trees * 0.05).toFixed(1),
      payback_roi_rating: "High Priority",
      population_benefited: 17000
    });
  }
}

function renderSimulationResult(data) {
  document.getElementById("res-lst-drop").textContent = `-${Number(data.predicted_lst_drop_c).toFixed(1)}`;
  document.getElementById("res-orig-chrs").textContent = Number(data.original_chrs).toFixed(1);
  document.getElementById("res-sim-chrs").textContent = Number(data.simulated_chrs).toFixed(1);
  document.getElementById("res-budget").textContent = formatINR(data.estimated_budget_inr);
  document.getElementById("res-co2").textContent = `${Number(data.co2_offset_tons_per_yr).toFixed(1)} tons/yr`;
  document.getElementById("res-roi").textContent = data.payback_roi_rating || "High Priority";
  document.getElementById("res-pop").textContent = Number(data.population_benefited || 17000).toLocaleString();
}

async function runCoolPath() {
  const base = getApiBase();
  const origVal = document.getElementById("cp-origin-select").value.split(",");
  const destVal = document.getElementById("cp-dest-select").value.split(",");

  const payload = {
    origin: { lat: parseFloat(origVal[0]), lng: parseFloat(origVal[1]) },
    destination: { lat: parseFloat(destVal[0]), lng: parseFloat(destVal[1]) },
    mode: "pedestrian"
  };

  try {
    const res = await fetch(`${base}/api/ai/coolpath`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("CoolPath Request Failed");
    const data = await res.json();
    renderCoolPathResult(data);
  } catch {
    const fallback = {
      shortest_route: {
        distance_meters: 1090,
        duration_minutes: 14,
        avg_exposure_temp_c: 43.5,
        shade_coverage_pct: 8.0,
        thermal_strain_index: "High Danger (91/100)",
        waypoints: [[72.8525, 19.0405], [72.8550, 19.0440], [72.8585, 19.0485]]
      },
      coolest_route: {
        distance_meters: 1488,
        duration_minutes: 19,
        avg_exposure_temp_c: 38.4,
        shade_coverage_pct: 78.0,
        thermal_strain_index: "Safe / Tolerable (38/100)",
        water_points_enroute: 2,
        temp_relief_delta_c: -4.5,
        waypoints: [[72.8525, 19.0405], [72.8565, 19.0406], [72.8591, 19.0418], [72.8585, 19.0485]]
      }
    };
    renderCoolPathResult(fallback);
  }
}

function renderCoolPathResult(data) {
  const s = data.shortest_route;
  const c = data.coolest_route;

  document.getElementById("r-short-dist").textContent = `${s.distance_meters.toLocaleString()} m`;
  document.getElementById("r-short-time").textContent = `${s.duration_minutes} mins`;
  document.getElementById("r-short-temp").textContent = `${Number(s.avg_exposure_temp_c).toFixed(1)}°C`;
  document.getElementById("r-short-shade").textContent = `${Number(s.shade_coverage_pct).toFixed(1)}%`;
  document.getElementById("r-short-strain").textContent = s.thermal_strain_index;

  document.getElementById("r-cool-dist").textContent = `${c.distance_meters.toLocaleString()} m`;
  document.getElementById("r-cool-time").textContent = `${c.duration_minutes} mins (+${c.duration_minutes - s.duration_minutes}m)`;
  document.getElementById("r-cool-temp").textContent = `${Number(c.avg_exposure_temp_c).toFixed(1)}°C`;
  document.getElementById("r-cool-shade").textContent = `${Number(c.shade_coverage_pct).toFixed(1)}%`;
  document.getElementById("r-cool-delta").textContent = `${c.temp_relief_delta_c}°C Cooler`;
  document.getElementById("r-cool-water").textContent = `${c.water_points_enroute || 2} Hydration Stops`;
  document.getElementById("r-cool-strain").textContent = c.thermal_strain_index;

  renderRoutePolylines(s.waypoints, c.waypoints);
}

async function submitTriage() {
  const base = getApiBase();
  const desc = document.getElementById("triage-desc").value;
  const name = document.getElementById("triage-name").value;
  const category = document.getElementById("triage-category").value;

  const payload = {
    description: desc,
    reporter_name: name,
    category: category
  };

  try {
    const res = await fetch(`${base}/api/ai/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Triage Failed");
    const data = await res.json();
    renderTriageResult(data);
  } catch {
    renderTriageResult({
      urgency: "Emergency",
      confidence: 0.95,
      extracted_entities: ["water tap broken", "dizziness", "outdoor workers"],
      recommended_action: "Dispatch emergency municipal water tanker & ORS distribution kit"
    });
  }
}

function renderTriageResult(data) {
  const badge = document.getElementById("tr-urgency-badge");
  badge.textContent = data.urgency.toUpperCase();
  if (data.urgency === "Critical" || data.urgency === "Emergency") {
    badge.className = "badge badge-alert";
  } else if (data.urgency === "Medium") {
    badge.className = "badge badge-subtle";
  } else {
    badge.className = "badge badge-green";
  }

  document.getElementById("tr-confidence").textContent = `${(data.confidence * 100).toFixed(1)}%`;

  const chipsContainer = document.getElementById("tr-entities");
  chipsContainer.innerHTML = "";
  (data.extracted_entities || []).forEach(ent => {
    const chip = document.createElement("span");
    chip.className = "entity-chip";
    chip.textContent = ent;
    chipsContainer.appendChild(chip);
  });

  document.getElementById("tr-action").textContent = data.recommended_action;

  const sosIcon = L.divIcon({
    className: "sos-beacon-icon",
    html: `<div style="background:#ef4444; width:22px; height:22px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 16px #ef4444; animation: blink 0.8s infinite;"></div>`,
    iconSize: [22, 22]
  });
  const sosMarker = L.marker([19.0430, 72.8550], { icon: sosIcon }).addTo(map);
  sosMarker.bindPopup(`
    <div class="custom-popup">
      <div class="popup-title">Distress Beacon &bull; ${data.urgency}</div>
      <div style="font-size:0.75rem; color:#fca5a5;">${data.recommended_action}</div>
    </div>
  `).openPopup();
  sosMarkers.push(sosMarker);
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.toggle("active", c.id === `tab-${tabId}`);
  });
}

function openGrokDrawer() {
  const drawer = document.getElementById("grok-drawer");
  if (drawer) drawer.classList.add("open");
}

function closeGrokDrawer() {
  const drawer = document.getElementById("grok-drawer");
  if (drawer) drawer.classList.remove("open");
  stopAudioBriefing();
}

function gatherActiveScreenContext() {
  const activeTabBtn = document.querySelector(".tab-btn.active");
  const tab = activeTabBtn ? activeTabBtn.dataset.tab : "xai";

  const zoneId = document.getElementById("xai-zone-select") ? document.getElementById("xai-zone-select").value : "GRID_MUM_001";
  const zData = ZONE_DATA[zoneId] || {};

  let simParams = null;
  if (document.getElementById("slider-trees")) {
    simParams = {
      trees: Number(document.getElementById("slider-trees").value),
      roofs_sqm: Number(document.getElementById("slider-roofs").value),
      kiosks: Number(document.getElementById("slider-kiosks").value),
      predicted_drop: document.getElementById("res-lst-drop") ? document.getElementById("res-lst-drop").textContent : "-2.4"
    };
  }

  let routeStats = null;
  if (document.getElementById("r-short-dist")) {
    routeStats = {
      shortest: document.getElementById("r-short-dist").textContent,
      coolest: document.getElementById("r-cool-dist").textContent,
      relief_delta: document.getElementById("r-cool-delta") ? document.getElementById("r-cool-delta").textContent : "-4.5°C"
    };
  }

  return {
    active_tab: tab,
    selected_zone_id: zoneId,
    zone_metrics: zData,
    simulation_params: simParams,
    route_metrics: routeStats
  };
}

async function triggerScreenExplanation(customPrompt = "") {
  openGrokDrawer();
  const outputArea = document.getElementById("grok-output");
  outputArea.innerHTML = `
    <div class="grok-placeholder">
      <div class="radar-pulse"></div>
      <p>Retrieving grounded climate knowledge and querying Grok...</p>
    </div>
  `;

  const context = gatherActiveScreenContext();
  const payload = {
    context: context,
    user_prompt: customPrompt || null
  };

  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/ai/screen-explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("RAG Request Failed");
    const data = await res.json();
    renderGrokExplanation(data);
  } catch (err) {
    renderGrokExplanation({
      title: "Active Screen Climate Telemetry Analysis",
      summary: "Overview of microclimate thermal indices and active intervention simulation.",
      detailed_explanation: "The active screen presents microclimate heat metrics for the target zone. Satellite Land Surface Temperature reveals critical tin-roof thermal radiation. Cool roofs and tree canopy interventions provide localized cooling relief.",
      grounded_sources: ["Mumbai Heat Action Plan 2024", "BMC Disaster Management Cell"],
      actionable_recommendations: ["Prioritize cool roof paint on informal settlements.", "Deploy hydration misting kiosks."],
      audio_transcript: "This is the active screen summary. The target zone has elevated heat risk driven by low albedo tin roofs. Interventions will provide critical cooling relief.",
      model_used: "local-rag-fallback"
    });
  }
}

function renderGrokExplanation(data) {
  currentAudioTranscript = data.audio_transcript || data.summary;
  const badge = document.getElementById("grok-model-badge");
  if (badge) badge.textContent = data.model_used || "grok-2-latest";

  const outputArea = document.getElementById("grok-output");
  outputArea.innerHTML = `
    <div class="grok-card-title">${data.title}</div>
    <div class="grok-card-summary">${data.summary}</div>
    <div class="grok-card-detailed">${data.detailed_explanation}</div>
    
    <div class="grok-section-label">Grounded Sources & Citations:</div>
    <div class="grok-sources-list">
      ${(data.grounded_sources || []).map(s => `<span class="source-chip">${s}</span>`).join("")}
    </div>

    <div class="recommendations-box">
      <div class="grok-section-label" style="color:#38bdf8;">Strategic Recommendations:</div>
      <ul>
        ${(data.actionable_recommendations || []).map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  `;
}

function toggleAudioBriefing() {
  if (isSpeaking) {
    stopAudioBriefing();
  } else {
    playAudioBriefing(currentAudioTranscript);
  }
}

function playAudioBriefing(text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const wave = document.getElementById("tts-wave");
  const btnText = document.getElementById("tts-btn-text");

  utterance.onstart = () => {
    isSpeaking = true;
    if (wave) wave.classList.remove("hidden");
    if (btnText) btnText.textContent = "Stop Audio";
  };

  utterance.onend = () => {
    stopAudioBriefing();
  };

  utterance.onerror = () => {
    stopAudioBriefing();
  };

  window.speechSynthesis.speak(utterance);
}

function stopAudioBriefing() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  const wave = document.getElementById("tts-wave");
  const btnText = document.getElementById("tts-btn-text");
  if (wave) wave.classList.add("hidden");
  if (btnText) btnText.textContent = "Listen Briefing";
}

function initVoiceDictation() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return;

  recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  const micBtn = document.getElementById("btn-grok-mic");
  const micText = document.getElementById("mic-status-text");

  recognition.onstart = () => {
    isRecording = true;
    if (micBtn) micBtn.classList.add("listening");
    if (micText) micText.textContent = "Listening...";
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const input = document.getElementById("grok-query-input");
    if (input) input.value = transcript;
    triggerScreenExplanation(transcript);
  };

  recognition.onend = () => {
    isRecording = false;
    if (micBtn) micBtn.classList.remove("listening");
    if (micText) micText.textContent = "Dictate";
  };

  recognition.onerror = () => {
    isRecording = false;
    if (micBtn) micBtn.classList.remove("listening");
    if (micText) micText.textContent = "Dictate";
  };
}

function toggleVoiceDictation() {
  if (!recognition) {
    initVoiceDictation();
  }
  if (!recognition) return;

  if (isRecording) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch {}
  }
}

function populateCitizenView() {
  const list = document.getElementById("citizen-shelters-list");
  if (!list) return;
  list.innerHTML = "";

  SHELTER_DATA.forEach(s => {
    const card = document.createElement("div");
    card.className = "shelter-card";
    card.innerHTML = `
      <div class="sh-title">${s.name}</div>
      <div class="sh-sub">${s.amenities}</div>
      <div class="sh-meta-row">
        <span>Ward: ${s.ward}</span>
        <span style="color: #38bdf8">${s.occupancy}/${s.capacity} Occupied</span>
      </div>
      <button class="btn-primary" style="margin-top: 8px; font-size: 0.75rem; padding: 6px 10px;" onclick="navigateShelter('${s.coords.join(",")}')">
        Navigate Shaded CoolPath
      </button>
    `;
    list.appendChild(card);
  });
}

window.navigateShelter = function(coordsStr) {
  const [lat, lng] = coordsStr.split(",").map(Number);
  document.getElementById("btn-persona-admin").click();
  switchTab("coolpath");
  document.getElementById("cp-origin-select").value = "19.0405,72.8525";
  runCoolPath();
};

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  checkApiConnection();
  loadXaiExplanation("GRID_MUM_001");
  executeSimulation(250, 8000, 3);
  populateCitizenView();
  initVoiceDictation();

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll(".persona-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".persona-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePersona = btn.dataset.persona;

      const adminPanel = document.getElementById("sidebar-panel");
      const citizenView = document.getElementById("citizen-portal-view");

      if (activePersona === "citizen") {
        citizenView.classList.remove("hidden");
        adminPanel.classList.add("hidden");
      } else {
        citizenView.classList.add("hidden");
        adminPanel.classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".layer-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".layer-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeLayer = btn.dataset.layer;
      renderGridPolygons();
    });
  });

  document.getElementById("xai-zone-select").addEventListener("change", e => {
    loadXaiExplanation(e.target.value);
    const z = ZONE_DATA[e.target.value];
    if (z) map.panTo(z.coords[0]);
  });

  document.getElementById("map-zone-quickjump").addEventListener("change", e => {
    document.getElementById("xai-zone-select").value = e.target.value;
    document.getElementById("sim-zone-select").value = e.target.value;
    loadXaiExplanation(e.target.value);
    const z = ZONE_DATA[e.target.value];
    if (z) map.panTo(z.coords[0]);
  });

  document.getElementById("btn-xai-to-sim").addEventListener("click", () => {
    const zid = document.getElementById("xai-zone-select").value;
    document.getElementById("sim-zone-select").value = zid;
    switchTab("simulate");
    onSimulationInput();
  });

  const btnXaiExplain = document.getElementById("btn-xai-explain-screen");
  if (btnXaiExplain) {
    btnXaiExplain.addEventListener("click", () => triggerScreenExplanation());
  }

  const btnOpenExplainer = document.getElementById("btn-open-explainer");
  if (btnOpenExplainer) {
    btnOpenExplainer.addEventListener("click", () => triggerScreenExplanation());
  }

  const btnCloseGrok = document.getElementById("btn-close-grok");
  if (btnCloseGrok) {
    btnCloseGrok.addEventListener("click", closeGrokDrawer);
  }

  const btnGrokExplain = document.getElementById("btn-grok-explain");
  if (btnGrokExplain) {
    btnGrokExplain.addEventListener("click", () => {
      const q = document.getElementById("grok-query-input").value;
      triggerScreenExplanation(q);
    });
  }

  const btnGrokSend = document.getElementById("btn-grok-send");
  if (btnGrokSend) {
    btnGrokSend.addEventListener("click", () => {
      const q = document.getElementById("grok-query-input").value;
      triggerScreenExplanation(q);
    });
  }

  const btnGrokTts = document.getElementById("btn-grok-tts");
  if (btnGrokTts) {
    btnGrokTts.addEventListener("click", toggleAudioBriefing);
  }

  const btnGrokMic = document.getElementById("btn-grok-mic");
  if (btnGrokMic) {
    btnGrokMic.addEventListener("click", toggleVoiceDictation);
  }

  document.getElementById("sim-zone-select").addEventListener("change", onSimulationInput);
  document.getElementById("slider-trees").addEventListener("input", onSimulationInput);
  document.getElementById("slider-roofs").addEventListener("input", onSimulationInput);
  document.getElementById("slider-kiosks").addEventListener("input", onSimulationInput);

  document.getElementById("btn-run-coolpath").addEventListener("click", runCoolPath);

  document.getElementById("btn-submit-triage").addEventListener("click", submitTriage);

  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.dataset.preset;
      const descElem = document.getElementById("triage-desc");
      const catElem = document.getElementById("triage-category");
      if (p === "emergency") {
        descElem.value = "Public drinking water tap at transit camp crossroad has no water for 24 hours. Construction workers and street vendors having heat dizziness.";
        catElem.value = "Hydration Crisis";
      } else if (p === "critical") {
        descElem.value = "Elderly patient collapsed near platform 1 bus queue due to severe sun exposure and 42 degree surface heat, unconscious.";
        catElem.value = "Heat Exhaustion";
      } else if (p === "infrastructure") {
        descElem.value = "The solar cooling kiosk misting fan is broken and shelter canopy torn near market square.";
        catElem.value = "Broken Infrastructure";
      }
    });
  });

  document.getElementById("api-base-select").addEventListener("change", checkApiConnection);

  const btnCitizenSos = document.getElementById("btn-citizen-sos");
  if (btnCitizenSos) {
    btnCitizenSos.addEventListener("click", () => {
      document.getElementById("btn-persona-admin").click();
      switchTab("triage");
    });
  }

  const btnCitizenCool = document.getElementById("btn-citizen-coolpath");
  if (btnCitizenCool) {
    btnCitizenCool.addEventListener("click", () => {
      document.getElementById("btn-persona-admin").click();
      switchTab("coolpath");
      runCoolPath();
    });
  }
});
