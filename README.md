# Solar Shadow Analysis 3D Web Application

An interactive **3D web application** that simulates a solar installation site and analyses
how surrounding structures (buildings and water tanks) shade the solar tables, then estimates
the **efficiency impact** of that shading — including a dedicated **Edge Occlusion Factor (EOF)**
metric.

> Built with Next.js + React + TypeScript + Redux Toolkit, rendering with Three.js via
> React Three Fiber, and solar geometry from SunCalc.

---

## Live demo

> Deploy the `client/` folder to Vercel (set the project's **root directory** to `client`) and paste the URL here:
>
> **Deployed app:** `https://solar-grid-analysis-system.vercel.app/`

The app is fully client-side, so it deploys to Vercel/Netlify with **no backend or environment
variables required**.

---

## Features

- **Interactive 3D scene** — two solar tables (each a `2 × 3` panel array at a fixed `15°` tilt),
  buildings as cuboids, and water tanks as cylinders, on an orbit-controllable ground plane.
- **Real-time object manipulation** — add/remove objects and edit them live:
  - Buildings: position (X, Y), width, length, height
  - Tanks: position (X, Y), radius, height
  - Solar tables: position (X, Y) and orientation (the `2 × 3` layout and `15°` tilt are preserved)
- **Sun simulation** — two modes:
  - **Manual**: azimuth + elevation sliders.
  - **Date / Time**: pick a date, time, latitude and longitude; the sun position is computed
    automatically (e.g. *21 June 09:00*, *21 June 13:00*, *21 December 16:00* presets included).
- **Dynamic shadows** — real-time shadow maps in the scene update as the sun moves.
- **Shadow analysis** — per-panel shaded fraction computed by ray-casting a sampling grid toward
  the sun against every occluder.
- **Efficiency analysis** — a transparent model that turns shading into an effective-irradiance
  factor, a `0–100` score, and a classification (`Optimal / Good / Moderate / Critical`),
  visualised as a per-panel **heatmap** on the 3D tables.
- **Edge Occlusion Factor (EOF)** — surfaced per panel and per table, both in the UI and below.
- **Bonus**: day-playback animation of the sun, and a **daily summary** (average & peak efficiency
  across the daylight hours of the selected date).
- **Save / Load** scenes, with a dedicated **Saved Scenes** page (`/saved`) listing every saved
  scene in a table (composition + a reference "report score") with Load / Delete actions.
- **Dual-write persistence** — saves go to **both** `localStorage` and the database (when the
  backend is configured). Reads come from `localStorage` by default; flip
  `NEXT_PUBLIC_SCENE_SOURCE=db` to read from MySQL instead.

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | **Next.js 14** (App Router) + **React 18**         |
| Language           | **TypeScript**                                      |
| State management   | **Redux Toolkit** + React-Redux                     |
| 3D rendering       | **Three.js** via **@react-three/fiber** + **drei** |
| Solar position     | **suncalc**                                         |
| Styling            | **Tailwind CSS**                                    |
| Backend (optional) | **Node.js + Express + TypeScript**, **MySQL** (`mysql2`), JWT auth (`jsonwebtoken` + `bcryptjs`) |
| Persistence        | `localStorage` by default, or the Express + MySQL API when configured |

### Why these libraries

- **React Three Fiber / drei** — the assignment is fundamentally a 3D visualisation problem; R3F
  lets us drive Three.js declaratively from React state, and drei provides `OrbitControls`, `Grid`,
  and `Sky` helpers.
- **suncalc** — a small, well-tested astronomical library for sun azimuth/altitude from date,
  time and location, so we don't hand-roll (and risk getting wrong) the solar-position astronomy.
- **Redux Toolkit** — a single predictable store for scene objects, sun state and view settings;
  the analysis is derived from this store via memoised selectors/hooks.

---

## Getting started

> Requires **Node.js 18+**.

```bash
# the frontend lives in client/
cd client
npm install

# start the dev server (http://localhost:3000)
npm run dev

# production build
npm run build
npm run start
```

---

## Project architecture

```
SolarGridProject/
├─ client/                # ── FRONTEND (Next.js) ──
│  ├─ package.json        # frontend app + scripts
│  ├─ next.config.mjs / tsconfig.json / tailwind.config.ts / postcss.config.mjs
│  └─ src/
│     ├─ app/             # Next App Router (layout, page, globals.css)
│     ├─ components/
│     │  ├─ scene/        # 3D: SceneCanvas, Building, Tank, SolarTable, SunLight
│     │  ├─ controls/     # UI: ControlPanel, Object/Sun/Analysis panels, Save/Load
│     │  ├─ Providers.tsx
│     │  └─ PlaybackDriver.tsx
│     ├─ store/           # Redux: scene / sun / settings slices + typed hooks
│     ├─ hooks/           # useAnalysis (derived analysis + sun direction)
│     ├─ lib/             # sun, geometry, shadowAnalysis, constants, persistence, api
│     └─ types/           # shared domain types
└─ server/                # ── BACKEND (Express + MySQL, optional) ──
   ├─ package.json
   └─ src/
      ├─ index.ts         # entry (DB ping + listen)
      ├─ app.ts           # express app, CORS, route mounting
      ├─ config/          # env + mysql2 pool
      ├─ db/              # schema.sql, migrate, seed (presets)
      ├─ middleware/      # JWT auth, error handling
      ├─ routes/          # URL → controller mappings
      ├─ controllers/     # read req / call service / send res
      ├─ services/        # business logic (validation, ownership, auth, analysis)
      ├─ models/          # data access (raw SQL per table)
      ├─ utils/           # http helpers, token, validation, sun resolution
      └─ analysis/        # SAME shadow/efficiency engine as the frontend
```

Each layer has one job: a **route** maps a URL to a handler, a **controller** reads the
request and shapes the response, a **service** holds the business rules (validation, ownership,
hashing, analysis), and a **model** runs the SQL. Services are framework-agnostic (they take plain
arguments, not `req`/`res`), so the business logic is testable on its own.

**Data flow:** UI controls → Redux store (`scene`, `sun`, `settings`). The 3D scene and the
analysis panel both read from the store. The analysis is a **pure function** of `(scene objects,
sun direction)` — `lib/shadowAnalysis.ts` — memoised in `hooks/useAnalysis.ts`, so the same result
drives both the on-panel heatmap and the metrics tables. `lib/geometry.ts` produces the table/panel
transforms used by **both** rendering and analysis, guaranteeing what you see equals what is
measured.

### Coordinate convention

Three.js Y-up. `+X` = East, `−X` = West, `+Z` = South, `−Z` = North, `+Y` = Up. The assignment's
"Position (X, Y)" is the horizontal ground position and maps to world `(x, z)`; "Height" is the
world `+Y` extent.

---

## Sun position methodology

- **Manual mode**: the user provides a compass azimuth (`0° = N, 90° = E, 180° = S, 270° = W`)
  and an elevation above the horizon.
- **Date/Time mode**: `suncalc.getPosition(date, lat, lng)` returns azimuth (measured from south,
  positive toward west) and altitude. We normalise azimuth to the compass convention
  (`compass = 180° + suncalcAzimuth`) and elevation in degrees.

Either way, angles are converted to a **unit direction vector pointing from the ground toward the
sun**:

```
x = sin(az)·cos(el)        // East
y = sin(el)                // Up
z = −cos(az)·cos(el)       // North = −Z
```

This vector positions the scene's directional light (which casts the real-time shadow maps) and is
the ray direction used by the analysis. When elevation ≤ 0.5° the sun is treated as **below the
horizon** (night → no direct irradiance).

**Assumptions:** clear-sky direct beam only; the local clock is treated as standard time at the
chosen longitude (no per-region DST/time-zone correction); default location is New Delhi
(`28.61, 77.21`) and is user-editable.

---

## Shadow analysis methodology

For every panel we lay a sampling grid (`6 × 8 = 48` points by default) across its surface, using
the exact same transform that renders the panel. From each sample point we cast a ray **toward the
sun** and test it against every occluder:

- **Buildings** → analytic ray vs axis-aligned box (slab method).
- **Water tanks** → analytic ray vs finite vertical cylinder (side + end caps).

A sample is **shaded** if any occluder is hit before the ray escapes (the sun is effectively at
infinity), if the sun is below the horizon, or if the sun is behind the panel (back-face). The
panel's **shaded fraction** is `shaded samples / total samples`.

We use analytic ray–primitive intersection (rather than GPU shadow-map readback) because it is
deterministic, resolution-independent, and easy to reason about and document. The in-scene shadow
maps are a separate, purely visual aid.

**Assumptions / simplifications:**
- Only buildings and tanks are treated as occluders (table-on-table self-shading is ignored).
- Shading is binary per sample (no penumbra / soft shadows); shadow *softness* is approximated only
  by grid resolution.
- Direct-beam shading only — diffuse/ambient and ground reflection are not modelled.

---

## Efficiency analysis methodology

Shading does not reduce output linearly, because a panel's cells are wired in **series strings**: a
shadow that crosses a whole string can throttle the entire string (via its bypass diode) far more
than the same shaded *area* scattered as isolated spots. Our model therefore answers the
assignment's guiding questions explicitly:

For each panel we compute, from the sampling grid:

| Quantity            | Definition                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| `shadedFraction f`  | fraction of samples in shadow (**how much** shadow)                         |
| `stringPenalty s`   | `max_row(rowShadedFraction) − f` — how **concentrated** shading is on the worst series row (**where** the shadow falls) |
| **`EOF`**           | **Edge Occlusion Factor** = shaded fraction within the panel's perimeter band |

These combine into an **effective irradiance factor**:

```
loss      = f + α·s + β·EOF·f          (α = 0.6, β = 0.15)
effFactor = clamp(1 − loss, 0, 1)
score     = round(effFactor × 100)
```

- **Quantifying shadow on a panel** → `f` (the sampled shaded fraction).
- **Does location matter?** → yes: `α·s` penalises shadows concentrated along a series string more
  than diffuse shading of equal area.
- **Comparing equal shaded area distributed differently** → the configuration with higher
  string-row concentration gets a higher `s`, hence a lower score.
- **Aggregating a table** → the table score is the mean of its 6 panel `effFactor`s (panels are
  equal area); table EOF and shaded fraction are likewise averaged.
- **Classification** by score: `≥85 Optimal · 60–84 Good · 30–59 Moderate · <30 Critical`.

### Edge Occlusion Factor (EOF)

**EOF is the fraction of a panel's *perimeter* sample band that is shaded.** Edge shading is an
early warning sign: occlusion from a neighbouring building or tank typically encroaches from a panel
edge before it reaches the centre, and edge cells often sit at the ends of series strings. EOF is
displayed for every panel and every table, and contributes the `β·EOF·f` term to the efficiency
loss, so two panels with identical total shading but more of it hugging the edges score slightly
lower. It is intended as an interpretable shading/efficiency **factor**, not a hardware spec.

**Assumptions / limitations of the efficiency model:**
- It is a transparent, physically-motivated heuristic, **not** an electrical (I–V / bypass-diode)
  simulation; coefficients `α`, `β` are tunable design choices, not measured constants.
- All panels are assumed identical and equally weighted; temperature, soiling, inverter clipping,
  and module-mismatch effects are out of scope.
- "Series row" is approximated by the sampling grid's rows along the panel slope.

---

## Assumptions (summary)

- Northern-hemisphere site; clear-sky direct beam; clock = standard time at the chosen longitude.
- Buildings are axis-aligned cuboids on flat ground; tanks are vertical cylinders on flat ground.
- Solar tables keep a fixed `2 × 3` layout and `15°` tilt at all times.
- Only buildings and tanks cast analysed shadows onto panels.
- Units are metres; the ground plane is `60 × 60 m`.

---

## Limitations (summary)

- Binary (hard-edged) shadows — no penumbra, no diffuse/reflected light.
- Heuristic efficiency model rather than a full electrical simulation.
- No DST/time-zone database; latitude/longitude entered manually.
- Persistence defaults to browser-local (`localStorage`); enable the optional Express + MySQL
  backend (see below) for server-side storage, auth, sharing, and reporting.

---

## Backend (Express + MySQL) — optional

The app runs fully without a backend. The `server/` folder adds an optional **Node.js + Express +
MySQL** API that demonstrates the full stack: persistence, authentication, and server-side analysis.
The frontend uses it automatically when `NEXT_PUBLIC_API_URL` is set; otherwise it falls back to
`localStorage`. Scene save/load is isolated behind `client/src/lib/persistence.ts`, so nothing else in the
UI changes between the two modes.

### Setup

> Requires **Node.js 18+** and a running **MySQL 8+** server.

```bash
cd server
npm install
cp .env.example .env        # then edit DB credentials + JWT_SECRET
npm run migrate             # creates the database + tables
npm run seed                # inserts example "preset" scenes (optional)
npm run dev                 # API on http://localhost:4000
```

Then enable it in the frontend (from `client/`):

```bash
cd client
cp .env.local.example .env.local
# set:  NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

### Database schema

```
users(id, email UNIQUE, password_hash, created_at)
scenes(id, user_id FK→users, name, data JSON, share_token UNIQUE, created_at, updated_at)
analyses(id, scene_id FK→scenes, kind, sun_azimuth, sun_elevation, result JSON, created_at)
presets(id, name UNIQUE, description, data JSON)
```

`ON DELETE CASCADE` links `users → scenes → analyses`. JSON columns store the scene-object array and
analysis results directly.

### API endpoints

| Method | Path | Auth | Purpose |
| ------ | ---- | ---- | ------- |
| `POST` | `/api/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/auth/login` | — | Log in, returns JWT |
| `GET`  | `/api/auth/me` | JWT | Current user |
| `GET`  | `/api/scenes` | optional | List your scenes (or anonymous scenes) |
| `POST` | `/api/scenes` | optional | Create a scene |
| `GET`  | `/api/scenes/:id` | optional | Load a scene |
| `PUT`  | `/api/scenes/:id` | optional | Update a scene |
| `DELETE` | `/api/scenes/:id` | optional | Delete a scene |
| `POST` | `/api/scenes/:id/share` | optional | Create a public share token |
| `GET`  | `/api/share/:token` | — | Read-only shared scene |
| `GET`  | `/api/scenes/:id/analyses` | optional | Stored analysis history |
| `POST` | `/api/scenes/:id/analyses` | optional | Compute + store an analysis snapshot |
| `POST` | `/api/scenes/:id/daily-analysis` | optional | Aggregate efficiency across a day |
| `GET`  | `/api/scenes/:id/report.csv` | optional | Per-panel CSV report |
| `POST` | `/api/analyze` | — | **Stateless** analysis for any scene + sun |
| `GET`  | `/api/presets` | — | Example sites |
| `GET`  | `/health` | — | Liveness probe |

**Auth model:** scenes are protected when created by a logged-in user; scenes created anonymously
(`user_id = NULL`) are open, so the frontend's save/load works without forcing a login (demo mode).
"optional" routes accept a JWT but do not require one.

**Shared analysis engine:** `server/src/analysis/` is the same shadow/efficiency code as the
frontend `src/lib/`, so `/api/analyze`, snapshots, daily aggregation and the CSV report produce
results identical to what the 3D app shows — the server can recompute and validate client results.

### Example

```bash
curl -X POST http://localhost:4000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"objects":[{"id":"t1","type":"table","x":0,"y":0,"azimuth":0},
       {"id":"k1","type":"tank","x":1.5,"y":5,"radius":2,"height":8}],
       "azimuth":180,"elevation":25}'
```

---

## External libraries / frameworks

`next`, `react`, `react-dom`, `@reduxjs/toolkit`, `react-redux`, `three`, `@react-three/fiber`,
`@react-three/drei`, `suncalc`, `tailwindcss`. See `package.json` for versions.

**Backend** (`server/package.json`): `express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `cors`,
`dotenv`, `suncalc`, `three` (for the shared analysis math), with `typescript` + `ts-node-dev`.
