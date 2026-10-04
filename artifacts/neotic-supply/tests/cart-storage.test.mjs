import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreBag, saveBag, BAG_STORAGE_KEY } from '../src/lib/cart-storage.ts';

const products = [{ id: 'neo-tee', price: 34.99, image: 'canonical.png' }];
const sizes = ['M', 'L'];
test('bag restores quantities and distinct sizes using current canonical product data', () => {
  const lines = restoreBag(JSON.stringify([
    { id: 'neo-tee', size: 'M', quantity: 2, price: 1, image: 'wrong.png' },
    { id: 'neo-tee', size: 'M', quantity: 1 },
    { id: 'neo-tee', size: 'L', quantity: 1 },
  ]), products, sizes);
  assert.equal(lines.length, 2);
  assert.equal(lines[0].quantity, 3);
  assert.equal(lines[1].size, 'L');
  assert.equal(lines[0].product, products[0]);
});
test('bag rejects unknown products, invalid sizes and unsafe quantities', () => {
  const entries = [
    null, { id: 'unknown', size: 'M', quantity: 1 },
    { id: 'neo-tee', size: 'invalid', quantity: 1 },
    ...[0, -1, 1.5, '2', null, Number.MAX_SAFE_INTEGER + 1].map(quantity => ({ id: 'neo-tee', size: 'M', quantity })),
  ];
  assert.deepEqual(restoreBag(JSON.stringify(entries), products, sizes), []);
  assert.deepEqual(restoreBag(null, products, sizes), []);
  assert.throws(() => restoreBag('{bad', products, sizes));
  assert.throws(() => restoreBag('{}', products, sizes));
});
test('persisted bag contains no prices, artwork or contact information, and clears after an order', () => {
  const storage = new Map();
  globalThis.localStorage = { setItem: (key, value) => storage.set(key, value) };
  saveBag([{ product: products[0], size: 'L', quantity: 2 }]);
  assert.deepEqual(JSON.parse(storage.get(BAG_STORAGE_KEY)), [{ id: 'neo-tee', size: 'L', quantity: 2 }]);
  saveBag([]);
  assert.equal(storage.get(BAG_STORAGE_KEY), '[]');
  delete globalThis.localStorage;
});