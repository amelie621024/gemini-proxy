const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

const server = http.createServer((req, res) => {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
 res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
 if (req.method === 'OPTIONS') {
 res.writeHead(200);
 res.end();
 return;
 }

 const url = new URL(req.url, `http://localhost:${PORT}`);
 
 if (!url.pathname.startsWith('/v1beta/')) {
 res.writeHead(404, { 'Content-Type': 'application/json' });
 res.end(JSON.stringify({ error: 'Not found' }));
 return;
 }

 const options = {
 hostname: 'generativelanguage.googleapis.com',
 path: url.pathname + url.search,
 method: req.method,
 headers: {
 'Content-Type': 'application/json',
 'x-goog-api-key': API_KEY
 }
 };

 const proxyReq = https.request(options, (proxyRes) => {
 res.setHeader('Content-Type', 'application/json');
 proxyRes.pipe(res);
 });

 proxyReq.on('error', (e) => {
 res.writeHead(500, { 'Content-Type': 'application/json' });
 res.end(JSON.stringify({ error: e.message }));
 });

 if (req.method !== 'GET') {
 req.pipe(proxyReq);
 } else {
 proxyReq.end();
 }
});

server.listen(PORT, '0.0.0.0', () => {
 console.log(`Proxy server running on port ${PORT}`);
});
