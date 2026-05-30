const http = require('http');
const { routeRequest } = require('./server/handlers');
const { ping, driver } = require('./server/db');
const { ensureBuckets } = require('./server/storage');

const port = Number(process.env.PORT || 8000);
// Target for Node.js API (MERN part)
const apiTarget = process.env.API_URL || 'http://localhost:5000';
// Target for PHP backend (Legacy part) - Default to common XAMPP/WAMP port
const phpTarget = process.env.PHP_URL || 'http://localhost:80';

const requestCounts = new Map();

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

function rateLimit(req, res) {
  const ip = req.socket.remoteAddress || 'local';
  const minute = Math.floor(Date.now() / 60000);
  const key = `${ip}:${minute}`;
  const count = (requestCounts.get(key) || 0) + 1;
  requestCounts.set(key, count);

  if (requestCounts.size > 1000) {
    for (const savedKey of requestCounts.keys()) {
      if (!savedKey.endsWith(`:${minute}`)) requestCounts.delete(savedKey);
    }
  }

  if (count > 500) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Too many requests' }));
    return true;
  }
  return false;
}

async function start() {
  ensureBuckets();
  try {
    await ping();
    console.log(`[INFO] Local SQLite ready (${driver})`);
    console.log(`[INFO] Proxying /api/* and /socket.io/* to ${apiTarget}`);
    console.log(`[INFO] Proxying /backend-php/* to ${phpTarget} (or falling back to local handlers)`);
  } catch (error) {
    console.error('[ERROR] Local database failed:', error.message);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    applySecurityHeaders(res);
    if (rateLimit(req, res)) return;

    const url = req.url;

    // Decide where to route
    if (url.startsWith('/api/') || url.startsWith('/socket.io/')) {
        proxyRequest(req, res, apiTarget);
    } else if (url.startsWith('/backend-php/')) {
        proxyRequest(req, res, phpTarget, true); // Fallback to local handles if PHP fails
    } else {
        routeRequest(req, res);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${port} is in use.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[READY] Application running at http://localhost:${port}`);
    console.log(`[READY] Open http://localhost:${port}/Landing Page.html`);
  });
}

async function proxyRequest(req, res, targetUrl, allowFallback = false) {
  const url = new URL(req.url, targetUrl);
  const headers = { ...req.headers, host: url.host };

  try {
    const response = await fetch(url.href, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: ['GET', 'HEAD'].includes(req.method) ? undefined : 'half',
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (err) {
    if (allowFallback) {
        // Fallback to local SQLite handlers
        try {
            await routeRequest(req, res);
        } catch (fErr) {
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Both proxy and local fallback failed' }));
            }
        }
    } else {
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                message: `Failed to connect to backend at ${targetUrl}. Is it running?`,
                error: err.message
            }));
        }
    }
  }
}

start();
