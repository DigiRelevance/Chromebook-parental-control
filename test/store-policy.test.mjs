// Chrome Web Store readiness: the checks the store's automated review runs
// before a human looks, applied to the exact file set the release zip ships.
//
// What this cannot prove: single purpose, honest data-use disclosures and a
// truthful listing. Those are the human half of the review; see the guide.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const ext = path.join(root, 'extension');
const read = (p) => fs.readFileSync(path.join(ext, p), 'utf8');
const manifest = JSON.parse(read('manifest.json'));

// Same selection rule as publish.yml: everything under extension/ except *.map.
const shipped = (() => {
  const out = [];
  const walk = (dir) => {
    for (const d of fs.readdirSync(path.join(ext, dir), { withFileTypes: true })) {
      const rel = path.join(dir, d.name);
      if (d.isDirectory()) walk(rel);
      else if (!rel.endsWith('.map')) out.push(rel);
    }
  };
  walk('');
  return out.sort();
})();

// Every permission the extension may request, with the justification the store listing uses.
// Adding a permission means adding it here on purpose, with its justification.
const PERMISSION_JUSTIFICATIONS = {
  alarms: 'wake once a minute to meter time and refresh the rules',
  declarativeNetRequest: 'block or redirect navigations inside Chrome without reading traffic',
  idle: 'do not count time while the child is away from the keyboard',
  storage: 'keep the pairing details and rules on the device',
  tabs: 'read the hostname of the focused tab to meter time against it',
};
const HOST_JUSTIFICATION = { '<all_urls>': 'the parent may block any site; rules must be able to match every host' };

const pngSize = (buf) => {
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'IHDR');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

test('STORE manifest: identity fields are within store limits', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.ok(typeof manifest.name === 'string' && manifest.name.trim().length > 0 && manifest.name.length <= 75, 'name ≤ 75 chars');
  assert.ok(typeof manifest.description === 'string' && manifest.description.length > 0 && manifest.description.length <= 132, 'description ≤ 132 chars');
  assert.match(manifest.version, /^\d+(\.\d+){0,3}$/, 'version is 1–4 dot-separated integers');
  for (const part of manifest.version.split('.')) assert.ok(Number(part) <= 65535 && !/^0\d/.test(part), 'version parts ≤ 65535, no leading zeros');
  assert.ok(Number(manifest.minimum_chrome_version) >= 88, 'minimum_chrome_version set (MV3 needs 88+)');
  assert.match(manifest.homepage_url || '', /^https:\/\//, 'homepage_url is an https URL');
  assert.equal(manifest.update_url, undefined, 'store-hosted items must not set update_url');
});

test('STORE manifest: only known top-level keys (unknown keys are review warnings)', () => {
  const known = ['manifest_version', 'name', 'description', 'version', 'homepage_url', 'minimum_chrome_version',
    'icons', 'action', 'background', 'permissions', 'host_permissions', 'web_accessible_resources', 'default_locale'];
  for (const k of Object.keys(manifest)) assert.ok(known.includes(k), `unexpected manifest key ${k}`);
});

test('STORE icons: 16, 32, 48 and 128 declared, shipped, PNG, and exactly that size', () => {
  for (const size of ['16', '32', '48', '128']) {
    for (const map of [manifest.icons, manifest.action?.default_icon]) {
      const rel = map?.[size];
      assert.ok(rel, `icon ${size} declared`);
      assert.ok(shipped.includes(rel), `${rel} is shipped`);
      assert.ok(rel.endsWith('.png'), `${rel} is PNG`);
      const { w, h } = pngSize(fs.readFileSync(path.join(ext, rel)));
      assert.equal(`${w}x${h}`, `${size}x${size}`, `${rel} dimensions`);
    }
  }
});

test('STORE permissions: every permission is on the justified list, nothing optional or extra', () => {
  assert.deepEqual([...manifest.permissions].sort(), Object.keys(PERMISSION_JUSTIFICATIONS).sort(), 'permissions == justified set');
  assert.deepEqual(manifest.host_permissions, Object.keys(HOST_JUSTIFICATION));
  assert.equal(manifest.optional_permissions, undefined);
  assert.equal(manifest.optional_host_permissions, undefined);
  for (const [p, why] of Object.entries({ ...PERMISSION_JUSTIFICATIONS, ...HOST_JUSTIFICATION })) assert.ok(why.length > 20, `justification for ${p}`);
});

test('STORE code: no remotely hosted code, no dynamic code, default CSP kept', () => {
  assert.equal(manifest.content_security_policy, undefined, 'default MV3 CSP (no remote, no eval)');
  assert.equal(manifest.background?.type, 'module');
  assert.equal(manifest.background?.service_worker, 'background.js');
  for (const f of shipped.filter((f) => f.endsWith('.js'))) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/\beval\s*\(|new\s+Function\s*\(|importScripts\s*\(/.test(src), `${f}: dynamic code`);
    assert.ok(!/import\s*\(\s*['"`]https?:/.test(src) && !/<script[^>]+src=["']https?:/.test(src), `${f}: remote script`);
    const urls = [...src.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
    assert.deepEqual(urls, [], `${f}: hard-coded network endpoints ${urls.join(', ')}`);
  }
  for (const f of shipped.filter((f) => f.endsWith('.html'))) {
    const html = read(f);
    assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>\s*\S/i.test(html), `${f}: inline script`);
    assert.ok(!/\son[a-z]+\s*=/i.test(html), `${f}: inline handler`);
    for (const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) assert.ok(!/^(https?:)?\/\//.test(m[1]), `${f}: remote resource ${m[1]}`);
  }
});

test('STORE package: the shipped file set is exactly what a reviewer expects', () => {
  const allowed = /\.(js|html|json|png|svg|css)$/;
  for (const f of shipped) {
    assert.ok(allowed.test(f), `${f}: unexpected file type`);
    assert.ok(!f.split(path.sep).some((s) => s.startsWith('.')), `${f}: hidden file`);
    assert.ok(!f.includes('node_modules'), f);
  }
  assert.ok(shipped.includes('manifest.json') && shipped.includes('background.js') && shipped.includes('popup.html') && shipped.includes('popup.js'));
  assert.ok(shipped.includes('pages/blocked.html') && shipped.includes('vendor/core.js'));
  const total = shipped.reduce((n, f) => n + fs.statSync(path.join(ext, f)).size, 0);
  assert.ok(total < 2 * 1024 * 1024, `package is ${total} bytes; keep it small`);
  for (const f of manifest.web_accessible_resources?.flatMap((w) => w.resources) || []) assert.ok(shipped.includes(f), `web-accessible ${f} shipped`);
  assert.deepEqual(manifest.web_accessible_resources, [{ resources: ['pages/blocked.html'], matches: ['http://*/*', 'https://*/*'] }]);
});

test('STORE listing prerequisites: privacy policy and justifications exist in the repository', () => {
  const privacy = fs.readFileSync(path.join(root, 'PRIVACY.md'), 'utf8');
  for (const must of ['hostname', 'minutes', 'parent', '90 days', 'alarms', 'declarativeNetRequest', 'idle', 'storage', 'tabs', '<all_urls>']) {
    assert.ok(privacy.toLowerCase().includes(must.toLowerCase()), `PRIVACY.md mentions ${must}`);
  }
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.ok(readme.includes('PRIVACY.md'), 'README links the privacy policy');
  assert.ok(readme.includes('Chrome Web Store'), 'README describes the store install path');
});

test('STORE transparency: popup and lock page tell the user what is happening', () => {
  const popup = read('popup.html');
  assert.ok(/pair/i.test(popup) && /console/i.test(popup), 'popup explains pairing with the parent console');
  const lock = read('pages/blocked.html');
  assert.ok(/reason/i.test(lock) && /id="url"/.test(lock), 'lock page shows the site and the reason');
});
