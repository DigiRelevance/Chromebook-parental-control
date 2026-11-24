/**
 * Renders the SCOUT brand assets from the SVG sources in brand/:
 *   extension/icons/icon{16,32,48,128}.png   Chrome extension icons (transparent)
 *   brand/store/social-preview.png           GitHub social preview, 1280x640
 *   brand/store/marquee.png                  Chrome Web Store marquee tile, 1400x560
 *   brand/store/tile-small-paper.png         Chrome Web Store small tile, 440x280
 *   brand/store/tile-small-brass.png         Chrome Web Store small tile, 440x280
 *
 * Run by hand after changing anything in brand/ and commit the output:
 *   PLAYWRIGHT_MODULE=/path/to/playwright node scripts/brand-assets.mjs
 * Needs network access for the three Google Fonts the tiles use. Icons do not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(new URL('..', import.meta.url).pathname);
// Comments in the SVG sources are left in place: browsers ignore them, and
// stripping them with a regex is not a sanitiser (CodeQL js/incomplete-multi-character-sanitization).
const svg = (name) => fs.readFileSync(path.join(root, 'brand', name), 'utf8');
const sized = (name, px) => svg(name).replace('<svg ', `<svg width="${px}" height="${px}" `);

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">';
const T = { paper: '#f7f4ee', paper2: '#efeadd', card: '#fffdf9', line: '#d9d2c2', ink: '#22201c', inkSoft: '#5c574d', brass: '#8a6d2f', brassSoft: '#b79a55' };
const serif = "font-family: Newsreader, Georgia, serif; font-weight: 500;";
const sans = "font-family: Archivo, 'Helvetica Neue', Arial, sans-serif;";

const page = (w, h, body, bg = T.paper) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>html,body{margin:0}body{width:${w}px;height:${h}px;overflow:hidden;background:${bg};color:${T.ink};${sans}}</style></head><body>${body}</body></html>`;

const tiles = {
  'brand/store/social-preview.png': [1280, 640, page(1280, 640, `
    <div style="box-sizing:border-box;width:1280px;height:640px;padding:72px 96px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="font-size:22px;color:${T.inkSoft}">Self-hosted ChromeOS Oversight &amp; Usage Tracker for the family</div>
      <div style="display:flex;align-items:center;gap:56px">
        ${sized('mark.svg', 200)}
        <div><div style="${serif}font-size:168px;line-height:.9;letter-spacing:-.02em">SCOUT</div>
        <div style="${serif}font-weight:400;font-size:44px;line-height:1.2;margin-top:18px">Your rules, kept at home.</div></div>
      </div>
      <div style="font-family:'IBM Plex Mono',Menlo,monospace;font-size:20px;color:${T.inkSoft}">marfleetn/Chromebook-parental-control</div>
    </div>`)],
  'brand/store/marquee.png': [1400, 560, page(1400, 560, `
    <div style="box-sizing:border-box;width:1400px;height:560px;padding:72px 96px;display:flex;align-items:center;justify-content:space-between;gap:72px">
      <div style="max-width:700px">
        <div style="${serif}font-size:132px;line-height:.9;letter-spacing:-.02em">SCOUT</div>
        <div style="${serif}font-weight:400;font-size:40px;line-height:1.2;margin-top:22px">Parental controls that never leave the house.</div>
        <div style="font-size:22px;line-height:1.45;color:${T.inkSoft};margin-top:18px">Allowed hours, daily limits and blocked sites, set on your own console.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;width:420px">
        <div style="background:${T.card};border:1px solid ${T.line};border-radius:3px;padding:20px 24px"><div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${T.inkSoft}">Allowed hours</div><div style="font-family:'IBM Plex Mono',Menlo,monospace;font-size:30px;margin-top:6px">08:00–20:00</div></div>
        <div style="background:${T.card};border:1px solid ${T.line};border-radius:3px;padding:20px 24px;display:flex;justify-content:space-between;align-items:baseline"><div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${T.inkSoft}">Daily limit</div><div style="font-size:22px;margin-top:6px">youtube.com</div></div><div style="font-family:'IBM Plex Mono',Menlo,monospace;font-size:22px">30 min/day</div></div>
        <div style="background:${T.card};border:1px solid ${T.line};border-radius:3px;padding:20px 24px;display:flex;justify-content:space-between;align-items:baseline"><div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${T.inkSoft}">Blocked sites</div><div style="font-size:22px;margin-top:6px">roblox.com</div></div><div style="font-size:16px;font-weight:600;color:${T.inkSoft}">Blocked</div></div>
      </div>
    </div>`)],
  'brand/store/tile-small-paper.png': [440, 280, page(440, 280, `
    <div style="box-sizing:border-box;width:440px;height:280px;padding:40px 44px;display:flex;flex-direction:column;justify-content:space-between">
      ${sized('mark.svg', 72)}
      <div><div style="${serif}font-size:64px;line-height:.9;letter-spacing:-.02em">SCOUT</div>
      <div style="${serif}font-weight:400;font-size:22px;margin-top:10px">Your rules, kept at home.</div></div>
    </div>`)],
  'brand/store/tile-small-brass.png': [440, 280, page(440, 280, `
    <div style="box-sizing:border-box;width:440px;height:280px;padding:40px 44px;display:flex;flex-direction:column;justify-content:space-between;color:${T.paper}">
      ${sized('mark.svg', 72).replace(/#8a6d2f/g, 'SWAP').replace(/#f7f4ee/g, T.brass).replace(/SWAP/g, T.paper)}
      <div><div style="${serif}font-size:64px;line-height:.9;letter-spacing:-.02em">SCOUT</div>
      <div style="${serif}font-weight:400;font-size:22px;margin-top:10px">Screen time, set at home.</div></div>
    </div>`, T.brass)],
};

const browser = await chromium.launch();
try {
  for (const [px, file] of [[16, 'mark-16.svg'], [32, 'mark-32.svg'], [48, 'mark.svg'], [128, 'mark.svg']]) {
    const p = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    await p.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${sized(file, px)}</body></html>`);
    const out = path.join(root, 'extension/icons', `icon${px}.png`);
    await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
    console.log('wrote', path.relative(root, out));
    await p.close();
  }
  for (const [rel, [w, h, html]] of Object.entries(tiles)) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready); // eslint-disable-line no-undef -- runs in the page
    const out = path.join(root, rel);
    await p.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
    console.log('wrote', rel);
    await p.close();
  }
} finally {
  await browser.close();
}
