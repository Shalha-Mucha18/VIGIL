# Crucix Data Sources

All 29 sources pulled every 15 minutes. 21 require no API key.

---

## Tier 1 — OSINT & Geopolitical

| Source | Website | API Endpoint | Key Required |
|---|---|---|---|
| GDELT | [gdeltproject.org](https://www.gdeltproject.org) | `https://api.gdeltproject.org/api/v2` | No |
| OpenSky (flights) | [opensky-network.org](https://opensky-network.org) | `https://opensky-network.org/api` | No |
| NASA FIRMS (fires) | [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov) | `https://firms.modaps.eosdis.nasa.gov/api/area/csv` | Free |
| AIS (ships) | [aisstream.io](https://aisstream.io) | WebSocket stream | Free |
| Safecast (radiation) | [safecast.org](https://safecast.org) | `https://api.safecast.org` | No |
| ACLED (conflicts) | [acleddata.com](https://acleddata.com) | `https://acleddata.com/api/acled/read` | Free account |
| ReliefWeb | [reliefweb.int](https://reliefweb.int) | `https://api.reliefweb.int/v1` | Free |
| WHO | [who.int](https://www.who.int) | `https://ghoapi.azureedge.net/api` | No |
| OFAC (sanctions) | [sanctionslistservice.ofac.treas.gov](https://sanctionslistservice.ofac.treas.gov) | `https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports` | No |
| OpenSanctions | [opensanctions.org](https://opensanctions.org) | `https://api.opensanctions.org` | No |
| ADS-B Exchange | [adsbexchange.com](https://www.adsbexchange.com) | `https://globe.adsbexchange.com/data/aircraft.json` | Paid |

---

## Tier 2 — Economic & Financial

| Source | Website | API Endpoint | Key Required |
|---|---|---|---|
| FRED | [fred.stlouisfed.org](https://fred.stlouisfed.org) | `https://api.stlouisfed.org/fred` | Free |
| US Treasury | [fiscaldata.treasury.gov](https://fiscaldata.treasury.gov) | `https://api.fiscaldata.treasury.gov/services/api/fiscal_service` | No |
| BLS (jobs/inflation) | [bls.gov](https://www.bls.gov) | `https://api.bls.gov/publicAPI/v2/timeseries/data/` | Free |
| EIA (energy) | [eia.gov](https://www.eia.gov) | `https://api.eia.gov/v2` | Free |
| GSCPI (supply chain) | [newyorkfed.org](https://www.newyorkfed.org) | `https://www.newyorkfed.org/medialibrary/research/interactives/data/gscpi` | No |
| USAspending | [usaspending.gov](https://www.usaspending.gov) | `https://api.usaspending.gov/api/v2` | No |
| UN Comtrade | [comtradeplus.un.org](https://comtradeplus.un.org) | `https://comtradeapi.un.org/public/v1` | No |

---

## Tier 3 — Environment & Social

| Source | Website | API Endpoint | Key Required |
|---|---|---|---|
| NOAA (weather) | [weather.gov](https://www.weather.gov) | `https://api.weather.gov` | No |
| EPA RadNet (radiation) | [epa.gov](https://www.epa.gov) | `https://enviro.epa.gov/enviro/efservice` | No |
| USPTO Patents | [patentsview.org](https://patentsview.org) | `https://search.patentsview.org/api/v1` | No |
| Bluesky | [bsky.app](https://bsky.app) | `https://public.api.bsky.app/xrpc` | No |
| Reddit | [reddit.com](https://www.reddit.com) | `https://oauth.reddit.com` | Free account |
| Telegram channels | [telegram.org](https://telegram.org) | `https://t.me/s/{channel}` | Bot token |
| KiwiSDR (radio) | [receiverbook.de](https://www.receiverbook.de) | `https://www.receiverbook.de/map?type=kiwisdr` | No |

---

## Tier 4–6 — Space, Markets, Security

| Source | Website | API Endpoint | Key Required |
|---|---|---|---|
| CelesTrak (satellites) | [celestrak.org](https://celestrak.org) | `https://celestrak.org` | No |
| Yahoo Finance | [finance.yahoo.com](https://finance.yahoo.com) | `https://query1.finance.yahoo.com/v8/finance/chart` | No |
| CISA KEV (vulnerabilities) | [cisa.gov](https://www.cisa.gov) | `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json` | No |
| Cloudflare Radar | [radar.cloudflare.com](https://radar.cloudflare.com) | `https://api.cloudflare.com/client/v4/radar` | Free |

---

## BD Cement Sources (added)

| Company | Exchange | Yahoo Finance Link | Currency |
|---|---|---|---|
| Holcim (Lafarge BD parent) | Swiss Exchange (SIX) | [HOLN.SW](https://finance.yahoo.com/quote/HOLN.SW) | CHF → BDT |
| HeidelbergCement (BD parent) | Frankfurt | [HEI.DE](https://finance.yahoo.com/quote/HEI.DE) | EUR → BDT |
| UltraTech Cement | NSE India | [ULTRACEMCO.NS](https://finance.yahoo.com/quote/ULTRACEMCO.NS) | INR → BDT |
| Ambuja Cements | NSE India | [AMBUJACEM.NS](https://finance.yahoo.com/quote/AMBUJACEM.NS) | INR → BDT |

BDT exchange rates sourced from Yahoo Finance: `CHFBDT=X`, `EURBDT=X`, `USDBDT=X`, `INRUSD=X`.
