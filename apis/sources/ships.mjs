// Ship/Vessel Tracking — aisstream.io (free real-time global AIS)
// Detects: dark ships, sanctions evasion, naval deployments, port congestion
// Individual vessel tracking: set TRACKED_VESSELS=123456789,987654321 in .env
//   or run: node apis/sources/ships.mjs <mmsi>

import '../utils/env.mjs';
import { WebSocket } from 'ws';

// Key maritime chokepoints to monitor
const CHOKEPOINTS = {
  straitOfHormuz:    { label: 'Strait of Hormuz',    lat: 26.5,  lon: 56.5,   note: '20% of world oil' },
  suezCanal:         { label: 'Suez Canal',           lat: 30.5,  lon: 32.3,   note: '12% of world trade' },
  straitOfGibraltar: { label: 'Strait of Gibraltar',  lat: 36.0,  lon: -5.7,   note: 'Gateway to Mediterranean' },
  straitOfMalacca:   { label: 'Strait of Malacca',    lat: 2.5,   lon: 101.5,  note: '25% of world trade' },
  babElMandeb:       { label: 'Bab el-Mandeb',        lat: 12.6,  lon: 43.3,   note: 'Red Sea gateway' },
  taiwanStrait:      { label: 'Taiwan Strait',        lat: 24.0,  lon: 119.0,  note: '88% of largest container ships' },
  bosporusStrait:    { label: 'Bosphorus',            lat: 41.1,  lon: 29.1,   note: 'Black Sea access' },
  panamaCanal:       { label: 'Panama Canal',         lat: 9.1,   lon: -79.7,  note: '5% of world trade' },
  capeOfGoodHope:    { label: 'Cape of Good Hope',    lat: -34.4, lon: 18.5,   note: 'Suez alternative' },
};

// Ship type codes → category label
function shipCategory(typeCode) {
  if (!typeCode) return 'Unknown';
  if (typeCode >= 80 && typeCode <= 89) return 'Tanker';
  if (typeCode >= 70 && typeCode <= 79) return 'Cargo';
  if (typeCode >= 60 && typeCode <= 69) return 'Passenger';
  if (typeCode >= 35 && typeCode <= 36) return 'Military';
  if (typeCode === 37) return 'Sailing';
  if (typeCode >= 30 && typeCode <= 32) return 'Fishing';
  if (typeCode >= 50 && typeCode <= 59) return 'Special';
  return 'Other';
}

// Core WebSocket collector — subscribes and collects vessel data until timeout
function openStream({ apiKey, boundingBoxes, mmsiList = [], timeoutMs = 12000, debug = false }) {
  const log = debug ? (...a) => process.stderr.write('[ships] ' + a.join(' ') + '\n') : () => {};

  return new Promise((resolve) => {
    const vessels = new Map(); // MMSI → vessel data
    let resolved = false;
    let ws;

    const done = (reason) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      log(`done (${reason}), vessels=${vessels.size}`);
      try { ws?.close(); } catch {}
      resolve(Array.from(vessels.values()));
    };

    const timer = setTimeout(() => done('timeout'), timeoutMs);

    try {
      ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
    } catch (e) {
      log('WebSocket constructor failed:', e.message);
      clearTimeout(timer);
      resolve([]);
      return;
    }

    ws.addEventListener('open', () => {
      log('connected, sending subscription');
      const sub = {
        APIKey: apiKey,
        BoundingBoxes: boundingBoxes,
        FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
      };
      if (mmsiList.length) sub.MMSI = mmsiList;
      ws.send(JSON.stringify(sub));
    });

    ws.addEventListener('message', (event) => {
      try {
        log('msg:', event.data.slice(0, 120));
        const msg = JSON.parse(event.data);
        const mmsi = msg.MetaData?.MMSI;
        if (!mmsi) return;

        const existing = vessels.get(mmsi) || {};
        const pos = msg.Message?.PositionReport;
        const stat = msg.Message?.ShipStaticData;

        vessels.set(mmsi, {
          mmsi,
          name: (stat?.Name || msg.MetaData?.ShipName || existing.name || '').trim() || 'Unknown',
          lat: pos?.Latitude ?? msg.MetaData?.latitude ?? existing.lat,
          lon: pos?.Longitude ?? msg.MetaData?.longitude ?? existing.lon,
          sog: pos?.Sog ?? existing.sog,
          cog: pos?.Cog ?? existing.cog,
          navStatus: pos?.NavigationalStatus ?? existing.navStatus,
          shipType: stat?.Type ?? existing.shipType,
          category: shipCategory(stat?.Type ?? existing.shipType),
          destination: stat?.Destination?.trim() || existing.destination,
          flag: stat?.Flag || existing.flag,
          timestamp: msg.MetaData?.time_utc || existing.timestamp,
        });
      } catch {}
    });

    ws.addEventListener('error', (e) => { log('error:', e.message); done('error'); });
    ws.addEventListener('close', (e) => { log(`close code=${e.code} reason=${e.reason}`); done('close'); });
  });
}

// Find which chokepoint a vessel is near (within ±2 degrees)
function nearestChokepoint(lat, lon) {
  for (const [key, cp] of Object.entries(CHOKEPOINTS)) {
    if (Math.abs(lat - cp.lat) <= 2 && Math.abs(lon - cp.lon) <= 2) {
      return { key, ...cp };
    }
  }
  return null;
}

// Track specific vessels by MMSI anywhere in the world
export async function trackVessels(mmsiList, timeoutMs = 20000, debug = false) {
  const apiKey = process.env.AISSTREAM_API_KEY;
  if (!apiKey) throw new Error('AISSTREAM_API_KEY not set');

  const vessels = await openStream({
    apiKey,
    boundingBoxes: [[[-90, -180], [90, 180]]], // global
    mmsiList: mmsiList.map(Number),
    timeoutMs,
    debug,
  });

  return vessels.map(v => ({
    ...v,
    nearChokepoint: (v.lat != null && v.lon != null) ? nearestChokepoint(v.lat, v.lon) : null,
  }));
}

export async function briefing() {
  const apiKey = process.env.AISSTREAM_API_KEY;

  if (!apiKey) {
    return {
      source: 'Maritime/AIS',
      timestamp: new Date().toISOString(),
      status: 'no_key',
      message: 'Set AISSTREAM_API_KEY for real-time global vessel tracking (free at aisstream.io)',
      chokepoints: CHOKEPOINTS,
    };
  }

  const debug = process.argv[1]?.endsWith('ships.mjs');

  // Parse TRACKED_VESSELS env var (comma-separated MMSIs)
  const trackedMMSIs = process.env.TRACKED_VESSELS
    ? process.env.TRACKED_VESSELS.split(',').map(s => Number(s.trim())).filter(Boolean)
    : [];

  // Run chokepoint sweep and individual vessel tracking in parallel
  const [chokepointVessels, trackedVessels] = await Promise.all([
    openStream({
      apiKey,
      boundingBoxes: Object.values(CHOKEPOINTS).map(cp => [
        [cp.lat - 2, cp.lon - 2],
        [cp.lat + 2, cp.lon + 2],
      ]),
      timeoutMs: 12000,
      debug,
    }),
    trackedMMSIs.length
      ? openStream({ apiKey, boundingBoxes: [[[-90, -180], [90, 180]]], mmsiList: trackedMMSIs, timeoutMs: 12000, debug })
      : Promise.resolve([]),
  ]);

  // Bucket chokepoint vessels
  const byChokepoint = {};
  for (const v of chokepointVessels) {
    if (v.lat == null || v.lon == null) continue;
    const cp = nearestChokepoint(v.lat, v.lon);
    if (cp) {
      if (!byChokepoint[cp.key]) byChokepoint[cp.key] = { ...CHOKEPOINTS[cp.key], vessels: [] };
      byChokepoint[cp.key].vessels.push(v);
    }
  }

  // Flag anomalies
  const anomalies = [];
  for (const v of chokepointVessels) {
    if (!v.name || v.name === 'Unknown') continue;
    if (v.sog !== undefined && v.sog < 0.5 && v.navStatus === 0)
      anomalies.push({ ...v, flag: 'STOPPED_UNDERWAY' });
    if (v.shipType >= 35 && v.shipType <= 36)
      anomalies.push({ ...v, flag: 'MILITARY' });
    if (v.shipType >= 80 && v.shipType <= 89 && v.sog !== undefined && v.sog < 1)
      anomalies.push({ ...v, flag: 'TANKER_STATIONARY' });
  }

  const chokepointSummary = Object.entries(byChokepoint).map(([key, cp]) => ({
    key,
    label: cp.label,
    note: cp.note,
    total: cp.vessels.length,
    tankers: cp.vessels.filter(v => v.shipType >= 80 && v.shipType <= 89).length,
    cargo: cp.vessels.filter(v => v.shipType >= 70 && v.shipType <= 79).length,
    military: cp.vessels.filter(v => v.shipType >= 35 && v.shipType <= 36).length,
    stopped: cp.vessels.filter(v => v.sog < 0.5 && v.navStatus === 0).length,
  }));

  const result = {
    source: 'Maritime/AIS',
    timestamp: new Date().toISOString(),
    status: 'live',
    summary: `${chokepointVessels.length} vessels tracked across ${chokepointSummary.length} chokepoints`,
    totalVessels: chokepointVessels.length,
    chokepointSummary,
    anomalies: anomalies.slice(0, 30),
    signals: anomalies.map(a =>
      `[MARITIME] ${a.flag}: ${a.name} (${a.category}) near ${nearestChokepoint(a.lat, a.lon)?.label ?? 'unknown'}`
    ),
  };

  // Attach individually tracked vessels if configured
  if (trackedVessels.length) {
    result.trackedVessels = trackedVessels.map(v => ({
      ...v,
      nearChokepoint: (v.lat != null && v.lon != null) ? nearestChokepoint(v.lat, v.lon) : null,
    }));
  }

  return result;
}

// WebSocket config (for persistent listener mode — future use)
export function getWebSocketConfig(apiKey) {
  return {
    url: 'wss://stream.aisstream.io/v0/stream',
    message: JSON.stringify({
      APIKey: apiKey,
      BoundingBoxes: Object.values(CHOKEPOINTS).map(cp => [
        [cp.lat - 2, cp.lon - 2],
        [cp.lat + 2, cp.lon + 2],
      ]),
      FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
    }),
  };
}

if (process.argv[1]?.endsWith('ships.mjs')) {
  // CLI: node apis/sources/ships.mjs [mmsi1] [mmsi2] ...
  const cliMMSIs = process.argv.slice(2).map(Number).filter(Boolean);
  if (cliMMSIs.length) {
    process.stderr.write(`[ships] Tracking ${cliMMSIs.length} vessel(s): ${cliMMSIs.join(', ')}\n`);
    const vessels = await trackVessels(cliMMSIs, 20000, true);
    console.log(JSON.stringify(vessels, null, 2));
  } else {
    const data = await briefing();
    console.log(JSON.stringify(data, null, 2));
  }
}
