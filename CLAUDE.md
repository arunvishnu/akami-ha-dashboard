# akami-ha-dashboard

Custom Home Assistant dashboard built with React + Vite. Replaces HA's Lovelace UI with a tab-based layout organized by floor and room.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires a `.env` file (gitignored):
```
VITE_HA_URL=https://home.arunvishnu.com
VITE_HA_TOKEN=your_long_lived_token
```

## Deploy pipeline

Push to `main` → GitHub Action builds → deploys built files to `deploy` branch → click **Update Dashboard** button in HA (runs `python3 /config/update_dashboard.py` via shell_command) → files land at `/config/www/ha-dashboard/`.

Dashboard is served at `/local/ha-dashboard/index.html` as a sidebar panel in HA.

## Architecture

### HA connection
`src/context/HAContext.jsx` — single WebSocket connection shared across all components via React context. All components call `useHA()` which reads from this context. Credentials come from `VITE_HA_URL`/`VITE_HA_TOKEN` env vars (baked in at build time) or localStorage fallback.

`src/hooks/useHA.js` — re-exports `useHA` from context. Import from here everywhere.

### Layout config
`src/layout.js` — **edit this file to add/remove rooms and entities**. Defines:
- `FLOORS` — tab list (Home, 1st Floor, 2nd Floor, Outdoor, Basement)
- `ROOMS` — each room with `floor`, `icon`, `label`, and `entities` (lights, fan, temperature, occupancy, media, switches, scenes, sensors)
- `FLOOR_ROOMS` — derived map of floor → room IDs
- `HOME_ENTITIES` — entities shown on the Home overview tab

### Components
- `TabBar` — floor navigation tabs
- `RoomCard` — compact card showing room status (lights on, temp, occupancy, fan, media)
- `RoomDetail` — slide-in panel (from right) with full room controls: scenes, lights+brightness, fan, switches, media, sensors
- `tabs/HomeTab` — weather, climate, occupancy grid, active media, quick controls (All Lights Off, Good Night)
- `tabs/FloorTab` — grid of RoomCards for a floor; manages which room's detail panel is open
- `EntityCard` — generic toggleable entity (switch, fan, automation)
- `LightCard` — light with on/off + brightness slider
- `ClimateCard` — thermostat with current/target temp and +/- adjust
- `MediaCard` — play/pause/skip/volume + album art

### Styles
Single CSS file at `src/styles/index.css`. Dark theme with CSS variables in `:root`. Key vars: `--bg`, `--surface`, `--surface-hover`, `--border`, `--accent`, `--on-color`.

## Key decisions
- One WebSocket per app (HAContext) — avoids multiple connections per card component
- `layout.js` is the single source of truth for what's shown — no localStorage config for the new tab-based layout
- Build-time token injection via GitHub secrets — no per-user setup, token is in the JS bundle
- `base: './'` in vite.config.js — required for relative asset paths when served from `/local/`
- Build output: `www/ha-dashboard/` (matches HA's `/local/` path convention)

## HA instance
- URL: `https://home.arunvishnu.com`
- Served via NGINX Proxy Manager (WebSocket support enabled)
- HA Yellow, HA OS 17.3, HA 2026.6.3
