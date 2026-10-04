export type Product = {
  id: string;
  name: string;
  character: string;
  characterNumber: string;
  color: 'BLACK' | 'WHITE';
  tagline: string;
  availability: string;
  price: number;
  image: string;
};

export type CartLine = { product: Product; quantity: number; size: string };

export type ShippingInfo = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
};

export type CheckoutErrors = Partial<Record<keyof ShippingInfo, string>>;

export type MockOrder = {
  reference: string;
  createdAt: string;
  lines: CartLine[];
  customer: ShippingInfo;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

export const DEMO_SHIPPING_CENTS = 0;

export const emptyShippingInfo: ShippingInfo = {
  email: '', phone: '', firstName: '', lastName: '', country: '',
  address: '', apartment: '', city: '', state: '', postalCode: '',
};

export function cartSubtotalCents(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + Math.round(line.product.price * 100) * line.quantity, 0);
}

export function formatMoneyCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function validateShippingInfo(info: ShippingInfo): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!info.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) errors.email = 'Enter a valid email address.';
  const required: Array<[keyof ShippingInfo, string]> = [
    ['firstName', 'first name'], ['lastName', 'last name'], ['country', 'country / region'],
    ['address', 'address'], ['city', 'city'], ['state', 'state / province'], ['postalCode', 'postal code'],
  ];
  required.forEach(([field, label]) => {
    if (!info[field].trim()) errors[field] = `Enter your ${label}.`;
  });
  return errors;
}

export function createMockOrder(lines: CartLine[], customer: ShippingInfo): MockOrder {
  const snapshot = lines.map((line) => ({ ...line, product: { ...line.product } }));
  const subtotalCents = cartSubtotalCents(snapshot);
  const createdAt = new Date().toISOString();
  return {
    reference: `NEO-${new Date(createdAt).getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt,
    lines: snapshot,
    customer: Object.fromEntries(Object.entries(customer).map(([key, value]) => [key, value.trim()])) as ShippingInfo,
    subtotalCents,
    shippingCents: DEMO_SHIPPING_CENTS,
    totalCents: subtotalCents + DEMO_SHIPPING_CENTS,
  };
}