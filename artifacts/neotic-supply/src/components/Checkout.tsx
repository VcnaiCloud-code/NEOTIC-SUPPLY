import { productImageSources } from '../lib/product-images';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../checkout.css';
import { useOverlay } from './useOverlay';
import {
  DEMO_SHIPPING_CENTS, cartSubtotalCents, formatMoneyCents, validateShippingInfo,
  type CartLine, type CheckoutErrors, type ShippingInfo,
} from '../lib/checkout';

type Props = {
  cart: CartLine[];
  customer: ShippingInfo;
  onCustomerChange: (customer: ShippingInfo) => void;
  imageRoot: string;
  onBackToBag: () => void;
  onBackToShop: () => void;
  onPlaceOrder: () => void;
};

const order: Array<keyof ShippingInfo> = ['email', 'phone', 'firstName', 'lastName', 'country', 'address', 'apartment', 'city', 'state', 'postalCode'];
const testKey: Record<keyof ShippingInfo, string> = {
  email: 'email', phone: 'phone', firstName: 'firstname', lastName: 'lastname', country: 'country',
  address: 'address', apartment: 'apartment', city: 'city', state: 'state', postalCode: 'postalcode',
};

export default function Checkout({ cart, customer, onCustomerChange, imageRoot, onBackToBag, onBackToShop, onPlaceOrder }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  useOverlay(root, onBackToBag, '#checkout-back-bag');

  const errors: CheckoutErrors = useMemo(() => (submitted ? validateShippingInfo(customer) : {}), [submitted, customer]);
  const subtotal = cartSubtotalCents(cart);
  const total = subtotal + DEMO_SHIPPING_CENTS;
  const itemCount = cart.reduce((n, l) => n + l.quantity, 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    const found = validateShippingInfo(customer);
    const first = order.find((f) => found[f]);
    if (first) {
      setSubmitted(true);
      root.current?.querySelector<HTMLElement>(`#checkout-${testKey[first]}`)?.focus();
      return;
    }
    onPlaceOrder();
  };

  const field = (key: keyof ShippingInfo, label: string, opts: { required?: boolean; type?: string; auto?: string; full?: boolean; mode?: 'numeric' | 'tel' | 'email' } = {}) => {
    const id = `checkout-${testKey[key]}`;
    const err = errors[key];
    return (
      <div className={`ck-field ${opts.full ? 'ck-full' : ''}`}>
        <label htmlFor={id}>{label.toUpperCase()}{!opts.required && <i>OPTIONAL</i>}</label>
        <input
          className="ck-input" id={id} name={key} type={opts.type ?? 'text'} autoComplete={opts.auto} inputMode={opts.mode}
          value={customer[key]} data-testid={id}
          aria-required={opts.required || undefined} aria-invalid={err ? true : undefined}
          aria-describedby={err ? `checkout-error-${testKey[key]}` : undefined}
          onChange={(ev) => onCustomerChange({ ...customer, [key]: ev.target.value })}
        />
        {err && <p className="ck-error" id={`checkout-error-${testKey[key]}`} data-testid={`checkout-error-${testKey[key]}`} role="alert">{err}</p>}
      </div>
    );
  };

  return (
    <div className="ck-root" ref={root} role="dialog" aria-modal="true" aria-labelledby="checkout-title" data-testid="checkout-page">
      <div className="ck-bar">
        <button type="button" className="ck-btn" id="checkout-back-bag" data-testid="checkout-back-bag" onClick={onBackToBag}><ArrowLeft size={14} /> BACK TO BAG</button>
        <span className="ck-bar-mid">NEOTIC SUPPLY / CHECKOUT</span>
        <button type="button" className="ck-btn" data-testid="checkout-back-shop" onClick={onBackToShop}>BACK TO SHOP</button>
      </div>
      <div className="ck-scroll">
        {!cart.length ? (
          <div className="ck-empty" data-testid="checkout-empty">
            <h2 className="display" id="checkout-title">BAG EMPTY.</h2>
            <p>There is nothing to check out. Pick something strange first.</p>
            <button type="button" className="ck-btn" onClick={onBackToShop}>BACK TO SHOP <ArrowRight size={14} /></button>
          </div>
        ) : (
          <div className="ck-grid">
            <form className="ck-main" onSubmit={submit} noValidate aria-label="Checkout details">
              <span className="ck-kicker">CHECKOUT / DROP 001</span>
              <h2 className="display ck-title" id="checkout-title">ALMOST<br /><em>THERE.</em></h2>
              <p className="ck-lede">Tell us where the universe should send it. Your details stay here while you move between bag and checkout.</p>
              <div className="ck-demo" data-testid="checkout-demo-banner"><b>DEMO MODE</b><span>No payment is collected and nothing ships. Placing an order creates a test confirmation only.</span></div>

              <section className="ck-section" aria-labelledby="ck-h-contact">
                <h3 className="ck-h" id="ck-h-contact">01 / CONTACT</h3>
                <div className="ck-fields">
                  {field('email', 'Email', { required: true, type: 'email', auto: 'email', mode: 'email', full: true })}
                  {field('phone', 'Phone number', { type: 'tel', auto: 'tel', mode: 'tel', full: true })}
                </div>
              </section>

              <section className="ck-section" aria-labelledby="ck-h-ship">
                <h3 className="ck-h" id="ck-h-ship">02 / SHIPPING</h3>
                <div className="ck-fields">
                  {field('firstName', 'First name', { required: true, auto: 'given-name' })}
                  {field('lastName', 'Last name', { required: true, auto: 'family-name' })}
                  {field('country', 'Country / Region', { required: true, auto: 'country-name', full: true })}
                  {field('address', 'Address', { required: true, auto: 'address-line1', full: true })}
                  {field('apartment', 'Apartment / Suite / Unit', { auto: 'address-line2', full: true })}
                  {field('city', 'City', { required: true, auto: 'address-level2' })}
                  {field('state', 'State / Province', { required: true, auto: 'address-level1' })}
                  {field('postalCode', 'Postal code', { required: true, auto: 'postal-code', full: true })}
                </div>
              </section>

              <section className="ck-section" aria-labelledby="ck-h-del">
                <h3 className="ck-h" id="ck-h-del">03 / DELIVERY</h3>
                <div className="ck-box ck-ship" data-testid="checkout-delivery">
                  <div>
                    <strong>STANDARD SHIPPING</strong>
                    <p>Estimated delivery: estimate available when shipping launches.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatMoneyCents(DEMO_SHIPPING_CENTS)}</strong>
                    <span className="ck-tag">DEMO PLACEHOLDER</span>
                  </div>
                </div>
              </section>

              <section className="ck-section" aria-labelledby="ck-h-pay">
                <h3 className="ck-h" id="ck-h-pay">04 / PAYMENT</h3>
                <div className="ck-box" data-testid="checkout-payment">
                  <p className="ck-pay" style={{ margin: 0, font: 'inherit' }}>Secure payment will be available soon.</p>
                  <p>No card details are requested or stored.</p>
                </div>
              </section>

              <button type="submit" className="ck-place" data-testid="checkout-place-order">PLACE ORDER <ArrowRight size={16} /></button>
            </form>

            <aside className="ck-side" aria-labelledby="ck-summary-title">
              <div className="ck-sticky">
                <h3 className="ck-summary-h" id="ck-summary-title">ORDER SUMMARY <span>{String(itemCount).padStart(2, '0')} ITEMS</span></h3>
                <ul className="ck-lines" data-testid="checkout-lines">
                  {cart.map(({ product, quantity, size }) => (
                    <li className="ck-line" key={`${product.id}-${size}`} data-testid={`checkout-line-${product.id}-${size.toLowerCase()}`}>
                      <img className="ck-thumb" src={`${imageRoot}${product.image}`} srcSet={productImageSources(`${imageRoot}${product.image}`)} sizes="64px" decoding="async" alt={`${product.name}, ${product.color.toLowerCase()}`} />
                      <div>
                        <div className="ck-line-name">{product.name}</div>
                        <div className="ck-line-meta">{product.characterNumber} / {product.color}<br />SIZE {size} / QTY {quantity}<br />{formatMoneyCents(Math.round(product.price * 100))} EACH</div>
                      </div>
                      <div className="ck-line-price">{formatMoneyCents(Math.round(product.price * 100) * quantity)}</div>
                    </li>
                  ))}
                </ul>
                <div className="ck-rows">
                  <div className="ck-row"><span>SUBTOTAL</span><span data-testid="checkout-subtotal">{formatMoneyCents(subtotal)}</span></div>
                  <div className="ck-row"><span>SHIPPING<em>DEMO PLACEHOLDER</em></span><span data-testid="checkout-shipping">{formatMoneyCents(DEMO_SHIPPING_CENTS)}</span></div>
                  <div className="ck-row total"><span>TOTAL</span><span data-testid="checkout-total">{formatMoneyCents(total)}</span></div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
