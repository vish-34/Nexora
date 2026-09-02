const asyncHandler = require("express-async-handler");
const weatherService = require("../services/weatherService");

const currentWeather = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat ?? process.env.DEFAULT_LAT ?? 19.076);
  const lng = Number(req.query.lng ?? process.env.DEFAULT_LNG ?? 72.8777);

  const weather = await weatherService.getCurrentWeather(lat, lng);

  res.json({
    city: "Mumbai",
    air_temp_c: weather.air_temp_c,
    relative_humidity_pct: weather.relative_humidity_pct,
    wbgt_c: weather.wbgt_c,
    heat_alert_level: weather.heat_alert_level,
    uv_index: weather.uv_index,
    location: { lat, lng },
    updated_at: weather.updated_at,
    tempC: weather.tempC,
    humidityPct: weather.humidityPct,
    wbgtC: weather.wbgtC,
    wbgtBand: weather.wbgtBand,
  });
});

module.exports = { currentWeather };
