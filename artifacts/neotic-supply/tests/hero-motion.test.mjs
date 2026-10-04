import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Controller unit test, not a browser/FPS test. Media and DOM are explicit mocks.
// Exercise the actual controller: no mouse work and no self-scheduling RAF.
let reads = 0, writes = 0, time = 0, nextFrame = 0;
const frames = new Map(), effects = [], refs = [], cleanups = [];
const timers = new Map();
class Element {
  constructor(parent = null) {
    this.parent = parent;
    this.listeners = new Map();
    this.attrs = new Set();
    this.classes = new Set();
    this.properties = new Map();
    this.style = { setProperty: (key, value) => { writes++; this.properties.set(key, value); } };
    this.classList = {
      add: key => this.classes.add(key),
      remove: key => this.classes.delete(key),
      contains: key => this.classes.has(key),
      toggle: (key, on) => on ? this.classes.add(key) : this.classes.delete(key),
    };
  }
  contains(node) { return !!node && (node === this || this.contains(node.parent)); }
  closest() { return null; }
  addEventListener(type, fn) { this.listeners.set(type, fn); }
  removeEventListener(type) { this.listeners.delete(type); }
  toggleAttribute(key, on) { on ? this.attrs.add(key) : this.attrs.delete(key); }
}
const root = new Element(), scene = new Element(), cursor = new Element(root), cta = new Element(root);
root.querySelector = () => cta;
const window = new Element();
Object.assign(window, { innerWidth: 1440, innerHeight: 900, scrollY: 0 });
const document = new Element();
Object.assign(document, { hidden: false, fonts: { ready: Promise.resolve() } });
Object.defineProperty(root, 'offsetHeight', { get: () => { reads++; return 790; } });
Object.defineProperty(scene, 'offsetHeight', { get: () => { reads++; return 1006; } });
scene.getBoundingClientRect = () => { reads++; return { top: 110 - window.scrollY }; };
cta.getBoundingClientRect = () => { reads++; return { left: 610, top: 650, width: 240, height: 54 }; };
const media = new Map();
window.matchMedia = query => {
  const list = new Element();
  list.matches = query.includes('pointer: fine');
  media.set(query, list);
  return list;
};
let intersect, resized;
const context = {
  exports: {}, Element, window, document, Math,
  getComputedStyle: () => { reads++; return { top: '76px' }; },
  requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
  cancelAnimationFrame: id => frames.delete(id),
   setTimeout: callback => { timers.set(++nextFrame, callback); return nextFrame; },
   clearTimeout: id => timers.delete(id),
  IntersectionObserver: class { constructor(cb) { intersect = cb; } observe() {} disconnect() {} },
  ResizeObserver: class { constructor(cb) { resized = cb; } observe() {} disconnect() {} },
  require: path => {
    if (path === 'react') return {
      memo: component => component,
      useRef: value => {
        const ref = { current: [scene, root][refs.length] ?? value };
        refs.push(ref);
        return ref;
      },
      useEffect: effect => effects.push(effect),
    };
    if (path === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
    if (path === 'lucide-react') return {};
    if (path.endsWith('.css')) return {};
     if (path.includes('hero-images')) return { heroImage: () => ({}) };
    throw new Error(`Unexpected import: ${path}`);
  },
};
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;
const source = fs.readFileSync(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
vm.runInNewContext(compile(source), context);
context.exports.default({ characters: [], imageRoot: '/brand/', active: true });
for (const effect of effects) cleanups.push(effect());
await Promise.resolve();
const step = () => {
  time += 1000 / 60;
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach(callback => callback(time));
};
const settle = () => {
  for (let i = 0; i < 180 && frames.size; i++) step();
  assert.equal(frames.size, 0, 'RAF sleeps once inputs settle');
};
step();
assert.equal(frames.size, 0, 'initial frame does not start a RAF loop');
assert(root.classes.has('is-in'), 'initial load keeps cinematic entrance');
for (const callback of [...timers.values()]) callback();
assert.equal(timers.size, 0);
assert(root.classes.has('is-ready'));
assert(!root.classes.has('is-in'), 'intro fill layers are released permanently');
assert(!window.listeners.has('pointermove') && !window.listeners.has('mousemove'));
assert.equal(root.listeners.size, 0, 'no cursor/CTA tracking');
assert.equal(media.size, 2, 'no fine-pointer subscription');
const warmReads = reads, warmWrites = writes;
for (let i = 0; i < 1000; i++) {
  window.listeners.get('pointermove')?.({ clientX: i, clientY: 500 });
}
assert.equal(reads, warmReads);
assert.equal(writes, warmWrites);
assert.equal(frames.size, 0, 'mouse motion causes no Hero frames or writes');
for (let cycle = 0; cycle < 50; cycle++) {
  for (let i = 0; i < 100; i++) {
    window.scrollY = 900 * i / 99;
    window.listeners.get('scroll')();
  }
  assert.equal(frames.size, 1, 'scroll samples coalesce');
  step();
  assert.equal(frames.size, 0, 'no post-scroll easing tail');
  assert.equal(root.properties.get('opacity'), '0.0000');
  assert(root.attrs.has('inert'), 'faded Hero cannot intercept Shop');
  window.scrollY = 0;
  window.listeners.get('scroll')();
  step();
  assert.equal(root.properties.get('opacity'), '1.0000');
  assert.equal(root.properties.get('transform'), 'none');
  assert(!root.attrs.has('inert'));
  assert(root.classes.has('is-ready') && !root.classes.has('is-in'));
  assert.equal(timers.size, 0, 'returns do not recreate intro state');
  assert.equal(reads, warmReads, 'scroll-only frames never measure geometry');
  assert.equal(window.listeners.size, 2, 'listener count never grows');
}
const mobile = media.get('(max-width: 680px)');
mobile.matches = true;
mobile.listeners.get('change')();
step();
window.scrollY = 400;
window.listeners.get('scroll')();
step();
assert.equal(root.properties.get('transform'), 'none', 'mobile has no scale/parallax');
const reduce = media.get('(prefers-reduced-motion: reduce)');
reduce.matches = true;
reduce.listeners.get('change')();
settle();
assert.equal(root.properties.get('opacity'), '1.0000');
assert.equal(root.properties.get('transform'), 'none');
assert.ok(!root.attrs.has('inert'), 'reduced motion restores accessibility');
resized();
settle();
assert.ok(reads > warmReads, 'layout changes invalidate cached geometry');
intersect([{ isIntersecting: false }]);
window.listeners.get('scroll')();
assert.equal(frames.size, 0, 'offscreen hero does not schedule animation');
reduce.matches = false;
reduce.listeners.get('change')();
intersect([{ isIntersecting: true }]);
window.scrollY = 900;
window.listeners.get('scroll')();
step();
assert(root.attrs.has('inert'));
intersect([{ isIntersecting: false }]);
reduce.matches = true;
reduce.listeners.get('change')();
assert(!root.attrs.has('inert'), 'reduced motion restores focus even while offscreen');
assert.equal(frames.size, 0);
cleanups.forEach(cleanup => cleanup?.());
assert.equal(window.listeners.size, 0);
assert.equal(document.listeners.size, 0);
assert.equal(frames.size, 0);
assert.equal(timers.size, 0);
assert(!/pointermove|mousemove|useState|\.decode\(/.test(source));
const artContext = { exports: {} };
vm.runInNewContext(compile(fs.readFileSync(new URL('../src/lib/hero-images.ts', import.meta.url), 'utf8')), artContext);
for (const name of ['neo', 'vex', 'raze', 'miko']) {
  const image = artContext.exports.heroImage('/brand/', `char-${name}.webp`);
  assert.equal(image.src, `/brand/char-${name}.webp`);
  assert.equal(image.height, 2200);
  assert(image.sizes.includes('svh') && image.sizes.includes('min('));
  for (const candidate of image.srcSet.split(', ')) {
    const url = candidate.split(' ')[0];
    assert(fs.existsSync(new URL(`../public${url}`, import.meta.url)), url);
  }
}
console.log('PASS: no pointer tracking; one frame per scroll batch; no idle/easing loop; 50 repeated returns without intro replay or listener growth; cached geometry; mobile; reduced motion; offscreen cancellation; cleanup.');