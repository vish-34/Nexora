const asyncHandler = require("express-async-handler");
const axios = require("axios");
const aiGatewayService = require("../services/aiGatewayService");

const explainZone = asyncHandler(async (req, res) => {
  const zoneId = req.params.zone_id || req.params.cellId;
  const result = await aiGatewayService.explainZone(zoneId, req.query);
  res.json(result);
});

const simulatePolicy = asyncHandler(async (req, res) => {
  const { zone_id, interventions } = req.body || {};
  const result = await aiGatewayService.simulatePolicy(
    zone_id,
    interventions || req.body
  );
  res.json(result);
});

const coolPathRoute = asyncHandler(async (req, res) => {
  const { origin, destination, mode } = req.body || {};
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return res.status(400).json({
      error: "origin {lat,lng} and destination {lat,lng} are required",
    });
  }
  const route = await aiGatewayService.coolPathRoute(
    origin,
    destination,
    mode
  );
  res.json(route);
});

const triageRoute = asyncHandler(async (req, res) => {
  const { description, category, reporter_name, location, phone } =
    req.body || {};
  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }
  const result = await aiGatewayService.triageDistress(
    description,
    category,
    reporter_name,
    location,
    phone
  );
  res.json(result);
});

const screenExplainRoute = asyncHandler(async (req, res) => {
  const { context, user_prompt } = req.body || {};
  const result = await aiGatewayService.screenExplain(context, user_prompt);
  res.json(result);
});

const aiStatus = asyncHandler(async (req, res) => {
  const aiServiceUrl =
    process.env.AI_ENGINE_URL ||
    process.env.AI_SERVICE_URL ||
    "http://localhost:8000";
  const mockForced = String(process.env.USE_MOCK_AI).toLowerCase() === "true";

  let aiEngineOnline = false;
  let latencyMs = null;
  let phase3Health = null;

  const start = Date.now();
  try {
    const healthRes = await axios.get(`${aiServiceUrl}/api/health`, {
      timeout: 1500,
    });
    latencyMs = Date.now() - start;
    if (healthRes.status === 200) {
      aiEngineOnline = true;
      phase3Health = healthRes.data;
    }
  } catch (err) {
    aiEngineOnline = false;
  }

  res.json({
    status: "ok",
    aiEngineOnline,
    aiServiceUrl,
    mockMode: mockForced || !aiEngineOnline,
    latencyMs,
    phase3Health,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  explainZone,
  simulatePolicy,
  coolPathRoute,
  triageRoute,
  screenExplainRoute,
  aiStatus,
};
