# 🚀 M. N. Jaber – AI Engineer Portfolio

Modern, multilingual (EN + AR), performance‑tuned, accessibility‑aware portfolio for an AI / ML engineer. Now a progressive web experience: service worker with layered caching strategies, offline fallback, merged JSON‑LD graphs, and a hardened developer workflow (ESLint, Prettier, commitlint, Lighthouse, Husky) ensuring consistent code quality.

![Hero Preview](images/website-photo.png)

**Live (GitHub Pages):** English: [Portfolio EN](https://mohammednasserahmed.github.io/portfolio/) · العربية: [الملف بالعربية](https://mohammednasserahmed.github.io/portfolio/ar/)

---

## ✨ Key Highlights

-   🌓 Persisted dark/light theme (system + user preference)
-   🌐 Bilingual (English / Arabic) with full RTL + dedicated Arabic font stack
-   🧠 Three.js starfield + typing effect, both motion-aware (respect `prefers-reduced-motion`)
-   ♿ Accessibility: skip link, focus outlining on Tab, semantic regions, reduced-motion fallbacks
-   ⚡ Tailwind JIT build → purged & minified CSS (`dist/style.css`)
-   🔍 SEO: canonical, hreflang, Open Graph, Twitter Card, robots.txt, sitemap (EN & AR)
-   🧾 Structured Data: single JSON-LD `@graph` (Person + WebSite + SearchAction) per locale
-   📱 PWA: manifest + service worker (network‑first HTML, stale‑while‑revalidate CSS/JS, cache‑first images, offline fallback)
-   🛠️ CI: Prettier, ESLint, Tailwind build, Lighthouse perf/accessibility/SEO audit
-   🧪 Quality Gates: Husky pre-commit (lint-staged + formatting) & commitlint (Conventional Commits)
-   🧩 Modular JS architecture (theme, interactions, deferred heavy tasks)
-   🌀 GPU-friendly marquees & galleries (no layout thrashing)

---

## 🗂 Directory Overview

```text
.
├── index.html              # English root page (+ JSON-LD, SEO tags)
├── ar/index.html           # Arabic localized page (RTL + localized schema)
├── css/style.css           # Tailwind directives + custom tokens/utilities
├── dist/style.css          # Built & minified output (generated)
├── js/main.js              # Theme toggle, typing, starfield, interactions
├── images/                 # Optimizable images (portraits, event frames)
├── docs/                   # Publication/report cover assets
├── tailwind.config.js      # Purge/content paths + theme extensions
├── postcss.config.cjs      # PostCSS pipeline (Tailwind + Autoprefixer)
├── sitemap.xml             # Canonical EN + AR URL entries
├── robots.txt              # Crawl policy + sitemap pointer
├── .github/workflows/ci.yml# Formatting + build pipeline
├── package.json            # Scripts & dev dependencies
└── LICENSE
```

---

## 🏗 Technology Stack & Libraries

| Area                    | Library / Tool                                              | Role & Rationale                                                         |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| Styling                 | **Tailwind CSS**                                            | Utility-first styling, rapid iteration, JIT purging for minimal output.  |
| Styling post-processing | **PostCSS** + **Autoprefixer**                              | Vendor prefixing & pipeline for Tailwind build.                          |
| Layout/Theming          | CSS Custom Properties                                       | Theme tokens (dark/light) toggled at root without recomputing classes.   |
| Interactivity           | Vanilla JS                                                  | Keeps footprint small; progressive enhancement layered in.               |
| Graphics                | **Three.js**                                                | Lightweight starfield (Points geometry) with adaptive pixel ratio.       |
| Performance audits      | **Lighthouse**                                              | Automated perf/accessibility/SEO scoring in CI.                          |
| Code quality            | **ESLint** + `eslint-plugin-import`                         | Enforces consistent imports & modern JS hygiene.                         |
| Formatting              | **Prettier**                                                | Uniform formatting across HTML/CSS/JS/JSON/MD.                           |
| Commit conventions      | **commitlint** + **@commitlint/config-conventional**        | Ensures semantic commit messages for changelog / history clarity.        |
| Git hooks               | **Husky** + **lint-staged**                                 | Pre-commit formatting & quick feedback loops.                            |
| Accessibility & Motion  | `IntersectionObserver`, `requestIdleCallback`, `matchMedia` | Defers non-critical tasks, honors reduced-motion users.                  |
| Dev server              | **serve**                                                   | Zero-config static preview for local & CI audits.                        |
| Parallel scripts        | **concurrently**                                            | Run CSS watch + local server simultaneously.                             |
| Images (local script)   | **sharp**                                                   | Fast native image optimization (replaced vulnerable imagemin toolchain). |
| PWA                     | Web App Manifest + Service Worker                           | Installability & offline resilience with layered caching strategies.     |
| CI                      | GitHub Actions                                              | Deterministic build + audits on PR & main pushes.                        |
| i18n/Fonts              | Google Fonts (Inter / IBM Plex Sans Arabic)                 | High readability Latin + Arabic scripts with appropriate glyph coverage. |

---

## 🔄 Development Workflow

```bash
# 1. Install deps
npm install

# 2. Start dev (watch Tailwind + local server on :5500)
npm run dev

# 3. Open browser
# English
http://localhost:5500/
# Arabic
http://localhost:5500/ar/

# 4. Build production CSS
npm run build

# 5. Format code
npm run format
```

Dev script runs two concurrent processes:

-   Tailwind watch → regenerates `dist/style.css`
-   Static server (`serve`) → serves root for local testing

---

## 🌗 Theming Strategy

-   CSS variables define color tokens (`:root` + `.light` modifier)
-   `localStorage` key: `portfolio-theme`
-   System preference respected on first visit (`prefers-color-scheme`)
-   Toggle updates a single root class (no reflow-heavy re-render cycles)

---

## 🧩 Architecture Notes

| Concern       | Implementation                                                                          |
| ------------- | --------------------------------------------------------------------------------------- |
| Animations    | GPU-friendly transforms; motion disabled for reduced-motion users                       |
| Starfield     | Three.js Points; capped particle count; high-DPI throttling                             |
| Typing Effect | Idle/deferred initialization; graceful no-op in reduced-motion                          |
| Scroll Reveal | IntersectionObserver + fallback immediate visibility                                    |
| RTL Fidelity  | Logic-less: attribute-driven direction with spacing adjustments                         |
| Fonts Loading | Preconnect + minimal weights; separate Arabic family                                    |
| Caching (SW)  | Network-first HTML, stale-while-revalidate CSS/JS, cache-first images, offline fallback |

---

## 🔍 SEO & Structured Data

Implemented:

-   `meta` description & author
-   Open Graph + Twitter card (large image)
-   Canonical + hreflang (`en`, `ar`, `x-default`)
-   `robots.txt` + simplified `sitemap.xml` (canonical roots only)
-   JSON-LD: localized `@graph` (Person + WebSite + SearchAction) single tag per page.

Planned (optional):

-   `BreadcrumbList` (if multi-page expansion)
-   `Article` schema for reports/guides
-   Social preview custom composite image

---

## ♿ Accessibility & Inclusivity

-   Respects `prefers-reduced-motion`
-   Skip link (`#hero`) for keyboard users
-   High contrast accent palette & focus states
-   Focus visibility opt-in (`user-tabbing` class)
-   Semantic sections + alt text (ongoing curation)

Roadmap:

-   Add ARIA landmark roles where redundant semantics help assistive tech
-   Automate color contrast regression via axe-core
-   Add accessible motion toggle (override animations explicitly)

---

## 🧪 CI & Quality Pipeline

Workflow (`.github/workflows/ci.yml`):

1. Checkout
2. Node setup (cached)
3. `npm ci`
4. Prettier formatting check
5. ESLint (import + best-practice rules)
6. Tailwind build (production CSS)
7. Local static server & wait-on
8. Lighthouse audit (performance, accessibility, SEO) — JSON report artifact
9. Upload built CSS artifact (optional deployable asset)

Extendable targets:

-   GitHub Pages deploy after merge
-   Performance budgets (fail below set thresholds)
-   Axe accessibility regression stage
-   Visual diff (Playwright / Chromatic snapshot) optional

---

## 🚀 Deployment

Automated via GitHub Actions on every push to `main` using a dedicated workflow: `.github/workflows/deploy-pages.yml`.

Pipeline summary:

1. Install dependencies
2. Build Tailwind CSS → `dist/style.css`
3. Assemble static bundle (HTML, `dist/`, `js/`, `images/`, `docs/`, PWA assets, SW)
4. Upload with `actions/upload-pages-artifact`
5. Publish using `actions/deploy-pages`

Prerequisites (one‑time in repository settings):

-   Enable GitHub Pages → Source: GitHub Actions

Resulting site URL: `https://<user>.github.io/portfolio/` (already reflected in canonical + manifest `start_url`).

To force an immediate redeploy (e.g., cache purge), re‑run the workflow from the Actions tab or push an empty commit:

```bash
git commit --allow-empty -m "chore: trigger pages redeploy" && git push
```

Service worker + manifest are included, so the site is installable and works offline (within the defined caching strategies).

---

## 📦 Scripts Reference

| Script            | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `dev`             | Watch CSS + serve locally                  |
| `watch:css`       | Tailwind watch only                        |
| `build`           | Production CSS build/minify                |
| `build:css`       | Alias for CSS build pipeline               |
| `format`          | Prettier write                             |
| `format:check`    | Prettier verify                            |
| `lint`            | ESLint scan                                |
| `lint:fix`        | ESLint auto-fix                            |
| `optimize:images` | Optimize PNG/JPEG via sharp (local script) |
| `lighthouse`      | Programmatic Lighthouse audit              |

---

## 🛣 Roadmap (Curated)

-   [x] Replace CDN Three.js with local vendored module (tree-shaken later)
-   [x] Migrate imagemin toolchain → **sharp** (fewer transitive binaries / vulns)
-   [ ] Add performance budgets (Lighthouse score floors)
-   [ ] Generate social preview composite image (1200×630)
-   [ ] Add HTTP security headers (Pages / Netlify config)
-   [ ] Analytics (privacy-friendly: Plausible / Fathom)
-   [ ] Visual regression (Playwright capture)
-   [ ] Expand content (articles → BreadcrumbList / Article schema)
-   [ ] Add motion toggle & axe CI checks

---

## 🧠 Design Principles

1. Minimal JavaScript for core UX
2. Progressive enhancement (features degrade gracefully)
3. Localization built-in (not bolted on)
4. Performance-first: reduce layout shifts & overdraw
5. Accessibility and semantics as baseline expectations

---

## 🔐 Privacy & Data

Currently no tracking scripts. Adding analytics later will follow a no‑cookies, anonymized approach.

---

## 🤝 Contributing

While this is a personal portfolio, suggestions via issues or PRs are welcome for performance, accessibility, or i18n improvements.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 🙌 Acknowledgements

-   TailwindCSS team for an elegant utility-first framework
-   Three.js for lightweight WebGL abstractions
-   IBM Plex & Inter type designers

---

Crafted with clean architecture, semantic HTML, progressive enhancement, and future extensibility in mind.

### 🔒 Security Note

Replaced vulnerable imagemin chain with **sharp** (native bindings). Keep dependencies patched and periodically review `npm audit` output.
