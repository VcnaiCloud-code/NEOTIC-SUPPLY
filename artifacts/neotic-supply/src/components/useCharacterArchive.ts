import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * One controller for all four chapters.
 * - reveal + active-chapter tracking via IntersectionObserver (DOM writes only on change)
 * - scroll depth: geometry is read together (no style writes during measure, current
 *   transform is subtracted from the cached value), the scroll rAF only writes, and it
 *   stops when idle / offscreen / inactive / hidden / mobile / reduced motion.
 */
export function useCharacterArchive(rootRef: RefObject<HTMLElement | null>, active: boolean, navigationRequest: { index: number; sequence: number } | null, ids: string[]) {
  const activeRef = useRef(active);
  const wakeRef = useRef<() => void>(() => {});
  activeRef.current = active;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!('IntersectionObserver' in window) || !('ResizeObserver' in window)) {
      root.classList.add('is-paused');
      return;
    }
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-ca-reveal]'));
    const depthEls = Array.from(root.querySelectorAll<HTMLElement>('[data-ca-depth]'));
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-ca-chapter]'));
    const links = Array.from(root.querySelectorAll<HTMLElement>('[data-ca-link]'));
    let visible = false;
    let frame = 0;
    let dirty = true;
    let destroyed = false;
    let vh = 1;
    let currentId = '';
    type Dep = { el: HTMLElement; mid: number; ky: number; kx: number; y: number; x: number };
    type Chap = { el: HTMLElement; mid: number; h: number; o: string };
    let deps: Dep[] = [];
    let chaps: Chap[] = [];

    let revealIo: IntersectionObserver | null = null;
    if (!reduceMq.matches && 'IntersectionObserver' in window) {
      // A fully collapsed reveal mask has zero intersection area. Observe the
      // unmasked stage instead, then reveal its artwork once that stage enters.
      const revealTargets = new Map<Element, HTMLElement>();
      reveals.forEach((target) => {
        const observed = target.classList.contains('ca-art') && target.parentElement
          ? target.parentElement : target;
        revealTargets.set(observed, target);
      });
      root.classList.add('ca-js');
      revealIo = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          revealTargets.get(e.target)?.classList.add('is-visible');
          revealIo?.unobserve(e.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealTargets.forEach((_target, observed) => revealIo?.observe(observed));
    }

    // active chapter: DOM writes only when the chapter actually changes
    let activeIo: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      activeIo = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = (e.target as HTMLElement).id;
          if (id === currentId) return;
          currentId = id;
          root.dataset.active = id;
          links.forEach((l) => {
            if (l.dataset.caLink === id) l.setAttribute('aria-current', 'true');
            else l.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      chapters.forEach((c) => activeIo?.observe(c));
    }

    const motionOn = () => activeRef.current && visible && !document.hidden && !reduceMq.matches && !mobileMq.matches;

    const measure = () => {
      const sy = window.scrollY;
      vh = Math.max(1, window.innerHeight);
      // reads only
      deps.forEach((d) => {
        const r = d.el.getBoundingClientRect();
        d.mid = r.top + sy + r.height / 2 - d.y;
      });
      chaps.forEach((c) => {
        const r = c.el.getBoundingClientRect();
        c.mid = r.top + sy + r.height / 2;
        c.h = r.height;
      });
      dirty = false;
    };

    const tick = () => {
      frame = 0;
      if (!motionOn()) return;
      if (!deps.length) {
        deps = depthEls.map((el) => ({ el, mid: 0, ky: Number(el.dataset.caDepth) || 0, kx: Number(el.dataset.caDx) || 0, y: 0, x: 0 }));
        chaps = chapters.map((el) => ({ el, mid: 0, h: 1, o: '' }));
        dirty = true;
      }
      if (dirty) measure();
      const center = window.scrollY + vh / 2;
      for (const d of deps) {
        const p = (d.mid - center) / vh;
        if (Math.abs(p) > 1.4) continue;
        const c = Math.max(-1, Math.min(1, p));
        const y = Math.round(c * d.ky * 10) / 10;
        const x = Math.round(c * d.kx * 10) / 10;
        if (y !== d.y || x !== d.x) {
          d.el.style.setProperty('--ca-y', `${y}px`);
          d.el.style.setProperty('--ca-x', `${x}px`);
          d.y = y; d.x = x;
        }
      }
      for (const c of chaps) {
        const p = Math.abs((c.mid - center) / (c.h * 0.9));
        if (p > 1.6) continue;
        const o = Math.max(0.35, 1 - Math.max(0, p - 0.5) * 1.1).toFixed(2);
        if (o !== c.o) { c.el.style.setProperty('--ca-o', o); c.o = o; }
      }
    };
    const wake = () => { if (!destroyed && !frame && motionOn()) frame = requestAnimationFrame(tick); };

    const clear = () => {
      root.classList.toggle('is-paused', !motionOn());
      if (reduceMq.matches || mobileMq.matches) {
        depthEls.forEach((el) => { el.style.removeProperty('--ca-y'); el.style.removeProperty('--ca-x'); });
        chapters.forEach((el) => el.style.removeProperty('--ca-o'));
        deps = []; chaps = [];
      }
    };
    wakeRef.current = () => { clear(); wake(); };
    const onResize = () => { dirty = true; clear(); wake(); };
    const io = new IntersectionObserver((es) => {
      visible = es[es.length - 1].isIntersecting;
      clear();
      if (visible) wake();
    }, { rootMargin: '10% 0px 10% 0px' });
    io.observe(root);
    const size = new ResizeObserver(onResize);
    size.observe(root);
    if (root.parentElement) size.observe(root.parentElement);
    void document.fonts?.ready.then(() => { if (!destroyed) onResize(); });
    const onScroll = () => wake();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onResize);
    reduceMq.addEventListener('change', onResize);
    mobileMq.addEventListener('change', onResize);
    clear();

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      revealIo?.disconnect();
      activeIo?.disconnect();
      io.disconnect();
      size.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onResize);
      reduceMq.removeEventListener('change', onResize);
      mobileMq.removeEventListener('change', onResize);
      wakeRef.current = () => {};
    };
  }, [rootRef]);

  useEffect(() => {
    wakeRef.current();
  }, [active, rootRef]);

  // World card -> chapter: one rAF scroll per request, never on mount.
  useEffect(() => {
    if (!navigationRequest) return;
    const id = ids[navigationRequest.index];
    if (!id) return;
    const raf = requestAnimationFrame(() => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationRequest]);
}
