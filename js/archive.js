/**
 * Archive page: calendar and spirograph detail view.
 * Uses dataFetcher, climateCalc, config, archiveSketch.
 */

(function() {
  const ARCHIVE_START = new Date(2026, 0, 1); // Jan 1, 2026 (display)
  const NOAA_FETCH_YEAR = 2024; // Backend: fetch 2024 data from NOAA (2026 doesn't exist in API); display as 2026 in UI

  let currentYear = 2026;
  let currentMonth = 0; // 0 = January
  (function setInitialMonth() {
    const today = getAnchorageToday();
    if (today >= ARCHIVE_START) {
      currentYear = today.getFullYear();
      currentMonth = today.getMonth();
    }
  })();
  function getAnchorageToday() {
    const now = new Date();
    const anchorage = new Date(now.toLocaleString('en-US', { timeZone: 'America/Anchorage' }));
    return new Date(anchorage.getFullYear(), anchorage.getMonth(), anchorage.getDate());
  }
  let archiveP5Instance = null;

  function getDayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function dateStr(y, m, d) {
    const pad = function(n) { return n < 10 ? '0' + n : n; };
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }

  function isDateDisabled(year, month, day) {
    const d = new Date(year, month, day);
    if (d < ARCHIVE_START) return true;
    const today = getAnchorageToday();
    if (d > today) return true;
    return false;
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    if (!grid || !monthYearEl) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearEl.textContent = monthNames[currentMonth] + ' ' + currentYear;

    const first = new Date(currentYear, currentMonth, 1);
    const last = new Date(currentYear, currentMonth + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();

    grid.innerHTML = '';
    for (let i = 0; i < startPad; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day calendar-day-empty';
      grid.appendChild(cell);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-day';
      cell.textContent = d;
      cell.dataset.year = currentYear;
      cell.dataset.month = currentMonth;
      cell.dataset.day = d;
      if (isDateDisabled(currentYear, currentMonth, d)) {
        cell.disabled = true;
        cell.classList.add('calendar-day-disabled');
      } else {
        cell.classList.add('calendar-day-available');
      }
      grid.appendChild(cell);
    }

    document.getElementById('calendar-prev').disabled = currentYear === 2026 && currentMonth === 0;
    const today = getAnchorageToday();
    document.getElementById('calendar-next').disabled = currentYear === today.getFullYear() && currentMonth === today.getMonth();
  }

  function showDetail() {
    const detail = document.getElementById('archive-detail');
    if (detail) detail.classList.remove('hidden');
  }

  function hideDetail() {
    const detail = document.getElementById('archive-detail');
    if (detail) detail.classList.add('hidden');
    if (archiveP5Instance) {
      archiveP5Instance.remove();
      archiveP5Instance = null;
    }
    const wrap = document.getElementById('spirograph-container');
    if (wrap) wrap.innerHTML = '';
  }

  function showLoading(show) {
    const el = document.getElementById('archive-detail-loading');
    if (el) el.classList.toggle('hidden', !show);
  }

  function showStats(show) {
    const el = document.getElementById('archive-detail-stats');
    if (el) el.classList.toggle('hidden', !show);
  }

  function setStats(dateStr, acceleration, hourlyDeltas) {
    const d = new Date(dateStr + 'T12:00:00');
    const displayDate = new Date(2026, d.getMonth(), d.getDate());
    const dateLabel = displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const dateEl = document.getElementById('archive-detail-date');
    const warmingEl = document.getElementById('archive-detail-warming');
    const deltaEl = document.getElementById('archive-detail-delta');
    if (dateEl) dateEl.textContent = dateLabel + ' vs ' + CONFIG.COMPARISON_YEAR;
    if (warmingEl) {
      const sign = acceleration >= 0 ? '+' : '';
      warmingEl.textContent = 'Warming: ' + sign + acceleration.toFixed(2) + '°F/year';
    }
    if (deltaEl && Array.isArray(hourlyDeltas) && hourlyDeltas.length > 0) {
      const min = Math.min(...hourlyDeltas);
      const max = Math.max(...hourlyDeltas);
      const fmt = function(t) { return (t >= 0 ? '+' : '') + t.toFixed(1) + '°F'; };
      deltaEl.textContent = 'Delta range: ' + fmt(min) + ' to ' + fmt(max);
    }
  }

  const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

  function getArchiveCachedData(dateString) {
    try {
      const raw = localStorage.getItem('climate-data-' + dateString);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.cachedAt !== 'number' || !parsed.data) return null;
      if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function saveArchiveCache(dateString, data) {
    try {
      localStorage.setItem('climate-data-' + dateString, JSON.stringify({
        cachedAt: Date.now(),
        data: data
      }));
    } catch (e) {
      console.warn('Archive cache save failed:', e.message);
    }
  }

  function renderSpirographWithResult(str, result) {
    showLoading(false);
    if (!result) {
      setStats(str, 0, []);
      showStats(true);
      return;
    }
    var acc = typeof result.acceleration === 'number' ? result.acceleration : 0;
    var deltas = Array.isArray(result.hourlyDeltas) ? result.hourlyDeltas.slice(0, 24) : [];
    if (deltas.length < 24) {
      while (deltas.length < 24) deltas.push(0);
    }
    var r = mapToR(normalizeAcceleration(acc));
    if (r < 67 || r > 74) {
      var originalR = r;
      var seed = Math.abs(originalR * 100) % 8;
      r = 67 + seed;
      console.log('Complexity override: r changed from ' + originalR + ' to ' + r);
    }
    var normalizedDeltas = normalizeDeltas(deltas);
    var hourlyD = normalizedDeltas.map(function(delta) { return mapToD(delta); });
    var date = new Date(str);
    var dayOfYear = getDayOfYear(date);
    var hourlyThickness = [];
    for (var h = 0; h < 24; h++) {
      hourlyThickness.push(mapToThickness(calculateSolar(h, dayOfYear)));
    }

    console.log('Archive total points:', CONFIG.TOTAL_POINTS);
    console.log('Archive r value:', r);
    console.log('Archive d range:', Math.min.apply(null, hourlyD).toFixed(1), '-', Math.max.apply(null, hourlyD).toFixed(1));
    console.log('Archive thickness range:', Math.min.apply(null, hourlyThickness).toFixed(2), '-', Math.max.apply(null, hourlyThickness).toFixed(2));

    setStats(str, result.acceleration, result.hourlyDeltas || deltas);
    showStats(true);

    var container = document.getElementById('spirograph-container');
    if (!container) {
      console.error('Archive: spirograph-container not found');
      return;
    }
    try {
      archiveP5Instance = new p5(function(sketch) {
        sketch.setup = function() {
          var canvas = sketch.createCanvas(600, 600, sketch.WEBGL);
          canvas.parent('spirograph-container');
          sketch.background(10);
          sketch.stroke(255);
          sketch.noFill();
          drawArchiveSpirograph(sketch, r, { d: hourlyD, thickness: hourlyThickness });
        };
        sketch.draw = function() {};
      });
    } catch (e) {
      console.error('Archive: p5 sketch failed', e);
    }
  }

  function openDate(year, month, day) {
    // Fetch/cache use 2024 (NOAA has data); UI displays as 2026 (conceptual framing)
    const fetchStr = dateStr(NOAA_FETCH_YEAR, month, day);
    showDetail();
    showLoading(true);
    showStats(false);
    document.getElementById('spirograph-container').innerHTML = '';

    const cachedData = getArchiveCachedData(fetchStr);
    if (cachedData) {
      console.log('Archive: using cached data for', fetchStr, '(no API call)');
      renderSpirographWithResult(fetchStr, cachedData);
      return;
    }

    fetchSpirographData(fetchStr)
      .then(function(result) {
        if (result) saveArchiveCache(fetchStr, result);
        renderSpirographWithResult(fetchStr, result);
      })
      .catch(function(err) {
        console.error('Archive fetch error:', err);
        showLoading(false);
        setStats(fetchStr, 0, []);
        showStats(true);
      });
  }

  document.getElementById('calendar-prev').addEventListener('click', function() {
    if (currentMonth === 0) {
      currentYear--;
      currentMonth = 11;
    } else {
      currentMonth--;
    }
    renderCalendar();
  });

  document.getElementById('calendar-next').addEventListener('click', function() {
    if (currentMonth === 11) {
      currentYear++;
      currentMonth = 0;
    } else {
      currentMonth++;
    }
    renderCalendar();
  });

  document.getElementById('calendar-grid').addEventListener('click', function(e) {
    const btn = e.target.closest('.calendar-day-available');
    if (!btn || btn.disabled) return;
    const y = parseInt(btn.dataset.year, 10);
    const m = parseInt(btn.dataset.month, 10);
    const d = parseInt(btn.dataset.day, 10);
    openDate(y, m, d);
  });

  document.getElementById('archive-detail-close').addEventListener('click', hideDetail);

  renderCalendar();
})();
