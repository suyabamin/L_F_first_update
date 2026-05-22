const http = require('http');
const { routeRequest } = require('./server/handlers');
const { ping, driver } = require('./server/db');
const { ensureBuckets } = require('./server/storage');

const port = Number(process.env.PORT || 8000);
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const requestCounts = new Map();

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
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

  if (count > Number(process.env.RATE_LIMIT_PER_MINUTE || 240)) {
    res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, message: 'Too many requests. Please try again shortly.' }));
    return true;
  }
  return false;
}

async function start() {
  ensureBuckets();
  try {
    await ping();
    console.log(`Database ready (${driver}, file: database/lost_found_app.sqlite)`);
    console.log('Demo login: rahim@example.com / password');
  } catch (error) {
    console.error('Database failed to start:', error.message);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    applySecurityHeaders(res);
    if (rateLimit(req, res)) return;
    if (shouldProxy(req.url)) {
      proxyToBackend(req, res).catch(() => routeRequest(req, res));
      return;
    }
    routeRequest(req, res);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or set PORT=8001`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(`Lost & Found app running at http://localhost:${port}`);
    console.log('Open http://localhost:8000/Landing%20Page.html');
  });
}

function shouldProxy(url) {
  return url.startsWith('/backend-php/') || url.startsWith('/api/') || url.startsWith('/uploads/') || url.startsWith('/socket.io/');
}

async function proxyToBackend(req, res) {
  const target = new URL(req.url, backendUrl);
  const headers = { ...req.headers, host: target.host };
  const response = await fetch(target, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
    duplex: ['GET', 'HEAD'].includes(req.method) ? undefined : 'half',
    redirect: 'manual'
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
}

start();
