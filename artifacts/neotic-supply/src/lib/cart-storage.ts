import type { CartLine, Product } from './checkout';

export const BAG_STORAGE_KEY = 'neotic-supply.bag.v1';

// Persist identifiers, never cached prices/artwork or checkout contact data.
export function restoreBag(raw: string | null, products: Product[], sizes: string[]): CartLine[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Stored bag is not an array.');
  const lines = new Map<string, CartLine>();
  for (const entry of data) {
    if (!entry || typeof entry !== 'object') continue;
    const { id, size, quantity } = entry;
    const product = products.find(p => p.id === id);
    if (!product || !sizes.includes(size) || !Number.isSafeInteger(quantity) || quantity < 1) continue;
    const key = `${id}:${size}`;
    const combined = (lines.get(key)?.quantity ?? 0) + quantity;
    if (!Number.isSafeInteger(combined)) continue;
    lines.set(key, { product, size, quantity: combined });
  }
  return [...lines.values()];
}

export function loadBag(products: Product[], sizes: string[]) {
  try {
    return restoreBag(localStorage.getItem(BAG_STORAGE_KEY), products, sizes);
  } catch {
    console.warn('The saved bag could not be restored. Browser storage may be unavailable or invalid.');
    return [];
  }
}

export function saveBag(lines: CartLine[]) {
  try {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(lines.map(({ product, size, quantity }) => ({ id: product.id, size, quantity }))));
  } catch {
    console.warn('The bag could not be saved. It will remain available in this tab but may not survive a reload.');
  }
}