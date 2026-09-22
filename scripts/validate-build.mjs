import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const home = readFileSync(join(root, 'dist/index.html'), 'utf8');
const homepageSource = readFileSync(join(root, 'src/pages/index.astro'), 'utf8');
const gridSignature = [...homepageSource.matchAll(/@media \(max-width: [^)]+\)|grid-(?:column|row):\s*[^;]+;/g)].map((match) => match[0]).join('\n');
assert.equal(createHash('sha256').update(gridSignature).digest('hex'), '0f39e76523296879934b58bce364337f68bd0f90d28925c1f1734cdd9f85769d', 'Approved homepage grid and breakpoints');
const count = (name) => [...home.matchAll(/class="([^"]+)"/g)].filter((match) => match[1].split(/\s+/).includes(name)).length;
for (const name of ['research-board', 'identity-hero', 'what-i-do', 'currently', 'personal-connection', 'nagi-penguin']) assert.equal(count(name), 1, name);
assert.ok(count('selected-item') <= 4, 'Selected stories come only from current RSS');
assert.ok(count('article-group') <= 3, 'At most three recent Notes previews');
assert.ok(home.includes('shape-rendering="crispEdges"'));
assert.ok(home.includes('href="https://nagi.tw/"'), 'Production canonical');
assert.ok(home.includes('href="https://notes.nagi.tw/"'), 'Notes homepage link');
for (const route of ['articles', 'topics', 'archive', 'rss.xml']) assert.ok(!existsSync(join(root, 'dist', route)), `No local ${route} system`);
for (const match of home.matchAll(/href="([^"]+)"/g)) {
  const href = match[1];
  assert.ok(!/^\/(articles|topics|archive)(\/|$)/.test(href), `Wrong origin: ${href}`);
  if (href.startsWith('#') || href.startsWith('/#')) assert.ok(home.includes(`id="${href.split('#')[1]}"`), `Missing anchor: ${href}`);
}
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? walk(join(directory, item.name)) : [join(directory, item.name)]);
for (const file of walk(join(root, 'src')).filter((file) => /\.(astro|ts)$/.test(file))) {
  assert.ok(!readFileSync(file, 'utf8').includes('astro:content'), 'Personal site cannot import Notes collection');
}
assert.ok(!existsSync(join(root, 'src/data/notes-preview.json')), 'No saved Notes snapshot');
for (const match of home.matchAll(/href="(https:\/\/notes\.nagi\.tw\/articles\/[^"?#]+)"/g)) assert.ok(match[1].startsWith('https://notes.nagi.tw/articles/'), `Invalid Notes link: ${match[1]}`);
console.log('Personal site structure, cross-site links, anchors, canonical and content isolation: PASS');
