# 🚀 M. N. Jaber – AI Engineer Portfolio

Modern, multilingual (EN + AR), performance‑tuned, accessibility‑aware portfolio for an AI/ML engineer. Features dark/light theming, animated hero, Three.js starfield, structured data (Person + WebSite + SearchAction), SEO optimization, and production Tailwind build pipeline.

![Hero Preview](images/website-photo.png)

**Live (GitHub Pages):** English: [Portfolio EN](https://mohammednasserahmed.github.io/portfolio/) · العربية: [الملف بالعربية](https://mohammednasserahmed.github.io/portfolio/ar/)

---

## ✨ Key Highlights

- 🌓 Persisted dark/light theme (system preference aware)
- 🌐 Bilingual (English / Arabic, full RTL support + dedicated Arabic font)
- 🧠 Typing effect + performant starfield (reduced motion aware)
- ♿ Accessibility conscious (focus restoration, reduced motion fallback, semantic structure)
- ⚡ Tailwind JIT build + purged/minified CSS
- 🔍 SEO: Open Graph, Twitter Card, canonical, hreflang, sitemap, robots.txt
- 🧾 Structured Data: Person + WebSite + SearchAction JSON-LD (EN & AR)
- 🛠️ CI: GitHub Actions (format check + CSS build artifact)
- 🧩 Modular architecture (extracted JS/CSS, theme tokens via CSS variables)
- 🔁 Smooth marquee skill + outreach scrollers (GPU-friendly)

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
├── sitemap.xml             # Indexed anchors for sections
├── robots.txt              # Crawl policy + sitemap pointer
├── .github/workflows/ci.yml# Formatting + build pipeline
├── package.json            # Scripts & dev dependencies
└── LICENSE
```

---

## 🏗 Technology Stack

| Layer | Tools / Approach |
|-------|------------------|
| Styling | TailwindCSS (JIT) + CSS custom properties |
| Interactivity | Vanilla JS + Three.js (lightweight particle field) |
| Fonts | Inter (EN), IBM Plex Sans Arabic (AR) |
| Build | Tailwind CLI + PostCSS + Autoprefixer |
| CI | GitHub Actions (Node 20) |
| SEO / Semantics | JSON-LD, OG/Twitter, hreflang, canonical |

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

- Tailwind watch → regenerates `dist/style.css`
- Static server (`serve`) → serves root for local testing

---

## 🌗 Theming Strategy

- CSS variables define color tokens (`:root` + `.light` modifier)
- `localStorage` key: `portfolio-theme`
- System preference respected on first visit (`prefers-color-scheme`)
- Toggle instantly swaps variables (no repaint thrash)

---

## 🧩 Architecture Notes

| Concern | Implementation |
|---------|----------------|
| Animations | GPU-friendly transforms, reduced motion short-circuit |
| Starfield | Three.js Points; limited particles + adaptive pixel ratio |
| Typing Effect | Defer via `requestIdleCallback` (fallback timeout) |
| Scroll Reveal | IntersectionObserver + graceful fallback |
| RTL Fidelity | Direction-aware spacing + preserved marquee direction |
| Fonts Loading | Preconnect to Google Fonts + separate Arabic font import |

---

## 🔍 SEO & Structured Data

Implemented:

- `meta` description & author
- Open Graph + Twitter card (large image)
- Canonical + hreflang (`en`, `ar`, `x-default`)
- `robots.txt` + `sitemap.xml`
- JSON-LD: `Person`, `WebSite` (with `SearchAction`) both localized.

Planned (optional):

- `BreadcrumbList` (if multi-page expansion)
- `Article` schema for reports/guides
- Social preview custom composite image

---

## ♿ Accessibility Considerations

- Respects `prefers-reduced-motion`
- High contrast accent colors
- Focus visibility opt-in (`user-tabbing` class)
- Semantic sections + meaningful alt text (needs continuous curation)

Roadmap:

- Skip link & landmarks
- ARIA roles refinement
- Color contrast automated audit (Lighthouse / axe)

---

## 🧪 CI Pipeline

Workflow (`.github/workflows/ci.yml`):

1. Checkout
2. Node setup w/ dependency cache
3. `npm ci`
4. Prettier check
5. Tailwind build (`dist/style.css`)
6. Upload artifact (for deploy or preview pipelines)

Extendable targets:

- Add Pages deploy after merge
- Add Lighthouse CI / Pa11y checks

---

## 🚀 Deployment (Planned Enhancement)

Add a GitHub Pages deploy job (after build on `main`). Optionally introduce:

```yaml
on: push:
	branches: [ main ]
```

With a step using `actions/upload-pages-artifact` + `actions/deploy-pages`.

Future: PWA (manifest + service worker) for offline + installability.

---

## 📦 Scripts Reference

| Script | Purpose |
|--------|---------|
| `dev` | Watch CSS + serve locally |
| `watch:css` | Tailwind watch only |
| `build` | Production CSS build/minify |
| `format` | Prettier write |
| `format:check` | Prettier verify |

---

## 🛣 Roadmap (Curated)

- [ ] Accessibility: skip link, keyboard trap audit
- [ ] Performance: pre-generate social share image (1200×630)
- [ ] Add HTTP security headers (via deploy layer)
- [ ] PWA: manifest + offline cache of critical assets
- [ ] Add analytics (privacy-friendly, e.g., Plausible)
- [ ] Automated visual regression (optional)
- [ ] Expand multilingual content (blog/articles)

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

- TailwindCSS team for an elegant utility-first framework
- Three.js for lightweight WebGL abstractions
- IBM Plex & Inter type designers

---

---

Crafted with clean architecture, semantic HTML, and future extensibility in mind.
