// Run a quick end-to-end smoke test against the local API harness
import { startLocalApiServer } from './local-api-harness.mjs';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const server = await startLocalApiServer();
  const base = 'http://127.0.0.1:3000/api';

  try {
    const cid = `smoke_${Math.random().toString(36).slice(2)}`;

    // GET /stats (should return baseline numbers)
    let res = await fetch(`${base}/stats?cid=${encodeURIComponent(cid)}`, { cache: 'no-store' });
    let data = await res.json();
    console.log('GET /stats ->', data);

    // POST /stats/visit (increments if >24h since last visit for this cid)
    res = await fetch(`${base}/stats/visit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: cid })
    });
    data = await res.json();
    console.log('POST /stats/visit ->', data);

    // POST /stats/star desired=true (add star)
    res = await fetch(`${base}/stats/star`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: cid, desired: true })
    });
    data = await res.json();
    console.log('POST /stats/star desired=true ->', data);

    // POST /stats/star desired=false (remove star)
    res = await fetch(`${base}/stats/star`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: cid, desired: false })
    });
    data = await res.json();
    console.log('POST /stats/star desired=false ->', data);

  } finally {
    await sleep(100);
    server.close();
  }
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
