const axios = require("axios");
const {
  mockCHRS,
  mockXAI,
  mockWhatIf,
  mockCoolPath,
  mockTriage,
  mockScreenExplain,
} = require("../utils/mockAiResponses");

const AI_BASE_URL =
  process.env.AI_ENGINE_URL ||
  process.env.AI_SERVICE_URL ||
  "http://localhost:8000";

const TIMEOUT = Number(process.env.AI_SERVICE_TIMEOUT_MS || 2500);

const isMockForced = () => String(process.env.USE_MOCK_AI).toLowerCase() === "true";

async function explainZone(zoneId) {
  if (isMockForced()) return mockXAI(zoneId);
  try {
    const res = await axios.get(`${AI_BASE_URL}/api/ai/explain/${zoneId}`, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockXAI(zoneId);
  }
}

async function simulatePolicy(zoneId, payload = {}) {
  if (isMockForced()) return mockWhatIf(zoneId, payload);
  try {
    const interventions = payload.interventions || payload;
    const body = {
      zone_id: zoneId,
      interventions: {
        canopy_trees_added: Number(
          interventions.canopy_trees_added || interventions.trees_added || 0
        ),
        cool_roof_sqm: Number(
          interventions.cool_roof_sqm || interventions.coolRoofAdoptionPct || 0
        ),
        water_kiosks_added: Number(
          interventions.water_kiosks_added || interventions.kiosks_added || 0
        ),
      },
    };
    const res = await axios.post(`${AI_BASE_URL}/api/ai/simulate`, body, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockWhatIf(zoneId, payload);
  }
}

async function coolPathRoute(origin, destination, mode = "pedestrian") {
  if (isMockForced()) return mockCoolPath(origin, destination);
  try {
    const body = {
      origin: { lat: Number(origin.lat), lng: Number(origin.lng) },
      destination: { lat: Number(destination.lat), lng: Number(destination.lng) },
      mode: mode || "pedestrian",
    };
    const res = await axios.post(`${AI_BASE_URL}/api/ai/coolpath`, body, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockCoolPath(origin, destination);
  }
}

async function triageDistress(description, category = "Hydration Crisis", reporterName = "Anonymous", location = null, phone = "") {
  if (isMockForced()) return mockTriage(description, category, reporterName);
  try {
    const body = {
      description,
      category,
      reporter_name: reporterName,
      phone,
      location: location ? { lat: Number(location.lat), lng: Number(location.lng) } : null,
    };
    const res = await axios.post(`${AI_BASE_URL}/api/ai/triage`, body, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockTriage(description, category, reporterName);
  }
}

async function screenExplain(context, userPrompt = "") {
  if (isMockForced()) return mockScreenExplain(context, userPrompt);
  try {
    const body = { context, user_prompt: userPrompt };
    const res = await axios.post(`${AI_BASE_URL}/api/ai/screen-explain`, body, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockScreenExplain(context, userPrompt);
  }
}

async function computeCHRS(cellId, inputs = {}) {
  if (isMockForced()) return mockCHRS(cellId, inputs);
  try {
    const res = await axios.post(`${AI_BASE_URL}/api/ai/chrs`, { cellId, ...inputs }, { timeout: TIMEOUT });
    return res.data;
  } catch (err) {
    return mockCHRS(cellId, inputs);
  }
}

module.exports = {
  explainZone,
  simulatePolicy,
  coolPathRoute,
  triageDistress,
  screenExplain,
  computeCHRS,
  getXAI: explainZone,
  getWhatIf: simulatePolicy,
  getCoolPath: coolPathRoute,
  getTriage: triageDistress,
  getScreenExplain: screenExplain,
  getCHRS: computeCHRS,
};
