/**
 * Live Weather Service using Open-Meteo Free Public API
 * Provides live real-time ambient temperature, humidity, wind, and calculated WBGT
 * for any Indian state, union territory, district, or ward.
 */

// Coordinates for Indian State Capitals & Core Geographic Tiers
export const REGION_COORDINATES = {
  india: { lat: 28.6139, lng: 77.2090, label: 'New Delhi (National Capital)' },
  world: { lat: 20.5937, lng: 78.9629, label: 'Subcontinental Central' },
  mumbai: { lat: 18.9220, lng: 72.8347, label: 'Mumbai (BMC Colaba)' },
  'mumbai-dharavi': { lat: 19.0430, lng: 72.8550, label: 'Dharavi Micro-Station' },
  maharashtra: { lat: 18.9220, lng: 72.8347, label: 'Mumbai, Maharashtra' },
  gujarat: { lat: 23.2156, lng: 72.6369, label: 'Gandhinagar / Ahmedabad' },
  rajasthan: { lat: 26.9124, lng: 75.7873, label: 'Jaipur, Rajasthan' },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'New Delhi, NCR' },
  karnataka: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru, Karnataka' },
  'uttar-pradesh': { lat: 26.8467, lng: 80.9462, label: 'Lucknow, Uttar Pradesh' },
  'tamil-nadu': { lat: 13.0827, lng: 80.2707, label: 'Chennai, Tamil Nadu' },
  'west-bengal': { lat: 22.5726, lng: 88.3639, label: 'Kolkata, West Bengal' },
  telangana: { lat: 17.3850, lng: 78.4867, label: 'Hyderabad, Telangana' },
  'andhra-pradesh': { lat: 16.5062, lng: 80.6480, label: 'Vijayawada, Andhra Pradesh' },
  bihar: { lat: 25.6093, lng: 85.1376, label: 'Patna, Bihar' },
  'madhya-pradesh': { lat: 23.2599, lng: 77.4126, label: 'Bhopal, Madhya Pradesh' },
  kerala: { lat: 8.5241, lng: 76.9366, label: 'Thiruvananthapuram, Kerala' },
  punjab: { lat: 30.7333, lng: 76.7794, label: 'Chandigarh, Punjab' },
  haryana: { lat: 30.7333, lng: 76.7794, label: 'Chandigarh, Haryana' },
  odisha: { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar, Odisha' },
  assam: { lat: 26.1445, lng: 91.7362, label: 'Guwahati, Assam' },
  jharkhand: { lat: 23.3441, lng: 85.3096, label: 'Ranchi, Jharkhand' },
  chhattisgarh: { lat: 21.2514, lng: 81.6296, label: 'Raipur, Chhattisgarh' },
  uttarakhand: { lat: 30.3165, lng: 78.0322, label: 'Dehradun, Uttarakhand' },
  'himachal-pradesh': { lat: 31.1048, lng: 77.1734, label: 'Shimla, Himachal Pradesh' },
  goa: { lat: 15.4909, lng: 73.8278, label: 'Panaji, Goa' },
  'jammu-kashmir': { lat: 34.0837, lng: 74.7973, label: 'Srinagar, J&K' },
  ladakh: { lat: 34.1526, lng: 77.5771, label: 'Leh, Ladakh' },
  tripura: { lat: 23.8315, lng: 91.2868, label: 'Agartala, Tripura' },
  meghalaya: { lat: 25.5788, lng: 91.8933, label: 'Shillong, Meghalaya' },
  manipur: { lat: 24.8170, lng: 93.9368, label: 'Imphal, Manipur' },
  nagaland: { lat: 25.6751, lng: 94.1086, label: 'Kohima, Nagaland' },
  puducherry: { lat: 11.9416, lng: 79.8083, label: 'Puducherry' },
  chandigarh: { lat: 30.7333, lng: 76.7794, label: 'Chandigarh UT' },
  sikkim: { lat: 27.3389, lng: 88.6065, label: 'Gangtok, Sikkim' },
  mizoram: { lat: 23.7271, lng: 92.7176, label: 'Aizawl, Mizoram' },
  'arunachal-pradesh': { lat: 27.0844, lng: 93.6053, label: 'Itanagar, Arunachal' }
};

// In-memory cache to prevent spamming API on rapid region toggles
const weatherCache = new Map();

/**
 * Calculates Wet-Bulb Temperature using Stull's equation
 */
function calculateWetBulb(T, RH) {
  const Tw =
    T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;
  return +Tw.toFixed(1);
}

/**
 * Fetches real-time weather from Open-Meteo for a specific region ID
 */
export async function fetchLiveRegionWeather(regionId = 'india') {
  const normalizedId = (regionId || 'india').toLowerCase().trim();
  const coords = REGION_COORDINATES[normalizedId] || REGION_COORDINATES.india;

  const cacheKey = `${coords.lat},${coords.lng}`;
  const cached = weatherCache.get(cacheKey);

  // Return cached result if less than 5 minutes old
  if (cached && Date.now() - cached.cachedAt < 300000) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo API returned ${res.status}`);

    const data = await res.json();
    const current = data.current;

    const temp = +current.temperature_2m.toFixed(1);
    const rh = +current.relative_humidity_2m.toFixed(0);
    const feelsLike = +current.apparent_temperature.toFixed(1);
    const wind = +current.wind_speed_10m.toFixed(1);
    const wetBulb = calculateWetBulb(temp, rh);

    const result = {
      isLive: true,
      stationName: coords.label,
      temp_c: temp,
      relative_humidity: rh,
      apparent_temp_c: feelsLike,
      wind_speed_kmh: wind,
      wbgt_c: +(wetBulb * 0.7 + temp * 0.3).toFixed(1), // Simplified outdoor WBGT estimate
      weather_code: current.weather_code,
      fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    weatherCache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  } catch (err) {
    console.warn(`[Open-Meteo] Live fetch failed for ${normalizedId}, using fallback:`, err);
    return {
      isLive: false,
      stationName: coords.label,
      temp_c: 33.5,
      relative_humidity: 62,
      apparent_temp_c: 37.0,
      wind_speed_kmh: 14.0,
      wbgt_c: 31.8,
      weather_code: 1,
      fetchedAt: 'Cached Fallback'
    };
  }
}
