#!/usr/bin/env node
/**
 * Image optimization script using sharp.
 * - Reads PNG/JPEG from ./images (excluding already optimized dir)
 * - Produces optimized outputs into ./images/optimized maintaining filename
 * - Applies lossless/lossy balance: mozjpeg quality 78, png adaptive palette
 */
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const SRC_DIR = './images';
const OUT_DIR = './images/optimized';

async function ensureDir(p) {
  try { await mkdir(p, { recursive: true }); } catch {}
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'optimized') continue; // skip output dir
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function pretty(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

async function processFile(file) {
  const ext = extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null;
  const img = sharp(file, { limitInputPixels: false });
  const meta = await img.metadata();
  let pipeline = img.clone();
  if (ext === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: 80 });
  } else {
    pipeline = pipeline.jpeg({ mozjpeg: true, quality: 78, chromaSubsampling: '4:4:4' });
  }
  const outPath = join(OUT_DIR, file.split(/[/\\]/).pop());
  const inputSize = (await stat(file)).size;
  const buf = await pipeline.toBuffer();
  await writeFile(outPath, buf);
  const outputSize = buf.length;
  return { file, outPath, inputSize, outputSize, ratio: (outputSize / inputSize) };
}

(async () => {
  await ensureDir(OUT_DIR);
  const tasks = [];
  for await (const file of walk(SRC_DIR)) tasks.push(processFile(file));
  const results = (await Promise.all(tasks)).filter(Boolean);
  if (!results.length) {
    console.log('No images found to optimize.');
    return;
  }
  console.log('Optimized images:');
  for (const r of results) {
    const saved = r.inputSize - r.outputSize;
    console.log(`- ${r.file} → ${r.outPath} ${pretty(r.outputSize)} (saved ${pretty(saved)} / ${(1 - r.ratio)*100|0}% )`);
  }
})();
