import { memo, useEffect, useRef } from 'react';
import '../about.css';

const FIGURES = [
  { key: 'neo', label: 'NEO — CHAOS', href: '#character-neo' },
  { key: 'vex', label: 'VEX — DREAM', href: '#character-vex' },
  { key: 'raze', label: 'RAZE — VISION', href: '#character-raze' },
  { key: 'miko', label: 'MIKO — EXPLORATION', href: '#character-miko' },
];

function About() {
  const rootRef = useRef<HTMLElement>(null);

  // Opacity/translate reveals only. Content is visible by default; hidden state exists
  // only while JS, IntersectionObserver and motion are all available.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-na-reveal]'));
    let io: IntersectionObserver | null = null;

    const stop = () => { io?.disconnect(); io = null; };
    const start = () => {
      stop();
      if (reduceMq.matches || !('IntersectionObserver' in window)) {
        root.classList.remove('na-js');
        return;
      }
      root.classList.add('na-js');
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          io?.unobserve(e.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      targets.forEach((t) => { if (!t.classList.contains('is-visible')) io?.observe(t); });
    };
    start();
    reduceMq.addEventListener('change', start);
    return () => { reduceMq.removeEventListener('change', start); stop(); };
  }, []);

  return (
    <section className="neotic-about" id="about" aria-labelledby="about-title" ref={rootRef}>
      {/* 1. INTRO */}
      <div className="na-block na-intro" data-testid="about-intro">
        <div className="wrap">
          <p className="na-label" data-na-reveal><span>NEOTIC SUPPLY</span><span>/ EST. 2025</span></p>
          <h2 className="display na-title" id="about-title" data-na-reveal>ABOUT</h2>
          <p className="display na-tagline" data-na-reveal>WEAR THE <em>UNREAL.</em></p>
        </div>
      </div>

      {/* 2. BRAND STATEMENT */}
      <div className="na-block na-statement">
        <div className="wrap na-statement-grid">
          <p className="na-big" data-na-reveal>NEOTIC SUPPLY IS A STREETWEAR UNIVERSE BUILT FOR THOSE WHO REFUSE TO FIT INTO ONE REALITY.</p>
          <p className="na-small" data-na-reveal>
            Part clothing. Part identity. Part fiction.<br />
            NEOTIC exists somewhere between what is real and what could be.
          </p>
        </div>
      </div>

      {/* 3. WHY */}
      <div className="na-block na-why">
        <div className="wrap na-why-grid">
          <h3 className="display na-h" data-na-reveal>WHY<br />NEOTIC?</h3>
          <div className="na-why-copy">
            <p className="na-lead" data-na-reveal>
              Because clothing doesn't have to describe who you are.<br />
              <em>It can describe who you're becoming.</em>
            </p>
            <p className="na-small" data-na-reveal>NEOTIC is built around characters, worlds and ideas that turn the unreal into something you can wear.</p>
          </div>
        </div>
      </div>

      {/* 4. PRINCIPLE */}
      <div className="na-block na-principle">
        <div className="wrap">
          <p className="na-label" data-na-reveal><span>THE PRINCIPLE</span></p>
          <p className="display na-principle-a" data-na-reveal>DON'T FIT<br />THE SYSTEM.</p>
          <p className="display na-principle-b" data-na-reveal>CREATE YOUR<br /><em>OWN FREQUENCY.</em></p>
        </div>
      </div>

      {/* 5. UNIVERSE CONNECTION */}
      <div className="na-block na-universe">
        <div className="wrap na-universe-grid">
          <p className="display na-triplet" data-na-reveal>
            <span>ONE BRAND.</span>
            <span>FOUR MINDS.</span>
            <span className="na-infinite">INFINITE POSSIBILITIES.</span>
          </p>
          <ul className="na-figures" aria-label="The four characters" data-na-reveal>
            {FIGURES.map((f) => (
              <li key={f.key}>
                <a href={f.href} data-testid={`about-character-${f.key}`}><span>{f.label}</span><span aria-hidden="true">→</span></a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. CLOTHING */}
      <div className="na-block na-clothing">
        <div className="wrap na-clothing-grid">
          <h3 className="display na-h" data-na-reveal>FROM THE UNREAL<br />TO THE <em>PHYSICAL.</em></h3>
          <div className="na-clothing-copy">
            <p className="na-lead na-lead-sm" data-na-reveal>
              Every piece is a fragment of the NEOTIC universe.<br />
              The characters, symbols and ideas are designed to exist beyond the screen.
            </p>
            <a className="button na-cta" href="#shop" data-na-reveal data-testid="about-shop-link"><span>EXPLORE THE SHOP</span><span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>

      {/* 7. DETAILS */}
      <div className="na-block na-details">
        <div className="wrap">
          <dl className="na-dl" data-na-reveal>
            <div><dt>NEOTIC SUPPLY</dt><dd>EST. 2025</dd><dd>WEAR THE UNREAL</dd></div>
            <div><dt>UNIVERSE</dt><dd>NEOTIC</dd></div>
            <div><dt>SYSTEM</dt><dd>001—∞</dd></div>
          </dl>
        </div>
      </div>

      {/* 8. FINAL */}
      <div className="na-block na-final">
        <div className="wrap">
          <p className="display na-final-title" data-na-reveal>WEAR<br />WHAT<br />DOESN'T<br />EXIST.</p>
          <p className="display na-yet" data-na-reveal>YET.</p>
          <a className="button na-cta" href="#home" data-na-reveal data-testid="about-home-link"><span>ENTER THE UNIVERSE</span><span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}

export default memo(About);
