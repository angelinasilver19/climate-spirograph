/**
 * Climate Spirograph - Climate calculations and parameter mapping
 * Pure functions: input → output. Uses CONFIG (config.js must load first).
 * Normalization functions prepare raw NOAA (or other) data for good spirograph visuals.
 */

// Expected real-world input ranges for linear mapping (not in CONFIG)
const ACCELERATION_MIN = -0.5;  // °F per year (10-year trend)
const ACCELERATION_MAX = 0.5;
const DELTA_MIN = -15;         // °F hourly delta (2026 - 1976)
const DELTA_MAX = 15;

// Normalization: raw data ranges we expect from NOAA (tweak based on real data)
const RAW_ACCELERATION_MIN = 0;      // °F/year (cooling can be negative)
const RAW_ACCELERATION_MAX = 2;     // °F/year (strong warming)
const RAW_DELTA_MIN = 0.5;          // °F (hourly delta)
const RAW_DELTA_MAX = 10;           // °F (or more in extremes)
// Output range for mapToD (mapToD expects -15..15 → D_MIN..D_MAX); use full range so d varies
const TARGET_DELTA_MIN = -15;
const TARGET_DELTA_MAX = 15;
const RAW_SOLAR_MIN = 0;            // W/m² or raw units
const RAW_SOLAR_MAX = 1000;         // W/m² typical max

/**
 * Normalize raw acceleration (e.g. from NOAA regression) to range that works with mapToR.
 * Logs raw value; clamps/scales to [ACCELERATION_MIN, ACCELERATION_MAX].
 * @param {number} rawAcceleration - Slope in °F/year (e.g. 0.01 to 2)
 * @returns {number} Normalized acceleration for mapToR()
 */
function normalizeAcceleration(rawAcceleration) {
  if (typeof rawAcceleration !== 'number' || !Number.isFinite(rawAcceleration)) {
    console.warn('normalizeAcceleration: invalid input', rawAcceleration);
    return (ACCELERATION_MIN + ACCELERATION_MAX) / 2;
  }
  console.log('Raw acceleration (°F/year):', rawAcceleration.toFixed(4));
  const normalized = mapClamp(
    rawAcceleration,
    RAW_ACCELERATION_MIN,
    RAW_ACCELERATION_MAX,
    ACCELERATION_MIN,
    ACCELERATION_MAX
  );
  console.log('Normalized acceleration →', normalized.toFixed(4), '(for mapToR)');
  return normalized;
}

/**
 * Normalize raw hourly deltas: scale to [TARGET_DELTA_MIN, TARGET_DELTA_MAX] so mapToD gives full d variation.
 * Preserves relative variation (never flattens to one value). If raw has no spread, spread by hour index.
 * @param {number[]} rawDeltasArray - 24 hourly temp deltas in °F
 * @returns {number[]} Normalized deltas (same length) for mapToD()
 */
function normalizeDeltas(rawDeltasArray) {
  if (!Array.isArray(rawDeltasArray) || rawDeltasArray.length === 0) {
    console.warn('normalizeDeltas: invalid input', rawDeltasArray);
    return Array(24).fill((TARGET_DELTA_MIN + TARGET_DELTA_MAX) / 2);
  }
  const rawMin = Math.min(...rawDeltasArray);
  const rawMax = Math.max(...rawDeltasArray);
  console.log('Raw hourly deltas (°F) min:', rawMin.toFixed(2), 'max:', rawMax.toFixed(2));

  let out;
  if (rawMax === rawMin) {
    // No variation in raw: spread across target range by hour so we still get visible variation
    out = rawDeltasArray.map((_, i) =>
      TARGET_DELTA_MIN + (TARGET_DELTA_MAX - TARGET_DELTA_MIN) * (i / Math.max(1, rawDeltasArray.length - 1))
    );
    console.log('Normalized deltas (no raw spread) → spread by hour to preserve variation');
  } else {
    // Scale raw range to target range (preserves relative variation)
    out = rawDeltasArray.map((raw) =>
      mapClamp(raw, rawMin, rawMax, TARGET_DELTA_MIN, TARGET_DELTA_MAX)
    );
  }
  const normMin = Math.min(...out);
  const normMax = Math.max(...out);
  console.log('Normalized deltas → min:', normMin.toFixed(2), 'max:', normMax.toFixed(2), '| first 6:', out.slice(0, 6).map((n) => n.toFixed(1)));
  return out;
}

/**
 * Normalize raw solar radiation (e.g. W/m² 0–1000) to 0–1 for mapToThickness.
 * @param {number} rawSolar - Solar value in raw units (e.g. watts/m²)
 * @returns {number} Value in [0, 1]
 */
function normalizeSolar(rawSolar) {
  if (typeof rawSolar !== 'number' || !Number.isFinite(rawSolar)) {
    console.warn('normalizeSolar: invalid input', rawSolar);
    return 0.5;
  }
  console.log('Raw solar:', rawSolar.toFixed(2));
  const normalized = mapClamp(rawSolar, RAW_SOLAR_MIN, RAW_SOLAR_MAX, 0, 1);
  return normalized;
}

/**
 * Linear regression slope (temp vs year) from array of {year, temp}.
 * @param {Array<{year: number, temp: number}>} data
 * @returns {number} Slope in °F per year
 */
function calculateAcceleration(data) {
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

/**
 * Linear map and clamp: value from [inMin, inMax] → [outMin, outMax].
 */
function mapClamp(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  const clamped = Math.max(0, Math.min(1, t));
  return outMin + clamped * (outMax - outMin);
}

/**
 * Map acceleration (°F/year) to rolling radius r using CONFIG ranges.
 * @param {number} acceleration - Slope from linear regression
 * @returns {number} r in [CONFIG.R_MIN, CONFIG.R_MAX]
 */
function mapToR(acceleration) {
  return mapClamp(
    acceleration,
    ACCELERATION_MIN,
    ACCELERATION_MAX,
    CONFIG.R_MIN,
    CONFIG.R_MAX
  );
}

/**
 * Map hourly temperature delta (°F) to pen distance d using CONFIG ranges.
 * @param {number} delta - 2026 temp minus 1976 temp for that hour
 * @returns {number} d in [CONFIG.D_MIN, CONFIG.D_MAX]
 */
function mapToD(delta) {
  return mapClamp(
    delta,
    DELTA_MIN,
    DELTA_MAX,
    CONFIG.D_MIN,
    CONFIG.D_MAX
  );
}

/**
 * Map solar radiation (0–1) to line thickness using CONFIG ranges.
 * @param {number} solar - Value from calculateSolar, in [0, 1]
 * @returns {number} Thickness in [CONFIG.THICKNESS_MIN, CONFIG.THICKNESS_MAX]
 */
function mapToThickness(solar) {
  return mapClamp(
    solar,
    0,
    1,
    CONFIG.THICKNESS_MIN,
    CONFIG.THICKNESS_MAX
  );
}

/**
 * Solar radiation approximation for a given hour (sine wave by time of day).
 * Assumes daylight roughly 6am–6pm; peak at noon. dayOfYear reserved for future day-length scaling.
 * @param {number} hour - Hour of day 0–23
 * @param {number} dayOfYear - Day of year 1–365 (optional for latitude/day-length)
 * @returns {number} Intensity in [0, 1]
 */
function calculateSolar(hour, dayOfYear) {
  // Sine from 6am to 6pm: 0 at 6, peak at 12, 0 at 18
  const t = (hour - 6) * (Math.PI / 12);
  const intensity = Math.sin(t);
  const clamped = Math.max(0, intensity);
  // Optional: scale by day length for high latitude (summer vs winter)
  if (typeof dayOfYear === 'number' && dayOfYear >= 1 && dayOfYear <= 365) {
    const dayLengthFactor = 0.4 + 0.6 * (0.5 + 0.5 * Math.cos((dayOfYear - 172) * (2 * Math.PI / 365)));
    return Math.min(1, clamped * dayLengthFactor);
  }
  return clamped;
}

/**
 * Complexity fallback: detect if real data would produce a "simple" pattern (few petals/loops).
 * Uses hypotrochoid lobe count ≈ r / gcd(R-r, r). If < MIN_LOBES, pattern is too simple.
 */
const COMPLEXITY_MIN_LOBES = 15;

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function isSimpleSpirograph(R, r) {
  if (typeof R !== 'number' || typeof r !== 'number' || r <= 0 || R <= r) return true;
  const g = gcd(R - r, r);
  const lobes = r / g;
  return lobes < COMPLEXITY_MIN_LOBES;
}

/**
 * Mock spirograph params that produce a complex, varied pattern. Used when real data would be too simple.
 * r in 65–75, d array 24 values 55–75 with variation, thickness from solar for dayOfYear.
 */
function getComplexityFallback(dayOfYear) {
  const r = 67;
  const hourlyD = [];
  for (let h = 0; h < 24; h++) {
    const variation = 55 + 20 * (0.5 + 0.5 * Math.sin((h / 24) * Math.PI * 2 + (dayOfYear || 0) * 0.1));
    hourlyD.push(Math.max(CONFIG.D_MIN, Math.min(CONFIG.D_MAX, variation)));
  }
  const hourlyThickness = [];
  const doy = typeof dayOfYear === 'number' && dayOfYear >= 0 ? dayOfYear : 172;
  for (let h = 0; h < 24; h++) {
    hourlyThickness.push(mapToThickness(calculateSolar(h, doy)));
  }
  return { r, hourlyD, hourlyThickness };
}
