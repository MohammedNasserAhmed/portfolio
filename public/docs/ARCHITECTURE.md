# Architecture Overview

This document describes the overall architecture, data flow, build/deploy pipeline, and key modules of the portfolio project.

## High-level

- Static site built with vanilla JavaScript and Tailwind CSS, packaged by custom Node build scripts.
- Content-driven sections (summary, projects, skills, publications) rendered at runtime from JSON.
- Optional PWA hooks (service worker currently disabled in index.html for safer debugging).
- Serverless API (Vercel) provides "Visitors" and "Stars" counters with local fallback.
- Export step assembles a deployable static site into `public/` for Vercel.

## Folders

- `src/` – Authoring source for modules, components, styles, templates
    - `components/` – UI components (Summary, Projects, Skills, Publications, MobileNav, VisitorStats)
    - `modules/` – Cross-cutting services (Theme, Content, Animation, Stats)
    - `config/` – Environment detection and runtime configuration
    - `styles/` – Tailwind entry and component CSS
    - `templates/` – HTML fragments used by build scripts
    - `utils/` – Small helpers (logging, error handling)
- `scripts/` – Build and tooling (ultra-reliable build, verify, export, dev server, optimize images)
- `api/` – Serverless endpoints usable on Vercel
    - `_lib/http.js` – JSON/CORS helpers
    - `_lib/storage.js` – In-memory store (optional Redis via env vars)
    - `stats.js`, `stats/visit.js`, `stats/star.js` – HTTP endpoints
- `public/` – Build/export output that Vercel serves as the static site root
- Root files – `index.html`, Tailwind and ESLint configs, `vercel.json`, `package.json`

## Runtime flow

1. `src/main.js` bootstraps the app, creating module instances and UI components.
2. `content-manager` loads JSON content and populates components.
3. `animation-manager` wires minor scroll/visibility animations.
4. `visitor-stats-component` renders the Visitors/Stars UI, backed by `stats-service`.
5. `stats-service` resolves `apiBaseUrl` from `config/environment`:
    - On Vercel production (host contains `vercel.app`): uses `'/api'` → serverless endpoints.
    - On GitHub Pages: API disabled → localStorage fallback only.

## Build pipeline

- `npm run build:prod` → `scripts/build-ultra-reliable.mjs` generates hashed CSS/JS in `dist/` and updates HTML.
- `postbuild` runs `fix-html-references`, `verify-build`, and `export` to assemble the site in `public/`.
- `vercel.json` sets `outputDirectory: public` and configures `api/**/*.js` functions with Node 18 runtime.

## Deployment

- GitHub Pages can serve the static site (no server-side API).
- Vercel serves the static output from `public/` and serverless functions from `api/**`.
- Production branch: `main`.

## Stats persistence

- In-memory default (resets on cold starts).
- Optional Redis (Upstash) via env vars to persist counts across deployments.

## Service worker

- Present at root `sw.js`; registration commented out in `index.html` to avoid stale caching during development.
- When enabled, ensure network-first for `/api/*` endpoints.
