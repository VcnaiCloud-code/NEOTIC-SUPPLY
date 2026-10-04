import { memo, useEffect, useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
import '../hero.css';

type HeroProps = {
  characters: Array<{ name: string; image: string }>;
  imageRoot: string;
  active: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Hero({ characters, imageRoot, active }: HeroProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<() => void>(() => {});
  activeRef.current = active;

  // intro: start next frame so nothing blocks interaction
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => root.classList.add('is-in'));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const cursor = cursorRef.current;
    if (!root || !scene || !cursor) return;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    let visible = true;
    let frame = 0;
    let tx = 0, ty = 0, mx = 0, my = 0; // parallax target/current
    let ctx = -100, cty = -100; // cursor follows the latest sample, without trailing
    let inside = false;
    let hot = false, overCta = false, pointerDirty = false;
    let geometryDirty = true, ctaDirty = true;
    let scrollY = window.scrollY;
    let sceneTop = 0, transitionDistance = 1, pinTop = 0;
    let viewportWidth = 1, viewportHeight = 1;
    let lastTime = 0, lastCursor = '', destroyed = false;
    const cta = root.querySelector<HTMLAnchorElement>('.nh-cta');
    let ctaBounds: DOMRect | null = null;
    const values = new Map<string, string>();
    const write = (element: HTMLElement, name: string, value: string) => {
      const key = `${element === root ? 'root' : 'cta'}:${name}`;
      if (values.get(key) === value) return;
      element.style.setProperty(name, value);
      values.set(key, value);
    };
    let sp = -1;
    let scrollProgress = 0;

    const running = () => activeRef.current && visible && !document.hidden;
    const cursorOk = () => fineMq.matches && !mobileMq.matches && !reduceMq.matches;

    const sync = () => {
      const on = running();
      root.classList.toggle('is-paused', !on);
      root.classList.toggle('is-reduced', reduceMq.matches);
      if (!on || !cursorOk()) {
        root.classList.remove('has-cursor');
        inside = false;
      }
    };

    const tick = (time: number) => {
      frame = 0;
      if (!running()) return;
      const reduce = reduceMq.matches;
      const dt = lastTime ? clamp(time - lastTime, 1, 50) : 1000 / 60;
      lastTime = time;
      // READ phase: measure only after layout/viewport changes, never per mousemove.
      if (geometryDirty) {
        const height = root.offsetHeight;
        sceneTop = scene.getBoundingClientRect().top + window.scrollY;
        const runway = Math.max(1, scene.offsetHeight - height);
        transitionDistance = runway + height * 0.72;
        pinTop = Number.parseFloat(getComputedStyle(root).top) || 0;
        viewportWidth = Math.max(1, window.innerWidth);
        viewportHeight = Math.max(1, window.innerHeight);
        geometryDirty = false;
        ctaDirty = true;
      }
      if (overCta && cta && ctaDirty) {
        ctaBounds = cta.getBoundingClientRect();
        ctaDirty = false;
      }
      if (pointerDirty) {
        tx = clamp((ctx / viewportWidth - 0.5) * 2, -1, 1);
        ty = clamp((cty / viewportHeight - 0.5) * 2, -1, 1);
        pointerDirty = false;
      }
      // WRITE phase: transforms/opacity only, with no layout reads.
      const target = reduce ? 0 : clamp((pinTop - sceneTop + scrollY) / transitionDistance, 0, 1);
      const scrollEase = 1 - Math.pow(1 - 0.12, dt / (1000 / 60));
      scrollProgress = reduce ? 0 : scrollProgress + (target - scrollProgress) * scrollEase;
      let busy = Math.abs(target - scrollProgress) > 0.0005;
      if (!busy) scrollProgress = target;
      const p = scrollProgress;
      if (Math.abs(p - sp) > 0.0005) {
        sp = p;
        write(root, '--sp', p.toFixed(4));
        const exit = clamp((p - 0.55) / 0.45, 0, 1);
        const fade = exit * exit * (3 - 2 * exit);
        write(root, '--nh-scene-opacity', (1 - fade).toFixed(4));
        write(root, '--nh-backdrop-opacity', (1 - p * 0.85).toFixed(4));
        write(root, '--nh-character-opacity', (1 - Math.max(0, p - 0.55) * 0.25).toFixed(4));
        // Invisible pinned content must not intercept SHOP clicks or keyboard focus.
        root.toggleAttribute('inert', p > 0.94);
        root.style.pointerEvents = p > 0.94 ? 'none' : '';
      }
      if (!reduce && !mobileMq.matches && fineMq.matches) {
        const mouseEase = 1 - Math.pow(1 - 0.07, dt / (1000 / 60));
        mx += (tx - mx) * mouseEase;
        my += (ty - my) * mouseEase;
        if (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001) busy = true;
        else { mx = tx; my = ty; }
        write(root, '--mx', mx.toFixed(4));
        write(root, '--my', my.toFixed(4));
      }
      root.classList.toggle('has-cursor', inside && cursorOk());
      root.classList.toggle('cursor-hot', inside && hot && cursorOk());
      if (inside && cursorOk()) {
        const position = `translate3d(${ctx.toFixed(1)}px,${cty.toFixed(1)}px,0)`;
        if (position !== lastCursor) {
          cursor.style.transform = position;
          lastCursor = position;
        }
      }
      if (cta) {
        const b = ctaBounds;
        const x = overCta && b && cursorOk() ? clamp((ctx - (b.left + b.width - 30)) / 40, -1, 1) * 4 : 0;
        const y = overCta && b && cursorOk() ? clamp((cty - (b.top + b.height / 2)) / 20, -1, 1) * 3 : 0;
        write(cta, '--ax', `${x.toFixed(1)}px`);
        write(cta, '--ay', `${y.toFixed(1)}px`);
      }
      if (busy) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const wake = () => { if (!destroyed && !frame && running()) frame = requestAnimationFrame(tick); };
    wakeRef.current = () => { sync(); wake(); };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !running() || !cursorOk()) return;
      // Native input already supplies a hit-tested target. Store only the latest
      // sample; no layout reads, hit-tests, DOM writes or React updates here.
      const el = e.target instanceof Element ? e.target : null;
      inside = !!el && root.contains(el);
      hot = inside && !!el?.closest('a,button');
      const nextCta = inside && !!cta && !!el && cta.contains(el);
      if (nextCta !== overCta) ctaDirty = true;
      overCta = nextCta;
      ctx = e.clientX; cty = e.clientY;
      pointerDirty = true;
      wake();
    };
    const onLeave = () => { inside = false; overCta = false; wake(); };
    const onScroll = () => { scrollY = window.scrollY; ctaDirty = true; wake(); };
    const onResize = () => { geometryDirty = true; onScroll(); };
    const onVis = () => { sync(); wake(); };
    const onMq = () => { geometryDirty = true; sp = -1; sync(); wake(); };
    const ro = new ResizeObserver(onResize);
    ro.observe(root);
    ro.observe(scene);
    void document.fonts.ready.then(() => { if (!destroyed) onResize(); });

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
      wake();
    }, { threshold: 0 });
    io.observe(root);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    reduceMq.addEventListener('change', onMq);
    fineMq.addEventListener('change', onMq);
    mobileMq.addEventListener('change', onMq);
    sync();
    wake();

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      reduceMq.removeEventListener('change', onMq);
      fineMq.removeEventListener('change', onMq);
      mobileMq.removeEventListener('change', onMq);
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(() => { wakeRef.current(); }, [active]);

  return (
    <div className="nh-scroll-scene" id="home" ref={sceneRef}>
    <section className="neotic-hero" aria-labelledby="hero-title" ref={rootRef}>
      <div className="nh-bg" data-testid="hero-background" aria-hidden="true">
        <div className="nh-layer nh-l-bg">
          <div className="nh-glow" />
          <div className="nh-grid" />
          <div className="nh-ring" />
        </div>
        <div className="nh-layer nh-l-logo"><span className="nh-ghost">NEOTIC</span></div>
        <div className="nh-layer nh-l-deco">
          <span className="nh-cross nh-cross-a" />
          <span className="nh-cross nh-cross-b" />
          <span className="nh-tag nh-tag-a">NEOTIC DISTRICT / 001</span>
          <span className="nh-tag nh-tag-b">DROP 001 — 04.10.26</span>
          <span className="nh-rule" />
        </div>
        <div className="nh-grain" />
      </div>

      <div className="nh-stage">
        {characters.map((c, i) => {
          const key = c.name.toLowerCase();
          return (
            <div className={`nh-char nh-char-${key}`} key={c.name} data-testid={`hero-character-${key}`} style={{ ['--i' as string]: i }}>
              <div className="nh-in">
                <img className="nh-img" src={`${imageRoot}${c.image}`} alt={c.name} decoding="async" draggable={false} />
                <span className="nh-name">{String(i + 1).padStart(3, '0')} / {c.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="nh-shade" aria-hidden="true" />

      <div className="nh-copy">
        <div className="nh-brand nh-i nh-i-brand">
          <span className="nh-logo">NEOTIC<small>SUPPLY</small></span>
          <span className="nh-est">EST. 2025</span>
        </div>
        <h1 className="nh-title nh-i nh-i-title" id="hero-title">WEAR THE <em>UNREAL.</em></h1>
      </div>

      <a className="nh-cta nh-i nh-i-cta" href="#shop" data-testid="hero-shop-link">
        <span className="nh-cta-label">ENTER THE UNIVERSE</span>
        <span className="nh-cta-arrow"><ArrowDownRight size={16} /></span>
      </a>

      <div className="nh-scroll nh-i nh-i-scroll" data-testid="hero-scroll-indicator" aria-hidden="true">
        <span>SCROLL</span><i />
      </div>

      <div className="nh-cursor" data-testid="hero-cursor" ref={cursorRef} aria-hidden="true"><b /></div>
    </section>
    <div className="nh-scroll-runway" aria-hidden="true" />
    </div>
  );
}

export default memo(Hero);
