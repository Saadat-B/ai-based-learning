import { createServer } from 'node:http';

const PORT = 4201;

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const body = JSON.stringify({ status: 'ok', uptime: process.uptime() });

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    });
    res.end(body);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`raw node:http server on http://localhost:${PORT}`);
});
