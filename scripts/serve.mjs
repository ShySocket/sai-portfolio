// Minimal static server for dist/ under the GitHub Pages base path, shared by shots.mjs and a11y.mjs.
// Used instead of `astro preview`, which runs as a lock-guarded background singleton when an AI agent
// is detected and so cannot serve several worktrees on chosen ports at once. Supports Range requests
// so <video> can seek.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const BASE = '/sai-portfolio/';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml',
};

export function serve(dist, port) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!path.startsWith(BASE)) { res.writeHead(302, { location: BASE }).end(); return; }
    let file = normalize(join(dist, path.slice(BASE.length)));
    if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
    let st;
    try { st = statSync(file); if (st.isDirectory()) { file = join(file, 'index.html'); st = statSync(file); } }
    catch { res.writeHead(404).end('not found'); return; }
    const type = TYPES[extname(file)] || 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
      res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1 });
      createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': st.size });
      createReadStream(file).pipe(res);
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// CLI: node scripts/serve.mjs <port>   (serves ../dist; a11y.mjs runs it as a child so Lighthouse's sync exec can't block it)
if (import.meta.url === `file://${process.argv[1]}`) {
  const dist = new URL('../dist', import.meta.url).pathname;
  await serve(dist, Number(process.argv[2]) || 4321);
}
