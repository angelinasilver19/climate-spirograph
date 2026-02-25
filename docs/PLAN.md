# Build Plan - Climate Spirograph
## Vibe Coding Sprint: EOD Tomorrow

**RULE: Complete ONE session fully before moving to the next. Test in browser after each session.**

---

# SESSION 1: Setup (Tonight, ~2 hours)

## What You're Building
By the end of this session, you'll have:
- A project folder with the right structure
- A NOAA API token
- A black webpage that says "ANCHORAGE, ALASKA" with a working clock
- p5.js loaded and ready

---

## STEP 1A: Create Your Project Folder

### What to do:
1. **On your computer**, create a new folder called `climate-spirograph` on your Desktop (or wherever you keep projects)
2. Inside that folder, create these empty folders:
   - `css`
   - `js`
   - `shaders`
   - `docs`

### How your folder should look:
```
climate-spirograph/
├── css/
├── js/
├── shaders/
└── docs/
```

**✅ TEST: Can you see these folders when you open `climate-spirograph` in Finder/Explorer?**

---

## STEP 1B: Add the Documentation Files

### What to do:
1. Take the 4 markdown files I gave you earlier (PRD.md, ARCHITECTURE.md, AI_RULES.md, PLAN.md)
2. Put them in the `docs/` folder

### How your folder should look now:
```
climate-spirograph/
├── css/
├── js/
├── shaders/
└── docs/
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── AI_RULES.md
    └── PLAN.md
```

**✅ TEST: Can you open PRD.md and see the content?**

---

## STEP 1C: Get Your NOAA API Token

### What to do:
1. Go to this website: https://www.ncdc.noaa.gov/cdo-web/token
2. Enter your email address
3. Click "Request Token"
4. Check your email (might take 5-10 minutes)
5. Copy the token (it's a long random string of letters and numbers)
6. Save it somewhere safe (Notes app, email draft, text file)

**✅ TEST: Do you have a token that looks like `ABcDefGHijKLmnOPqrStUvWxYz123456`?**

---

## STEP 1D: Open Cursor and Open Your Project

### What to do:
1. Open **Cursor** (the app)
2. Click "File" → "Open Folder"
3. Select your `climate-spirograph` folder
4. Click "Open"

You should now see your folder structure in the left sidebar of Cursor.

**✅ TEST: Can you see `css/`, `js/`, `shaders/`, and `docs/` in Cursor's sidebar?**

---

## STEP 1E: Create .cursorrules File

This file tells Cursor the rules to follow.

### What to do:
1. In Cursor, right-click in the sidebar
2. Click "New File"
3. Name it `.cursorrules` (yes, with the dot at the start)
4. Paste this into the file:

```
# Climate Spirograph Project Rules

BEFORE STARTING ANY WORK:
Read these files in order:
1. docs/PRD.md - What we're building
2. docs/ARCHITECTURE.md - How it's structured  
3. docs/AI_RULES.md - Non-negotiable constraints
4. docs/PLAN.md - Step-by-step build instructions

## Core Rules:
- Use ONLY p5.js + vanilla JavaScript (NO frameworks)
- NO build tools (npm, webpack, etc.)
- Three variables ONLY: r (daily), d (hourly), thickness (hourly)
- Anchorage only, 1976 vs 2026 comparison
- Real NOAA data only (no mock data in production)
- Follow PLAN.md step-by-step (ONE step at a time)

## Workflow:
1. Read current step in PLAN.md
2. Generate code
3. Tell Angelina to test in browser
4. Fix any issues
5. Mark step as DONE
6. Move to next step

Angelina is learning to code. Be patient, explain clearly, test frequently.
```

5. Save the file (Cmd+S or Ctrl+S)

**✅ TEST: Can you see `.cursorrules` in Cursor's sidebar?**

---

## STEP 1F: Tell Cursor to Read the Docs

### What to do:
1. Open Cursor's chat (bottom panel or Cmd+L / Ctrl+L)
2. Type this EXACT message:

```
Please read all files in the docs/ folder:
@docs/PRD.md
@docs/ARCHITECTURE.md
@docs/AI_RULES.md
@docs/PLAN.md

Then confirm you understand:
1. What we're building (climate spirograph)
2. The three variables (r, d, thickness)
3. The tech stack (p5.js + WebGL)
4. That we're working in a sprint to finish by EOD tomorrow

Do NOT start coding yet. Just confirm you've read and understood.
```

3. Press Enter
4. Wait for Cursor to respond

**✅ TEST: Did Cursor respond saying it read the docs and understands the project?**

---

## STEP 1G: Create index.html

### What to do:
1. Tell Cursor:

```
Let's start building. Create index.html in the root folder with:
- Dark background (#0a0a0a)
- "ANCHORAGE, ALASKA" text in top left
- A live clock showing Anchorage time (HH:MM:SS AKST format)
- Load p5.js from CDN
- A centered 600x600 div where the canvas will go
- Clean, minimal styling

Do NOT add the spirograph yet. Just the page structure, clock, and p5.js.
```

2. Cursor will generate the code
3. Look at the code it generated - does it make sense?
4. If yes, accept it

**✅ TEST: Does `index.html` now exist in your project root?**

---

## STEP 1H: Create style.css

### What to do:
1. Tell Cursor:

```
Create css/style.css with:
- Very dark background (#0a0a0a)
- White text (#ffffff)
- Modern, clean font (Helvetica Neue or similar)
- Clock positioned in top left corner (40px from edges)
- Canvas container centered on page
- Professional, gallery-like aesthetic
```

2. Cursor will generate the CSS
3. Accept if it looks good

**✅ TEST: Does `css/style.css` exist?**

---

## STEP 1I: Test in Browser

### What to do:
1. In Cursor, find `index.html` in the sidebar
2. Right-click it
3. Click "Reveal in Finder" (Mac) or "Reveal in File Explorer" (Windows)
4. Double-click `index.html` to open it in your browser

### What you SHOULD see:
- Black background
- "ANCHORAGE, ALASKA" text in top left
- A clock showing Anchorage time, updating every second
- A centered area where the spirograph will go (might be empty for now)

### If something's wrong:
1. Open browser console: View → Developer → JavaScript Console (or right-click → Inspect → Console)
2. Look for red error messages
3. Copy the error and paste it into Cursor chat: "I'm getting this error: [paste error]"
4. Cursor will help you fix it

**✅ TEST: Does your page look like a dark, minimal gallery page with a working clock?**

---

## STEP 1J: Create config.js

### What to do:
1. Tell Cursor:

```
Create js/config.js with:
- NOAA API token (placeholder for now: 'REPLACE_WITH_YOUR_TOKEN')
- Station ID: GHCND:USW00026451
- Comparison year: 1976
- Spirograph constants (R=200, r range 80-160, d range 20-80, thickness range 0.5-4)
- Animation settings (1440 total points, 30ms per frame)

Use the examples in ARCHITECTURE.md as reference.
```

2. Cursor will generate the config file
3. After it's created, open `js/config.js`
4. Find the line that says `NOAA_TOKEN: 'REPLACE_WITH_YOUR_TOKEN'`
5. Replace `'REPLACE_WITH_YOUR_TOKEN'` with your actual NOAA token (in quotes)
6. Save (Cmd+S or Ctrl+S)

**✅ TEST: Does `js/config.js` exist with your real NOAA token?**

---

## END OF SESSION 1

### What You Should Have Now:
- ✅ Project folder structure
- ✅ Documentation in docs/
- ✅ .cursorrules file
- ✅ Cursor understands the project
- ✅ NOAA API token saved in config.js
- ✅ index.html with dark theme
- ✅ Working Anchorage clock
- ✅ css/style.css
- ✅ p5.js loaded from CDN

### Test Checklist:
- [ ] Open index.html in browser
- [ ] See black background
- [ ] See "ANCHORAGE, ALASKA" text
- [ ] Clock updates every second
- [ ] No errors in browser console

**If all tests pass, you're done for tonight! Take a break. Tomorrow we'll add the actual spirograph.**

---

# SESSION 2: Data & Drawing (Tomorrow Morning, ~3-4 hours)

## What You're Building
By the end of this session:
- Fetch real temperature data from NOAA
- Calculate the three variables (r, d, thickness)
- Draw a basic spirograph (no chrome effect yet)

---

## STEP 2A: Create dataFetcher.js

### What to do:
1. Tell Cursor:

```
Create js/dataFetcher.js with functions to:
1. Fetch daily temperatures from NOAA CDO API for a given year and date
2. Fetch 10 years of data (2017-2026) for acceleration calculation
3. Interpolate hourly temperatures from daily high/low
4. Handle errors gracefully (try/catch, user-friendly messages)

Use the API format from ARCHITECTURE.md. Use async/await.
```

2. Cursor will write the code
3. Review it - look for the functions:
   - `fetchDailyTemp(year, date)`
   - `fetchAccelerationData(date)`
   - `interpolateHourlyTemps(dailyHigh, dailyLow)`

4. Accept if it looks good

**✅ TEST: Does `js/dataFetcher.js` exist with API functions?**

---

## STEP 2B: Create climateCalc.js

### What to do:
1. Tell Cursor:

```
Create js/climateCalc.js with functions to:
1. Calculate linear regression (acceleration) from array of {year, temp} data
2. Map acceleration value to r (rolling radius) using CONFIG ranges
3. Map hourly delta to d (pen distance) using CONFIG ranges
4. Map solar radiation to line thickness using CONFIG ranges
5. Calculate solar radiation for a given hour (sine wave approximation based on time of day)

Keep functions pure (input → output, no side effects).
```

2. Cursor writes the code
3. Review the functions:
   - `calculateAcceleration(data)`
   - `mapToR(acceleration)`
   - `mapToD(delta)`
   - `mapToThickness(solar)`
   - `calculateSolar(hour, dayOfYear)`

**✅ TEST: Does `js/climateCalc.js` exist with calculation functions?**

---

## STEP 2C: Test Data Fetching

### What to do:
1. In `index.html`, add the new script tags BEFORE the closing `</body>` tag:

```html
<script src="js/config.js"></script>
<script src="js/climateCalc.js"></script>
<script src="js/dataFetcher.js"></script>
```

2. Tell Cursor:

```
Add a test function to index.html that:
1. Fetches daily temp for 2026-02-23
2. Logs it to console
3. Call this function when page loads

This is just for testing the API. We'll remove it later.
```

3. Refresh your browser
4. Open console (View → Developer → JavaScript Console)
5. You should see a temperature value logged

### If you see an error:
- "Invalid token" → Check your NOAA token in config.js
- "CORS error" → NOAA API might need different headers (tell Cursor)
- "Network error" → Check your internet connection

**✅ TEST: Do you see a temperature value in the console?**

---

## STEP 2D: Create sketch.js (p5.js Main File)

### What to do:
1. Tell Cursor:

```
Create js/sketch.js with p5.js structure:

preload() {
  // We'll load shaders here later
}

setup() {
  createCanvas(600, 600, WEBGL);
  // Don't start drawing yet - wait for data
}

draw() {
  background(10);
  // Spirograph will draw here
}

Also add:
- Global variables for climate data
- Function to fetch and prepare data: fetchClimateData(date)
- Function to draw spirograph: drawSpirograph(r, hourlyD, hourlyThickness)

Follow the pseudocode in ARCHITECTURE.md for the spirograph math.
Use beginShape()/vertex()/endShape() for drawing.
```

2. Cursor writes the p5.js sketch
3. This is the main drawing file - review it carefully

**✅ TEST: Does `js/sketch.js` exist with p5.js functions?**

---

## STEP 2E: Connect Everything

### What to do:
1. Tell Cursor:

```
Update index.html to:
1. Remove the test function from earlier
2. Add sketch.js as the LAST script (after all other js files)
3. When page loads, automatically fetch today's climate data and draw spirograph

The flow should be:
page loads → fetch data → calculate variables → draw spirograph
```

2. Update the script tags order:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script src="js/config.js"></script>
<script src="js/climateCalc.js"></script>
<script src="js/dataFetcher.js"></script>
<script src="js/sketch.js"></script>
```

**✅ TEST: Are scripts in the right order?**

---

## STEP 2F: Test Basic Spirograph

### What to do:
1. Save all files
2. Refresh browser
3. Wait 5-10 seconds for data to load

### What you SHOULD see:
- Black background
- Clock still working
- A white spirograph drawing in the center
- It might look basic (just white lines, no chrome effect yet)
- Console shows data loading messages

### What you might see instead:
- **Nothing draws:** Check console for errors
- **API errors:** Check NOAA token
- **"Loading forever":** API might be slow, wait 30 seconds
- **Weird shape:** Data mapping might be off (we'll fix in next step)

**✅ TEST: Do you see ANY spirograph shape drawing?**

---

## STEP 2G: Debug and Adjust

### What to do:
1. If spirograph looks wrong, tell Cursor:

```
The spirograph is drawing but looks [describe the problem: too small, too big, wrong shape, etc.].

Current values showing in console:
- r = [value]
- d values range from [min] to [max]
- thickness values range from [min] to [max]

Help me adjust the mapping ranges in config.js to fix this.
```

2. Cursor will suggest new values for CONFIG
3. Update config.js with new ranges
4. Refresh and test again

**Keep adjusting until the spirograph:**
- Fills most of the 600x600 canvas
- Has visible variation (loops change size)
- Doesn't go off-canvas

**✅ TEST: Does spirograph look reasonable (even if plain/not chrome yet)?**

---

## END OF SESSION 2

### What You Should Have Now:
- ✅ Real NOAA data loading
- ✅ Three variables calculating correctly
- ✅ Basic white spirograph drawing
- ✅ No errors in console

### Test Checklist:
- [ ] Page loads without errors
- [ ] Clock still works
- [ ] Spirograph draws in center
- [ ] Console shows successful data fetch
- [ ] Spirograph completes drawing

**If all tests pass, take a lunch break! After lunch: chrome shader time.**

---

# SESSION 3: Chrome Shader & Polish (Tomorrow Afternoon, ~2-3 hours)

## What You're Building
By the end of this session:
- Metallic chrome line effect
- 3D drop shadow
- Smooth animation
- Final polish
- Deployed to GitHub Pages

---

## STEP 3A: Create Chrome Shaders

### What to do:
1. Tell Cursor:

```
Create two shader files:

1. shaders/chrome.vert (vertex shader) - handles geometry positioning
2. shaders/chrome.frag (fragment shader) - creates metallic chrome appearance

The chrome effect should:
- Look like brushed metal
- Reflect light (brighter on top, darker on sides)
- Respond to a uniform called uSolarIntensity (0-1)
- Have subtle specular highlights

Use standard GLSL syntax. Reference examples of chrome/metal shaders if needed.
```

2. Cursor will generate both shader files
3. Don't worry if you don't understand shader code - that's normal

**✅ TEST: Do `shaders/chrome.vert` and `shaders/chrome.frag` exist?**

---

## STEP 3B: Load Shaders in sketch.js

### What to do:
1. Tell Cursor:

```
Update js/sketch.js to:
1. Load chrome shaders in preload()
2. Apply shader before drawing in draw()
3. Pass solar intensity for current hour as uniform to shader
4. Keep the spirograph drawing logic the same

The shader should make the line look metallic instead of flat white.
```

2. Cursor updates sketch.js
3. Save the file

**✅ TEST: Does sketch.js call loadShader() and shader()?**

---

## STEP 3C: Test Chrome Effect

### What to do:
1. Refresh browser
2. Wait for spirograph to draw

### What you SHOULD see:
- Spirograph line looks metallic/reflective (not flat white)
- Line appears brighter where "light hits it"
- Subtle gradient/shine effect
- Line gets brighter during Anchorage daytime hours

### If shader doesn't work:
1. Check console for shader compile errors
2. Tell Cursor: "Shader error: [paste error from console]"
3. Cursor will fix the shader code

**✅ TEST: Does the line look metallic/chrome-like?**

---

## STEP 3D: Add Drop Shadow

### What to do:
1. Tell Cursor:

```
Add a subtle 3D drop shadow effect to the spirograph.

Options:
1. Draw the same spirograph twice (offset second one for shadow)
2. Use CSS drop-shadow filter
3. Add shadow in the shader

Use whichever method looks best. Shadow should be subtle (dark gray, slight offset).
```

2. Cursor implements shadow
3. Test in browser

**✅ TEST: Does spirograph have a subtle shadow giving it depth?**

---

## STEP 3E: Add Animation

Right now spirograph might draw instantly. Let's animate it.

### What to do:
1. Tell Cursor:

```
Update sketch.js to animate the spirograph drawing over 20-30 seconds.

Instead of drawing all points at once:
1. Track currentPoint (starts at 0)
2. Each frame, draw a few more points
3. When currentPoint reaches totalPoints, drawing is complete
4. Drawing speed should feel smooth, not too fast or slow

Use p5.js draw() loop (runs ~60 fps automatically).
```

2. Cursor updates the drawing logic
3. Refresh and watch it animate

**✅ TEST: Does spirograph draw smoothly over 20-30 seconds?**

---

## STEP 3F: Add Loading State

### What to do:
1. Tell Cursor:

```
While fetching data from NOAA, show:
"Loading climate data..."

centered on the page where spirograph will appear.

Once data is loaded and drawing starts, hide this message.
```

2. Cursor adds loading message
3. Test - you should briefly see "Loading..." then spirograph starts

**✅ TEST: Do you see loading message while data fetches?**

---

## STEP 3G: Add Artist Statement Button

### What to do:
1. Tell Cursor:

```
Add a button in the bottom right corner that says "About"

When clicked, show a modal overlay with:
- Dark semi-transparent background
- White text box in center
- Close button (X)
- Placeholder text: "Artist statement coming soon..."

Style it to match the dark, minimal aesthetic.
```

2. Cursor creates button and modal
3. Test clicking it - modal should open and close

**✅ TEST: Does "About" button work?**

---

## STEP 3H: Final Visual Polish

### What to do:
1. Look at your spirograph critically
2. Tell Cursor any adjustments needed:

```
The chrome effect needs to be [brighter/darker/more subtle/etc.]
The animation should be [faster/slower]
The shadow needs to be [more visible/more subtle]
The canvas size should be [bigger/smaller]
```

3. Keep tweaking until it looks professional

**✅ TEST: Does it look gallery-ready and polished?**

---

## STEP 3I: Test Full Flow

### What to do:
1. Close browser completely
2. Open `index.html` fresh
3. Watch the full experience:
   - Page loads (black, clock appears)
   - "Loading..." message shows
   - Spirograph animates with chrome effect
   - Clock keeps ticking
   - About button works

### Final checks:
- [ ] No console errors
- [ ] Clock updates every second
- [ ] Spirograph draws smoothly
- [ ] Chrome effect looks metallic
- [ ] Shadow is visible but subtle
- [ ] Loading message works
- [ ] About button opens modal

**✅ TEST: Does everything work perfectly?**

---

## STEP 3J: Deploy to GitHub Pages

### What to do:
1. Tell Cursor:

```
Help me deploy this to GitHub Pages. I need step-by-step instructions for:
1. Creating a GitHub repository
2. Uploading my files
3. Enabling GitHub Pages
4. Getting the live URL

Remember I've never used GitHub before.
```

2. Follow Cursor's instructions EXACTLY
3. When done, you'll have a URL like: `yourusername.github.io/climate-spirograph`

**✅ TEST: Can you visit your live site in a browser?**

---

## STEP 3K: Share Your Work!

### What to do:
1. Visit your live site
2. Take a screenshot or screen recording
3. Share with friends, add to portfolio

**You just built your first data visualization project! 🎉**

---

## END OF SESSION 3

### What You've Built:
- ✅ Real-time animated climate spirograph
- ✅ Chrome metallic line effect with 3D shadow
- ✅ Live Anchorage clock
- ✅ Professional dark theme
- ✅ Loading states and error handling
- ✅ Artist statement modal
- ✅ Deployed live on GitHub Pages

**CONGRATULATIONS! You finished the MVP.**

---

# AFTER MVP: Archive Page (Optional, Do Later)

If you want to add the archive page showing past spirographs, tell Cursor:

```
Let's build archive.html now. It should:
1. Show a grid of static spirograph PNGs
2. One for each day since January 1, 2026
3. Each labeled with its date
4. Click to view full size
5. Link back to main page

Use the same dark theme. How should we generate the static images?
```

But this is NOT required for tomorrow's deadline. Do this later when you have time.

---

# Troubleshooting Guide

## If NOAA API isn't working:
1. Check token is correct in config.js
2. Try the API URL directly in browser
3. Check NOAA website status: https://www.ncdc.noaa.gov/
4. Use backup: fetch daily data, interpolate hourly (this is OK!)

## If shader won't compile:
1. Check console for specific error
2. Shader errors are cryptic - just copy/paste to Cursor
3. Cursor will fix syntax errors
4. If totally broken, can fall back to plain white line temporarily

## If spirograph looks wrong:
1. Console.log the r, d, thickness values
2. Make sure they're in reasonable ranges (not 0, not 10000)
3. Adjust CONFIG mapping ranges
4. Test with hardcoded values first, then real data

## If animation is janky:
1. Draw fewer points per frame
2. Use frameRate(30) instead of 60
3. Check if API fetch is blocking draw loop
4. Make sure draw() isn't doing expensive calculations every frame

## If page is blank:
1. Check console for JavaScript errors
2. Check that all script files loaded (Network tab in dev tools)
3. Make sure p5.js CDN is accessible
4. Check file paths are correct (case-sensitive on some systems)

---

# Remember:

**You're not expected to understand everything.** 

The goal is:
1. Follow the steps
2. Test in browser
3. Fix errors with Cursor's help
4. Get it working

You'll learn more by DOING than by understanding every line.

**Cursor is your copilot. Use it liberally. Ask questions. Iterate.**

**By EOD tomorrow, you'll have a working climate spirograph. Let's go! 🚀**
