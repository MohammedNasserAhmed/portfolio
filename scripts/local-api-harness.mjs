// Lightweight local HTTP server to run api/* handlers for development and tests
import { createServer } from 'http';
import statsHandler from '../api/stats.js';
import visitHandler from '../api/stats/visit.js';
import starHandler from '../api/stats/star.js';

function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  // Normalize trailing slashes
  const path = pathname.replace(/\/$/, '');

  if (path === '/api/stats' && (req.method === 'GET' || req.method === 'OPTIONS')) {
    return statsHandler(req, res);
  }

  if (path === '/api/stats/visit' && (req.method === 'POST' || req.method === 'OPTIONS')) {
    return visitHandler(req, res);
  }

  if (path === '/api/stats/star' && (req.method === 'POST' || req.method === 'OPTIONS')) {
    return starHandler(req, res);
  }

  res.statusCode = 404;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: 'not_found', path: pathname, method: req.method }));
}

export function startLocalApiServer({ port = 3000, host = '127.0.0.1' } = {}) {
  return new Promise((resolve, reject) => {
    const server = createServer(router);
    server.on('error', reject);
    server.listen(port, host, () => {
      console.log(`Local API harness listening at http://${host}:${port}`);
      resolve(server);
    });
  });
}

// If executed directly, start the server and keep it running
if (import.meta.url === `file://${process.argv[1]}`) {
  startLocalApiServer().catch((err) => {
    console.error('Failed to start local API harness:', err);
    process.exit(1);
  });
}
