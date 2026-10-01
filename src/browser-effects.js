// Adapted from Sara-Pragya's smooth-scroll component.
export function startSmoothScroll() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  if (reduced.matches || coarse.matches) return;
  const root = document.documentElement;
  const original = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  let target = window.scrollY;
  let frame = 0;
  let animating = false;
  const clamp = value => Math.min(Math.max(value, 0), Math.max(0, root.scrollHeight - window.innerHeight));
  const animate = () => {
    target = clamp(target);
    const difference = target - window.scrollY;
    if (Math.abs(difference) < .5) {
      window.scrollTo(0, target);
      animating = false;
      return;
    }
    window.scrollTo(0, window.scrollY + difference * .1);
    frame = window.requestAnimationFrame(animate);
  };
  const begin = () => {
    if (animating) return;
    animating = true;
    frame = window.requestAnimationFrame(animate);
  };
  const cancel = () => {
    window.cancelAnimationFrame(frame);
    animating = false;
    target = window.scrollY;
  };
  const wheel = event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || !event.deltaY || reduced.matches || coarse.matches) return;
    event.preventDefault();
    const lineHeight = parseFloat(getComputedStyle(document.body).lineHeight) || 16;
    const unit = event.deltaMode === 1 ? lineHeight : event.deltaMode === 2 ? window.innerHeight : 1;
    target = clamp(target + event.deltaY * unit);
    begin();
  };
  const scroll = () => { if (!animating) target = window.scrollY; };
  const click = event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduced.matches || coarse.matches) return;
    const link = event.target.closest?.('a[href^="#"]');
    // Keep native skip-link focus and modified link clicks.
    if (!link || link.classList.contains('skip-link')) return;
    const hash = link.getAttribute('href');
    const destination = document.getElementById(hash.slice(1));
    if (!destination) return;
    event.preventDefault();
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
    target = clamp(window.scrollY + destination.getBoundingClientRect().top - headerHeight - 16);
    window.history.pushState(null, '', hash);
    begin();
  };
  const key = event => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel(); };
  window.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('keydown', key);
  window.addEventListener('pointerdown', cancel);
  reduced.addEventListener('change', cancel);
  coarse.addEventListener('change', cancel);
  document.addEventListener('click', click);
  return () => {
    cancel();
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('keydown', key);
    window.removeEventListener('pointerdown', cancel);
    reduced.removeEventListener('change', cancel);
    coarse.removeEventListener('change', cancel);
    document.removeEventListener('click', click);
    root.style.scrollBehavior = original;
  };
}

export function startSiteCursor(cursor) {
  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hide = () => {
    cursor.style.opacity = '0';
    root.classList.remove('custom-cursor-active');
  };
  const move = event => {
    if (event.pointerType === 'touch' || !fine.matches || reduced.matches) { hide(); return; }
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    cursor.style.opacity = '1';
    root.classList.add('custom-cursor-active');
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  fine.addEventListener('change', hide);
  reduced.addEventListener('change', hide);
  return () => {
    hide();
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerleave', hide);
    window.removeEventListener('blur', hide);
    fine.removeEventListener('change', hide);
    reduced.removeEventListener('change', hide);
  };
}
