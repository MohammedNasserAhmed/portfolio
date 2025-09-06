# my-portfolio

A clean, modern, and fully responsive portfolio website for M. N. Jaber, an AI Engineer (PhD). Built with HTML, Tailwind (CDN), and lightweight custom CSS/JS.

## Structure

- `index.html` – Main single-page application
- `css/style.css` – Extracted custom styles + theme variables
- `js/main.js` – Interactive behavior (typing effect support, theme toggle, etc.)
- `images/` – Site images
- `docs/` – Non-inline assets like reports and guides
- `.prettierrc.json` – Formatting configuration
- `package.json` – Dev tooling (Prettier only)

## Workflow

1. Edit markup in `index.html`.
2. Add or adjust styles in `css/style.css` (avoid re-adding inline `<style>` blocks).
3. Add scripts or enhancements in `js/main.js`.
4. Put new media assets in `images/` (or `docs/` if they are publication assets).
5. Run formatter before commits.

## Development

Install dev dependency (Prettier):

```bash
npm install
```

Format all supported files:

```bash
npm run format
```

Check (no write):

```bash
npm run format:check
```

## Theme Toggle

Dark theme loads by default; site auto-detects the OS preference on first visit. User selection (dark/light) is stored in `localStorage` under `portfolio-theme`.

## Future Enhancements (Ideas)

- Add accessibility audit (ARIA landmarks & reduced motion preference)
- Lighthouse performance budget & asset compression
- Replace CDN Tailwind with a build step (optional) for purging unused classes
- Deploy workflow (GitHub Pages / Netlify) with CI format check

## License

See `LICENSE`.
