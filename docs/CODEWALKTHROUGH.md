# Code Walkthrough

A practical, file-by-file tour of the project to help you (or future contributors) find and understand code quickly.

## Root

- `index.html` – Entry HTML, links built assets from `dist/`, includes fonts and optional SW registration (commented). Provides containers for dynamic sections and the Visitor Stats UI.
- `vercel.json` – Vercel config. `version: 2`, `outputDirectory: public`, Node 18 runtime for `api/**/*.js`.
- `package.json` – Scripts (build, lint, export), dev deps (Tailwind, ESLint, Prettier), Husky hooks.
- `eslint.config.js` – Flat ESLint: browser, Node, SW contexts; ignores `dist/**` and `public/**`.

## src/main.js

Bootstraps the application:

- Creates and initializes components: `SummaryComponent`, `ProjectsComponent`, `SkillsComponent`, `PublicationsComponent`, `MobileNavigation`, `VisitorStatsComponent`.
- Loads JSON content via `contentManager` and renders it into the page.
- Wires interactions: skill filters affect projects, accessibility helpers, and fallback rendering.

## Components (src/components)

- `summary-component.js` – Renders the professional summary cards.
- `projects-component.js` – Displays scrollable/animated projects carousel; supports filtering by skills.
- `skills-component.js` – Renders skills and exposes a filter-change callback.
- `publications-component.js` – Renders publications list.
- `mobile-navigation.js` – Mobile menu toggle and interactions.
- `visitor-stats-component.js` – UI for Visitors/Stars; optimistic star toggling; syncs with `stats-service`.

## Modules (src/modules)

- `content-manager.js` – Fetches JSON content (`data/content.json`, `data/content.ar.json`) and returns structured data for components.
- `theme-manager.js` – Dark-mode baseline (site is effectively dark-only now).
- `animation-manager.js` – Minimal scroll/visibility/observer-based effects.
- `stats-service.js` – Core abstraction for stats:
    - Detects backend availability from `config/environment`.
    - Methods: `getStats`, `incrementVisit`, `toggleStar`.
    - Local fallback persists to localStorage when backend is disabled (e.g., GitHub Pages).

## Config (src/config)

- `environment.js` – Detects environment (development / production / staging) and exposes `getConfig`:
    - Production: if host includes `vercel.app`, uses `'/api'` base.
    - Otherwise points at GitHub Pages URL to intentionally disable API on GH Pages.
- `app-config.js` – Misc app-level tuning (timeouts, admin/dev toggles).
- `config-loader.js` – Loader utilities for config.

## Styles (src/styles)

- `main.css` – Tailwind entry; compiles to `dist/style.*.css`.
- `base.css`, `components.css`, `projects.css`, `skills.css` – Structured CSS for sections.

## Templates (src/templates)

- `base.html` – Base HTML used in build pipelines.
- `sections/*.html` – Markup fragments for each section (hero, summary, skills, projects, publications, education, outreach).

## Utilities (src/utils)

- `helpers.js` – Small utilities for logging and errors used by `main.js`.

## Serverless API (api/\*\*)

- `_lib/http.js` – `json`, `readJson`, CORS helpers, `isPreflight`.
- `_lib/storage.js` – In-memory store with 24h dedup per client; optional Upstash Redis.
- `stats.js` – GET `/api/stats` returns `{ visitors, stars, userHasStarred }`.
- `stats/visit.js` – POST `/api/stats/visit` increments visits (dedup by client within 24h).
- `stats/star.js` – POST `/api/stats/star` toggles star for the client.

## Build and Tooling (scripts/\*\*)

- `build-ultra-reliable.mjs` – Generates hashed assets into `dist/` and updates HTML; no ES module imports in outputs.
- `fix-html-references.mjs` – Rewrites HTML to reference the newest hashed assets.
- `verify-build.mjs` – Sanity check that assets referenced exist.
- `build-export.mjs` – Copies site into `public/` for Vercel.
- `dev-server.mjs` – Simple local development server.
- `validate-content.mjs` – Validates `data/content*.json` against schema.
- `optimize-images.mjs`, `run-lh.mjs` – Optional optimizations and Lighthouse run.

## How things fit together

- App boot → Content load → Components render.
- Visitor Stats UI mounts in header; calls `stats-service`.
- On Vercel: `apiBaseUrl = '/api'` → serverless handlers.
- On GH Pages: API disabled → local fallback counts only.
- Build → Export → Vercel serves `public/` and functions in `api/**`.

## Notes and tips

- During development, keep the SW disabled until you’re confident caches won’t mask changes.
- If you want durable stats, configure Upstash Redis on Vercel and set the env vars documented in `docs/API.md`.
- To verify backend usage, open DevTools → Network and look for `/api/stats` and `/api/stats/visit` calls.
