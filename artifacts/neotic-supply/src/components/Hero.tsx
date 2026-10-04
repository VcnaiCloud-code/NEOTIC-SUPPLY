import { memo, useEffect, useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
import '../hero.css';

type HeroProps = {
  characters: Array<{ name: string; image: string }>;
  imageRoot: string;
  active: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Hero({ imageRoot, active }: HeroProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<() => void>(() => {});
  activeRef.current = active;

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    let visible = true;
    let frame = 0;
    let geometryDirty = true;
    let scrollY = window.scrollY;
    let sceneTop = 0, transitionDistance = 1, pinTop = 0;
    let destroyed = false;
    let introStarted = false, introDone = root.classList.contains('is-ready');
    let introTimer: ReturnType<typeof setTimeout> | undefined;
    const values = new Map<string, string>();
    const write = (name: string, value: string) => {
      if (values.get(name) === value) return;
      root.style.setProperty(name, value);
      values.set(name, value);
    };
    let sp = -1;
    let inert = false;
    const finishIntro = () => {
      if (introDone) return;
      introDone = true;
      clearTimeout(introTimer);
      // Release forwards-fill animation layers. Never remove is-ready on return.
      root.classList.add('is-ready');
      root.classList.remove('is-in');
    };

    const running = () => activeRef.current && visible && !document.hidden;

    const sync = () => {
      const on = running();
      root.classList.toggle('is-paused', !on);
      root.classList.toggle('is-reduced', reduceMq.matches);
      if (!on || reduceMq.matches) finishIntro();
      // Media changes must restore accessibility even while offscreen/asleep.
      if (reduceMq.matches && inert) {
        inert = false;
        root.toggleAttribute('inert', false);
        root.style.pointerEvents = '';
      }
      if (!on && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const tick = () => {
      frame = 0;
      if (!running()) return;
      const reduce = reduceMq.matches;
      // Cached READ phase: only viewport/layout changes invalidate geometry.
      if (geometryDirty) {
        const height = root.offsetHeight;
        sceneTop = scene.getBoundingClientRect().top + window.scrollY;
        const runway = Math.max(1, scene.offsetHeight - height);
        transitionDistance = runway + height * 0.72;
        pinTop = Number.parseFloat(getComputedStyle(root).top) || 0;
        geometryDirty = false;
      }
      if (reduce || scrollY > sceneTop + 1) finishIntro();
      if (!introStarted && !introDone) {
        introStarted = true;
        root.classList.add('is-in');
        introTimer = setTimeout(finishIntro, 2800);
      }
      // One input-driven frame; no easing tail or perpetual RAF. Animate the
      // whole composition, not four images plus multiple background/copy layers.
      const p = reduce ? 0 : clamp((pinTop - sceneTop + scrollY) / transitionDistance, 0, 1);
      if (Math.abs(p - sp) > 0.0005) {
        sp = p;
        const exit = clamp((p - 0.60) / 0.40, 0, 1);
        const fade = exit * exit * (3 - 2 * exit);
        write('opacity', (1 - fade).toFixed(4));
        write('transform', p === 0 || mobileMq.matches ? 'none' : `translate3d(0,0,0) scale(${(1 - p * 0.008).toFixed(4)})`);
        // Invisible pinned content must not intercept SHOP clicks or keyboard focus.
        if (inert !== (p > 0.94)) {
          inert = p > 0.94;
          root.toggleAttribute('inert', inert);
          root.style.pointerEvents = inert ? 'none' : '';
        }
      }
    };
    const wake = () => { if (!destroyed && !frame && running()) frame = requestAnimationFrame(tick); };
    wakeRef.current = () => { sync(); wake(); };

    const onScroll = () => { scrollY = window.scrollY; wake(); };
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

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    reduceMq.addEventListener('change', onMq);
    mobileMq.addEventListener('change', onMq);
    sync();
    wake();

    return () => {
      destroyed = true;
      clearTimeout(introTimer);
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      reduceMq.removeEventListener('change', onMq);
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
        </div>
        <div className="nh-layer nh-l-logo"><span className="nh-ghost">NEOTIC</span></div>
        <div className="nh-layer nh-l-deco">
          <span className="nh-cross nh-cross-a" />
          <span className="nh-cross nh-cross-b" />
          <span className="nh-tag nh-tag-a">NEOTIC DISTRICT / 001</span>
          <span className="nh-tag nh-tag-b">DROP 001 — 04.10.26</span>
          <span className="nh-rule" />
        </div>
      </div>

      <div className="nh-stage">
        <div className="nh-poster" data-testid="hero-poster">
          <img className="nh-img" src={`${imageRoot}hero/group-key-visual-original.jpg`} width={928} height={1152} alt="NEO, VEX, RAZE and MIKO" loading="eager" fetchPriority="high" decoding="async" draggable={false} />
        </div>
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

    </section>
    <div className="nh-scroll-runway" aria-hidden="true" />
    </div>
  );
}

export default memo(Hero);
