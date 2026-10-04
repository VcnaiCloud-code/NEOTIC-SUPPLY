import { useEffect, useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
import '../hero.css';

type HeroProps = {
  characters: Array<{ name: string; image: string }>;
  imageRoot: string;
  active: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Hero({ characters, imageRoot, active }: HeroProps) {
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
    const cursor = cursorRef.current;
    if (!root || !cursor) return;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    let visible = true;
    let frame = 0;
    let tx = 0, ty = 0, mx = 0, my = 0; // parallax target/current
    let cx = -100, cy = -100, ctx = -100, cty = -100; // cursor
    let inside = false;
    let sp = -1;

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

    const tick = () => {
      frame = 0;
      if (!running()) return;
      const reduce = reduceMq.matches;
      // scroll progress
      const r = root.getBoundingClientRect();
      const p = reduce ? 0 : clamp(-r.top / Math.max(1, r.height), 0, 1);
      if (Math.abs(p - sp) > 0.0005) {
        sp = p;
        root.style.setProperty('--sp', p.toFixed(4));
      }
      let busy = false;
      if (!reduce && !mobileMq.matches && fineMq.matches) {
        mx += (tx - mx) * 0.07;
        my += (ty - my) * 0.07;
        if (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001) busy = true;
        else { mx = tx; my = ty; }
        root.style.setProperty('--mx', mx.toFixed(4));
        root.style.setProperty('--my', my.toFixed(4));
      }
      if (inside && cursorOk()) {
        cx += (ctx - cx) * 0.22;
        cy += (cty - cy) * 0.22;
        if (Math.abs(ctx - cx) > 0.1 || Math.abs(cty - cy) > 0.1) busy = true;
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      }
      if (busy) frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!frame && running()) frame = requestAnimationFrame(tick); };
    wakeRef.current = () => { sync(); wake(); };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !running() || reduceMq.matches) return;
      const r = root.getBoundingClientRect();
      const within = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      if (cursorOk()) {
        // hide over header-overlapping modals: only when pointer is over hero itself
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const over = within && !!el && root.contains(el);
        if (over && !inside) { cx = ctx = e.clientX; cy = cty = e.clientY; }
        inside = over;
        root.classList.toggle('has-cursor', over);
        ctx = e.clientX; cty = e.clientY;
        if (over) root.classList.toggle('cursor-hot', !!(el as HTMLElement).closest('a,button'));
      }
      wake();
    };
    const onLeave = () => { inside = false; root.classList.remove('has-cursor'); };
    const onScroll = () => wake();
    const onVis = () => { sync(); wake(); };
    const onMq = () => { sync(); wake(); };

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
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    reduceMq.addEventListener('change', onMq);
    fineMq.addEventListener('change', onMq);
    mobileMq.addEventListener('change', onMq);
    sync();
    wake();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      reduceMq.removeEventListener('change', onMq);
      fineMq.removeEventListener('change', onMq);
      mobileMq.removeEventListener('change', onMq);
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(() => { wakeRef.current(); }, [active]);

  const onCtaMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - (b.left + b.width - 30)) / 40, -1, 1) * 4;
    const y = clamp((e.clientY - (b.top + b.height / 2)) / 20, -1, 1) * 3;
    e.currentTarget.style.setProperty('--ax', `${x.toFixed(1)}px`);
    e.currentTarget.style.setProperty('--ay', `${y.toFixed(1)}px`);
  };
  const onCtaLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty('--ax', '0px');
    e.currentTarget.style.setProperty('--ay', '0px');
  };

  return (
    <section className="neotic-hero" id="home" aria-labelledby="hero-title" ref={rootRef}>
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

      <a className="nh-cta nh-i nh-i-cta" href="#shop" data-testid="hero-shop-link" onPointerMove={onCtaMove} onPointerLeave={onCtaLeave}>
        <span className="nh-cta-label">ENTER THE UNIVERSE</span>
        <span className="nh-cta-arrow"><ArrowDownRight size={16} /></span>
      </a>

      <div className="nh-scroll nh-i nh-i-scroll" data-testid="hero-scroll-indicator" aria-hidden="true">
        <span>SCROLL</span><i />
      </div>

      <div className="nh-cursor" data-testid="hero-cursor" ref={cursorRef} aria-hidden="true"><b /></div>
    </section>
  );
}

export default Hero;
