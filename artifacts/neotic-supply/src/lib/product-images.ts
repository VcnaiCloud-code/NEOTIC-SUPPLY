// Derivatives of the original transparent artwork, not replacement designs.
// Full-size WebP copies are lossless; smaller variants retain alpha.
const optimized = new Set(['neo', 'vex', 'raze', 'miko']);
const widths = [160, 240, 480, 768, 1145] as const;

function supported(source: string) {
  const match = source.match(/\/(neo|vex|raze|miko)-tee-transparent\.png$/);
  return !!match && optimized.has(match[1]);
}

export function productImageSources(source: string): string | undefined {
  if (!supported(source)) return undefined;
  return widths.map(width => `${source.replace(/\.png$/, `-${width}.webp`)} ${width}w`).join(', ');
}

export function productThumbnail(source: string) {
  return supported(source) ? source.replace(/\.png$/, '-240.webp') : source;
}