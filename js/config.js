/**
 * Climate Spirograph - Configuration
 * API token and constants. Replace REPLACE_WITH_YOUR_TOKEN with your NOAA token.
 */

const CONFIG = {
  // NOAA API
  NOAA_TOKEN: 'SXQgFarDluBXrrqYgCyxwKdoeSjIfbHd',
  NOAA_API_BASE: 'https://www.ncei.noaa.gov/cdo-web/api/v2/data',
  STATION_ID: 'GHCND:USW00026451',
  COMPARISON_YEAR: 1976,

  // Spirograph geometry (tuned for real NOAA data: balanced, no white blobs)
  R: 200,                    // Fixed outer circle radius
  R_MIN: 60,                 // Rolling radius (r) → good petal count
  R_MAX: 80,
  D_MIN: 55,                 // Pen distance (d) → nice loops, not too big/small
  D_MAX: 75,
  THICKNESS_MIN: 0.5,        // Line thickness (balanced with mock)
  THICKNESS_MAX: 1.8,

  // Dense pattern: same point count for main page and archive (intricate, gallery-quality)
  TOTAL_POINTS: 4000,
  POINTS_PER_FRAME: 3,     // unused when using real-time sync
  FRAME_DELAY_MS: 30
};
