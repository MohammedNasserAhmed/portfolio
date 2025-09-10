import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Simple build step: copy js/main.js to dist/main.js stripping DEV overlay when NODE_ENV=production
const __file = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__file), '..');
const srcPath = path.join(root, 'js', 'main.js');
const outDir = path.join(root, 'dist');
const outPath = path.join(outDir, 'main.js');

fs.mkdirSync(outDir, { recursive: true });
let code = fs.readFileSync(srcPath, 'utf8');

const prod = process.env.NODE_ENV === 'production';
if (prod) {
    // Remove everything between /* DEV-OVERLAY-START */ and /* DEV-OVERLAY-END */
    code = code.replace(
        /\/\* DEV-OVERLAY-START \*\/[\s\S]*?\/\* DEV-OVERLAY-END \*\//g,
        '\n// overlay stripped for production\n'
    );
}

// Lightweight minify: remove consecutive blank lines
code = code.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(outPath, code, 'utf8');

// When in production, also emit content-hashed assets (JS & CSS), update HTML, write manifest, and prune older bundles.
if (prod) {
    const KEEP_COUNT = parseInt(process.env.KEEP_ASSET_VERSIONS || '2', 10); // configurable retain count

    // Helper to hash and truncate
    const makeHash = (contents) =>
        crypto.createHash('sha256').update(contents).digest('hex').slice(0, 10);

    // JS hashing
    const jsHash = makeHash(code);
    const hashedJS = `main.${jsHash}.js`;
    fs.writeFileSync(path.join(outDir, hashedJS), code, 'utf8');

    // CSS hashing (if style.css exists)
    let cssHash = 'na';
    let hashedCSS = null;
    const cssPath = path.join(outDir, 'style.css');
    if (fs.existsSync(cssPath)) {
        const css = fs.readFileSync(cssPath, 'utf8');
        cssHash = makeHash(css);
        hashedCSS = `style.${cssHash}.css`;
        fs.writeFileSync(path.join(outDir, hashedCSS), css, 'utf8');
    }

    // Composite version hash (stable order)
    const versionHash = makeHash(jsHash + ':' + cssHash);

    // Update HTML pages
    const pages = [path.join(root, 'index.html'), path.join(root, 'ar', 'index.html')];
    pages.forEach((p) => {
        if (!fs.existsSync(p)) return;
        let html = fs.readFileSync(p, 'utf8');
        // Replace JS reference
        html = html.replace(/dist\/main(?:\.[a-f0-9]{10})?\.js[^"']*/g, `dist/${hashedJS}`);
        // Replace CSS link (href="dist/style*.css")
        if (hashedCSS) {
            html = html.replace(/dist\/style(?:\.[a-f0-9]{10})?\.css/g, `dist/${hashedCSS}`);
        }
        // Inject or replace meta tag
        if (/meta name="asset-version"/i.test(html)) {
            html = html.replace(
                /<meta name="asset-version"[^>]*>/i,
                `<meta name="asset-version" content="${versionHash}">`
            );
        } else {
            html = html.replace(
                /<meta name="apple-mobile-web-app-status-bar-style"[^>]*>/i,
                (m) => `${m}\n        <meta name="asset-version" content="${versionHash}">`
            );
        }
        fs.writeFileSync(p, html, 'utf8');
    });

    // Write manifest
    const manifest = {
        version: versionHash,
        js: `dist/${hashedJS}`,
        css: hashedCSS ? `dist/${hashedCSS}` : null,
        generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(
        path.join(outDir, 'asset-manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf8'
    );

    // Prune old hashed bundles keeping last N by mtime
    const prune = (pattern) => {
        const files = fs
            .readdirSync(outDir)
            .filter((f) => pattern.test(f))
            .map((f) => ({ f, t: fs.statSync(path.join(outDir, f)).mtimeMs }))
            .sort((a, b) => b.t - a.t);
        const toDelete = files.slice(KEEP_COUNT);
        toDelete.forEach(({ f }) => {
            try {
                fs.unlinkSync(path.join(outDir, f));
                console.log(`[build] Pruned old asset: ${f}`);
            } catch (e) {
                console.warn('[build] Failed to prune', f, e.message);
            }
        });
    };
    prune(/^main\.[a-f0-9]{10}\.js$/);
    prune(/^style\.[a-f0-9]{10}\.css$/);

    console.log(
        `[build] Hashed bundles emitted JS=${hashedJS}${hashedCSS ? ' CSS=' + hashedCSS : ''} version=${versionHash}`
    );
    console.log('[build] Manifest written: dist/asset-manifest.json');
}

console.log(`[build] main.js written to dist (prod=${prod})`);
