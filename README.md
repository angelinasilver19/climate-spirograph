# Climate Spirograph

Anchorage, Alaska temperature visualization. See `docs/PRD.md` for the full spec.

## Running locally (required for NOAA API)

Open the project from a **local server** so the browser can fetch from the NOAA API (CORS blocks `file://`).

**From the project root in the terminal:**

```bash
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

Stop the server with `Ctrl+C`.
