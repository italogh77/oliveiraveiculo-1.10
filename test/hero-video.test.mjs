import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const projectRoot = new URL('..', import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1));
const heroPath = join(projectRoot, 'src', 'pages', 'HomePage.jsx');
const cssPath = join(projectRoot, 'src', 'index.css');
const heroSource = readFileSync(heroPath, 'utf8');
const cssSource = readFileSync(cssPath, 'utf8');

test('hero displays proportional 2048x911 banner image without cropping', () => {
  assert.match(heroSource, /loja-oliveira-banner-2048\.png/);
  assert.match(heroSource, /aspect-\[2048\/911\]/);
  assert.match(heroSource, /Explorar veículos/);
  assert.match(heroSource, /Falar no WhatsApp/);
  assert.doesNotMatch(heroSource, /<video/);
});

test('hero styles preserve proportional aspect ratio on desktop and clean mobile display', () => {
  assert.match(cssSource, /aspect-ratio:\s*2048\s*\/\s*911/);
});

