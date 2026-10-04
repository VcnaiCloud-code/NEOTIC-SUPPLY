import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cartSubtotalCents, createMockOrder, emptyShippingInfo,
  validateShippingInfo, DEMO_SHIPPING_CENTS,
} from '../src/lib/checkout.ts';

const customer = {
  ...emptyShippingInfo,
  email: 'demo@example.test', firstName: 'Demo', lastName: 'Shopper',
  country: 'Colombia', address: 'Test address', city: 'Bogota',
  state: 'Bogota', postalCode: '110111',
};
// Test fixtures only; these are never part of the storefront catalog.
const line = (id, price, size, quantity) => ({
  product: { id, price, name: 'Test fixture', character: 'Test', characterNumber: '000', color: 'BLACK', tagline: '', availability: 'AVAILABLE', image: '' },
  size, quantity,
});

test('required shipping/contact fields reject missing or whitespace-only input', () => {
  const required = ['email', 'firstName', 'lastName', 'country', 'address', 'city', 'state', 'postalCode'];
  assert.deepEqual(Object.keys(validateShippingInfo(emptyShippingInfo)).sort(), required.sort());
  for (const field of required) {
    assert.ok(validateShippingInfo({ ...customer, [field]: '   ' })[field]);
  }
});

test('email validation and optional fields are consistent', () => {
  for (const email of ['invalid', 'user@', '@domain.test', 'user domain@test.com']) {
    assert.ok(validateShippingInfo({ ...customer, email }).email);
  }
  assert.deepEqual(validateShippingInfo({ ...customer, email: ' demo@example.test ' }), {});
  assert.deepEqual(validateShippingInfo(customer), {});
});

test('subtotal uses cents and keeps product-size combinations intact', () => {
  const lines = [line('sku-a', 34.99, 'L', 2), line('sku-a', 34.99, 'M', 1), line('sku-b', 29.99, 'M', 1)];
  assert.equal(cartSubtotalCents(lines), 13496);
  assert.equal(cartSubtotalCents([]), 0);
  const order = createMockOrder(lines, customer);
  assert.equal(order.lines.length, 3);
  assert.equal(order.subtotalCents, 13496);
  assert.equal(order.shippingCents, DEMO_SHIPPING_CENTS);
  assert.equal(order.totalCents, 13496 + DEMO_SHIPPING_CENTS);
});

test('confirmation is an independent snapshot before live cart/draft clearing', () => {
  const lines = [line('sku-a', 34.99, 'L', 2)];
  const draft = { ...customer, firstName: ' Demo ' };
  const order = createMockOrder(lines, draft);
  lines[0].quantity = 99;
  lines[0].product.name = 'Changed';
  lines.length = 0;
  draft.firstName = '';
  assert.equal(order.lines[0].quantity, 2);
  assert.equal(order.lines[0].product.name, 'Test fixture');
  assert.equal(order.customer.firstName, 'Demo');
  assert.equal(order.totalCents, 6998);
});

test('test order references are unique and use the expected format', () => {
  const references = Array.from({ length: 20 }, () => createMockOrder([line('sku-a', 34.99, 'L', 1)], customer).reference);
  assert.equal(new Set(references).size, references.length);
  references.forEach((reference) => assert.match(reference, /^NEO-\d{4}-[A-F0-9]{8}$/));
});