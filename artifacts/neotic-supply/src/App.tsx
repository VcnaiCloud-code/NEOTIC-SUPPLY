import { useEffect, useMemo, useRef, useState } from 'react';
import { productImageSources, productThumbnail } from './lib/product-images';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import Hero from './components/Hero';
import World from './components/World';
import CharacterArchive from './components/CharacterArchive';
import About from './components/About';
import { useOverlay } from './components/useOverlay';
import { loadBag, saveBag } from './lib/cart-storage';
import { ArrowDownRight, ArrowRight, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { cartSubtotalCents, createMockOrder, emptyShippingInfo, validateShippingInfo } from './lib/checkout';
import type { Product, CartLine, ShippingInfo, MockOrder } from './lib/checkout';

const products: Product[] = [
  { id: 'neo-tee', name: 'NEO TEE', character: 'NEO', characterNumber: '001', color: 'BLACK', tagline: 'THE CHAOS MIND', availability: 'AVAILABLE', price: 34.99, image: 'neo-tee-transparent.png' },
  { id: 'vex-tee', name: 'VEX TEE', character: 'VEX', characterNumber: '002', color: 'WHITE', tagline: 'THE DREAMER', availability: 'AVAILABLE', price: 29.99, image: 'vex-tee-transparent.png' },
  { id: 'raze-tee', name: 'RAZE TEE', character: 'RAZE', characterNumber: '003', color: 'WHITE', tagline: 'THE VISIONARY', availability: 'AVAILABLE', price: 32.99, image: 'raze-tee-transparent.png' },
  { id: 'miko-tee', name: 'MIKO TEE', character: 'MIKO', characterNumber: '004', color: 'WHITE', tagline: 'THE EXPLORER', availability: 'AVAILABLE', price: 29.99, image: 'miko-tee-transparent.png' },
];
const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const characters = [
  { name: 'NEO', index: '01 / 04', title: 'THE CHAOS MIND', quote: '“Ideas too big for this dimension.”', description: "Neo is impulsive, chaotic and always 10 steps ahead. He doesn't follow rules, he rewrites them.", image: 'char-neo.webp' },
  { name: 'VEX', index: '02 / 04', title: 'THE DREAMER', quote: '“Real world? That’s boring.”', description: "Vex lives in her own frequency. She sees things others can't and turns chaos into art.", image: 'char-vex.webp' },
  { name: 'RAZE', index: '03 / 04', title: 'THE VISIONARY', quote: '“I don’t see the future... I design it.”', description: 'Raze is calculated, silent and always in control. He moves in silence, but his ideas make noise.', image: 'char-raze.webp' },
  { name: 'MIKO', index: '04 / 04', title: 'THE EXPLORER', quote: '“New planet, same drip.”', description: 'Miko is curious, fearless and always looking for the next adventure. For them, every place is a new playground.', image: 'char-miko.webp' },
];
const brandRoot = '/brand/';
const dropDeadline = Date.parse('2026-10-04T00:00:00Z');

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function App() {
  const [cart, setCart] = useState<CartLine[]>(() => loadBag(products, shirtSizes));
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(Date.now());
  const [checkoutStage, setCheckoutStage] = useState<'storefront' | 'checkout' | 'confirmation'>('storefront');
  const [checkoutCustomer, setCheckoutCustomer] = useState<ShippingInfo>({ ...emptyShippingInfo });
  const [mockOrder, setMockOrder] = useState<MockOrder | null>(null);
  const orderSubmitted = useRef(false);
  const cartRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  useOverlay(cartRef, () => setCartOpen(false), '[data-testid="cart-close"]', cartOpen);

  useEffect(() => {
    if (!menuOpen) return;
    headerRef.current?.querySelector<HTMLElement>('.navlinks a')?.focus({ preventScroll: true });
    const mobile = window.matchMedia('(max-width:680px)');
    const onResize = () => { if (!mobile.matches) setMenuOpen(false); };
    mobile.addEventListener('change', onResize);
    return () => mobile.removeEventListener('change', onResize);
  }, [menuOpen]);
  useEffect(() => { saveBag(cart); }, [cart]);
  useEffect(() => {
    // React mounts after the browser's first fragment lookup. Restore genuine
    // in-page links once DOM targets exist, without changing native history.
    const frame = requestAnimationFrame(() => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    const onHistory = () => {
      setMenuOpen(false);
      setSearchOpen(false);
      setCartOpen(false);
      setSelectedProduct(null);
      setCheckoutStage('storefront');
    };
    window.addEventListener('popstate', onHistory);
    window.addEventListener('hashchange', onHistory);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('hashchange', onHistory);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? products.filter((product) => `${product.name} ${product.character} ${product.characterNumber} ${product.tagline} ${product.color}`.toLowerCase().includes(term)) : products;
  }, [query]);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const total = cartSubtotalCents(cart) / 100;
  const timeLeft = Math.max(0, dropDeadline - now);
  const countdown = {
    days: Math.floor(timeLeft / 86400000),
    hours: Math.floor((timeLeft / 3600000) % 24),
    minutes: Math.floor((timeLeft / 60000) % 60),
    seconds: Math.floor((timeLeft / 1000) % 60),
  };

  useEffect(() => {
    const deadline = dropDeadline;
    if (Date.now() >= deadline) return;
    const timer = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= deadline) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2100);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.defaultPrevented && menuOpenRef.current && headerRef.current) {
        const items = Array.from(headerRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
          .filter(el => el.getClientRects().length > 0 && !el.closest('[inert]'));
        if (items.length) {
          event.preventDefault();
          const index = items.indexOf(document.activeElement as HTMLElement);
          const next = index < 0 ? (event.shiftKey ? items.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
          items[next].focus({ preventScroll: true });
        }
      }
      if (event.key === 'Escape') {
        if (menuOpenRef.current) menuToggleRef.current?.focus({ preventScroll: true });
        setCartOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
    if (!targets.length) return;

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [filteredProducts]);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-parallax]');
    if (!targets.length) return;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 680px)');
    const distance = 12;
    const values = new Map<HTMLElement, string>();
    let frame = 0;
    const update = () => {
      frame = 0;
      if (reduceMq.matches || mobileMq.matches) {
        targets.forEach(target => target.style.removeProperty('--parallax-y'));
        values.clear();
        return;
      }
      const viewportHeight = window.innerHeight;
      // Finish all reads before writing styles; don't repaint identical values.
      const samples = Array.from(targets).map((target) => {
        const bounds = target.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > viewportHeight) return null;
        const progress = (viewportHeight - bounds.top) / (viewportHeight + bounds.height) - 0.5;
        const offset = Math.max(-distance, Math.min(distance, progress * distance * 2));
        return { target, value: `${offset.toFixed(1)}px` };
      });
      samples.forEach(sample => {
        if (!sample || values.get(sample.target) === sample.value) return;
        sample.target.style.setProperty('--parallax-y', sample.value);
        values.set(sample.target, sample.value);
      });
    };
    const onScroll = () => {
      if (document.hidden || reduceMq.matches || mobileMq.matches) return;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onMotionChange = () => {
      if (frame) window.cancelAnimationFrame(frame);
      update();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    reduceMq.addEventListener('change', onMotionChange);
    mobileMq.addEventListener('change', onMotionChange);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      reduceMq.removeEventListener('change', onMotionChange);
      mobileMq.removeEventListener('change', onMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const addToCart = (product: Product, size: string) => {
    setMenuOpen(false);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id && line.size === size);
      if (existing) return current.map((line) => line.product.id === product.id && line.size === size ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { product, quantity: 1, size }];
    });
    setSelectedProduct(null);
    setToast(`${product.name} / ${size} — AÑADIDO A LA BOLSA`);
    setCartOpen(true);
  };
  const updateQuantity = (id: string, size: string, amount: number) => {
    setCart((current) => current.map((line) => line.product.id === id && line.size === size ? { ...line, quantity: Math.max(1, line.quantity + amount) } : line));
  };
  const chooseSize = (product: Product, size: string) => {
    setSelectedSizes((current) => ({ ...current, [product.id]: size }));
  };
  const selectedSizeFor = (product: Product) => selectedSizes[product.id] ?? 'M';
  const jumpTo = (id: string) => {
    setMenuOpen(false);
    // Button-driven section changes need the same URL/history destination as
    // native anchors. pushState preserves an intentionally opened search panel.
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById(id)?.scrollIntoView({ behavior });
  };
  const openCheckout = () => {
    if (!cart.length) return;
    orderSubmitted.current = false;
    setMockOrder(null);
    setCartOpen(false);
    setSelectedProduct(null);
    setCheckoutStage('checkout');
  };
  const placeDemoOrder = () => {
    if (orderSubmitted.current || !cart.length || Object.keys(validateShippingInfo(checkoutCustomer)).length) return;
    // Create an independent confirmation snapshot before clearing the live cart.
    const confirmation = createMockOrder(cart, checkoutCustomer);
    orderSubmitted.current = true;
    setMockOrder(confirmation);
    setCheckoutStage('confirmation');
    setCart([]);
    setCheckoutCustomer({ ...emptyShippingInfo });
  };
  const returnFromCheckoutToShop = () => {
    setCheckoutStage('storefront');
    setCartOpen(false);
    setMockOrder(null);
    jumpTo('shop');
  };

  return (
    <>
      <div className="topbar" data-testid="announcement-bar">DROP 001 — 04.10.26 &nbsp; / &nbsp; SHIPPING WORLDWIDE</div>
      <header className="nav" ref={headerRef}>
        <a className="brand" href="#home" aria-label="NEOTIC SUPPLY home" onClick={() => setMenuOpen(false)}>NEOTIC<small>SUPPLY</small></a>
        <nav id="main-navigation" className={`navlinks ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#shop" onClick={() => setMenuOpen(false)}>SHOP</a>
          <a href="#characters" onClick={() => setMenuOpen(false)}>CHARACTERS</a>
          <a href="#world" onClick={() => setMenuOpen(false)}>THE WORLD</a>
          <a href="#drop" onClick={() => setMenuOpen(false)}>DROPS</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-action" aria-label="Search products" data-testid="search-toggle" onClick={() => { setSearchOpen((open) => !open); jumpTo('shop'); }}>
            <Search size={17} strokeWidth={1.5} />
          </button>
          <button className="nav-action mono" aria-label={`Open bag, ${itemCount} items`} data-testid="cart-toggle" onClick={() => { setMenuOpen(false); setSelectedProduct(null); setCartOpen(true); }}>
            <ShoppingBag size={16} strokeWidth={1.5} /><span className="bag-count" data-testid="cart-count">{String(itemCount).padStart(2, '0')}</span>
          </button>
        </div>
        <button ref={menuToggleRef} className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="main-navigation" data-testid="menu-toggle" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <Hero characters={characters} imageRoot={brandRoot} active={!cartOpen && !selectedProduct && !menuOpen && checkoutStage === 'storefront'} />

        <section className="section" id="shop" aria-labelledby="shop-title">
          <div className="wrap">
            <div className="shop-intro" data-reveal>
              <div>
                <span className="kicker">01 / SHOP — DROP 001</span>
                <h2 className="section-title display" id="shop-title">STUFF THAT<br /><em>FEELS ALIVE.</em></h2>
              </div>
              <div>
                <p className="section-note">Ediciones limitadas. Gráficos imposibles. Solo NEOTIC.</p>
                {searchOpen && <label className="search-label"><input className="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BUSCAR EN EL DROP..." aria-label="Search products" data-testid="product-search" autoFocus /></label>}
              </div>
            </div>
            {!searchOpen && <div className="section-note" style={{ margin: '-14px 0 26px' }}>Four pieces. One universe. Built to be worn out there.</div>}
            {searchOpen && query && <div className="mono" style={{ fontSize: 9, color: '#929a94', marginBottom: 14 }} data-testid="search-results-count">{filteredProducts.length} RESULT{filteredProducts.length === 1 ? '' : 'S'} / {products.length}</div>}
            <div className="products" data-testid="product-grid">
              {filteredProducts.length ? filteredProducts.map((product) => (
                <article className="product" key={product.id} data-testid={`product-${product.id}`} data-reveal>
                  <button className="product-preview" type="button" aria-label={`View details for ${product.name}`} onClick={() => { setMenuOpen(false); setCartOpen(false); setSelectedProduct(product); }} data-testid={`product-detail-open-${product.id}`}>
                    <div className="product-visual">
                      <span className="product-no">{product.character} / {product.characterNumber}</span>
                      <img className="product-img" src={`${brandRoot}${product.image}`} srcSet={productImageSources(`${brandRoot}${product.image}`)} sizes="(max-width:900px) 46vw, 24vw" alt={`${product.name}, official ${product.color.toLowerCase()} NEOTIC SUPPLY shirt`} loading="lazy" decoding="async" />
                      <span className="product-view">VIEW DETAILS <ArrowRight size={13} /></span>
                    </div>
                  </button>
                  <div className="product-meta">
                    <div className="product-name-group">
                      <span className="product-name">{product.name}</span>
                      <span className="product-character-line">{product.characterNumber} / {product.tagline}</span>
                    </div>
                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                  <div className="product-availability"><span aria-hidden="true">●</span>{product.availability}</div>
                  <div className="size-select-card">
                    <div className="size-select-heading"><span>SELECT SIZE</span><span>SIZE {selectedSizeFor(product)}</span></div>
                    <div className="size-options card-size-options" role="group" aria-label={`Select size for ${product.name}`}>
                      {shirtSizes.map((size) => <button type="button" className={`size-option ${selectedSizeFor(product) === size ? 'selected' : ''}`} aria-pressed={selectedSizeFor(product) === size} key={size} onClick={() => chooseSize(product, size)} data-testid={`card-size-${product.id}-${size.toLowerCase()}`}>{size}</button>)}
                    </div>
                  </div>
                  <button className="add-button" onClick={() => addToCart(product, selectedSizeFor(product))} data-testid={`add-${product.id}`}>ADD TO BAG <span aria-hidden="true">＋</span></button>
                </article>
              )) : <div className="empty-search" data-testid="search-empty">NO MATCH FOUND.<br />Prueba otro término. El universo es grande.</div>}
            </div>
          </div>
        </section>

        <CharacterArchive
          characters={characters}
          imageRoot={brandRoot}
          active={!cartOpen && !selectedProduct && !menuOpen && checkoutStage === 'storefront'}
          onOpenProduct={(name) => {
            const product = products.find((item) => item.character === name);
            if (!product) throw new Error(`Missing canonical product for ${name}`);
            setMenuOpen(false);
            setCartOpen(false);
            setSelectedProduct(product);
          }}
        />

        <World
          characters={characters}
          imageRoot={brandRoot}
          active={!cartOpen && !selectedProduct && !menuOpen && checkoutStage === 'storefront'}
        />

        <section className="section drop-section" id="drop" aria-labelledby="drop-title" data-parallax>
          <div className="wrap drop-inner" data-reveal>
            <span className="kicker">04 / NEXT DROP</span>
            <h2 className="display" id="drop-title">DROP <em>001</em></h2>
            <p className="drop-line">WEAR THE UNREAL</p>
            <div className="countdown" aria-label="Countdown to October 4, 2026">
              {Object.entries(countdown).map(([unit, value]) => <div className="time-unit" key={unit} data-testid={`countdown-${unit}`}><strong>{String(value).padStart(2, '0')}</strong><span>{({ days: 'DÍAS', hours: 'HORAS', minutes: 'MIN', seconds: 'SEG' } as Record<string, string>)[unit]}</span></div>)}
            </div>
            <div className="date-label" data-testid="drop-date">04.10.26 &nbsp; / &nbsp; 00:00 UTC</div>
            <a className="button" href="#shop" data-testid="drop-shop-link">VER DROP <ArrowDownRight size={16} /></a>
          </div>
        </section>

        <About />
        <div className="manifesto" aria-label="Wear the unreal"><span>NEOTIC SUPPLY — WEAR THE UNREAL — SAME MINDSET, DIFFERENT UNIVERSE — REAL PEOPLE WEAR NEOTIC — </span></div>
      </main>

      <footer className="footer">
        <div><div className="footer-brand">NEOTIC SUPPLY</div><span>EST. 2025 / MADE FOR THE UNREAL</span></div>
        <nav className="footer-nav" aria-label="Footer navigation"><a href="#shop">SHOP</a><a href="#characters">CHARACTERS</a><a href="#world">THE WORLD</a><a href="#drop">DROPS</a></nav>
        <span>© 2026 NEOTIC SUPPLY</span>
      </footer>

      <div className={`overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside ref={cartRef} className={`drawer ${cartOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!cartOpen} inert={!cartOpen} aria-label="Shopping bag" data-testid="cart-drawer">
        <div className="drawer-head"><h2>YOUR BAG <span style={{ color: '#78d2d0' }}>({itemCount})</span></h2><button className="close-button" aria-label="Close bag" data-testid="cart-close" onClick={() => setCartOpen(false)}><X size={18} /></button></div>
        {cart.length ? <>
          <div className="cart-items">{cart.map(({ product, quantity, size }) => <div className="cart-item" key={`${product.id}-${size}`} data-testid={`cart-line-${product.id}-${size.toLowerCase()}`}>
            <div className="cart-thumb" style={{ backgroundImage: `url('${productThumbnail(`${brandRoot}${product.image}`)}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
            <div><div className="cart-item-name">{product.name}</div><div className="cart-item-size">{product.characterNumber} / {product.color} / SIZE {size}</div><div className="cart-item-price">{formatPrice(product.price)}</div><div className="quantity">
              <button aria-label={`Remove one ${product.name}, size ${size}`} onClick={() => updateQuantity(product.id, size, -1)} data-testid={`quantity-minus-${product.id}-${size.toLowerCase()}`}>−</button><span>{quantity}</span><button aria-label={`Add one ${product.name}, size ${size}`} onClick={() => updateQuantity(product.id, size, 1)} data-testid={`quantity-plus-${product.id}-${size.toLowerCase()}`}>＋</button>
            </div></div>
            <button className="remove" aria-label={`Remove ${product.name}, size ${size}`} onClick={() => setCart((current) => current.filter((line) => line.product.id !== product.id || line.size !== size))} data-testid={`remove-${product.id}-${size.toLowerCase()}`}>REMOVE</button>
          </div>)}</div>
          <div className="cart-total"><span>SUBTOTAL</span><strong data-testid="cart-subtotal">{formatPrice(total)}</strong></div>
          <button className="button" style={{ width: '100%' }} onClick={openCheckout} data-testid="checkout-button">CONTINUE TO CHECKOUT <ArrowRight size={16} /></button>
          <p className="checkout-note">Demo checkout only. No payment will be collected.</p>
        </> : <div className="cart-empty" data-testid="cart-empty">TU BOLSA ESTÁ VACÍA.<br /><span>Some strange things belong in here.</span><button className="button" onClick={() => { setCartOpen(false); jumpTo('shop'); }}>EXPLORAR EL DROP <ArrowRight size={15} /></button></div>}
      </aside>
      {selectedProduct && <ProductDetail
        product={selectedProduct}
        imageSrc={`${brandRoot}${selectedProduct.image}`}
        selectedSize={selectedSizeFor(selectedProduct)}
        sizes={shirtSizes}
        onSelectSize={(size) => chooseSize(selectedProduct, size)}
        onAddToBag={() => addToCart(selectedProduct, selectedSizeFor(selectedProduct))}
        onClose={() => setSelectedProduct(null)}
        onBackToShop={() => { setSelectedProduct(null); jumpTo('shop'); }}
      />}
      {checkoutStage === 'checkout' && <Checkout
        cart={cart}
        customer={checkoutCustomer}
        onCustomerChange={setCheckoutCustomer}
        imageRoot={brandRoot}
        onBackToBag={() => { setCheckoutStage('storefront'); setCartOpen(true); }}
        onBackToShop={returnFromCheckoutToShop}
        onPlaceOrder={placeDemoOrder}
      />}
      {checkoutStage === 'confirmation' && mockOrder && <OrderConfirmation
        order={mockOrder}
        imageRoot={brandRoot}
        onContinueShopping={returnFromCheckoutToShop}
      />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="toast">{toast}</div>
    </>
  );
}

export default App;