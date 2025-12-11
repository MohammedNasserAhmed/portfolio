# Phased Refactor & Rebuild Plan

A pragmatic, low-risk roadmap to improve reliability, performance, and maintainability over short iterations.

## Phase 1 — Stabilize and verify (now)

Goals

- Eliminate recurring runtime errors and fragile paths.
- Add minimal checks that catch regressions before deploy.

Actions

- Service Worker: keep registration disabled until prod is verified; when re-enabling, use network-first for HTML and network-only for `/api/*`.
- Export integrity checks: add a tiny script (or task) asserting exported files exist:
    - `public/data/content.json`
    - `public/docs/guide.png`, `public/docs/report.png`
    - `public/dist/main.*.js`, `public/dist/style.*.css`
- Content schema: validate `data/content*.json` on every commit (already scripted via `validate-content.mjs`).

Acceptance

- Local preview has zero console errors (excluding extensions).
- Export check passes in CI.

## Phase 2 — Content and assets hygiene

Goals

- Standardize content image locations and references.
- Avoid coupling “docs” to runtime assets.

Actions

- Move publications images from `docs/` → `images/publications/`.
- Update `data/content*.json` image paths accordingly.
- Add a build step that verifies every image path referenced in content exists, otherwise fails.

Acceptance

- All content images resolve from `/images/publications/*`.
- Build fails if an image path is broken.

## Phase 3 — Code hardening & small tests

Goals

- Make code easier to evolve; prevent accidental regressions.

Actions

- Add lightweight JSDoc types across `src/components/*` and `src/modules/*`.
- Extract small utilities:
    - Image recovery helper from Publications component.
    - Section heading text-rotation.
- Add 2–3 tiny unit tests (where feasible without heavy infra) for `utils/helpers.js`.

Acceptance

- `npm run lint` is green with new JSDoc.
- Tests run (even minimal) and pass locally/CI.

## Phase 4 — PWA and performance

Goals

- Re-introduce offline-friendly behavior safely.

Actions

- Re-enable SW registration in `index.html` after prod endpoint validation.
- Cache strategies:
    - HTML: network-first with offline fallback.
    - CSS/JS: stale-while-revalidate.
    - Images: cache-first with cap (already implemented).
    - API: network-only; never cache.
- Add versioned cache names and an upgrade path (skipWaiting + clients.claim gated by a build version).

Acceptance

- No caching of API responses; offline page works.
- Lighthouse performance P75 > 90 on desktop; no SW-related errors.

## Phase 5 — Backend durability (optional)

Goals

- Ensure stats persist across redeploys and scale.

Actions

- Configure Upstash Redis on Vercel (env vars as documented in `docs/API.md`).
- Tighten CORS to your domains; add basic rate limiting.
- Add bot mitigation (ignore known crawlers in visit increment).

Acceptance

- Visitors/stars persist across deploys.
- API returns proper CORS and rate-limit headers.

## Phase 6 — Developer experience & docs

Goals

- Improve onboarding and confidence.

Actions

- Add a short “How to develop” section in `docs/DEVELOPMENT.md` for the updated flow (build → export → preview).
- Create a tiny checklist for releasing to Vercel (root `/`, build `npm run build:prod`, output `public/`).

Acceptance

- Fresh clone can build and preview in <5 minutes.

---

## Sequence and effort

- Phase 1–2: 0.5–1 day
- Phase 3–4: 1–2 days (depending on tests and SW tuning)
- Phase 5: 0.5 day (if Redis needed)
- Phase 6: 0.5 day

## Risk management

- Small, isolated PRs per phase.
- Keep SW off until live API confirmed.
- Always verify export before deploy.

## Optional nice-to-haves

- Add a “/health” static page that exercises content JS without external calls (fast smoke test).
- Split `src/styles/main.css` into feature-aligned files and rely more on Tailwind utilities for consistency.
