import test from 'node:test';
import assert from 'node:assert/strict';
import { startSiteCursor, startSmoothScroll } from '../src/browser-effects.js';

test('smooth scrolling and the custom cursor preserve native fallbacks and clean up', t => {
  const emitter = values => Object.assign(values, {
    listeners: new Map(),
    addEventListener(name, fn) { this.listeners.set(name, fn); },
    removeEventListener(name) { this.listeners.delete(name); },
    fire(name, event = {}) { this.listeners.get(name)?.(event); },
  });
  const reduced = emitter({ matches: false });
  const coarse = emitter({ matches: false });
  const fine = emitter({ matches: true });
  const classes = new Set();
  const root = { scrollHeight: 3000, style: { scrollBehavior: 'smooth' }, classList: { add: value => classes.add(value), remove: value => classes.delete(value) } };
  let frame;
  const win = emitter({
    scrollY: 0, innerHeight: 800,
    matchMedia: query => query.includes('reduced-motion') ? reduced : query.includes('coarse') ? coarse : fine,
    requestAnimationFrame: fn => { frame = fn; return 1; },
    cancelAnimationFrame: () => { frame = undefined; },
    scrollTo: (_, top) => { win.scrollY = top; },
    history: { pushState: (_, __, hash) => { win.hash = hash; } },
  });
  const doc = emitter({ documentElement: root, body: {},
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 80 }) }),
    getElementById: id => id === 'about' ? { getBoundingClientRect: () => ({ top: 1000 - win.scrollY }) } : null,
  });
  const previous = ['window', 'document', 'getComputedStyle'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  t.after(() => previous.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]));
  globalThis.window = win;
  globalThis.document = doc;
  globalThis.getComputedStyle = () => ({ lineHeight: '24px' });
  const settle = () => {
    let count = 0;
    while (frame && count++ < 200) { const next = frame; frame = undefined; next(); }
    assert.ok(count < 200, 'scroll animation settles');
  };
  let prevented = false;
  const wheel = { deltaY: 300, deltaMode: 0, preventDefault: () => { prevented = true; } };
  const stopScroll = startSmoothScroll();
  win.fire('wheel', wheel);
  assert.equal(prevented, true);
  assert.equal(win.scrollY, 0, 'wheel movement starts on the animation frame');
  frame();
  assert.equal(win.scrollY, 30, 'same 0.1 easing as the reference');
  settle();
  assert.equal(win.scrollY, 300);
  win.fire('wheel', { ...wheel, deltaY: 10000 });
  settle();
  assert.equal(win.scrollY, 2200, 'clamped to document bottom');
  let skip = false;
  const link = { classList: { contains: () => skip }, getAttribute: () => '#about' };
  const click = { button: 0, target: { closest: () => link }, preventDefault: () => { prevented = true; } };
  doc.fire('click', click);
  settle();
  assert.equal(win.scrollY, 904, 'anchor clears header by 16px');
  assert.equal(win.hash, '#about');
  skip = true;
  prevented = false;
  doc.fire('click', click);
  win.fire('wheel', { ...wheel, ctrlKey: true });
  assert.equal(prevented, false, 'skip links and browser zoom remain native');
  win.fire('wheel', wheel);
  win.fire('keydown', { key: 'End' });
  assert.equal(frame, undefined, 'keyboard navigation cancels pending easing');
  stopScroll();
  assert.equal(root.style.scrollBehavior, 'smooth');
  assert.equal(win.listeners.size + doc.listeners.size, 0);
  coarse.matches = true;
  assert.equal(startSmoothScroll(), undefined, 'touch scrolling stays native');
  coarse.matches = false;
  reduced.matches = true;
  assert.equal(startSmoothScroll(), undefined, 'reduced motion stays native');
  reduced.matches = false;
  const cursor = { style: {} };
  const stopCursor = startSiteCursor(cursor);
  doc.fire('pointermove', { pointerType: 'mouse', clientX: 10, clientY: 20 });
  assert.equal(cursor.style.opacity, '1');
  assert.equal(classes.has('custom-cursor-active'), true);
  win.fire('blur');
  assert.equal(classes.size, 0, 'OS cursor restored when leaving the window');
  doc.fire('pointermove', { pointerType: 'touch' });
  assert.equal(cursor.style.opacity, '0');
  reduced.matches = true;
  doc.fire('pointermove', { pointerType: 'mouse' });
  assert.equal(classes.size, 0);
  stopCursor();
  assert.equal(win.listeners.size + doc.listeners.size + reduced.listeners.size + fine.listeners.size, 0);
});
