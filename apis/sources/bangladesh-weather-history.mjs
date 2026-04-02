// NASA POWER API — Full historical weather for all 64 Bangladesh districts
// No API key required. No rate limits. Data from 1981 to yesterday.
// One request per district (64 total), all years in one shot.
// Run: node apis/sources/bangladesh-weather-history.mjs

import fs from 'fs';

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
];

const OUTPUT_FILE = 'bangladesh-history.csv';
const START = '19810101';
const END   = '20210331';
const CONCURRENCY = 5; // fetch 5 districts at a time

async function fetchDistrict(d) {
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point` +
    `?parameters=T2M_MAX,T2M_MIN` +
    `&community=RE` +
    `&longitude=${d.lon}` +
    `&latitude=${d.lat}` +
    `&start=${START}` +
    `&end=${END}` +
    `&format=JSON`;

  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const props = json?.properties?.parameter;
  if (!props?.T2M_MAX || !props?.T2M_MIN) throw new Error('missing data');

  const rows = [];
  for (const date of Object.keys(props.T2M_MAX)) {
    const maxT = props.T2M_MAX[date];
    const minT = props.T2M_MIN[date];
    // NASA uses -999 for missing values
    if (maxT === -999 || minT === -999) continue;
    const fmt = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
    rows.push(`${d.name},${d.lat},${d.lon},historical,${fmt},${maxT},${minT}`);
  }
  return rows;
}

// Write header
fs.writeFileSync(OUTPUT_FILE, 'district,lat,lon,type,date,maxTempC,minTempC\n');

let totalRows = 0;
const failed  = [];

// Process in batches of CONCURRENCY
for (let i = 0; i < DISTRICTS.length; i += CONCURRENCY) {
  const batch = DISTRICTS.slice(i, i + CONCURRENCY);
  process.stderr.write(`Fetching ${batch.map(d => d.name).join(', ')}...\n`);

  const results = await Promise.allSettled(batch.map(fetchDistrict));

  for (let j = 0; j < batch.length; j++) {
    const d = batch[j];
    const r = results[j];
    if (r.status === 'fulfilled') {
      fs.appendFileSync(OUTPUT_FILE, r.value.join('\n') + '\n');
      totalRows += r.value.length;
      process.stderr.write(`  ✓ ${d.name}: ${r.value.length} rows\n`);
    } else {
      process.stderr.write(`  ✗ ${d.name}: FAILED (${r.reason?.message})\n`);
      failed.push(d.name);
    }
  }
}

process.stderr.write(`\nDone. Total rows: ${totalRows}. File: ${OUTPUT_FILE}\n`);
if (failed.length) process.stderr.write(`Failed districts: ${failed.join(', ')}\n`);
