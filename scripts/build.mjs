import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  code = code.replace(/\/\* DEV-OVERLAY-START \*\/[\s\S]*?\/\* DEV-OVERLAY-END \*\//g, '\n// overlay stripped for production\n');
}

// Lightweight minify: remove consecutive blank lines
code = code.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(outPath, code, 'utf8');
console.log(`[build] main.js written to dist (prod=${prod})`);