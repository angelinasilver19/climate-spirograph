/**
 * Climate Spirograph - p5.js main sketch
 * Draws the spirograph from climate data. Uses CONFIG, climateCalc, dataFetcher.
 */

// Global climate data (set when fetch completes)
let dataReady = false;
let r = 67;  // fallback until data loads
let hourlyD = [];
let hourlyThickness = [];
let currentPoint = 0;
let useLiveTime = true;  // true = follow Anchorage time, false = follow slider

function preload() {
  // Shaders will be loaded here later
}

function setup() {
  const canvas = createCanvas(600, 600, WEBGL);
  canvas.parent('canvas-container');

  const slider = document.getElementById('time-slider');
  const liveBtn = document.getElementById('live-btn');
  if (slider) {
    slider.addEventListener('input', () => {
      useLiveTime = false;
      if (liveBtn) liveBtn.classList.remove('active');
    });
  }
  if (liveBtn) {
    liveBtn.addEventListener('click', () => {
      useLiveTime = true;
      liveBtn.classList.add('active');
    });
  }

  // Today's date in Anchorage (reliable across timezones); fetch 2024 data from NOAA
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Anchorage', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = formatter.formatToParts(now);
  const getPart = function(type) { return parts.find(function(p) { return p.type === type; }).value; };
  const month = getPart('month');
  const day = getPart('day');
  const dateStr = '2024-' + month + '-' + day;

  fetchSpirographData(dateStr)
    .then((result) => {
      const loadingEl = document.getElementById('loading-message');
      if (!result) {
        console.error('Failed to load climate data');
        if (loadingEl) loadingEl.textContent = 'Unable to load climate data.';
        return;
      }
      useLiveTime = true;
      if (document.getElementById('live-btn')) document.getElementById('live-btn').classList.add('active');
      // Normalize then map to spirograph parameters (normalization functions log raw values)
      r = mapToR(normalizeAcceleration(result.acceleration));
      if (r < 67 || r > 74) {
        const originalR = r;
        const seed = Math.abs(originalR * 100) % 8;
        r = 67 + seed;
        console.log('Complexity override: r changed from ' + originalR + ' to ' + r);
      }
      const normalizedDeltas = normalizeDeltas(result.hourlyDeltas);
      hourlyD = normalizedDeltas.map((delta) => mapToD(delta));
      const date = new Date(dateStr);
      const dayOfYear = getDayOfYear(date);
      hourlyThickness = [];
      for (let h = 0; h < 24; h++) {
        hourlyThickness.push(mapToThickness(calculateSolar(h, dayOfYear)));
      }
      const dMin = Math.min(...hourlyD);
      const dMax = Math.max(...hourlyD);
      const tMin = Math.min(...hourlyThickness);
      const tMax = Math.max(...hourlyThickness);
      console.log('Main page total points:', CONFIG.TOTAL_POINTS);
      console.log('Spirograph params → r:', r.toFixed(1), '| d min:', dMin.toFixed(1), 'max:', dMax.toFixed(1), '| thickness min:', tMin.toFixed(2), 'max:', tMax.toFixed(2));
      console.log('First 6 d values:', hourlyD.slice(0, 6).map((d) => d.toFixed(1)), '| first 6 thickness:', hourlyThickness.slice(0, 6).map((t) => t.toFixed(2)));
      dataReady = true;
      console.log('Fetch result for info panel:', {
        acceleration: result.acceleration,
        accelerationType: typeof result.acceleration,
        hourlyDeltasLength: result.hourlyDeltas ? result.hourlyDeltas.length : 0
      });
      updateInfoPanel(dateStr, result.acceleration, result.hourlyDeltas);
      if (loadingEl) loadingEl.classList.add('hidden');
    })
    .catch((err) => {
      console.error('Climate data fetch error:', err);
      const loadingEl = document.getElementById('loading-message');
      if (loadingEl) loadingEl.textContent = 'Error loading climate data.';
    });
}

function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Format a number with leading + for non-negative. */
function signedTemp(t) {
  return (t >= 0 ? '+' : '') + t.toFixed(1) + '°F';
}

/** Update the top-right info panel with NOAA climate data. */
function updateInfoPanel(dateStr, acceleration, hourlyDeltas) {
  const dateEl = document.getElementById('info-date');
  const warmingEl = document.getElementById('info-warming');
  const deltaEl = document.getElementById('info-delta');

  console.log('updateInfoPanel called with:', { dateStr, acceleration, hourlyDeltas: Array.isArray(hourlyDeltas) ? hourlyDeltas.length : typeof hourlyDeltas });

  if (!dateEl || !warmingEl || !deltaEl) {
    console.warn('Info panel elements missing:', { dateEl: !!dateEl, warmingEl: !!warmingEl, deltaEl: !!deltaEl });
    return;
  }

  const d = new Date(dateStr + 'T12:00:00');
  const displayDate = new Date(2026, d.getMonth(), d.getDate());
  const dateLabel = displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  dateEl.textContent = dateLabel + ' vs ' + CONFIG.COMPARISON_YEAR;

  const accelNum = typeof acceleration === 'number' && !Number.isNaN(acceleration) ? acceleration : null;
  if (accelNum !== null) {
    const warmingSign = accelNum >= 0 ? '+' : '';
    warmingEl.textContent = 'Warming: ' + warmingSign + accelNum.toFixed(2) + '°F/year';
    console.log('Info panel — warming set:', warmingEl.textContent);
  } else {
    warmingEl.textContent = 'Warming: —';
    console.warn('Info panel — acceleration missing or invalid:', acceleration);
  }

  if (Array.isArray(hourlyDeltas) && hourlyDeltas.length > 0) {
    const deltaMin = Math.min(...hourlyDeltas);
    const deltaMax = Math.max(...hourlyDeltas);
    deltaEl.textContent = 'Delta range: ' + signedTemp(deltaMin) + ' to ' + signedTemp(deltaMax);
    console.log('Info panel — delta range set:', deltaEl.textContent);
  } else {
    deltaEl.textContent = 'Delta range: —';
    console.warn('Info panel — hourlyDeltas missing or empty:', hourlyDeltas);
  }
}

/** GCD for closure: hypotrochoid closes when t = 2*PI * r / gcd(R-r, r). */
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

/** Get current Anchorage time and progress through the day (0 to 1). */
function getAnchorageProgress() {
  const now = new Date();
  const anchorageDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Anchorage' }));
  const hour = anchorageDate.getHours();
  const minute = anchorageDate.getMinutes();
  const second = anchorageDate.getSeconds();
  const progress = (hour + minute / 60 + second / 3600) / 24;
  return { hour, minute, second, progress };
}

function draw() {
  background(10);

  if (!dataReady) return;

  const slider = document.getElementById('time-slider');
  const liveBtn = document.getElementById('live-btn');
  const { progress } = getAnchorageProgress();
  const currentTimeHours = progress * 24; // 0–24, "now" on the full-width bar

  if (slider) {
    let val = parseFloat(slider.value) || 0;
    if (val > currentTimeHours) {
      slider.value = currentTimeHours;
      val = currentTimeHours;
    }
    if (useLiveTime) {
      slider.value = currentTimeHours;
      currentPoint = Math.floor(progress * CONFIG.TOTAL_POINTS);
    } else {
      currentPoint = Math.floor((val / 24) * CONFIG.TOTAL_POINTS);
    }
  } else {
    currentPoint = Math.floor(progress * CONFIG.TOTAL_POINTS);
  }

  // Gray out the "future" part of the track (after current time)
  document.documentElement.style.setProperty('--time-now-pct', (progress * 100) + '%');

  if (useLiveTime && liveBtn) liveBtn.classList.add('active');
  else if (liveBtn) liveBtn.classList.remove('active');

  stroke(255);
  noFill();
  drawSpirograph(r, { d: hourlyD, thickness: hourlyThickness }, currentPoint);
}

/**
 * Spirograph drawing — IDENTICAL to archiveSketch.js drawArchiveSpirograph().
 * Main page: pass maxPoint = currentPoint (draw up to current hour).
 * Archive: would pass maxPoint = totalPoints (draw all 24h).
 * Uses global p5 (TWO_PI, cos, sin, strokeWeight, line).
 */
function drawSpirograph(rollingR, hourlyParams, maxPoint) {
  const R = CONFIG.R;
  const totalPoints = CONFIG.TOTAL_POINTS;
  const pointsToDraw = (typeof maxPoint === 'number' && maxPoint >= 0) ? Math.min(maxPoint, totalPoints) : totalPoints;
  const dArr = hourlyParams.d;
  const thicknessArr = hourlyParams.thickness;
  const g = gcd(R - rollingR, rollingR);
  const tMax = TWO_PI * (rollingR / g);

  let prevX, prevY;

  for (let i = 0; i <= pointsToDraw && i <= totalPoints; i++) {
    const t = (i / totalPoints) * tMax;
    const hourIndex = Math.min(23, Math.floor((i * 24) / totalPoints));
    const d = dArr[hourIndex];
    const thickness = thicknessArr[hourIndex];

    const x = (R - rollingR) * cos(t) + d * cos(((R - rollingR) / rollingR) * t);
    const y = (R - rollingR) * sin(t) - d * sin(((R - rollingR) / rollingR) * t);

    if (i === 0) {
      prevX = x;
      prevY = y;
    } else {
      strokeWeight(thickness);
      line(prevX, prevY, x, y);
      prevX = x;
      prevY = y;
    }
  }
}
