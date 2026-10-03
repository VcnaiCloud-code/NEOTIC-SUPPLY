import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, Menu, Search, ShoppingBag, X } from 'lucide-react';

type Product = { id: string; name: string; price: number; image: string; tag: string };
type CartLine = { product: Product; quantity: number };

const products: Product[] = [
  { id: 'crew-tee', name: 'AFTER HOURS / CREW TEE', price: 34.99, image: 'product-neo.webp', tag: 'DROP 001 / 01' },
  { id: 'neo-tee', name: 'NEO / PORTRAIT TEE', price: 32.99, image: 'product-vex.webp', tag: 'DROP 001 / 02' },
  { id: 'core-black', name: 'CORE / BACK PRINT TEE', price: 29.99, image: 'product-miko.webp', tag: 'CORE / 03' },
  { id: 'neo-back', name: 'NEO / 001 BACK PRINT', price: 29.99, image: 'product-core.webp', tag: 'CORE / 04' },
];
const characters = [
  { name: 'NEO', index: '01 / 04', title: 'THE CHAOS MIND', quote: '“Ideas too big for this dimension.”', description: "Neo is impulsive, chaotic and always 10 steps ahead. He doesn't follow rules, he rewrites them.", image: 'char-neo.webp' },
  { name: 'VEX', index: '02 / 04', title: 'THE DREAMER', quote: '“Real world? That’s boring.”', description: "Vex lives in her own frequency. She sees things others can't and turns chaos into art.", image: 'char-vex.webp' },
  { name: 'RAZE', index: '03 / 04', title: 'THE VISIONARY', quote: '“I don’t see the future... I design it.”', description: 'Raze is calculated, silent and always in control. He moves in silence, but his ideas make noise.', image: 'char-raze.webp' },
  { name: 'MIKO', index: '04 / 04', title: 'THE EXPLORER', quote: '“New planet, same drip.”', description: 'Miko is curious, fearless and always looking for the next adventure. For them, every place is a new playground.', image: 'char-miko.webp' },
];
const brandRoot = '/brand/';

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [character, setCharacter] = useState(0);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(Date.now());

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? products.filter((product) => product.name.toLowerCase().includes(term)) : products;
  }, [query]);
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const timeLeft = Math.max(0, new Date('2026-10-04T00:00:00').getTime() - now);
  const countdown = {
    days: Math.floor(timeLeft / 86400000),
    hours: Math.floor((timeLeft / 3600000) % 24),
    minutes: Math.floor((timeLeft / 60000) % 60),
    seconds: Math.floor((timeLeft / 1000) % 60),
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2100);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) return current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { product, quantity: 1 }];
    });
    setToast(`${product.name} — ADDED TO BAG`);
    setCartOpen(true);
  };
  const updateQuantity = (id: string, amount: number) => {
    setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: line.quantity + amount } : line).filter((line) => line.quantity > 0));
  };
  const jumpTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const currentCharacter = characters[character];

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="topbar" data-testid="announcement-bar"><span>DROP 001 / 04.10.26</span><i /> SHIPPING WORLDWIDE — MADE FOR THE UNREAL</div>
      <header className="nav">
        <a className="brand" href="#home" aria-label="NEOTIC SUPPLY home" onClick={() => setMenuOpen(false)}>NEOTIC<small>SUPPLY</small></a>
        <nav className={`navlinks ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
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
          <button className="nav-action mono" aria-label={`Open bag, ${itemCount} items`} data-testid="cart-toggle" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={16} strokeWidth={1.5} /><span className="bag-count" data-testid="cart-count">{String(itemCount).padStart(2, '0')}</span>
          </button>
        </div>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} data-testid="menu-toggle" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="side-star" aria-hidden="true" />
          <div className="wrap hero-content">
            <span className="eyebrow">EST. 2025 &nbsp; / &nbsp; CHARACTER-LED STREETWEAR</span>
            <h1 className="display" id="hero-title">NEOTIC<br /><em>SUPPLY</em></h1>
            <p className="hero-sub">Urban wear for what’s next. Made for people who’d rather be unmistakable than understood.</p>
            <a className="button" href="#shop" data-testid="hero-shop-link">ENTER THE UNIVERSE <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-side">SAME MINDSET. DIFFERENT UNIVERSE.</div>
        </section>

        <section className="section" id="shop" aria-labelledby="shop-title">
          <div className="wrap">
            <div className="shop-intro">
              <div>
                <span className="kicker">01 / SHOP — DROP 001</span>
                <h2 className="section-title display" id="shop-title">THE DROP<br /><em>001.</em></h2>
              </div>
              <div>
                <p className="section-note">Four new uniforms from another frequency. Limited run. No reruns.</p>
                {searchOpen && <label className="search-label"><input className="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="BUSCAR EN EL DROP..." aria-label="Search products" data-testid="product-search" autoFocus /></label>}
              </div>
            </div>
            {!searchOpen && <div className="shop-subline"><span>01—04 / THE FIRST TRANSMISSION</span><span>DESIGNED IN THE NEOTIC DISTRICT</span></div>}
            {searchOpen && query && <div className="mono" style={{ fontSize: 9, color: '#929a94', marginBottom: 14 }} data-testid="search-results-count">{filteredProducts.length} RESULT{filteredProducts.length === 1 ? '' : 'S'} / {products.length}</div>}
            <div className="products" data-testid="product-grid">
              {filteredProducts.length ? filteredProducts.map((product) => (
                <article className="product" key={product.id} data-testid={`product-${product.id}`}>
                  <div className="product-visual">
                    <span className="product-no">{product.tag}</span>
                    <div className="product-img" style={{ backgroundImage: `url('${brandRoot}${product.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} role="img" aria-label={`${product.name} graphic tee`} />
                  </div>
                  <div className="product-meta"><span>{product.name}</span><strong>{formatPrice(product.price)}</strong></div>
                  <button className="add-button" onClick={() => addToCart(product)} data-testid={`add-${product.id}`}>ADD TO BAG <span aria-hidden="true">＋</span></button>
                </article>
              )) : <div className="empty-search" data-testid="search-empty">NO MATCH FOUND.<br />Prueba otro término. El universo es grande.</div>}
            </div>
          </div>
        </section>

        <section className="section character-section" id="characters" aria-labelledby="characters-title">
          <div className="wrap">
            <div className="section-heading">
              <div><span className="kicker">02 / CHARACTERS</span><h2 className="section-title display" id="characters-title">MEET<br /><em>THE CREW.</em></h2></div>
              <p className="section-note">Different faces, same soul. Cambia de personaje para explorar las caras de este universo.</p>
            </div>
            <div className="character-stage" data-testid="character-stage">
              <div className="character-image" style={{ backgroundImage: `url('${brandRoot}${currentCharacter.image}')` }} role="img" aria-label={`${currentCharacter.name} character artwork`} data-testid="character-image" />
              <div className="character-info">
                <span className="kicker" data-testid="character-index">{currentCharacter.index} &nbsp; / &nbsp; {currentCharacter.title}</span>
                <h3 className="display" data-testid="character-name">{currentCharacter.name}</h3>
                <p className="character-quote" data-testid="character-quote">{currentCharacter.quote}</p>
                <p data-testid="character-description">{currentCharacter.description}</p>
                <div className="character-control">
                  <span className="mono" style={{ color: '#929991', fontSize: 9 }}>SWIPE YOUR REALITY</span>
                  <div className="arrow-group">
                    <button className="arrow" aria-label="Previous character" data-testid="character-prev" onClick={() => setCharacter((character - 1 + characters.length) % characters.length)}><ArrowLeft size={17} /></button>
                    <button className="arrow" aria-label="Next character" data-testid="character-next" onClick={() => setCharacter((character + 1) % characters.length)}><ArrowRight size={17} /></button>
                  </div>
                </div>
                <div className="character-select" aria-label="Choose a character">
                  {characters.map((item, index) => <button key={item.name} aria-label={`View ${item.name}`} aria-pressed={character === index} className={character === index ? 'selected' : ''} onClick={() => setCharacter(index)}>{item.name}<span>0{index + 1}</span></button>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section world" id="world" aria-labelledby="world-title">
          <div className="wrap">
            <div className="world-copy">
            <span className="kicker">03 / THE WORLD</span>
              <h2 className="display" id="world-title">NOT MADE<br />FOR <em>HERE.</em></h2>
              <p>A city with a pulse. Four characters with their own gravity. Follow the signal and find your way in.</p>
              <button className="button" onClick={() => jumpTo('characters')} data-testid="explore-world">EXPLORAR EL UNIVERSO <ArrowDownRight size={16} /></button>
            </div>
            <span className="coordinates">NEOTIC DISTRICT / 001</span><span className="coordinates two">THE DROP ROOM</span><span className="coordinates three">CHARACTER ARCHIVE</span>
          </div>
        </section>

        <section className="section drop-section" id="drop" aria-labelledby="drop-title">
          <div className="wrap drop-inner">
            <span className="kicker">04 / NEXT DROP</span>
            <h2 className="display" id="drop-title">DROP <em>001</em></h2>
            <p className="drop-line">THE FIRST TRANSMISSION / LIMITED UNITS</p>
            <div className="countdown" aria-label="Countdown to October 4, 2026">
              {Object.entries(countdown).map(([unit, value]) => <div className="time-unit" key={unit} data-testid={`countdown-${unit}`}><strong>{String(value).padStart(2, '0')}</strong><span>{({ days: 'DÍAS', hours: 'HORAS', minutes: 'MIN', seconds: 'SEG' } as Record<string, string>)[unit]}</span></div>)}
            </div>
            <div className="date-label" data-testid="drop-date">04.10.26 &nbsp; / &nbsp; 00:00 UTC</div>
            <a className="button" href="#shop" data-testid="drop-shop-link">VER DROP <ArrowDownRight size={16} /></a>
          </div>
        </section>

        <section className="section about" id="about" aria-labelledby="about-title">
          <div className="wrap about-content">
            <span className="kicker">05 / OUR FREQUENCY</span>
            <h2 className="display" id="about-title">BE SEEN.<br /><em>NOT DECODED.</em></h2>
            <p>NEOTIC SUPPLY is an independent streetwear universe built around original characters, strange places, and the people who never needed to fit the frame.</p>
            <a className="button" href="#characters">MEET THE CREW <ArrowDownRight size={16} /></a>
          </div>
        </section>
        <div className="manifesto" aria-label="Wear the unreal"><span>NEOTIC SUPPLY — WEAR THE UNREAL — SAME MINDSET, DIFFERENT UNIVERSE — REAL PEOPLE WEAR NEOTIC — </span></div>
      </main>

      <footer className="footer">
        <div><div className="footer-brand">NEOTIC SUPPLY</div><span>EST. 2025 / MADE FOR THE UNREAL</span></div>
        <nav className="footer-nav" aria-label="Footer navigation"><a href="#shop">SHOP</a><a href="#characters">CHARACTERS</a><a href="#world">THE WORLD</a><a href="#drop">DROPS</a></nav>
        <span>© 2026 NEOTIC SUPPLY</span>
      </footer>

      <div className={`overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className={`drawer ${cartOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping bag" data-testid="cart-drawer">
        <div className="drawer-head"><h2>YOUR BAG <span style={{ color: '#78d2d0' }}>({itemCount})</span></h2><button className="close-button" aria-label="Close bag" data-testid="cart-close" onClick={() => setCartOpen(false)}><X size={18} /></button></div>
        {cart.length ? <>
          <div className="cart-items">{cart.map(({ product, quantity }) => <div className="cart-item" key={product.id} data-testid={`cart-line-${product.id}`}>
            <div className="cart-thumb" style={{ backgroundImage: `url('${brandRoot}${product.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div><div className="cart-item-name">{product.name}</div><div className="cart-item-price">{formatPrice(product.price)}</div><div className="quantity">
              <button aria-label={`Remove one ${product.name}`} onClick={() => updateQuantity(product.id, -1)} data-testid={`quantity-minus-${product.id}`}>−</button><span>{quantity}</span><button aria-label={`Add one ${product.name}`} onClick={() => updateQuantity(product.id, 1)} data-testid={`quantity-plus-${product.id}`}>＋</button>
            </div></div>
            <button className="remove" onClick={() => setCart((current) => current.filter((line) => line.product.id !== product.id))} data-testid={`remove-${product.id}`}>REMOVE</button>
          </div>)}</div>
          <div className="cart-total"><span>SUBTOTAL</span><strong data-testid="cart-subtotal">{formatPrice(total)}</strong></div>
          <button className="button" style={{ width: '100%' }} onClick={() => { setCartOpen(false); setToast('CHECKOUT NO DISPONIBLE — DROP 001 SOON'); }} data-testid="checkout-button">CONTINUE TO CHECKOUT <ArrowRight size={16} /></button>
          <p className="checkout-note">Checkout is not active yet. No payment will be collected.</p>
        </> : <div className="cart-empty" data-testid="cart-empty">TU BOLSA ESTÁ VACÍA.<br /><span>Some strange things belong in here.</span><button className="button" onClick={() => { setCartOpen(false); jumpTo('shop'); }}>EXPLORAR EL DROP <ArrowRight size={15} /></button></div>}
      </aside>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite" data-testid="toast">{toast}</div>
    </>
  );
}

export default App;