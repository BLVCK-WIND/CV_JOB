// Generates A4 PDFs (EN + VI) from the production build using headless Chrome/Edge.
// Output: dist/cv/*.pdf (served by the site) and public/cv/*.pdf (so `npm run dev` links work).
import { createServer } from 'node:http';
import { readFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, normalize } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = resolve('dist');
const OUT_DIRS = [join(ROOT, 'cv'), resolve('public', 'cv')];
const FILES = { en: 'Nguyen-Duy-Phong-CV-EN.pdf', vi: 'Nguyen-Duy-Phong-CV-VI.pdf' };

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

async function main() {
  if (!existsSync(join(ROOT, 'index.html'))) {
    console.error('[pdf] dist/index.html not found — run `npm run build:web` first.');
    process.exit(1);
  }
  const browser = findBrowser();
  if (!browser) {
    console.warn('[pdf] No Chrome/Edge found (set CHROME_PATH). Skipping PDF generation.');
    return;
  }

  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = normalize(join(ROOT, urlPath));
      if (!file.startsWith(ROOT)) throw new Error('forbidden');
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();

  try {
    for (const dir of OUT_DIRS) await mkdir(dir, { recursive: true });

    for (const [lang, name] of Object.entries(FILES)) {
      const target = join(OUT_DIRS[0], name);
      await run(browser, [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-pdf-header-footer',
        '--virtual-time-budget=5000',
        `--print-to-pdf=${target}`,
        `http://127.0.0.1:${port}/index.html?lang=${lang}`,
      ]);
      const buf = await readFile(target);
      const pages = (buf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
      console.log(`[pdf] ${name}: ${pages} page(s), ${(buf.length / 1024).toFixed(0)} KB`);
      if (pages !== 1) console.warn(`[pdf] WARNING: ${name} is not exactly one page.`);
      for (const dir of OUT_DIRS.slice(1)) await copyFile(target, join(dir, name));
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('[pdf] Failed:', err.message);
  process.exit(1);
});
