import { execFile } from 'node:child_process';

const url = process.env.LH_URL || 'http://localhost:5500/';

execFile('lighthouse', [
  url,
  '--quiet',
  '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
  '--only-categories=performance,accessibility,seo',
  '--output=json',
  '--output-path=./lighthouse-report.json'
], (err, stdout, stderr) => {
  if (err) {
    console.error('Lighthouse failed', err.message);
    process.exit(1);
  }
  console.log('Lighthouse completed. Report: lighthouse-report.json');
  if (stderr) console.error(stderr);
});
