# Architecture Document
## Climate Spirograph - Anchorage Alaska

### Tech Stack

**Core Technologies:**
- **HTML5** - Page structure
- **CSS3** - Dark theme styling
- **Vanilla JavaScript** - Core logic
- **p5.js** - Creative coding library for spirograph drawing
- **WebGL (via p5.js)** - Chrome shader effect
- **NOAA API** - Climate data source

**NO frameworks, NO build tools, NO npm** (unless absolutely needed)

**Hosting:**
- GitHub Pages (free, simple)
- Just push HTML files and they're live

---

### Folder Structure

```
climate-spirograph/
│
├── index.html                 # Main page with live spirograph
├── archive.html               # Archive page (build later)
│
├── css/
│   └── style.css             # Dark theme + layout
│
├── js/
│   ├── config.js             # API keys, constants
│   ├── sketch.js             # p5.js main sketch (spirograph drawing)
│   ├── dataFetcher.js        # NOAA API calls
│   ├── climateCalc.js        # Climate calculations
│   ├── chromeShader.js       # WebGL shader setup
│   └── clock.js              # Anchorage time display
│
├── shaders/
│   ├── chrome.vert           # Vertex shader
│   └── chrome.frag           # Fragment shader
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── AI_RULES.md
│   └── PLAN.md
│
└── README.md
```

---

### How p5.js Works

**p5.js is a JavaScript library that makes drawing easy.**

Instead of complex Canvas API code, you write:
```javascript
function setup() {
  createCanvas(600, 600, WEBGL); // Creates a 600x600 canvas with WebGL
}

function draw() {
  background(0); // Black background
  // Draw your spirograph here
}
```

p5.js handles all the hard parts. You just tell it what to draw.

**Key p5.js functions we'll use:**
- `createCanvas()` - Makes the drawing area
- `background()` - Sets background color
- `stroke()` - Sets line color
- `strokeWeight()` - Sets line thickness
- `line()` or `vertex()` - Draws lines
- `beginShape()` / `endShape()` - Draws complex shapes

**p5.js with WEBGL mode lets us use shaders for the chrome effect.**

---

### Data Flow

```
User loads page
    ↓
Get today's date
    ↓
[NOAA API] Fetch daily temps for Feb 23, 2017-2026
    ↓
Calculate acceleration (linear regression)
    ↓
[NOAA API] Fetch daily high/low for today (2026)
    ↓
[NOAA API] Fetch daily high/low for same date in 1976
    ↓
Interpolate hourly temps from daily high/low (24 values each)
    ↓
Calculate 24 hourly deltas (2026 - 1976)
    ↓
Calculate solar radiation for each hour (math approximation)
    ↓
Map data to spirograph parameters:
  - acceleration → r (once)
  - hourly deltas → d (24 times)
  - solar radiation → thickness (24 times)
    ↓
Draw spirograph with chrome shader
    ↓
Animate over 20-30 seconds
```

---

### NOAA API Integration

**You need a free API token:**
1. Go to: https://www.ncdc.noaa.gov/cdo-web/token
2. Enter your email
3. Check email for token
4. Copy into `config.js`

**API Endpoint:**
```
https://www.ncei.noaa.gov/cdo-web/api/v2/data
```

**Headers:**
```javascript
{
  'token': 'YOUR_NOAA_TOKEN_HERE'
}
```

**Example request (daily average temp):**
```
GET https://www.ncei.noaa.gov/cdo-web/api/v2/data?
  datasetid=GHCND&
  stationid=GHCND:USW00026451&
  startdate=2026-02-23&
  enddate=2026-02-23&
  datatypeid=TAVG&
  units=standard
```

**Returns:**
```json
{
  "results": [
    {
      "date": "2026-02-23T00:00:00",
      "datatype": "TAVG",
      "station": "GHCND:USW00026451",
      "value": 28.5
    }
  ]
}
```

---

### Chrome Shader Explanation

**What is a shader?**
A shader is a small program that runs on your GPU (graphics card) to create visual effects.

**We use TWO shader files:**

1. **chrome.vert** (Vertex Shader) - Positions the geometry
2. **chrome.frag** (Fragment Shader) - Colors each pixel to look like chrome

**You don't need to write these from scratch.** Cursor will generate them based on the instructions in PLAN.md. You just need to load them in p5.js.

**How shaders work with p5.js:**
```javascript
let chromeShader;

function preload() {
  chromeShader = loadShader('shaders/chrome.vert', 'shaders/chrome.frag');
}

function draw() {
  shader(chromeShader); // Apply the chrome effect
  // Draw your spirograph
}
```

The shader makes the line look metallic and reflective.

**We'll pass solar radiation data to the shader** so it gets brighter during the day, darker at night.

---

### Spirograph Math (Simplified)

**Don't worry about understanding this deeply.** Cursor will write the code.

**The equations:**
```
For each point along the spirograph:
  x = centerX + (R - r) * cos(angle) + d * cos(((R - r) / r) * angle)
  y = centerY + (R - r) * sin(angle) - d * sin(((R - r) / r) * angle)
```

**What these mean:**
- **R** = big fixed circle (constant = 200)
- **r** = rolling circle radius (from acceleration, constant for the day)
- **d** = pen distance (from hourly delta, changes 24 times)
- **angle** = goes from 0 to 360 degrees as we draw

**In p5.js, this becomes:**
```javascript
for (let i = 0; i < totalPoints; i++) {
  let angle = (i / totalPoints) * TWO_PI; // TWO_PI = 360 degrees
  let hourIndex = floor((i / totalPoints) * 24); // Which hour (0-23)
  
  let d = hourlyD[hourIndex]; // Get d for this hour
  let thickness = hourlyThickness[hourIndex]; // Get thickness for this hour
  
  let x = centerX + (R - r) * cos(angle) + d * cos(((R - r) / r) * angle);
  let y = centerY + (R - r) * sin(angle) - d * sin(((R - r) / r) * angle);
  
  vertex(x, y); // Add point to shape
}
```

---

### Animation Strategy

**Goal:** Draw spirograph over 20-30 seconds

**Approach:**
```javascript
let currentPoint = 0;
let totalPoints = 1440; // 24 hours * 60 minutes

function draw() {
  // Draw one new point per frame
  if (currentPoint < totalPoints) {
    // Calculate and draw next point
    currentPoint++;
  }
}
```

p5.js `draw()` function runs ~60 times per second by default.
- 1440 points ÷ 60 fps = 24 seconds to complete

---

### Anchorage Clock

**Simple JavaScript:**
```javascript
function updateClock() {
  let now = new Date();
  
  // Convert to Anchorage time (AKST = UTC-9)
  let anchorageTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Anchorage"}));
  
  let hours = anchorageTime.getHours();
  let minutes = anchorageTime.getMinutes();
  let seconds = anchorageTime.getSeconds();
  
  // Format: 17:23:45
  let timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} AKST`;
  
  document.getElementById('clock').textContent = timeString;
}

function pad(num) {
  return num < 10 ? '0' + num : num;
}

// Update every second
setInterval(updateClock, 1000);
```

---

### Dark Theme CSS

**Simple and clean:**
```css
body {
  margin: 0;
  padding: 0;
  background: #0a0a0a; /* Very dark gray, not pure black */
  color: #ffffff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

#canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#clock {
  position: absolute;
  top: 40px;
  left: 40px;
  font-size: 14px;
  letter-spacing: 1px;
}
```

---

### Deployment (GitHub Pages)

**After you finish building:**

1. Create a GitHub account (if you don't have one)
2. Create a new repository called "climate-spirograph"
3. Upload all your files
4. Go to Settings → Pages
5. Select "main" branch
6. Click Save
7. Your site is live at: `yourusername.github.io/climate-spirograph`

**I'll walk you through this step-by-step when you're ready.**

---

### What Cursor Will Do vs What You'll Do

**Cursor writes:**
- All the JavaScript code
- The shader files
- API fetch functions
- Spirograph math
- Animation logic

**You do:**
- Tell Cursor what to build (using these docs)
- Test in browser after each step
- Tweak values (colors, timing, sizes)
- Make decisions (looks good? needs adjustment?)
- Learn how the pieces fit together

**You're the director. Cursor is the crew.**

---

### File Loading Order (Important!)

**In index.html, scripts must load in this order:**
```html
<!-- Load p5.js library first -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>

<!-- Then load your files -->
<script src="js/config.js"></script>
<script src="js/climateCalc.js"></script>
<script src="js/dataFetcher.js"></script>
<script src="js/chromeShader.js"></script>
<script src="js/clock.js"></script>
<script src="js/sketch.js"></script> <!-- This one LAST -->
```

Why? Each file depends on the previous ones being loaded.

---

### Browser Testing

**How to test:**
1. Save your files
2. Find `index.html` in Finder (Mac) or File Explorer (Windows)
3. Right-click → Open With → Chrome
4. Open browser console: View → Developer → JavaScript Console
5. Look for errors (red text)
6. Refresh page to test changes (Cmd+R or Ctrl+R)

**Cursor has a built-in terminal** at the bottom where you can also run a local server, but opening the HTML directly works fine for now.

---

### Common Issues & Solutions

**Issue:** "API key invalid"
→ Check that token is correct in config.js

**Issue:** "CORS error"
→ NOAA API should work, but if not, we'll add a proxy

**Issue:** Spirograph doesn't draw
→ Check browser console for JavaScript errors

**Issue:** Shader doesn't work
→ Make sure WEBGL mode is enabled: `createCanvas(600, 600, WEBGL)`

**Issue:** Page is blank
→ Check that all script files loaded (look in Network tab of browser dev tools)

---

### Performance Notes

**This should run smoothly on any modern computer.**

- p5.js is optimized for animation
- WebGL shaders run on GPU (very fast)
- 1440 points is not many for a computer to draw
- NOAA API calls only happen once at page load

If it's slow, we can optimize, but it shouldn't be an issue.

---

### Next Steps After This Works

**Future enhancements (not now):**
1. Archive page with past spirographs
2. Ability to click a date and see that day
3. Export spirograph as PNG
4. Embed in main portfolio site
5. Add more polish (transitions, hover effects, etc.)

**But first: Get ONE spirograph drawing with real data and chrome effect.**
