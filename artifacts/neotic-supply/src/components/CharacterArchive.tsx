import { memo, useRef } from 'react';
import type { ReactNode } from 'react';
import '../characters.css';
import { useCharacterArchive } from './useCharacterArchive';

type Props = {
  characters: Array<{ name: string; image: string }>;
  imageRoot: string;
  active: boolean;
  navigationRequest: { index: number; sequence: number } | null;
  onOpenProduct: (name: string) => void;
};

type Meta = {
  key: string; no: string; name: string; title: string; lines: string[]; phrase: string; quote: string;
  tech: Array<[string, string]>;
};

const META: Meta[] = [
  { key: 'neo', no: '001', name: 'NEO', title: 'THE CHAOS MIND', lines: ['Impulsive. Chaotic. Always one step ahead.', "He doesn't follow rules. He rewrites them."], phrase: 'RULES ARE JUST SUGGESTIONS.', quote: '“Ideas too big for this dimension.”', tech: [['FREQUENCY', '001.0 / UNSTABLE'], ['COORD', '41.7N 02.3E'], ['TEE', 'BLACK']] },
  { key: 'vex', no: '002', name: 'VEX', title: 'THE DREAMER', lines: ['She lives in her own frequency.', "She sees things others can't.", 'She turns chaos into art.'], phrase: 'SHE SEES WHAT OTHERS MISS.', quote: '“Real world? That’s boring.”', tech: [['FREQUENCY', '002.0 / DRIFT'], ['COORD', '18.2N 77.9W'], ['TEE', 'WHITE']] },
  { key: 'raze', no: '003', name: 'RAZE', title: 'THE VISIONARY', lines: ['Calculated. Silent. Always in motion.', 'His ideas make noise.'], phrase: 'THE IDEA COMES FIRST.', quote: '“I don’t see the future... I design it.”', tech: [['FREQUENCY', '003.0 / HELD'], ['COORD', '63.0S 11.4E'], ['TEE', 'WHITE']] },
  { key: 'miko', no: '004', name: 'MIKO', title: 'THE EXPLORER', lines: ['Curious. Fearless.', 'Always looking for the next adventure.'], phrase: "THERE'S ALWAYS SOMETHING BEYOND.", quote: '“New planet, same drip.”', tech: [['FREQUENCY', '004.0 / OPEN'], ['COORD', '07.5S 139.1E'], ['TEE', 'WHITE']] },
];

const IDS = META.map((m) => `character-${m.key}`);

/* ---- background layer: graphics only, swappable for future layered assets ---- */
function Background({ k }: { k: string }) {
  if (k === 'neo') return (
    <svg className="ca-gfx" viewBox="0 0 1000 800" preserveAspectRatio="none" data-ca-depth="-40">
      <path d="M520 0L1000 0L1000 800L360 800Z" className="ca-neo-panel" />
      <path d="M520 0L360 800" className="ca-neo-edge" />
      <path d="M40 120L260 120L300 160M40 140L200 140" className="ca-line" />
      <path d="M700 60L760 120M720 40L800 120" className="ca-line" />
      <path d="M60 700L180 640L300 700" className="ca-line" />
      <path d="M380 64h16M388 56v16" className="ca-accent" />
    </svg>
  );
  if (k === 'vex') return (
    <svg className="ca-gfx" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" data-ca-depth="-26">
      <ellipse cx="320" cy="400" rx="300" ry="360" className="ca-vex-halo" />
      <path d="M80 640C260 460 120 300 340 160S640 100 760 60" className="ca-line" />
      <path d="M140 700C340 520 220 380 420 250S700 180 900 130" className="ca-line ca-faint" />
      <circle cx="760" cy="60" r="5" className="ca-fill" />
      <circle cx="860" cy="330" r="46" className="ca-line" />
      <circle cx="860" cy="330" r="3" className="ca-fill" />
    </svg>
  );
  if (k === 'raze') return (
    <svg className="ca-gfx" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" data-ca-depth="-10">
      <rect x="560" y="120" width="300" height="560" className="ca-line ca-faint" />
      <path d="M560 400H860M710 120V680" className="ca-line ca-faint" />
      <path d="M90 90H150M90 90V150" className="ca-gold" />
      <rect x="880" y="700" width="14" height="14" className="ca-gold" />
      <path d="M80 720H340" className="ca-line" />
    </svg>
  );
  return (
    <svg className="ca-gfx" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" data-ca-depth="-30" data-ca-dx="24">
      <ellipse cx="560" cy="420" rx="420" ry="420" className="ca-line ca-faint" />
      <ellipse cx="560" cy="420" rx="300" ry="300" className="ca-line" strokeDasharray="2 8" />
      <ellipse cx="560" cy="420" rx="460" ry="150" className="ca-line ca-faint" transform="rotate(-24 560 420)" />
      <circle cx="935" cy="300" r="7" className="ca-white" />
      <circle cx="170" cy="560" r="4" className="ca-white" />
      <circle cx="560" cy="120" r="3" className="ca-white" />
    </svg>
  );
}

function Art({ m, src }: { m: Meta; src: string }) {
  return (
    <div className="ca-art" data-ca-reveal>
      <div className="ca-art-in" data-ca-depth={m.key === 'neo' ? '-34' : m.key === 'vex' ? '-18' : m.key === 'raze' ? '-8' : '-22'} data-ca-dx={m.key === 'miko' ? '-26' : '0'}>
        <img src={src} alt={`${m.name}, ${m.title.toLowerCase()} — full character artwork`} loading="lazy" decoding="async" draggable={false} data-testid={`characters-art-${m.key}`} />
      </div>
    </div>
  );
}

function Copy({ m, next, onOpenProduct }: { m: Meta; next: { href: string; label: string }; onOpenProduct: (name: string) => void }) {
  return (
    <div className="ca-copy">
      <p className="ca-ref" data-ca-reveal><span>{m.no}</span><span>{m.title}</span></p>
      <h3 className="display ca-name" id={`character-${m.key}-title`} data-testid={`characters-name-${m.key}`} data-ca-reveal>{m.name}</h3>
      <div className="ca-text" data-ca-reveal>
        <p className="ca-lines">{m.lines.map((l) => <span key={l}>{l}</span>)}</p>
        <p className="ca-phrase">{m.phrase}</p>
        <p className="ca-quote">{m.quote}</p>
      </div>
      <dl className="ca-tech" data-ca-reveal>
        {m.tech.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="ca-actions" data-ca-reveal>
        <button type="button" className="button ca-product" onClick={() => onOpenProduct(m.name)} data-testid={`characters-product-${m.key}`}>
          <span>VIEW {m.name} TEE</span><span aria-hidden="true">→</span>
        </button>
        <a className="ca-next" href={next.href} data-testid={`characters-next-${m.key}`}><span>{next.label}</span><span aria-hidden="true">↓</span></a>
      </div>
    </div>
  );
}

function Chapter({ m, src, i, onOpenProduct }: { m: Meta; src: string; i: number; onOpenProduct: (n: string) => void }): ReactNode {
  const n = META[i + 1];
  const next = n ? { href: `#character-${n.key}`, label: `NEXT ${n.no} ${n.name}` } : { href: '#characters-finale', label: 'NEXT FINALE' };
  return (
    <article className={`ca-chapter ca-${m.key}`} id={`character-${m.key}`} aria-labelledby={`character-${m.key}-title`} data-testid={`characters-chapter-${m.key}`} data-ca-chapter>
      <div className="ca-bg" aria-hidden="true">
        <Background k={m.key} />
        <span className="ca-bignum">{m.no}</span>
      </div>
      <div className="wrap ca-inner">
        <div className="ca-stage"><Art m={m} src={src} /></div>
        <Copy m={m} next={next} onOpenProduct={onOpenProduct} />
      </div>
    </article>
  );
}

function CharacterArchive({ characters, imageRoot, active, navigationRequest, onOpenProduct }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  useCharacterArchive(rootRef, active, navigationRequest, IDS);
  const srcFor = (name: string) => {
    const c = characters.find((x) => x.name === name);
    if (!c) throw new Error(`Missing canonical character artwork for ${name}`);
    return `${imageRoot}${c.image}`;
  };

  return (
    <section className="neotic-characters" id="characters" aria-labelledby="characters-title" ref={rootRef}>
      <div className="ca-intro">
        <div className="wrap">
          <div className="ca-label" data-ca-reveal><span>NEOTIC UNIVERSE</span><span>/ SUBJECTS 001—004</span></div>
          <h2 className="display ca-title" id="characters-title" data-ca-reveal>THE<br />CHARACTERS</h2>
          <p className="ca-statement" data-ca-reveal>“Four minds moving through the same unreal.”</p>
        </div>
      </div>

      <nav className="ca-index" aria-label="Character index">
        <ol className="wrap">
          {META.map((m) => (
            <li key={m.key}>
              <a href={`#character-${m.key}`} data-ca-link={`character-${m.key}`} data-testid={`characters-index-${m.key}`}>
                <span>{m.no.slice(1)}</span><b>{m.name}</b>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {META.map((m, i) => <Chapter key={m.key} m={m} i={i} src={srcFor(m.name)} onOpenProduct={onOpenProduct} />)}

      <div className="ca-finale" id="characters-finale">
        <div className="wrap">
          <p className="display ca-final-title" data-ca-reveal>FOUR CHARACTERS.<br />FOUR FREQUENCIES.<br /><em>ONE UNIVERSE.</em></p>
          <a className="button ca-cta" href="#drop" data-ca-reveal data-testid="characters-explore-drop"><span>EXPLORE THE DROP</span><span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}

export default memo(CharacterArchive);
