import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Controller unit test, not a browser/FPS test. Media and DOM are explicit mocks.
// Exercise actual component effects without relaxing production pointer gates.
let reads = 0, writes = 0, time = 0, nextFrame = 0;
const frames = new Map(), effects = [], refs = [], cleanups = [];
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
  IntersectionObserver: class { constructor(cb) { intersect = cb; } observe() {} disconnect() {} },
  ResizeObserver: class { constructor(cb) { resized = cb; } observe() {} disconnect() {} },
  require: path => {
    if (path === 'react') return {
      memo: component => component,
      useRef: value => {
        const ref = { current: [scene, root, cursor][refs.length] ?? value };
        refs.push(ref);
        return ref;
      },
      useEffect: effect => effects.push(effect),
    };
    if (path === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
    if (path === 'lucide-react') return {};
    if (path.endsWith('.css')) return {};
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
const move = (x, y, target = root, type = 'mouse') =>
  window.listeners.get('pointermove')({ clientX: x, clientY: y, target, pointerType: type });
settle();
const warmReads = reads, warmWrites = writes;
for (let i = 0; i < 1000; i++) move(200 + i, 500);
assert.equal(reads, warmReads, 'pointer events never measure layout');
assert.equal(writes, warmWrites, 'pointer events never write styles');
assert.equal(frames.size, 1, '1000 inputs are coalesced into one pending frame');
step();
assert.equal(cursor.style.transform, 'translate3d(1199.0px,500.0px,0)', 'cursor has no easing trail');
settle();
assert.equal(reads, warmReads, 'parallax frames do not repeatedly measure layout');

// Continuous horizontal and vertical input samples against the real controller.
for (let i = 0; i < 240; i++) {
  const x = 720 + Math.sin(i / 12) * 500;
  const y = 450 + Math.cos(i / 15) * 300;
  move(x, y);
  step();
  assert.equal(cursor.style.transform, `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`);
  assert.ok(Math.abs(Number(root.properties.get('--mx'))) <= 1);
}
settle();
assert.equal(reads, warmReads, 'continuous XY input keeps cached geometry');
window.scrollY = 200;
window.listeners.get('scroll')();
settle();
assert.ok(Math.abs(Number(root.properties.get('--sp')) - 166 / 784.8) < 0.001);
assert.equal(reads, warmReads, 'scroll-only frames use cached document geometry');
move(840, 677, cta);
settle();
assert.equal(reads, warmReads + 1, 'CTA bounds are read once on entry, before writes');
assert.equal(cta.properties.get('--ax'), '2.0px');
root.listeners.get('pointerleave')();
settle();
assert.equal(cta.properties.get('--ax'), '0.0px');
assert.ok(!root.classes.has('has-cursor'));
const beforeTouch = writes;
move(300, 400, root, 'touch');
assert.equal(frames.size, 0, 'touch does not start mouse animation');
assert.equal(writes, beforeTouch);
window.scrollY = 900;
window.listeners.get('scroll')();
settle();
assert.ok(root.attrs.has('inert'), 'faded hero does not intercept SHOP');
const reduce = media.get('(prefers-reduced-motion: reduce)');
reduce.matches = true;
reduce.listeners.get('change')();
settle();
assert.equal(root.properties.get('--sp'), '0.0000');
assert.ok(!root.attrs.has('inert'), 'reduced motion restores accessibility');
resized();
settle();
assert.ok(reads > warmReads + 1, 'layout changes invalidate cached geometry');
intersect([{ isIntersecting: false }]);
move(700, 400);
assert.equal(frames.size, 0, 'offscreen hero does not schedule animation');
cleanups.forEach(cleanup => cleanup?.());
assert.equal(window.listeners.size, 0);
assert.equal(document.listeners.size, 0);
assert.equal(frames.size, 0);
console.log('PASS: input batching, latest-frame cursor, continuous XY controller, cached scroll/geometry, CTA, touch, reduced motion, offscreen pause, cleanup.');