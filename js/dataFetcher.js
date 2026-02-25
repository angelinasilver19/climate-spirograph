/**
 * Climate Spirograph - NOAA data fetching
 * Uses CONFIG (config.js must load first).
 * CORS proxy used so we can fetch from browser when opening via file:// or different origin.
 */

const CORS_PROXY = 'https://corsproxy.io/?';

const CACHE_PREFIX = 'climate-data-';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function cacheKey(dateStr) {
  return CACHE_PREFIX + dateStr;
}

function getCachedSpirographData(dateStr) {
  try {
    const key = cacheKey(dateStr);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.cachedAt !== 'number' || !parsed.data) return null;
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setCachedSpirographData(dateStr, data) {
  try {
    const key = cacheKey(dateStr);
    localStorage.setItem(key, JSON.stringify({ cachedAt: Date.now(), data }));
  } catch (e) {
    console.warn('Could not cache climate data:', e.message);
  }
}

function fetchWithCors(url, options = {}) {
  const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
  return fetch(proxiedUrl, options);
}

/**
 * Fetch daily average temperature (TAVG) from NOAA for a specific year and date.
 * @param {number} year - Full year (e.g. 2026)
 * @param {string} dateStr - Date as YYYY-MM-DD
 * @returns {Promise<number|null>} Temperature in Fahrenheit, or null on error
 */
async function fetchDailyTemp(year, dateStr) {
  const url = new URL(CONFIG.NOAA_API_BASE);
  url.searchParams.set('datasetid', 'GHCND');
  url.searchParams.set('stationid', CONFIG.STATION_ID);
  url.searchParams.set('startdate', dateStr);
  url.searchParams.set('enddate', dateStr);
  url.searchParams.set('datatypeid', 'TAVG');
  url.searchParams.set('units', 'standard');

  try {
    const response = await fetchWithCors(url.toString(), {
      headers: { token: CONFIG.NOAA_TOKEN }
    });
    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    return data.results[0].value;
  } catch (error) {
    console.error('fetchDailyTemp failed:', error);
    return null;
  }
}

/**
 * Fetch 10 years of daily temps for the same calendar date (2017–2026) for acceleration.
 * @param {string} dateStr - Date as YYYY-MM-DD (e.g. 2026-02-23); month/day used for all years
 * @returns {Promise<Array<{year: number, temp: number}>>}
 */
async function fetchAccelerationData(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    console.error('fetchAccelerationData: date must be YYYY-MM-DD');
    return [];
  }
  const month = parts[1];
  const day = parts[2];
  const results = [];

  for (let year = 2017; year <= 2026; year++) {
    const d = `${year}-${month}-${day}`;
    const temp = await fetchDailyTemp(year, d);
    if (temp !== null) {
      results.push({ year, temp });
    }
  }
  return results;
}

/**
 * Fetch daily high (TMAX) and low (TMIN) for a given year and date.
 * @param {number} year
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<{high: number, low: number}|null>}
 */
async function fetchDailyHighLow(year, dateStr) {
  const url = new URL(CONFIG.NOAA_API_BASE);
  url.searchParams.set('datasetid', 'GHCND');
  url.searchParams.set('stationid', CONFIG.STATION_ID);
  url.searchParams.set('startdate', dateStr);
  url.searchParams.set('enddate', dateStr);
  url.searchParams.set('units', 'standard');
  url.searchParams.append('datatypeid', 'TMAX');
  url.searchParams.append('datatypeid', 'TMIN');

  try {
    const response = await fetchWithCors(url.toString(), {
      headers: { token: CONFIG.NOAA_TOKEN }
    });
    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    let high = null;
    let low = null;
    for (const r of data.results) {
      if (r.datatype === 'TMAX') high = r.value;
      if (r.datatype === 'TMIN') low = r.value;
    }
    if (high === null || low === null) {
      console.warn('fetchDailyHighLow: no TMAX or TMIN for', year, dateStr);
      return null;
    }
    // GHCND stores temps in tenths of degrees C; CDO may return raw. Convert to °F if value looks like tenths (e.g. 200–400).
    if (high > 150 || low > 150) {
      high = (high / 10) * (9 / 5) + 32;
      low = (low / 10) * (9 / 5) + 32;
    }
    console.log('fetchDailyHighLow', year, dateStr, '→ high:', high.toFixed(1), '°F, low:', low.toFixed(1), '°F');
    return { high, low };
  } catch (error) {
    console.error('fetchDailyHighLow failed:', error);
    return null;
  }
}

/**
 * Interpolate 24 hourly temperatures from daily high and low using a sine wave.
 * Assumes low near sunrise (hour 6) and high near afternoon (hour 15).
 * @param {number} dailyHigh - Daily high temp (F)
 * @param {number} dailyLow - Daily low temp (F)
 * @returns {number[]} Array of 24 hourly temps (F)
 */
function interpolateHourlyTemps(dailyHigh, dailyLow) {
  const hourly = [];
  const amplitude = (dailyHigh - dailyLow) / 2;
  const offset = (dailyHigh + dailyLow) / 2;
  // Sine wave: low ~6am, high ~15 (3pm); period 24 hours
  for (let hour = 0; hour < 24; hour++) {
    const t = (hour - 6) / 24 * Math.PI * 2;
    const value = offset + amplitude * Math.sin(t);
    hourly.push(value);
  }
  return hourly;
}

/**
 * Simple linear regression slope (temp vs year) for acceleration.
 * @param {Array<{year: number, temp: number}>} data
 * @returns {number} Slope in temp units per year
 */
function linearRegressionSlope(data) {
  if (!data || data.length < 2) return 0;
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of data) {
    sumX += p.year;
    sumY += p.temp;
    sumXY += p.year * p.temp;
    sumX2 += p.year * p.year;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

// Fallback comparison years if CONFIG.COMPARISON_YEAR has no data
const FALLBACK_COMPARISON_YEARS = [1976, 1990, 2000, 1980, 2010];

/**
 * Main function: fetch all data needed for the spirograph and return acceleration + hourly deltas.
 * Uses year from dateStr (e.g. 2024-02-23) vs CONFIG.COMPARISON_YEAR (or fallback if missing).
 * @param {string} dateStr - Date as YYYY-MM-DD (e.g. 2024-02-23)
 * @returns {Promise<{acceleration: number, hourlyDeltas: number[]}|null>} null on error
 */
async function fetchSpirographData(dateStr) {
  try {
    const year = parseInt(dateStr.substring(0, 4), 10);
    if (!Number.isFinite(year)) {
      console.error('fetchSpirographData: invalid date string', dateStr);
      return null;
    }

    const cached = getCachedSpirographData(dateStr);
    if (cached) {
      console.log('Using cached climate data for', dateStr);
      return cached;
    }

    const monthDay = dateStr.slice(5); // "MM-DD"

    const [accelData, highLowCurrent] = await Promise.all([
      fetchAccelerationData(dateStr),
      fetchDailyHighLow(year, dateStr)
    ]);

    if (!highLowCurrent) {
      console.error('Missing high/low data for current year', year);
      return null;
    }

    // Try comparison year; fallback to others if 1976 has no data (use comparison year in date!)
    let highLowCompare = await fetchDailyHighLow(CONFIG.COMPARISON_YEAR, `${CONFIG.COMPARISON_YEAR}-${monthDay}`);
    let compareYear = CONFIG.COMPARISON_YEAR;
    if (!highLowCompare) {
      for (const fallback of FALLBACK_COMPARISON_YEARS) {
        if (fallback === CONFIG.COMPARISON_YEAR) continue;
        highLowCompare = await fetchDailyHighLow(fallback, `${fallback}-${monthDay}`);
        if (highLowCompare) {
          compareYear = fallback;
          console.warn('No data for', CONFIG.COMPARISON_YEAR, '— using', fallback, 'for comparison');
          break;
        }
      }
    }
    if (!highLowCompare) {
      console.error('No high/low data for any comparison year. Tried:', CONFIG.COMPARISON_YEAR, FALLBACK_COMPARISON_YEARS.filter((y) => y !== CONFIG.COMPARISON_YEAR));
      return null;
    }

    console.log('High/low current year', year, ':', { high: highLowCurrent.high, low: highLowCurrent.low });
    console.log('High/low comparison year', compareYear, ':', { high: highLowCompare.high, low: highLowCompare.low });

    const hourlyCurrent = interpolateHourlyTemps(highLowCurrent.high, highLowCurrent.low);
    const hourlyCompare = interpolateHourlyTemps(highLowCompare.high, highLowCompare.low);
    console.log('Hourly temps', year, '(first 6 hours):', hourlyCurrent.slice(0, 6).map((t) => t.toFixed(1)));
    console.log('Hourly temps', compareYear, '(first 6 hours):', hourlyCompare.slice(0, 6).map((t) => t.toFixed(1)));

    const hourlyDeltas = hourlyCurrent.map((t, i) => t - hourlyCompare[i]);

    const acceleration = linearRegressionSlope(accelData);

    // Log raw values so we can see what NOAA gave us (normalization will log again)
    console.log('NOAA raw — acceleration (°F/year):', acceleration.toFixed(4));
    const dMin = Math.min(...hourlyDeltas);
    const dMax = Math.max(...hourlyDeltas);
    console.log('NOAA raw — hourly deltas (°F) min:', dMin.toFixed(2), 'max:', dMax.toFixed(2), '| first 6:', hourlyDeltas.slice(0, 6).map((d) => d.toFixed(2)));

    const result = { acceleration, hourlyDeltas };
    setCachedSpirographData(dateStr, result);
    return result;
  } catch (error) {
    console.error('fetchSpirographData failed:', error);
    return null;
  }
}
