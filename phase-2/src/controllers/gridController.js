const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const HeatGrid = require("../models/HeatGrid");
const weatherService = require("../services/weatherService");
const aiGatewayService = require("../services/aiGatewayService");

let fallbackCells;
try {
  fallbackCells = require("../../../Nexora/shared/mumbai_heat_grid.json");
} catch (e) {
  fallbackCells = require("../../data/mumbai_heat_grid.sample.json");
}

const listCells = asyncHandler(async (req, res) => {
  const { ward, band, minRisk, limit = 500 } = req.query;
  let cells = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (ward) filter.ward = ward;
      if (band) filter["chrs.band"] = band;
      if (minRisk) filter.chrs_risk_score = { $gte: Number(minRisk) };
      cells = await HeatGrid.find(filter).limit(Number(limit)).lean();
    } catch (e) {
      cells = fallbackCells;
    }
  } else {
    cells = fallbackCells;
    if (ward) cells = cells.filter((c) => c.ward === ward);
    if (minRisk) cells = cells.filter((c) => (c.chrs_risk_score || 0) >= Number(minRisk));
  }

  if (!cells || cells.length === 0) {
    cells = fallbackCells;
    if (ward) cells = cells.filter((c) => c.ward === ward);
    if (minRisk) cells = cells.filter((c) => (c.chrs_risk_score || 0) >= Number(minRisk));
  }

  if (!req.originalUrl.includes("/api/v1/heatgrid")) {
    return res.json({
      type: "FeatureCollection",
      city: "Mumbai",
      description: "500m micro-grid polygon cells with satellite LST, vegetation NDVI, built-up NDBI, and CHRS heat risk",
      total_cells: cells.length,
      features: cells.map((c) => ({
        type: "Feature",
        id: c.zone_id || c.cellId,
        geometry: c.geometry || c.polygon || {
          type: "Polygon",
          coordinates: [
            [
              [72.852, 19.04],
              [72.8575, 19.04],
              [72.8575, 19.0455],
              [72.852, 19.0455],
              [72.852, 19.04],
            ],
          ],
        },
        properties: {
          zone_id: c.zone_id || c.cellId,
          name: c.name,
          ward: c.ward,
          lst_celsius: c.lst_celsius ?? c.surfaceTempC ?? 40.0,
          ndvi: c.ndvi ?? 0.15,
          ndbi: c.ndbi ?? 0.65,
          population_density_per_sqkm:
            c.population_density_per_sqkm ?? c.population_density ?? c.populationDensity ?? 50000,
          elderly_percentage: c.elderly_percentage ?? c.elderlyPct ?? 14.0,
          informal_housing_ratio: c.informal_housing_ratio ?? 0.5,
          canopy_cover_pct: c.canopy_cover_pct ?? 10.0,
          drinking_water_access_score: c.drinking_water_access_score ?? 5.0,
          chrs_risk_score: c.chrs_risk_score ?? c.chrs?.score ?? 75.0,
          risk_level: c.risk_level ?? "High",
          primary_hazard_driver:
            c.primary_hazard_driver || "Low albedo informal roofing and canopy deficit",
        },
      })),
    });
  }

  res.json({ count: cells.length, cells });
});

const getCell = asyncHandler(async (req, res) => {
  const id = req.params.zone_id || req.params.cellId;
  if (mongoose.connection.readyState === 1) {
    try {
      const cell = await HeatGrid.findOne({ $or: [{ zone_id: id }, { cellId: id }] }).lean();
      if (cell) return res.json(cell);
    } catch (e) { }
  }

  const found = fallbackCells.find((c) => c.zone_id === id || c.cellId === id);
  if (!found) return res.status(404).json({ error: "Cell not found" });
  res.json(found);
});

const nearbyCells = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat ?? process.env.DEFAULT_LAT ?? 19.076);
  const lng = Number(req.query.lng ?? process.env.DEFAULT_LNG ?? 72.8777);
  const radiusM = Number(req.query.radiusM || 1000);

  if (mongoose.connection.readyState === 1) {
    try {
      const cells = await HeatGrid.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusM,
          },
        },
      })
        .limit(200)
        .lean();
      return res.json({ center: { lat, lng }, radiusM, count: cells.length, cells });
    } catch (e) { }
  }

  res.json({ center: { lat, lng }, radiusM, count: fallbackCells.length, cells: fallbackCells });
});

const upsertCells = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({ upserted: 0, modified: 0, status: "in-memory mock mode" });
  }
  const cells = Array.isArray(req.body) ? req.body : [req.body];
  const ops = cells.map((c) => {
    const zid = c.zone_id || c.cellId;
    return {
      updateOne: {
        filter: { $or: [{ zone_id: zid }, { cellId: zid }] },
        update: { $set: { ...c, zone_id: zid, cellId: zid } },
        upsert: true,
      },
    };
  });
  const result = await HeatGrid.bulkWrite(ops);
  res.status(201).json({ upserted: result.upsertedCount, modified: result.modifiedCount });
});

const refreshWeather = asyncHandler(async (req, res) => {
  const id = req.params.zone_id || req.params.cellId;
  let lat = 19.0425;
  let lng = 72.8545;

  if (mongoose.connection.readyState === 1) {
    try {
      const cell = await HeatGrid.findOne({ $or: [{ zone_id: id }, { cellId: id }] });
      if (cell) {
        [lng, lat] = cell.location.coordinates;
        const weather = await weatherService.getCurrentWeather(lat, lng);
        cell.ambientTempC = weather.air_temp_c;
        cell.humidityPct = weather.relative_humidity_pct;
        cell.wbgt_c = weather.wbgt_c;
        cell.wbgtC = weather.wbgt_c;
        await cell.save();
        return res.json({
          zone_id: cell.zone_id,
          weather,
          wbgt_c: weather.wbgt_c,
          wbgtBand: weatherService.wbgtBand(weather.wbgt_c),
        });
      }
    } catch (e) { }
  }

  const weather = await weatherService.getCurrentWeather(lat, lng);
  res.json({
    zone_id: id,
    weather,
    wbgt_c: weather.wbgt_c,
    wbgtBand: weatherService.wbgtBand(weather.wbgt_c),
  });
});

const computeChrs = asyncHandler(async (req, res) => {
  const id = req.params.zone_id || req.params.cellId;
  const chrs = await aiGatewayService.computeCHRS(id, {
    wbgtC: 34.2,
    ndvi: 0.08,
    populationDensity: 68000,
    elderlyPct: 14.5,
    surfaceTempC: 43.8,
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const cell = await HeatGrid.findOne({ $or: [{ zone_id: id }, { cellId: id }] });
      if (cell) {
        cell.chrs_risk_score = chrs.score;
        cell.risk_level = chrs.band ? chrs.band.charAt(0).toUpperCase() + chrs.band.slice(1) : cell.risk_level;
        cell.chrs = { score: chrs.score, band: chrs.band, computedAt: new Date(), source: chrs.source };
        await cell.save();
      }
    } catch (e) { }
  }

  res.json(chrs);
});

const explainCell = asyncHandler(async (req, res) => {
  const id = req.params.zone_id || req.params.cellId;
  const explanation = await aiGatewayService.explainZone(id);
  res.json(explanation);
});

const whatIfCell = asyncHandler(async (req, res) => {
  const id = req.params.zone_id || req.params.cellId;
  const result = await aiGatewayService.simulatePolicy(id, req.body || {});
  res.json(result);
});

module.exports = {
  listCells,
  getCell,
  nearbyCells,
  upsertCells,
  refreshWeather,
  computeChrs,
  explainCell,
  whatIfCell,
};
