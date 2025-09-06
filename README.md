# 🚀 AI / ML Engineer Portfolio

Multilingual (English + Arabic) personal portfolio showcasing machine learning, LLM, and retrieval engineering work. Fast, accessible, offline‑capable, and privacy‑friendly.

**Live:** [English](https://mohammednasserahmed.github.io/portfolio/) · [العربية](https://mohammednasserahmed.github.io/portfolio/ar/)

![Portfolio preview](images/website-photo.png)

---

## ✨ Visitor Highlights

| Area          | What You Get                                                                      |
| ------------- | --------------------------------------------------------------------------------- |
| Speed         | Lightweight pages, optimized assets, PWA offline support                          |
| Multilingual  | Complete Arabic RTL version with mirrored layout                                  |
| Theming       | Dark / light mode persists your preference                                        |
| Accessibility | Reduced‑motion support, semantic structure, keyboard friendly                     |
| Projects      | Curated ML / LLM / retrieval builds with tech stack pills & optional GitHub links |
| Publications  | Selected reports & guides (bilingual metadata)                                    |
| Installable   | Add to Home Screen (manifest + service worker)                                    |

---

## 🧪 Core Features

- Progressive Web App (offline fallback + caching strategies)
- Structured data (JSON‑LD graph) for richer search appearance
- SEO basics: canonical, hreflang, sitemap, meta + social preview tags
- Dynamic content rendered from locale JSON (easy to extend)
- Performance‑first animations (defer heavy tasks & respect prefers‑reduced‑motion)

---

## 🛠 Tech Stack (Concise)

| Layer         | Tooling                                    |
| ------------- | ------------------------------------------ |
| Styling       | Tailwind CSS + CSS variables               |
| Interactivity | Vanilla JS + Three.js starfield (deferred) |
| Build         | Tailwind CLI + light custom JS strip step  |
| Quality       | ESLint · Prettier · Lighthouse check       |
| Content       | JSON + JSON Schema validation (Ajv)        |
| Delivery      | GitHub Pages (Actions pipeline)            |

---

## 📂 Repository Map

```text
index.html        # EN page
ar/index.html     # AR localized page
data/             # content.json + content.ar.json + schema
js/main.js        # runtime + dynamic rendering
dist/             # built assets (generated)
sw.js             # service worker
manifest.webmanifest
```

---

## � Quick Start (For Local Viewing)

```bash
git clone <this-repo>
cd portfolio
npm install
npm run dev   # opens local server + tailwind watch
```

Visit: [http://localhost:5500/](http://localhost:5500/) (English) · [http://localhost:5500/ar/](http://localhost:5500/ar/) (Arabic)

Production build (strips dev overlay):

```bash
npm run build:prod
```

---

## 🔒 Privacy

No analytics or trackers. Future metrics (if added) will use a lightweight, cookie‑free platform.

---

## 🤝 Feedback

Ideas or accessibility improvements? Open an issue. PRs for small fixes welcome.

---

## 📝 License

MIT – see `LICENSE`.

---

## 🧩 Developer Appendix (Optional Reading)

> This section is intentionally separated to keep the top of the README visitor‑focused.

**Dev Overlay:** Append `#admin=dev` locally (not on GitHub Pages) to open a JSON editor for the current locale content. The code lives between `/* DEV-OVERLAY-START */` and `/* DEV-OVERLAY-END */` and is stripped in production builds.

**Schema Validation:**

```bash
npm run validate:content
```

Ensures `data/content*.json` match `data/content.schema.json`.

### Selected Design Principles

- Progressive enhancement over framework dependence
- Minimize layout thrash (transform / opacity animations only)
- Respect system preferences (color scheme & motion)
- Localization & RTL built in from the start

### High‑Level Architecture

```text
HTML (EN / AR)
	└─ JS runtime (main.js)
			├─ Fetch locale JSON
			├─ Render sections (summary / projects / skills / publications)
			├─ Theme + accessibility helpers
			└─ (Dev only) overlay for rapid JSON preview

Service Worker
	├─ Network-first: HTML
	├─ SWR: CSS / JS
	└─ Cache-first: images + offline fallback

```

---

**Security Note:** Image optimization via `sharp` replaces deprecated imagemin chain; keep dependencies updated (`npm audit`).

---

Crafted with performance, accessibility, and multilingual reach in mind.
