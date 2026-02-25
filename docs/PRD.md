# Product Requirements Document (PRD)
## Climate Spirograph: Anchorage Alaska Temperature Visualization

### Project Overview
A real-time animated data visualization showing climate change in Anchorage, Alaska through spirograph patterns. Compares 2026 hourly temperatures to 1976 (50-year delta). Inspired by Olafur Eliasson's "Weather-drawing observatory for the future."

**TIMELINE: Build in 2 days (EOD tomorrow)**

---

### Core Concept
Each spirograph = ONE DAY (24 hours) of temperature data

**Three Variables:**
1. **r (rolling radius)** — Warming acceleration (measured ONCE per day, constant throughout)
2. **d (pen distance)** — Hourly temp delta 2026 vs 1976 (changes 24 times, once per hour)
3. **Line thickness** — Solar radiation (changes 24 times, once per hour)

---

### Visual Design

**Aesthetic:**
- **Dark background** (black or very dark gray)
- **Chrome/metallic white line** with realistic reflections (WebGL shader)
- **3D effect** with drop shadow
- **Clean, sophisticated, precise** — digital not hand-drawn
- Chic gallery/exhibition feeling

**Landing Page:**
```
ANCHORAGE, ALASKA
17:23:45 AKST

[spirograph animating in real-time]

[Artist Statement button]
```

**Key Elements:**
- Spirograph draws in real-time when page loads (~20-30 seconds)
- Live clock in top corner showing Anchorage time (updates every second)
- "Artist Statement" button opens modal overlay
- Minimal text — let visual speak

**After Drawing Completes:**
- Stays static (finished)
- Automatically starts drawing tomorrow's spirograph
- Loops daily

---

### Archive Page

**Shows:** Grid of static PNG/JPG spirographs
**Dates:** All days since January 1, 2026
**Layout:** Simple grid with date labels
**Interaction:** Click to view full size (optional)

---

### Data Approach

**Source:** NOAA Climate Data Online (CDO) API
**Station:** Anchorage Ted Stevens International Airport (GHCND:USW00026451)
**Comparison:** 2026 vs 1976 (50-year delta)

**Data Strategy:**
- Fetch daily high/low temps (reliable, clean data)
- Use smart interpolation for hourly estimates
- **NO MOCK DATA** — only real NOAA climate data

**Calculations:**
1. **Acceleration:** Linear regression of temps for this date, 2017-2026 (10-year trend)
2. **Hourly delta:** Interpolated hourly temp in 2026 minus 1976 for each hour
3. **Solar radiation:** Mathematical approximation based on time of day, latitude, date

---

### Technical Stack

**Tools:**
- **Cursor** — primary code editor
- **p5.js** — JavaScript library for creative coding and spirograph drawing
- **WebGL shader** — creates chrome metallic reflection effect
- **HTML/CSS/JavaScript** — basic building blocks
- **NOAA API** — climate data source

**Why p5.js for this project:**
- Made for artists, not engineers
- Easier to embed in portfolio site
- Works well with WebGL shaders
- Cursor writes great p5.js code fast

---

### Chrome Metallic Effect

**Approach:** WebGL shader (NO environment map, keep it simple)

**Effect:**
- Realistic brushed metal appearance
- Dynamic reflections responding to "light" (solar radiation)
- Brighter during Anchorage daytime, darker at night
- Subtle 3D depth with drop shadow

**Assets needed:** NONE — shader generates effect mathematically

---

### Success Criteria

✅ Spirograph draws smoothly with real climate data  
✅ Chrome metallic effect looks professional and stunning  
✅ Live Anchorage clock works  
✅ Dark theme feels sophisticated  
✅ Animation timing feels right (~20-30 seconds)  
✅ Deployed live on GitHub Pages by EOD tomorrow  
✅ Embeddable in portfolio site  

---

### Out of Scope (For Now)

- Artist statement copy (do this after launch)
- Mobile optimization (desktop first)
- Multiple cities (Anchorage only)
- User interactions beyond viewing
- Social sharing
- Sound/audio

---

### Portfolio Context

This is the FIRST project in Angelina's "🧀 Patiently Aged" (data visualization) section. It should:
- Demonstrate technical + artistic skill
- Show ability to work with real data
- Look professional and gallery-ready
- Be a proof of concept for future data viz projects
