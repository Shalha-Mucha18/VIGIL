// Market data CSV appender
// Writes one row per symbol per sweep to runs/market-data.csv
// Also writes cement-data.csv and bd-cement-data.csv (prices in BDT)

import { existsSync, appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const HEADERS = 'timestamp,category,symbol,name,price,prevClose,change,changePct,currency,exchange,marketState\n';
const BD_HEADERS = 'timestamp,category,symbol,name,price_bdt,prevClose_bdt,change_bdt,changePct,currency,exchange,marketState\n';

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchRate(pair) {
  try {
    const res = await fetch(`${YF_BASE}/${pair}?range=1d&interval=1d`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

async function fetchBDTRates() {
  const [chfBdt, eurBdt, usdBdt, inrUsd] = await Promise.all([
    fetchRate('CHFBDT=X'),
    fetchRate('EURBDT=X'),
    fetchRate('USDBDT=X'),
    fetchRate('INRUSD=X'),
  ]);
  return {
    CHF: chfBdt,
    EUR: eurBdt,
    USD: usdBdt,
    // INR→BDT via INR→USD→BDT
    INR: inrUsd && usdBdt ? Math.round(inrUsd * usdBdt * 10000) / 10000 : null,
  };
}

function toBDT(price, currency, rates) {
  const rate = rates[currency];
  if (!rate || price == null || price === '') return '';
  return Math.round(price * rate * 100) / 100;
}

function buildRow(ts, category, full) {
  return [
    ts,
    category,
    full.symbol,
    `"${(full.name || '').replace(/"/g, '""')}"`,
    full.price ?? '',
    full.prevClose ?? '',
    full.change ?? '',
    full.changePct ?? '',
    full.currency || 'USD',
    full.exchange || '',
    full.marketState || '',
  ].join(',');
}

function buildBDRow(ts, category, full, rates) {
  return [
    ts,
    category,
    full.symbol,
    `"${(full.name || '').replace(/"/g, '""')}"`,
    toBDT(full.price, full.currency, rates),
    toBDT(full.prevClose, full.currency, rates),
    toBDT(full.change, full.currency, rates),
    full.changePct ?? '',
    'BDT',
    full.exchange || '',
    full.marketState || '',
  ].join(',');
}

export async function appendMarketCSV(yfData, runsDir) {
  const csvPath = join(runsDir, 'market-data.csv');
  if (!existsSync(csvPath)) writeFileSync(csvPath, HEADERS);

  const cementPath = join(runsDir, 'cement-data.csv');
  if (!existsSync(cementPath)) writeFileSync(cementPath, HEADERS);

  const bdCementPath = join(runsDir, 'bd-cement-data.csv');
  if (!existsSync(bdCementPath)) writeFileSync(bdCementPath, BD_HEADERS);

  const ts = new Date().toISOString();
  const categoryMap = {
    indexes: yfData.indexes || [],
    rates: yfData.rates || [],
    commodities: yfData.commodities || [],
    crypto: yfData.crypto || [],
    volatility: yfData.volatility || [],
    materials: yfData.materials || [],
    bd_cement: yfData.bd_cement || [],
  };
  const quotes = yfData.quotes || {};

  // Fetch BDT rates only if we have bd_cement data
  const hasBD = (yfData.bd_cement || []).length > 0;
  const bdRates = hasBD ? await fetchBDTRates() : {};

  const allRows = [];
  const cementRows = [];
  const bdCementRows = [];

  for (const [category, symbols] of Object.entries(categoryMap)) {
    for (const q of symbols) {
      const full = quotes[q.symbol] || q;
      const row = buildRow(ts, category, full);
      allRows.push(row);
      if (category === 'materials') cementRows.push(row);
      if (category === 'bd_cement') bdCementRows.push(buildBDRow(ts, category, full, bdRates));
    }
  }

  if (allRows.length) appendFileSync(csvPath, allRows.join('\n') + '\n');
  if (cementRows.length) appendFileSync(cementPath, cementRows.join('\n') + '\n');
  if (bdCementRows.length) appendFileSync(bdCementPath, bdCementRows.join('\n') + '\n');
}
