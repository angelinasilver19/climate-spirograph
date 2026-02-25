# AI Rules for Cursor
## Non-Negotiables - Climate Spirograph Project

---

## 🚨 CRITICAL RULES - NEVER BREAK

### 1. NO FRAMEWORKS
- **ONLY vanilla JavaScript + p5.js**
- NO React, Vue, Angular, Svelte
- p5.js is a LIBRARY, not a framework (this is allowed)

### 2. NO BUILD TOOLS
- **NO Webpack, Vite, Parcel, npm, package.json**
- Just HTML/CSS/JS files that open directly in browser
- Exception: p5.js loads from CDN (no install needed)

### 3. NEVER HARDCODE API KEYS
- API keys ONLY in `config.js`
- Use placeholder: `'REPLACE_WITH_YOUR_TOKEN'`
- Never commit real keys

### 4. THREE VARIABLES ONLY
**These are THE ONLY spirograph variables:**
- **r (rolling radius)** — Acceleration (ONCE per day, constant)
- **d (pen distance)** — Hourly delta (24 times, hourly)
- **Line thickness** — Solar radiation (24 times, hourly)

**DO NOT:**
- Add extra variables
- Change what these represent
- Make r vary hourly

### 5. REAL DATA ONLY
- Use NOAA API data (daily high/low + interpolation)
- NO MOCK DATA in production
- Mock data OK for initial testing ONLY

### 6. ANCHORAGE ONLY
- Location hardcoded: Anchorage, Alaska
- NO city selector
- NO "enter your location"

### 7. 1976 COMPARISON
- Compare 2026 vs 1976 (50-year delta)
- NOT 1950 (data too messy)

---

## ✅ CODE STYLE RULES

### JavaScript Style
```javascript
// ✅ GOOD
const acceleration = calculateAcceleration(temps);
const r = mapToRadius(acceleration, CONFIG.R_MIN, CONFIG.R_MAX);

// ❌ BAD
var acceleration = calculateAcceleration(temps); // No var!
let r = acceleration * 20 + 80; // Magic numbers!
```

**Rules:**
- Use `const` by default, `let` when reassigning
- NEVER use `var`
- NO magic numbers — use CONFIG constants
- Descriptive variable names
- Small functions (one job each)

### Comments
```javascript
// ✅ GOOD - Explains WHY
// NOAA returns temps in tenths of degrees C, so divide by 10
const tempC = data.value / 10;

// ❌ BAD - States the obvious
// Divide by 10
const tempC = data.value / 10;
```

---

## 🎯 WHAT CURSOR SHOULD DO

### Always:
- Follow PLAN.md step-by-step (ONE step at a time)
- Check ARCHITECTURE.md for how things connect
- Test code in browser before saying "done"
- Add error handling for API calls
- Keep code simple and readable
- Show loading states

### Ask Before:
- Adding libraries (even small ones)
- Changing spirograph math
- Adding features not in PRD
- Changing file structure
- Making big architectural changes

### Never:
- Skip ahead in PLAN.md
- Add features not requested
- Use frameworks
- Overcomplicate things
- Leave console.logs in production
- Assume something works without testing

---

## 🌐 API RULES

### NOAA API Calls
```javascript
// ✅ GOOD - Proper error handling
async function fetchData(url) {
  try {
    const response = await fetch(url, {
      headers: { 'token': CONFIG.NOAA_TOKEN }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Fetch failed:', error);
    showErrorMessage('Unable to load climate data');
    return null;
  }
}

// ❌ BAD - No error handling
async function fetchData(url) {
  const response = await fetch(url);
  return await response.json();
}
```

**Rules:**
- Always wrap in try/catch
- Check `response.ok` before parsing
- Show user-friendly errors (not raw error objects)
- Log errors to console for debugging

---

## 🎨 P5.JS RULES

### Structure
Every p5.js project has these functions:
```javascript
function preload() {
  // Load assets (shaders, images, fonts) BEFORE setup runs
  chromeShader = loadShader('shaders/chrome.vert', 'shaders/chrome.frag');
}

function setup() {
  // Runs ONCE at start
  createCanvas(600, 600, WEBGL);
  // Initialize variables
}

function draw() {
  // Runs 60 times per second (animation loop)
  background(0);
  // Draw spirograph here
}
```

**Rules:**
- Load shaders in `preload()`, not `setup()`
- Create canvas in `setup()`, not `draw()`
- Keep `draw()` efficient (it runs constantly)
- Use WEBGL mode for shaders: `createCanvas(w, h, WEBGL)`

### Drawing
```javascript
// ✅ GOOD - Use p5.js built-in shapes
beginShape();
for (let i = 0; i < points.length; i++) {
  vertex(points[i].x, points[i].y);
}
endShape();

// ❌ BAD - Don't use raw Canvas API with p5.js
ctx.beginPath();
ctx.lineTo(x, y);
ctx.stroke();
```

---

## 🎬 ANIMATION RULES

### Smooth Animation
```javascript
// ✅ GOOD - Let p5.js handle frame rate
let currentPoint = 0;
const totalPoints = 1440;

function draw() {
  if (currentPoint < totalPoints) {
    // Draw next point
    currentPoint++;
  }
}

// ❌ BAD - Don't use setTimeout/setInterval with p5.js
setInterval(() => {
  drawNextPoint();
}, 16);
```

**Rules:**
- Use p5.js `draw()` loop, not setTimeout
- Control speed with `frameRate()` if needed
- Draw in batches if needed for performance

---

## 🐛 DEBUGGING RULES

### Console Logging
```javascript
// ✅ GOOD - Helpful during development
console.log('Fetched', temps.length, 'temperatures for', date);
console.log('Acceleration:', acceleration, '°F/year');

// ❌ BAD - Useless
console.log('here'); // Where?
console.log(data); // What data?
```

**Rules:**
- Descriptive messages during development
- Remove or comment out before "done"
- Use `console.error()` for actual errors
- Use `console.warn()` for warnings

### Testing Checklist
Before marking a step "done":
- [ ] Code runs without errors in browser console
- [ ] Visual output looks correct
- [ ] API calls work (or test data works)
- [ ] No console.logs left uncommented
- [ ] File is in correct folder
- [ ] Code follows style rules above

---

## 🎨 CHROME SHADER RULES

### Shader Loading
```javascript
// ✅ GOOD - Load in preload()
let chromeShader;

function preload() {
  chromeShader = loadShader('shaders/chrome.vert', 'shaders/chrome.frag');
}

function draw() {
  shader(chromeShader);
  // Draw spirograph
}

// ❌ BAD - Don't load in draw() (will reload every frame!)
function draw() {
  let s = loadShader('shaders/chrome.vert', 'shaders/chrome.frag');
  shader(s);
}
```

### Passing Data to Shaders
```javascript
// ✅ GOOD - Set uniforms before drawing
chromeShader.setUniform('uTime', frameCount);
chromeShader.setUniform('uSolarIntensity', solarRadiation);
shader(chromeShader);
// Draw
```

**Shader files will be provided in PLAN.md — don't try to write them from scratch.**

---

## 📁 FILE ORGANIZATION

### Keep It Simple
- Files under 300 lines (split if bigger)
- One clear purpose per file
- Group related functions
- Clear file names

### Load Order Matters
In `index.html`, load scripts in this order:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script src="js/config.js"></script>
<script src="js/climateCalc.js"></script>
<script src="js/dataFetcher.js"></script>
<script src="js/chromeShader.js"></script>
<script src="js/clock.js"></script>
<script src="js/sketch.js"></script> <!-- LAST -->
```

---

## ⚡ PERFORMANCE RULES

### Don't Overthink It
- 1440 points is not many for a computer
- WebGL is fast (runs on GPU)
- p5.js is optimized
- This WILL run smoothly

### If It's Slow
- Draw fewer points per frame
- Use `frameRate(30)` instead of default 60
- Batch geometry into single shapes
- Check for infinite loops

---

## 🚫 THINGS TO AVOID

### Premature Optimization
- Don't optimize until there's a problem
- Solve it simply first, optimize later

### Feature Creep
- Stick to PLAN.md
- No extra features
- We can add polish later

### Overengineering
- This is not a production app with millions of users
- Keep it simple
- Working > perfect

---

## ✨ THINGS THAT ARE OK

### You CAN:
- Use modern JavaScript (ES6+, async/await, arrow functions)
- Use CSS Grid and Flexbox
- Use HTML5 semantic elements
- Refactor for clarity
- Fix bugs you notice
- Add helpful comments
- Ask questions

### You CAN'T (without asking):
- Change core spirograph variables
- Add new features
- Use frameworks/build tools
- Change comparison year (1976)
- Add multiple cities
- Use TypeScript

---

## 🆘 WHEN STUCK

### If NOAA API doesn't work:
1. Check token is correct in config.js
2. Check browser console for errors
3. Test endpoint in browser directly
4. Check NOAA service status
5. Ask Angelina for help

### If spirograph looks wrong:
1. Console.log the data values (r, d, thickness)
2. Check if values are in reasonable ranges
3. Verify math equations match ARCHITECTURE.md
4. Test with simpler values (constants)

### If shader doesn't work:
1. Check WEBGL mode is enabled
2. Check shader files exist and loaded
3. Check console for shader compile errors
4. Test without shader first (plain drawing)

### If animation is janky:
1. Check draw() function for expensive operations
2. Try drawing fewer points per frame
3. Check if data fetching is blocking draw loop
4. Use `frameRate(30)` if needed

---

## 📋 FINAL CHECKLIST

Before saying a step is "DONE":
- [ ] Code runs in browser without errors
- [ ] Matches requirements in PLAN.md
- [ ] Tested with real browser (not just in Cursor)
- [ ] No console.logs left in
- [ ] Code is readable and commented where needed
- [ ] Error handling exists for API calls
- [ ] Loading states work
- [ ] Follows all rules in this document

---

## 🎯 REMEMBER

**Goal:** Working spirograph by EOD tomorrow
**Priority:** Functionality > perfection
**Approach:** Test early, test often
**Mindset:** Simple solutions > clever solutions

**Angelina is learning to code. Be helpful, be clear, be patient.**
