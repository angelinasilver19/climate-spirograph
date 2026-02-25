/**
 * Archive spirograph — EXACT same drawing logic as sketch.js drawSpirograph().
 * Only difference: p5 instance mode (sketch.xxx) and currentPoint = totalPoints for full 24h.
 * CONFIG must be loaded.
 */

// Exact copy from sketch.js
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

/**
 * Exact copy of sketch.js drawSpirograph(), adapted for p5 instance mode.
 * For archive we draw full 24h so currentPoint = totalPoints.
 */
function drawArchiveSpirograph(sketch, rollingR, hourlyParams) {
  const R = CONFIG.R;
  const totalPoints = CONFIG.TOTAL_POINTS;
  const currentPoint = totalPoints;
  const dArr = hourlyParams.d;
  const thicknessArr = hourlyParams.thickness;
  const g = gcd(R - rollingR, rollingR);
  const tMax = sketch.TWO_PI * (rollingR / g);

  let prevX, prevY;

  for (let i = 0; i <= currentPoint && i <= totalPoints; i++) {
    const t = (i / totalPoints) * tMax;
    const hourIndex = Math.min(23, Math.floor((i * 24) / totalPoints));
    const d = dArr[hourIndex];
    const thickness = thicknessArr[hourIndex];

    const x = (R - rollingR) * sketch.cos(t) + d * sketch.cos(((R - rollingR) / rollingR) * t);
    const y = (R - rollingR) * sketch.sin(t) - d * sketch.sin(((R - rollingR) / rollingR) * t);

    if (i === 0) {
      prevX = x;
      prevY = y;
    } else {
      sketch.strokeWeight(thickness);
      sketch.line(prevX, prevY, x, y);
      prevX = x;
      prevY = y;
    }
  }
}
