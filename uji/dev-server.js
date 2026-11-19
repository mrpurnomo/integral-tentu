// Server uji lokal: situs statis + /api/app (fungsi asli) dengan Redis tiruan di memori.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const mem = { h: {}, s: {} };
const redisMock = http.createServer((q, r) => { let b = ''; q.on('data', (d) => (b += d)).on('end', () => { const [c, k, f, v] = JSON.parse(b); let out = null;
  if (c === 'HGETALL') out = Object.entries(mem.h[k] || {}).flat(); else if (c === 'HGET') out = (mem.h[k] || {})[f] ?? null; else if (c === 'HSET') { (mem.h[k] = mem.h[k] || {})[f] = v; out = 1; } else if (c === 'HSETNX') { const h = (mem.h[k] = mem.h[k] || {}); if (Object.prototype.hasOwnProperty.call(h, f)) out = 0; else { h[f] = v; out = 1; } } else if (c === 'HDEL') { delete (mem.h[k] || {})[f]; out = 1; } else if (c === 'DEL') { delete mem.h[k]; delete mem.s[k]; out = 1; } else if (c === 'GET') out = mem.s[k] ?? null; else if (c === 'SET') { mem.s[k] = f; out = 'OK'; }
  r.setHeader('content-type', 'application/json'); r.end(JSON.stringify({ result: out })); }); }).listen(3201);
delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN; process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:3201'; process.env.UPSTASH_REDIS_REST_TOKEN = 'x'; 
const handler = require(ROOT + '/api/app.js');
http.createServer((q, r) => { const u = q.url.split('?')[0];
  if (u === '/api/app') { let b = ''; q.on('data', (d) => (b += d)).on('end', () => { q.body = b ? JSON.parse(b) : {}; const res = { statusCode: 200, setHeader() {}, end(t) { r.writeHead(this.statusCode, { 'content-type': 'application/json', 'x-dev-redis': 'tiruan' }); r.end(t); } }; handler(q, res); }); return; }
  const f = path.join(ROOT, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end('404'); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : (f.endsWith('.pdf') ? 'application/pdf' : 'text/plain'), 'cache-control': 'no-store' }); r.end(d); }); }).listen(3200, () => console.log('dev 3200'));
