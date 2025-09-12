#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

function rimrafDir(dir) {
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) rimrafDir(p);
      else fs.unlinkSync(p);
    }
    fs.rmdirSync(dir);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function main() {
  console.log('📦 Exporting site to /public for Vercel...');
  rimrafDir(publicDir);
  ensureDir(publicDir);

  // Copy root HTML and assets
  const rootFiles = [
    'index.html',
    'offline.html',
    'manifest.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'sw.js'
  ];
  for (const f of rootFiles) {
    const src = path.join(root, f);
    if (fs.existsSync(src)) copyFile(src, path.join(publicDir, f));
  }

  // Copy directories
  const dirs = ['ar', 'images', 'js', 'css'];
  for (const dir of dirs) {
    const src = path.join(root, dir);
    if (fs.existsSync(src)) copyDir(src, path.join(publicDir, dir));
  }

  // Copy built dist assets
  if (fs.existsSync(distDir)) copyDir(distDir, path.join(publicDir, 'dist'));

  // Ensure base path works: for GitHub Pages the base is /portfolio, but for Vercel likely root
  // Our built HTML already references ./dist/... so it should work. If needed, additional rewrites can be added via vercel.json.

  console.log('✅ Export complete: public/');
}

main();
