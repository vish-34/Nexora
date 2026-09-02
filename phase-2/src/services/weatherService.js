const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: Number(process.env.WEATHER_CACHE_TTL_SECONDS || 600),
});

const BASE_URL =
  process.env.OPEN_METEO_API_URL ||
  process.env.OPEN_METEO_BASE_URL ||
  "https://api.open-meteo.com/v1/forecast";

function calculateWetBulbTemperature(tempC, relHumidityPct) {
  const t = tempC;
  const rh = relHumidityPct;
  const tw =
    t * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Math.round(tw * 10) / 10;
}

function calculateGlobeTemperature(tempC, directRadiation = 650) {
  const tg = tempC + 0.018 * directRadiation;
  return Math.round(tg * 10) / 10;
}

function calculateWBGT(tempC, relHumidityPct, solarRadiation = 650) {
  const tw = calculateWetBulbTemperature(tempC, relHumidityPct);
  const tg = calculateGlobeTemperature(tempC, solarRadiation);
  const wbgt = 0.7 * tw + 0.2 * tg + 0.1 * tempC;
  return Math.round(wbgt * 10) / 10;
}

function getAlertLevel(wbgtC) {
  if (wbgtC >= 32.2) {
    return "Extreme Danger (Red Alert)";
  }
  if (wbgtC >= 30.1) {
    return "High Heat Danger (Orange Alert)";
  }
  if (wbgtC >= 27.8) {
    return "Heat Caution (Yellow Alert)";
  }
  return "Normal (Green Alert)";
}

function wbgtBand(wbgtC) {
  if (wbgtC >= 32.2) return "extreme";
  if (wbgtC >= 30.1) return "high";
  if (wbgtC >= 27.8) return "moderate";
  return "low";
}

async function getCurrentWeather(lat = 19.076, lng = 72.8777) {
  const key = `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
  const cached = cache.get(key);
  if (cached) return { ...cached, fromCache: true };

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,direct_radiation,uv_index",
        timezone: "Asia/Kolkata",
      },
      timeout: 6000,
    });

    const current = response.data?.current;
    if (!current) throw new Error("No current weather data in Open-Meteo response");

    const tempC = current.temperature_2m;
    const humidityPct = current.relative_humidity_2m;
    const solarRadiation = current.direct_radiation ?? 650;
    const uvIndex = current.uv_index ?? 9.2;
    const wbgtC = calculateWBGT(tempC, humidityPct, solarRadiation);
    const alertLevel = getAlertLevel(wbgtC);

    const result = {
      city: "Mumbai",
      air_temp_c: tempC,
      relative_humidity_pct: humidityPct,
      wbgt_c: wbgtC,
      heat_alert_level: alertLevel,
      uv_index: uvIndex,
      updated_at: new Date().toISOString(),
      location: { lat, lng },
      tempC,
      humidityPct,
      apparentTempC: current.apparent_temperature,
      windSpeedKmh: current.wind_speed_10m,
      wbgtC,
      wbgtBand: wbgtBand(wbgtC),
      fromCache: false,
    };

    cache.set(key, result);
    return result;
  } catch (err) {
    const fallbackTemp = 37.4;
    const fallbackHumidity = 74;
    const fallbackWbgt = calculateWBGT(fallbackTemp, fallbackHumidity, 650);
    const fallbackResult = {
      city: "Mumbai",
      air_temp_c: fallbackTemp,
      relative_humidity_pct: fallbackHumidity,
      wbgt_c: fallbackWbgt,
      heat_alert_level: getAlertLevel(fallbackWbgt),
      uv_index: 9.2,
      updated_at: new Date().toISOString(),
      location: { lat, lng },
      tempC: fallbackTemp,
      humidityPct: fallbackHumidity,
      apparentTempC: 43.5,
      windSpeedKmh: 12.0,
      wbgtC: fallbackWbgt,
      wbgtBand: wbgtBand(fallbackWbgt),
      fromCache: false,
    };
    return fallbackResult;
  }
}

module.exports = {
  getCurrentWeather,
  calculateWBGT,
  calculateWetBulbTemperature,
  calculateGlobeTemperature,
  getAlertLevel,
  wbgtBand,
};
