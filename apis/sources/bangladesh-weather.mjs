// Open-Meteo — Current weather for all 64 Bangladesh districts
// No API key required. Single batched request for all districts.

import { safeFetch } from '../utils/fetch.mjs';

const DISTRICTS = [
  { name: 'Dhaka',          lat: 23.7104, lon: 90.4074 },
  { name: 'Chittagong',     lat: 22.3419, lon: 91.8155 },
  { name: 'Rajshahi',       lat: 24.3745, lon: 88.6042 },
  { name: 'Khulna',         lat: 22.8456, lon: 89.5403 },
  { name: 'Barisal',        lat: 22.7010, lon: 90.3535 },
  { name: 'Sylhet',         lat: 24.8998, lon: 91.8687 },
  { name: 'Mymensingh',     lat: 24.7471, lon: 90.4203 },
  { name: 'Rangpur',        lat: 25.7439, lon: 89.2752 },
  { name: 'Gazipur',        lat: 23.9999, lon: 90.4203 },
  { name: 'Narayanganj',    lat: 23.6238, lon: 90.5000 },
  { name: 'Comilla',        lat: 23.4607, lon: 91.1809 },
  { name: 'Jessore',        lat: 23.1667, lon: 89.2167 },
  { name: 'Bogra',          lat: 24.8465, lon: 89.3720 },
  { name: 'Dinajpur',       lat: 25.6217, lon: 88.6354 },
  { name: 'Pabna',          lat: 24.0064, lon: 89.2372 },
  { name: 'Tangail',        lat: 24.2512, lon: 89.9167 },
  { name: 'Jamalpur',       lat: 24.9382, lon: 89.9375 },
  { name: 'Kishoreganj',    lat: 24.4440, lon: 90.7761 },
  { name: 'Faridpur',       lat: 23.6070, lon: 89.8429 },
  { name: 'Sherpur',        lat: 25.0191, lon: 90.0164 },
  { name: 'Netrokona',      lat: 24.8704, lon: 90.7244 },
  { name: 'Narsingdi',      lat: 23.9324, lon: 90.7154 },
  { name: 'Manikganj',      lat: 23.8638, lon: 90.0010 },
  { name: 'Munshiganj',     lat: 23.5422, lon: 90.5320 },
  { name: 'Gopalganj',      lat: 23.0050, lon: 89.8266 },
  { name: 'Madaripur',      lat: 23.1641, lon: 90.1978 },
  { name: 'Shariatpur',     lat: 23.2423, lon: 90.4348 },
  { name: 'Rajbari',        lat: 23.7574, lon: 89.6442 },
  { name: 'Chandpur',       lat: 23.2332, lon: 90.6520 },
  { name: 'Brahmanbaria',   lat: 23.9570, lon: 91.1115 },
  { name: 'Habiganj',       lat: 24.3745, lon: 91.4150 },
  { name: 'Moulvibazar',    lat: 24.4829, lon: 91.7774 },
  { name: 'Sunamganj',      lat: 25.0658, lon: 91.3950 },
  { name: 'Noakhali',       lat: 22.8724, lon: 91.0994 },
  { name: 'Feni',           lat: 23.0231, lon: 91.3966 },
  { name: 'Lakshmipur',     lat: 22.9431, lon: 90.8282 },
  { name: "Cox's Bazar",    lat: 21.4272, lon: 92.0058 },
  { name: 'Rangamati',      lat: 22.6471, lon: 92.2033 },
  { name: 'Bandarban',      lat: 22.1953, lon: 92.2184 },
  { name: 'Khagrachhari',   lat: 23.1193, lon: 91.9847 },
  { name: 'Chuadanga',      lat: 23.6401, lon: 88.8411 },
  { name: 'Meherpur',       lat: 23.7621, lon: 88.6318 },
  { name: 'Kushtia',        lat: 23.9013, lon: 89.1201 },
  { name: 'Magura',         lat: 23.4873, lon: 89.4208 },
  { name: 'Narail',         lat: 23.1726, lon: 89.5012 },
  { name: 'Satkhira',       lat: 22.7185, lon: 89.0705 },
  { name: 'Bagerhat',       lat: 22.6602, lon: 89.7854 },
  { name: 'Pirojpur',       lat: 22.5794, lon: 89.9742 },
  { name: 'Jhalokati',      lat: 22.6406, lon: 90.1985 },
  { name: 'Patuakhali',     lat: 22.3596, lon: 90.3296 },
  { name: 'Bhola',          lat: 22.6859, lon: 90.6482 },
  { name: 'Barguna',        lat: 22.0956, lon: 90.1120 },
  { name: 'Sirajganj',      lat: 24.4534, lon: 89.7001 },
  { name: 'Natore',         lat: 24.4204, lon: 88.9881 },
  { name: 'Nawabganj',      lat: 24.5966, lon: 88.2753 },
  { name: 'Joypurhat',      lat: 25.1003, lon: 89.0229 },
  { name: 'Gaibandha',      lat: 25.3288, lon: 89.5426 },
  { name: 'Nilphamari',     lat: 25.9310, lon: 88.8560 },
  { name: 'Lalmonirhat',    lat: 25.9923, lon: 89.4448 },
  { name: 'Kurigram',       lat: 25.8070, lon: 89.6360 },
  { name: 'Thakurgaon',     lat: 26.0335, lon: 88.4616 },
  { name: 'Panchagarh',     lat: 26.3411, lon: 88.5542 },
  { name: 'Netrokona',      lat: 24.8704, lon: 90.7244 },
  { name: 'Habiganj',       lat: 24.3745, lon: 91.4150 },
  { name: 'Sunamganj',      lat: 25.0658, lon: 91.3950 },
];

// Deduplicate (some districts appear twice due to division grouping)
const UNIQUE_DISTRICTS = DISTRICTS.filter((d, i, arr) =>
  arr.findIndex(x => x.name === d.name) === i
);

const LAT_PARAM = UNIQUE_DISTRICTS.map(d => d.lat).join(',');
const LON_PARAM = UNIQUE_DISTRICTS.map(d => d.lon).join(',');

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL  = 'https://archive-api.open-meteo.com/v1/archive';
const CURRENT_VARS = 'temperature_2m,precipitation,weathercode,windspeed_10m,relativehumidity_2m';
const DAILY_VARS   = 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode';

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function decodeWMO(code) {
  if (code === 0)                   return 'Clear sky';
  if (code <= 3)                    return 'Partly cloudy';
  if (code <= 9)                    return 'Mist / fog patches';
  if (code === 45 || code === 48)   return 'Fog';
  if (code <= 55)                   return 'Drizzle';
  if (code <= 57)                   return 'Freezing drizzle';
  if (code <= 63)                   return 'Rain';
  if (code <= 65)                   return 'Heavy rain';
  if (code <= 67)                   return 'Freezing rain';
  if (code <= 77)                   return 'Snow';
  if (code <= 82)                   return 'Rain showers';
  if (code <= 86)                   return 'Snow showers';
  if (code === 95)                  return 'Thunderstorm';
  if (code <= 99)                   return 'Thunderstorm with hail';
  return 'Unknown';
}

export async function briefing() {
  // Date range for historical: past 30 days up to yesterday
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const past30    = new Date(today); past30.setDate(today.getDate() - 30);
  const histStart = isoDate(past30);
  const histEnd   = isoDate(yesterday);

  const forecastUrl = `${FORECAST_URL}?latitude=${LAT_PARAM}&longitude=${LON_PARAM}&current=${CURRENT_VARS}&daily=${DAILY_VARS}&forecast_days=7&timezone=Asia%2FDhaka`;
  const archiveUrl  = `${ARCHIVE_URL}?latitude=${LAT_PARAM}&longitude=${LON_PARAM}&daily=${DAILY_VARS}&start_date=${histStart}&end_date=${histEnd}&timezone=Asia%2FDhaka`;

  const [rawForecast, rawArchive] = await Promise.all([
    safeFetch(forecastUrl, { timeout: 20000, retries: 1 }),
    safeFetch(archiveUrl,  { timeout: 20000, retries: 1 }),
  ]);

  if (rawForecast?.error) {
    return {
      source: 'Open-Meteo / Bangladesh Weather',
      timestamp: new Date().toISOString(),
      error: rawForecast.error,
    };
  }

  const forecastResults = Array.isArray(rawForecast) ? rawForecast : [rawForecast];
  const archiveResults  = Array.isArray(rawArchive)  ? rawArchive  : [rawArchive];

  const districts = UNIQUE_DISTRICTS.map((d, i) => {
    const r = forecastResults[i];
    if (!r || !r.current) return { district: d.name, lat: d.lat, lon: d.lon, error: 'no_data' };

    const c = r.current;

    // 7-day forecast from forecast API
    const fday = r.daily;
    const forecast = fday?.time?.map((date, j) => ({
      date,
      maxTempC:        fday.temperature_2m_max?.[j] ?? null,
      minTempC:        fday.temperature_2m_min?.[j] ?? null,
      precipitationMm: fday.precipitation_sum?.[j] ?? null,
      weatherCode:     fday.weathercode?.[j] ?? null,
      condition:       fday.weathercode?.[j] != null ? decodeWMO(fday.weathercode[j]) : 'Unknown',
    })) ?? [];

    // 30-day historical from archive API
    const aday = archiveResults[i]?.daily;
    const historical = aday?.time?.map((date, j) => ({
      date,
      maxTempC:        aday.temperature_2m_max?.[j] ?? null,
      minTempC:        aday.temperature_2m_min?.[j] ?? null,
      precipitationMm: aday.precipitation_sum?.[j] ?? null,
      weatherCode:     aday.weathercode?.[j] ?? null,
      condition:       aday.weathercode?.[j] != null ? decodeWMO(aday.weathercode[j]) : 'Unknown',
    })) ?? [];

    return {
      district:      d.name,
      lat:           d.lat,
      lon:           d.lon,
      temperature:   c.temperature_2m ?? null,
      precipitation: c.precipitation ?? null,
      windspeedKph:  c.windspeed_10m ?? null,
      humidity:      c.relativehumidity_2m ?? null,
      weatherCode:   c.weathercode ?? null,
      condition:     c.weathercode != null ? decodeWMO(c.weathercode) : 'Unknown',
      observedAt:    c.time ?? null,
      forecast,      // next 7 days
      historical,    // past 30 days
    };
  });

  // Build signals for notable conditions
  const signals = [];
  for (const d of districts) {
    if (d.error) continue;
    const code = d.weatherCode;
    if (code >= 95)                                 signals.push(`THUNDERSTORM in ${d.district}: ${d.condition}, ${d.precipitation}mm precip`);
    else if (code === 65 || (code >= 80 && code <= 82)) signals.push(`HEAVY RAIN in ${d.district}: ${d.precipitation}mm, ${d.condition}`);
    else if (code >= 45 && code <= 48)              signals.push(`FOG WARNING in ${d.district}`);
    if (d.temperature !== null && d.temperature >= 40) signals.push(`EXTREME HEAT in ${d.district}: ${d.temperature}°C`);
    if (d.temperature !== null && d.temperature <= 10) signals.push(`COLD SPELL in ${d.district}: ${d.temperature}°C`);
    if (d.windspeedKph !== null && d.windspeedKph >= 60) signals.push(`HIGH WINDS in ${d.district}: ${d.windspeedKph} km/h`);
  }

  // Aggregate summary
  const valid = districts.filter(d => !d.error && d.temperature !== null);
  const temps = valid.map(d => d.temperature);
  const avgTemp = temps.length ? +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : null;
  const maxTemp = temps.length ? Math.max(...temps) : null;
  const minTemp = temps.length ? Math.min(...temps) : null;
  const hottestDistrict = valid.find(d => d.temperature === maxTemp)?.district ?? null;
  const coldestDistrict = valid.find(d => d.temperature === minTemp)?.district ?? null;

  const conditionFreq = {};
  for (const d of valid) conditionFreq[d.condition] = (conditionFreq[d.condition] ?? 0) + 1;
  const dominantCondition = Object.entries(conditionFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const summary = {
    districtsTotal:           UNIQUE_DISTRICTS.length,
    districtsWithData:        valid.length,
    districtsWithRain:        valid.filter(d => d.precipitation > 0).length,
    districtsWithThunderstorm: valid.filter(d => d.weatherCode >= 95).length,
    avgTemperatureC:          avgTemp,
    maxTemperatureC:          maxTemp,
    minTemperatureC:          minTemp,
    hottestDistrict,
    coldestDistrict,
    dominantCondition,
  };

  return {
    source: 'Open-Meteo / Bangladesh Weather',
    timestamp: new Date().toISOString(),
    note: 'Current conditions for all Bangladesh districts via Open-Meteo (no API key required)',
    summary,
    districts,
    signals,
  };
}

if (process.argv[1]?.endsWith('bangladesh-weather.mjs')) {
  const data = await briefing();
  console.log(JSON.stringify(data, null, 2));
}
