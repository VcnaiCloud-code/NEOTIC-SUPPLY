import { memo, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import '../world.css';

type WorldProps = {
  characters: Array<{ name: string; image: string }>;
  imageRoot: string;
  active: boolean;
};

const META: Record<string, { no: string; title: string; note: string; coord: string }> = {
  NEO: { no: '001', title: 'THE CHAOS MIND', note: 'Rewrites the rules before they print.', coord: '41.7N / 02.3E' },
  VEX: { no: '002', title: 'THE DREAMER', note: 'Lives one frequency to the left of real.', coord: '18.2N / 77.9W' },
  RAZE: { no: '003', title: 'THE VISIONARY', note: 'Silent. Calculated. Already there.', coord: '63.0S / 11.4E' },
  MIKO: { no: '004', title: 'THE EXPLORER', note: 'Every place is a new playground.', coord: '07.5S / 139.1E' },
};

function World({ characters, imageRoot, active }: WorldProps) {
  const rootRef = useRef<HTMLElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<() => void>(() => {});
  activeRef.current = active;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Without observers, keep the default visible, static presentation.
    if (!('IntersectionObserver' in window) || !('ResizeObserver' in window)) return;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-nw-reveal]'));
    const depth = Array.from(root.querySelectorAll<HTMLElement>('[data-nw-depth]'));
    let visible = false;
    let frame = 0;
    let destroyed = false;
    let dirty = true;
    let vh = 1;
    let lastTime = 0;
    let geo: Array<{ el: HTMLElement; mid: number; k: number; current: number; last: string }> = [];

    // Progressive reveal: content is visible unless JS + motion are both available.
    let ro: IntersectionObserver | null = null;
    if (!reduceMq.matches && 'IntersectionObserver' in window) {
      root.classList.add('nw-js');
      ro = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          ro?.unobserve(e.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
      targets.forEach((t) => ro?.observe(t));
    }

    const running = () => activeRef.current && visible && !document.hidden && !reduceMq.matches && !mobileMq.matches;

    const measure = () => {
      vh = Math.max(1, window.innerHeight);
      // Read all geometry together; subtract existing visual translation rather
      // than resetting styles and forcing a read/write/read layout cycle.
      geo = depth.map((el) => {
        const prev = el.style.getPropertyValue('--nw-y');
        const r = el.getBoundingClientRect();
        const transform = getComputedStyle(el).transform;
        const y = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
        return {
          el, mid: r.top + window.scrollY + r.height / 2 - y,
          k: Number(el.dataset.nwDepth) || 0, current: Number.parseFloat(prev) || 0, last: prev,
        };
      });
      dirty = false;
    };

    const tick = (time: number) => {
      frame = 0;
      if (!running()) { lastTime = 0; return; }
      if (dirty) measure();
      const center = window.scrollY + vh / 2;
      const dt = lastTime ? Math.min(50, Math.max(1, time - lastTime)) : 1000 / 60;
      const ease = 1 - Math.pow(1 - 0.14, dt / (1000 / 60));
      lastTime = time;
      let busy = false;
      for (const g of geo) {
        const p = Math.max(-1, Math.min(1, (g.mid - center) / vh));
        const target = p * g.k;
        g.current += (target - g.current) * ease;
        if (Math.abs(target - g.current) > 0.05) busy = true;
        else g.current = target;
        const v = `${g.current.toFixed(1)}px`;
        if (v !== g.last) { g.el.style.setProperty('--nw-y', v); g.last = v; }
      }
      if (busy) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const wake = () => { if (!destroyed && !frame && running()) frame = requestAnimationFrame(tick); };

    const clear = () => {
      root.classList.toggle('is-paused', !running());
      if (reduceMq.matches || mobileMq.matches) depth.forEach((el) => el.style.removeProperty('--nw-y'));
    };
    wakeRef.current = () => { clear(); wake(); };
    const onScroll = () => wake();
    const onResize = () => { dirty = true; clear(); wake(); };
    const io = new IntersectionObserver((es) => {
      visible = es[es.length - 1].isIntersecting;
      clear();
      if (visible) wake();
    }, { rootMargin: '10% 0px 10% 0px' });
    io.observe(root);
    const size = new ResizeObserver(onResize);
    size.observe(root);
    // Shop filtering or archive text can shift WORLD without changing its own size.
    if (root.parentElement) size.observe(root.parentElement);
    void document.fonts?.ready.then(() => { if (!destroyed) onResize(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onResize);
    reduceMq.addEventListener('change', onResize);
    mobileMq.addEventListener('change', onResize);
    clear();

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      ro?.disconnect();
      io.disconnect();
      size.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onResize);
      reduceMq.removeEventListener('change', onResize);
      mobileMq.removeEventListener('change', onResize);
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    wakeRef.current();
  }, [active]);

  const order = ['NEO', 'VEX', 'RAZE', 'MIKO'];
  const list = order.map((n) => characters.find((c) => c.name === n)).filter((c): c is { name: string; image: string } => !!c);

  return (
    <section className="neotic-world" id="world" aria-labelledby="world-title" ref={rootRef}>
      {/* 1-2 ENTRY + INTRODUCTION */}
      <div className="nw-intro">
        <div className="nw-bg" aria-hidden="true">
          <div className="nw-gridlines" data-nw-depth="-24" />
          <span className="nw-ghost" data-nw-depth="40">WORLD</span>
        </div>
        <div className="wrap nw-intro-inner">
          <div className="nw-label" data-nw-reveal>
            <span>NEOTIC UNIVERSE</span><span>/ SYSTEM 001</span>
          </div>
          <h2 className="display nw-title" id="world-title" data-nw-reveal>
            <span className="nw-line"><span>THE</span></span>
            <span className="nw-line"><span>WORLD</span></span>
          </h2>
          <div className="nw-intro-copy">
            <p className="nw-statement" data-nw-reveal>“NEOTIC SUPPLY exists somewhere between reality and the unreal.”</p>
            <p className="nw-body" data-nw-reveal>
              A universe built for those who don’t fit the system.<br />
              Four minds. Four frequencies. One world.
            </p>
          </div>
        </div>
      </div>

      {/* 3 THE UNIVERSE */}
      <div className="nw-universe">
        <div className="nw-artifacts" aria-hidden="true">
          <svg className="nw-geo nw-geo-a" viewBox="0 0 400 400" data-nw-depth="-50">
            <circle cx="200" cy="200" r="190" />
            <circle cx="200" cy="200" r="120" strokeDasharray="2 7" />
            <path d="M200 10V390M10 200H390" />
            <path d="M66 66L334 334" />
            <rect x="150" y="150" width="100" height="100" transform="rotate(45 200 200)" />
            <circle className="nw-dot" cx="334" cy="334" r="4" />
          </svg>
          <svg className="nw-geo nw-geo-b" viewBox="0 0 200 200" data-nw-depth="30">
            <path d="M20 180L100 20L180 180Z" />
            <path d="M60 180L100 100L140 180" />
            <path d="M100 20V180" strokeDasharray="2 6" />
          </svg>
          <span className="nw-mark nw-mark-a">41.7384 N / 02.3219 E</span>
          <span className="nw-mark nw-mark-b">ARCHIVE 001 — UNLISTED</span>
          <span className="nw-mark nw-mark-c">+</span>
        </div>
        <div className="wrap nw-universe-inner">
          <div className="nw-universe-head" data-nw-reveal>
            <span className="kicker">THE UNIVERSE</span>
          </div>
          <p className="display nw-moment" data-nw-reveal>REALITY<br />IS <em>OPTIONAL.</em></p>
          <div className="nw-universe-note" data-nw-reveal>
            <span className="nw-rule" />
            <p>Not a collection. A place that was here before the first print — and keeps going past the last.</p>
          </div>
        </div>
      </div>

      {/* 4-5 FOUR FREQUENCIES */}
      <div className="nw-freq">
        <div className="wrap">
          <div className="nw-freq-head" data-nw-reveal>
            <span className="kicker">04 MINDS / 04 SIGNALS</span>
            <h3 className="display nw-freq-title" id="nw-frequencies-title">FOUR<br />FREQUENCIES.</h3>
          </div>
          <ul className="nw-cards" aria-labelledby="nw-frequencies-title">
            {list.map((c, i) => {
              const m = META[c.name];
              return (
                <li className={`nw-card nw-card-${i + 1}`} key={c.name} data-nw-reveal style={{ ['--i' as string]: i }}>
                  <a href={`#character-${c.name.toLowerCase()}`} className="nw-card-link" data-testid={`world-frequency-${c.name.toLowerCase()}`} aria-label={`${m.no} ${c.name} ${m.title} — view in characters`}>
                    <span className="nw-card-top"><span>{m.no}</span><span>{m.coord}</span></span>
                    <span className="nw-card-art">
                      <span className="nw-card-ring" aria-hidden="true" />
                      <img src={`${imageRoot}${c.image}`} alt={`${c.name}, ${m.title.toLowerCase()}`} loading="lazy" decoding="async" draggable={false} />
                    </span>
                    <span className="nw-card-meta">
                      <span className="nw-card-no">{m.no}</span>
                      <span className="display nw-card-name">{c.name}</span>
                      <span className="nw-card-title">{m.title}</span>
                      <span className="nw-card-note">{m.note}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* 6 STATEMENT */}
      <div className="nw-break">
        <div className="wrap">
          <p className="display nw-moment nw-moment-wide" data-nw-reveal data-nw-depth="-18">THE UNREAL<br />IS A <em>PLACE.</em></p>
        </div>
      </div>

      {/* 7 SYSTEM */}
      <div className="nw-system">
        <div className="wrap">
          <div className="nw-system-head" data-nw-reveal>
            <span className="kicker">SYSTEM 001 / PARTIAL MAP</span>
            <p>What you see is one corner of it.</p>
          </div>
          <figure className="nw-diagram" data-nw-reveal tabIndex={0} aria-label="NEOTIC abstract system map. Scroll horizontally on small screens.">
            <svg viewBox="0 0 1000 540" role="img" aria-labelledby="nw-diagram-title nw-diagram-desc">
              <title id="nw-diagram-title">NEOTIC system diagram</title>
              <desc id="nw-diagram-desc">An abstract network linking NEO 001, VEX 002, RAZE 003 and MIKO 004, with unmapped points beyond the edge.</desc>
              <g className="nw-d-faint">
                <circle cx="500" cy="270" r="250" />
                <circle cx="500" cy="270" r="150" strokeDasharray="2 8" />
                <path d="M500 10V530M0 270H1000" />
              </g>
              <g className="nw-d-lines">
                <path d="M190 150L500 270L770 120" />
                <path d="M500 270L330 440L770 120" strokeDasharray="1 7" />
                <path d="M330 440L190 150" strokeDasharray="1 7" />
                <path d="M770 120L930 60" strokeDasharray="3 9" />
                <path d="M330 440L240 520" strokeDasharray="3 9" />
                <path d="M500 270L960 330" strokeDasharray="3 9" />
              </g>
              <g className="nw-d-ghost">
                <circle cx="930" cy="60" r="5" /><circle cx="240" cy="520" r="5" /><circle cx="960" cy="330" r="5" />
              </g>
              <g className="nw-d-node">
                <circle cx="190" cy="150" r="9" /><circle cx="770" cy="120" r="9" /><circle cx="330" cy="440" r="9" />
                <circle className="nw-d-core" cx="500" cy="270" r="4" />
              </g>
              <g className="nw-d-text">
                <text x="190" y="120" textAnchor="middle">NEO — 001</text>
                <text x="190" y="182" textAnchor="middle" className="nw-d-sub">41.7N / 02.3E</text>
                <text x="770" y="90" textAnchor="middle">VEX — 002</text>
                <text x="770" y="152" textAnchor="middle" className="nw-d-sub">18.2N / 77.9W</text>
                <text x="330" y="478" textAnchor="middle">RAZE — 003</text>
                <text x="330" y="414" textAnchor="middle" className="nw-d-sub">63.0S / 11.4E</text>
                <text x="520" y="256" className="nw-d-sub">ORIGIN</text>
                <text x="930" y="42" textAnchor="middle" className="nw-d-sub">UNMAPPED</text>
                <text x="960" y="360" textAnchor="end" className="nw-d-sub">UNMAPPED</text>
              </g>
              <g className="nw-d-text">
                <circle cx="640" cy="458" r="9" className="nw-d-node-c" />
                <text x="640" y="494" textAnchor="middle">MIKO — 004</text>
                <text x="640" y="424" textAnchor="middle" className="nw-d-sub">07.5S / 139.1E</text>
                <path d="M500 270L640 458" className="nw-d-line-m" />
              </g>
            </svg>
            <figcaption className="nw-mobile-key">
              {list.map((c) => <span key={c.name}>{META[c.name].no} — {c.name}</span>)}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* 8 FINAL */}
      <div className="nw-final">
        <div className="wrap nw-final-inner">
          <h3 className="display nw-final-title" data-nw-reveal>FOUR MINDS.<br /><em>ONE UNIVERSE.</em></h3>
          <p className="nw-welcome" data-nw-reveal>WELCOME TO NEOTIC.</p>
          <a className="button nw-cta" href="#characters" data-testid="explore-world" data-nw-reveal>
            <span>EXPLORE THE CHARACTERS</span><ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(World);
