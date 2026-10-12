import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Instagram,
  MapPin,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';

type Promotion = {
  id: string;
  pieces: number;
  title: string;
  description: string;
  price: number;
  image: string;
};

type CartEntry = { productId: string; quantity: number };
type OrderInfo = {
  number: string;
  name: string;
  fulfillment: 'delivery' | 'pickup';
  total: number;
};

const publicAsset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const promotions: Promotion[] = [
  {
    id: 'promo-10',
    pieces: 10,
    title: 'Antojo',
    description: 'Un gustito para empezar la noche como corresponde.',
    price: 9990,
    image: publicAsset('/images/sushi-10.webp'),
  },
  {
    id: 'promo-20',
    pieces: 20,
    title: 'Plan de dos',
    description: 'La dupla perfecta para compartir sin apuro.',
    price: 16990,
    image: publicAsset('/images/sushi-20.webp'),
  },
  {
    id: 'promo-30',
    pieces: 30,
    title: 'La juntada',
    description: 'Para esa mesa que siempre termina pidiendo algo más.',
    price: 20000,
    image: publicAsset('/images/sushi-30.webp'),
  },
  {
    id: 'promo-40',
    pieces: 40,
    title: 'Mesa larga',
    description: 'Abundante, variado y listo para compartir entre amigos.',
    price: 27990,
    image: publicAsset('/images/sushi-40.webp'),
  },
  {
    id: 'promo-50',
    pieces: 50,
    title: 'La celebración',
    description: 'Cincuenta piezas para que nadie se quede mirando.',
    price: 32000,
    image: publicAsset('/images/sushi-50.webp'),
  },
];

const formatPrice = (price: number) =>
  `$${price.toLocaleString('es-CL').replace(/\./g, '.')}`;

function App() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('polisushi-cart-v1');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(
            parsed.filter(
              (item): item is CartEntry =>
                typeof item?.productId === 'string' &&
                promotions.some((product) => product.id === item.productId) &&
                Number.isInteger(item?.quantity) &&
                item.quantity > 0,
            ),
          );
        }
      }
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('polisushi-cart-v1', JSON.stringify(cart));
    } catch {
      // Cart remains usable for this visit when storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const cartDetails = useMemo(
    () =>
      cart
        .map((entry) => ({
          ...entry,
          product: promotions.find((product) => product.id === entry.productId),
        }))
        .filter((entry): entry is CartEntry & { product: Promotion } => Boolean(entry.product)),
    [cart],
  );
  const itemCount = cartDetails.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartDetails.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { productId, quantity: 1 }];
    });
    const product = promotions.find((item) => item.id === productId);
    setToast(`${product?.pieces ?? ''} piezas añadidas a tu pedido`);
  };

  const changeQuantity = (productId: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productId: string) =>
    setCart((current) => current.filter((item) => item.productId !== productId));

  const startCheckout = () => {
    setCartOpen(false);
    setOrder(null);
    setCheckoutOpen(true);
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cartDetails.length === 0) return;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const shortName = name.split(/\s+/)[0] || 'Hola';
    const orderNo = `PS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setOrder({ number: orderNo, name: shortName, fulfillment, total: subtotal });
    setCart([]);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setOrder(null);
  };

  const closeMenu = () => setMobileNavOpen(false);

  return (
    <div className="site-shell">
      <div className="announcement">
        <span>La cena ya está resuelta</span>
        <span aria-hidden="true">·</span>
        Promos frescas, listas para compartir
      </div>

      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#inicio" aria-label="Polisushi, ir al inicio" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">P</span>
            <span className="brand-name">poli<em>sushi</em></span>
          </a>
          <nav className={`nav ${mobileNavOpen ? 'mobile-open' : ''}`} aria-label="Navegación principal">
            <a href="#promos" onClick={closeMenu}>Promociones</a>
            <a href="#como-pedir" onClick={closeMenu}>Cómo pedir</a>
            <a href="#contacto" onClick={closeMenu}>Contacto</a>
          </nav>
          <div className="header-actions">
            <button className="cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${itemCount} artículos`}>
              <ShoppingBag size={17} strokeWidth={2.2} />
              <span className="cart-label">Tu pedido</span>
              <span className="cart-count">{itemCount}</span>
            </button>
            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy-wrap">
              <div className="eyebrow reveal">Sushi hecho para compartir</div>
              <h1 className="reveal delay-1">La noche pide <span>Polisushi.</span></h1>
              <p className="hero-copy reveal delay-2">
                Buen sushi, hartas piezas y cero vueltas. Elige tu promo favorita y deja que la
                cena se convierta en el mejor plan.
              </p>
              <div className="hero-cta reveal delay-3">
                <a className="button-primary" href="#promos">Ver promociones <ArrowRight size={17} /></a>
                <a className="text-link" href="#como-pedir">Así de fácil <ArrowDown size={15} /></a>
              </div>
              <div className="hero-note"><Check size={15} /> Precios claros, pedido fácil y rico de verdad.</div>
            </div>
            <div className="hero-art" aria-label="Una mesa abundante de sushi recién preparado">
              <div className="hero-ornament" aria-hidden="true" />
              <div className="hero-photo" role="img" aria-label="Bandeja colorida de sushi para compartir" />
              <div className="hero-scribble">BUEN<br />PLAN<br />AQUÍ</div>
              <div className="hero-sticker"><strong>La mesa feliz</strong><span>empieza con una buena promo</span></div>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <span key={copy}>Arma la mesa <span>elige tus piezas</span><span>comparte el antojo</span><span>pide sin complicarte</span></span>
            ))}
          </div>
        </div>

        <section className="promos container" id="promos">
          <div className="section-head">
            <div>
              <div className="eyebrow">Tu próxima buena decisión</div>
              <h2>Promos para<br />poner al centro.</h2>
            </div>
            <p>Desde un antojo hasta una mesa llena. Todo llega en piezas abundantes y a precio conocido.</p>
          </div>
          <div className="promo-grid">
            {promotions.map((promotion) => (
              <article className="promo-card" key={promotion.id}>
                <div className="promo-image">
                  <img src={promotion.image} alt={`Promoción de ${promotion.pieces} piezas de sushi`} loading="lazy" />
                  <span className="piece-tag">{promotion.pieces} piezas</span>
                </div>
                <div className="promo-body">
                  <div className="promo-titleline"><h3>{promotion.title}</h3></div>
                  <p className="promo-desc">{promotion.description}</p>
                  <div className="promo-foot">
                    <span className="price">{formatPrice(promotion.price)}</span>
                    <button className="add-button" type="button" onClick={() => addToCart(promotion.id)} aria-label={`Agregar promo ${promotion.pieces} piezas al carrito`}>
                      <Plus size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="how" id="como-pedir">
          <div className="container how-inner">
            <div className="how-title">
              <div className="eyebrow">Sin enredos, sin letra chica</div>
              <h2>De antojo<br />a pedido.</h2>
              <p>Elige, cuéntanos dónde y listo. Así de simple debería ser resolver una buena cena.</p>
            </div>
            <div className="steps">
              <div className="step"><span className="step-num">01 / ELIGE</span><h3>Arma tu mesa</h3><p>Agrega una o varias promos. Puedes ajustar cantidades en tu carrito.</p></div>
              <div className="step"><span className="step-num">02 / CUÉNTANOS</span><h3>Completa tus datos</h3><p>Déjanos un contacto y elige despacho o retiro para tu pedido.</p></div>
              <div className="step"><span className="step-num">03 / CONFIRMA</span><h3>Revisa antes de enviar</h3><p>Verás tu total y resumen. No pedimos datos de tarjeta ni cobramos en línea.</p></div>
              <div className="step"><span className="step-num">04 / CONFIRMACIÓN</span><h3>Revisa tu resumen</h3><p>En esta versión de prueba el pedido no se envía al restaurante ni se procesa un pago.</p></div>
            </div>
          </div>
        </section>

        <section className="contact container" id="contacto">
          <div className="contact-panel">
            <div>
              <div className="eyebrow">Estamos al otro lado</div>
              <h2>¿Juntada a la vista?</h2>
              <p>Cuéntanos tu plan. Síguenos para enterarte de novedades o escríbenos cuando el antojo no pueda esperar.</p>
            </div>
            <div className="contact-links">
              <a className="social-link" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <span className="social-link-label"><Instagram size={20} /><span>Instagram<small>Encuéntranos en redes</small></span></span><ChevronRight size={17} />
              </a>
              <a className="social-link" href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                <span className="social-link-label"><span className="facebook-mark" aria-hidden="true">f</span><span>Facebook<small>Polisushi en tu comunidad</small></span></span><ChevronRight size={17} />
              </a>
              <button className="social-link whatsapp-button" type="button" onClick={() => setToast('WhatsApp: celular del dueño pendiente de confirmar.')}>
                <span className="social-link-label"><span className="whatsapp-mark" aria-hidden="true">W</span><span>WhatsApp<small className="pending">Celular del dueño pendiente</small></span></span><ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <a className="brand" href="#inicio" aria-label="Polisushi, volver al inicio">
            <span className="brand-mark" aria-hidden="true">P</span><span className="brand-name">poli<em>sushi</em></span>
          </a>
          <span className="footer-copy">© {new Date().getFullYear()} Polisushi. Hecho para compartir.</span>
          <div className="footer-links"><a href="#promos">Promociones</a><a href="#como-pedir">Cómo pedir</a><a href="#contacto">Contacto</a></div>
        </div>
      </footer>

      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="Tu pedido" aria-modal="true" role="dialog" aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h2>Tu pedido <span className="cart-count">{itemCount}</span></h2>
          <button className="icon-button" type="button" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X size={19} /></button>
        </div>
        <div className="cart-items">
          {cartDetails.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-mark"><ShoppingCart size={28} /></div>
              <h3>Tu mesa está esperando.</h3>
              <p>Agrega una promo y aquí aparecerá el resumen de tu pedido.</p>
              <button className="button-primary" type="button" onClick={() => { setCartOpen(false); document.querySelector('#promos')?.scrollIntoView({ behavior: 'smooth' }); }}>Ver promociones <ArrowRight size={16} /></button>
            </div>
          ) : (
            cartDetails.map(({ product, quantity }) => (
              <div className="cart-row" key={product.id}>
                <img className="cart-thumb" src={product.image} alt="" />
                <div>
                  <h3>{product.title} · {product.pieces} piezas</h3>
                  <small>{formatPrice(product.price)} por promo</small>
                  <div className="quantity" aria-label={`Cantidad de ${product.title}`}>
                    <button type="button" aria-label={`Quitar una promo de ${product.pieces} piezas`} onClick={() => changeQuantity(product.id, -1)}><Minus size={13} /></button>
                    <span aria-live="polite">{quantity}</span>
                    <button type="button" aria-label={`Agregar una promo de ${product.pieces} piezas`} onClick={() => changeQuantity(product.id, 1)}><Plus size={13} /></button>
                  </div>
                </div>
                <div className="cart-row-price">
                  <span>{formatPrice(product.price * quantity)}</span><br />
                  <button className="remove-item" type="button" onClick={() => removeItem(product.id)}>Quitar</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-bottom">
          <div className="subtotal"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="subtotal-note">El despacho, si aplica, se coordina al confirmar.</div>
          <button className="button-primary checkout-button" type="button" disabled={!cartDetails.length} onClick={startCheckout}>Continuar con el pedido <ArrowRight size={17} /></button>
        </div>
      </aside>

      {checkoutOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCheckout(); }}>
          <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            {!order ? (
              <>
                <div className="checkout-top">
                  <div><h2 id="checkout-title">Prepara tu pedido.</h2><p>Completa los datos para ver una confirmación de prueba en esta página.</p></div>
                  <button className="icon-button" type="button" onClick={closeCheckout} aria-label="Cerrar formulario"><X size={19} /></button>
                </div>
                <form className="checkout-form" onSubmit={placeOrder}>
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="customer-name">Nombre y apellido</label>
                      <input id="customer-name" name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="¿A nombre de quién?" />
                    </div>
                    <div className="field">
                      <label htmlFor="customer-phone">Celular de contacto</label>
                      <input id="customer-phone" name="phone" type="tel" autoComplete="tel" required pattern="[+0-9 ()-]{8,20}" title="Ingresa un número de contacto válido." placeholder="+56 9 1234 5678" />
                    </div>
                    <div className="field full">
                      <label htmlFor="customer-email">Correo electrónico</label>
                      <input id="customer-email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder="tu@correo.cl" />
                    </div>
                    <div className="field full">
                      <label>¿Cómo recibes tu pedido?</label>
                      <div className="fulfillment">
                        <label><input type="radio" name="fulfillment" value="delivery" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} /> <Truck size={16} /> Despacho</label>
                        <label><input type="radio" name="fulfillment" value="pickup" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} /> <MapPin size={16} /> Retiro</label>
                      </div>
                    </div>
                    {fulfillment === 'delivery' && (
                      <>
                        <div className="field">
                          <label htmlFor="customer-address">Dirección</label>
                          <input id="customer-address" name="address" autoComplete="street-address" required maxLength={120} placeholder="Calle y número" />
                        </div>
                        <div className="field">
                          <label htmlFor="customer-commune">Comuna</label>
                          <input id="customer-commune" name="commune" autoComplete="address-level2" required maxLength={80} placeholder="Tu comuna" />
                        </div>
                      </>
                    )}
                    <div className="field full">
                      <label htmlFor="customer-notes">Indicaciones (opcional)</label>
                      <textarea id="customer-notes" name="notes" maxLength={300} placeholder="Referencia, detalle del pedido u otra indicación." />
                    </div>
                  </div>
                  <div className="checkout-summary">
                    {cartDetails.map(({ product, quantity }) => (
                      <div className="checkout-summary-row" key={product.id}><span>{product.pieces} piezas × {quantity}</span><span>{formatPrice(product.price * quantity)}</span></div>
                    ))}
                    <div className="checkout-summary-total"><span>Total de productos</span><span>{formatPrice(subtotal)}</span></div>
                  </div>
                  <p className="checkout-disclaimer">Esta es una demostración: el pedido no se envía ni se guarda en el restaurante. No se cobra ni se solicitan datos de tarjeta.</p>
                  <button className="button-primary checkout-button" type="submit">Ver confirmación de prueba <ArrowRight size={17} /></button>
                </form>
              </>
            ) : (
              <div className="confirmation">
                <div className="confirm-check"><Check size={34} /></div>
                <div className="eyebrow">Resumen de demostración</div>
                <h2>¡Gracias, {order.name}!</h2>
                <p>Este resumen solo aparece en esta página: no fue enviado al restaurante ni guardado para su preparación. No se realizó ningún cobro.</p>
                <span className="order-number">RESUMEN {order.number}</span>
                <div className="confirm-details">
                  <span>{order.fulfillment === 'delivery' ? 'Modalidad' : 'Modalidad'}<br /><strong>{order.fulfillment === 'delivery' ? 'Despacho' : 'Retiro por coordinar'}</strong></span>
                  <span>Total de productos<br /><strong>{formatPrice(order.total)}</strong></span>
                </div>
                <button className="button-primary" type="button" onClick={closeCheckout}>Volver a Polisushi <Check size={16} /></button>
              </div>
            )}
          </section>
        </div>
      )}
      <div className={`toast-message ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

export default App;
