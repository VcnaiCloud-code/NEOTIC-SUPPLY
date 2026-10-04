import { productImageSources } from '../lib/product-images';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import '../checkout.css';
import { useOverlay } from './useOverlay';
import { formatMoneyCents, type MockOrder } from '../lib/checkout';

type Props = { order: MockOrder; imageRoot: string; onContinueShopping: () => void };

export default function OrderConfirmation({ order, imageRoot, onContinueShopping }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useOverlay(root, onContinueShopping, '#confirmation-title');
  const c = order.customer;
  const name = `${c.firstName} ${c.lastName}`.trim();
  const addr = [c.address, c.apartment, `${c.city}, ${c.state} ${c.postalCode}`, c.country].filter(Boolean);
  const when = new Date(order.createdAt).toLocaleString();

  return (
    <div className="ck-root" ref={root} role="dialog" aria-modal="true" aria-labelledby="confirmation-title" data-testid="confirmation-page">
      <div className="ck-bar">
        <span>NEOTIC SUPPLY / ORDER</span>
        <span className="ck-bar-mid">TEST / DEMO ORDER</span>
        <button type="button" className="ck-btn" onClick={onContinueShopping}>CLOSE</button>
      </div>
      <div className="ck-scroll">
        <div className="ck-grid">
          <div className="ck-main">
            <span className="ck-kicker">DROP 001 / {when}</span>
            <h2 className="display ck-title ck-confirm-title" id="confirmation-title" tabIndex={-1}>ORDER<br /><em>CONFIRMED.</em></h2>
            <p className="ck-lede" style={{ color: '#e9e8e1', fontSize: 15 }}>THANK YOU FOR ENTERING THE UNIVERSE.</p>
            <div className="ck-ref" data-testid="order-reference"><span className="ck-ref-l">ORDER REFERENCE</span>{order.reference}</div>
            <div className="ck-demo" data-testid="confirmation-demo-banner"><b>TEST / DEMO ORDER</b><span>No payment was charged. No real fulfillment will happen and no confirmation email was sent.</span></div>

            <section className="ck-section">
              <h3 className="ck-h">CONTACT</h3>
              <dl className="ck-dl">
                <dt>EMAIL</dt><dd>{c.email}</dd>
                {c.phone && <><dt>PHONE</dt><dd>{c.phone}</dd></>}
              </dl>
            </section>
            <section className="ck-section">
              <h3 className="ck-h">SHIP TO</h3>
              <dl className="ck-dl">
                <dt>NAME</dt><dd>{name}</dd>
                <dt>ADDRESS</dt><dd>{addr.map((l, i) => <span key={i}>{l}<br /></span>)}</dd>
              </dl>
            </section>
            <section className="ck-section">
              <h3 className="ck-h">DELIVERY</h3>
              <dl className="ck-dl">
                <dt>METHOD</dt><dd>STANDARD SHIPPING</dd>
                <dt>ESTIMATE</dt><dd>Estimate available when shipping launches.</dd>
              </dl>
            </section>
            <button type="button" className="ck-place" data-testid="confirmation-continue-shopping" onClick={onContinueShopping}>CONTINUE SHOPPING <ArrowRight size={16} /></button>
          </div>

          <aside className="ck-side" aria-labelledby="ck-conf-summary">
            <div className="ck-sticky">
              <h3 className="ck-summary-h" id="ck-conf-summary">YOUR ORDER <span>{order.lines.reduce((n, l) => n + l.quantity, 0)} ITEMS</span></h3>
              <ul className="ck-lines">
                {order.lines.map(({ product, quantity, size }) => (
                  <li className="ck-line" key={`${product.id}-${size}`} data-testid={`confirmation-line-${product.id}-${size.toLowerCase()}`}>
                    <img className="ck-thumb" src={`${imageRoot}${product.image}`} srcSet={productImageSources(`${imageRoot}${product.image}`)} sizes="64px" decoding="async" alt={`${product.name}, ${product.color.toLowerCase()}`} />
                    <div>
                      <div className="ck-line-name">{product.name}</div>
                      <div className="ck-line-meta">{product.characterNumber} / {product.color}<br />SIZE {size} / QTY {quantity}</div>
                    </div>
                    <div className="ck-line-price">{formatMoneyCents(Math.round(product.price * 100) * quantity)}</div>
                  </li>
                ))}
              </ul>
              <div className="ck-rows">
                <div className="ck-row"><span>SUBTOTAL</span><span>{formatMoneyCents(order.subtotalCents)}</span></div>
                <div className="ck-row"><span>SHIPPING<em>DEMO PLACEHOLDER</em></span><span>{formatMoneyCents(order.shippingCents)}</span></div>
                <div className="ck-row total"><span>TOTAL</span><span data-testid="confirmation-total">{formatMoneyCents(order.totalCents)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
