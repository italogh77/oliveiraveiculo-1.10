import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const projectRoot = new URL('..', import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1));
const heroPath = join(projectRoot, 'src', 'pages', 'HomePage.jsx');
const cssPath = join(projectRoot, 'src', 'index.css');
const heroSource = readFileSync(heroPath, 'utf8');
const cssSource = readFileSync(cssPath, 'utf8');

test('hero fills the visible viewport and uses an accessible background video', () => {
  assert.match(heroSource, /min-h-\[100svh\]/);
  assert.match(heroSource, /<video[\s\S]*autoPlay[\s\S]*muted[\s\S]*loop[\s\S]*playsInline/);
  assert.match(heroSource, /poster=\{publicAsset\('hero-drone-mobile-poster\.jpg'\)\}/);
  assert.match(heroSource, /hero-drone-mobile\.webm/);
  assert.match(heroSource, /hero-drone-mobile\.mp4/);
  assert.match(heroSource, /hero-drone-mobile-poster\.jpg/);
  assert.match(heroSource, /<source[\s\S]*media="\(max-width: 767px\)"/);
  assert.match(heroSource, /className="ov-hero-video/);
  assert.match(heroSource, /<img[\s\S]*loja-oliveira-banner-2048\.png/);
});

test('hero video is disabled when the visitor requests reduced motion', () => {
  assert.match(cssSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.ov-hero-video[\s\S]*display:\s*none/);
});

test('generated hero media exists and stays within the mobile delivery budget', () => {
  for (const file of ['hero-drone-mobile.webm', 'hero-drone-mobile.mp4', 'hero-drone-mobile-poster.jpg']) {
    const assetPath = join(projectRoot, 'public', file);
    assert.equal(existsSync(assetPath), true, `${file} is missing`);
    assert.ok(statSync(assetPath).size < 6 * 1024 * 1024, `${file} exceeds 6 MB`);
  }
});
