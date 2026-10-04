// HERO-only derivatives. Canonical images used elsewhere are never modified.
const ART: Record<string, { width: number; height: number; fraction: number }> = {
  'char-neo.webp': { width: 805, height: 2200, fraction: 0.78 },
  'char-vex.webp': { width: 830, height: 2200, fraction: 0.72 },
  'char-raze.webp': { width: 675, height: 2200, fraction: 0.80 },
  'char-miko.webp': { width: 816, height: 2200, fraction: 0.70 },
};

export function heroImage(root: string, file: string) {
  const art = ART[file];
  if (!art) throw new Error(`Missing HERO image specification: ${file}`);
  const stem = file.replace('.webp', '');
  const ratio = art.width / art.height;
  const desktop = (ratio * art.fraction).toFixed(6);
  const tablet = (ratio * 0.64).toFixed(6);
  const mobile = (ratio * 0.5).toFixed(6);
  return {
    src: `${root}${file}`,
    srcSet: [160, 320, 480].filter(w => w < art.width)
      .map(w => `${root}hero/${stem}-${w}.webp ${w}w`)
      .concat(`${root}${file} ${art.width}w`).join(', '),
    // Match actual contained artwork, not the much wider character column.
    sizes: `(max-width: 680px) min(46vw, calc(clamp(340px, 46svh, 440px) * ${mobile})), (max-width: 1024px) min(27vw, calc(max(640px, 100svh - 110px) * ${tablet})), min(25vw, calc(max(640px, 100svh - 110px) * ${desktop}))`,
    width: art.width,
    height: art.height,
    style: { aspectRatio: `${art.width} / ${art.height}` },
  };
}