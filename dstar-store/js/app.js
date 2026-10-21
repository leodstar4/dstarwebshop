/* ============================================
   DSTAR STORE — APP.JS
   ============================================ */

const PRODUCTS = window.DSTAR_PRODUCTS || [];

// ============================================
// CDN HELPER — inyecta transformaciones Cloudinary
// ============================================
function cdnOpt(url, w, h, { limit = false, avif = false, crop = '' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  const isJpg = /\.(jpe?g|jpg)(\?|$)/i.test(url);
  const transforms = [avif ? 'f_avif' : 'f_auto', 'q_auto', 'dpr_auto'];
  if (isJpg && !avif) transforms.push('fl_progressive');
  if (crop) transforms.push(crop);
  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  if (limit) transforms.push('c_limit');
  return url.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
}

// f_auto entrega JPEG XL a Chrome y Safari: pesa más que AVIF y tarda más en decodificar.
// AVIF va en <source> y f_auto queda como respaldo para navegadores sin AVIF.
function cdnSrcset(url, widths, opts = {}) {
  return widths.map((w) => `${cdnOpt(url, w, null, opts)} ${w}w`).join(', ');
}

function cdnPicture(url, { w, widths, sizes, limit = false, crop = '', attrs = '' }) {
  const sizesAttr = sizes ? ` sizes="${sizes}"` : '';
  const avif = widths ? cdnSrcset(url, widths, { limit, crop, avif: true }) : cdnOpt(url, w, null, { limit, crop, avif: true });
  const srcset = widths ? ` srcset="${escapeHtml(cdnSrcset(url, widths, { limit, crop }))}"` : '';
  return `<picture><source type="image/avif" srcset="${escapeHtml(avif)}"${sizesAttr}><img src="${escapeHtml(cdnOpt(url, w, null, { limit, crop }))}"${srcset}${sizesAttr} ${attrs}></picture>`;
}

const IMG_PLACEHOLDER = {
  card: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 400%22/%3E',
  blog: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 225%22%3E%3Crect fill=%22%23141414%22 width=%22400%22 height=%22225%22/%3E%3Ctext fill=%22%235c5c57%22 font-family=%22monospace%22 font-size=%2212%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EDSTAR%3C/text%3E%3C/svg%3E',
  cart: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 70 90%22%3E%3Crect fill=%22%23141414%22 width=%2270%22 height=%2290%22/%3E%3C/svg%3E'
};

function imgFallback(img, kind) {
  if (img.parentElement && img.parentElement.tagName === 'PICTURE') img.parentElement.querySelectorAll('source').forEach((s) => s.remove());
  img.removeAttribute('srcset');
  if (IMG_PLACEHOLDER[kind]) img.src = IMG_PLACEHOLDER[kind];
  else img.style.visibility = 'hidden';
}

document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || img.dataset.fallback === undefined) return;
  const kind = img.dataset.fallback;
  delete img.dataset.fallback;
  imgFallback(img, kind);
}, true);

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  currency: 'MXN'
};

// ============================================
// STATE
// ============================================
let cart = window.DSTAR_CART ? window.DSTAR_CART.load() : [];

// ============================================
// DOM REFS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================
// INIT
// ============================================
async function initApp() {
  await window.DSTAR_CATALOG_READY;
  cart = window.DSTAR_CART ? window.DSTAR_CART.load() : [];
  if (document.body.classList.contains('page-product')) {
    // ── Página de detalle de producto ──
    updateCartUI();
    initNav();
    initCart();
    initScrollProgress();
    initRippleButtons();
    initProductPage();
    initGlassLight();
    initLiveStock();
  } else {
    // ── Página principal ──
    // 1. Critical path: renders + core interactivity
    // renderLookbook/Blog/FAQ corren SYNC aquí para que GSAP los encuentre
    // cuando initFadeIns/initLookbook/initBlogReveal corran en el rAF de gsap-animations.js
    renderProducts();
    initCardPrefetch();
    renderLookbook();
    renderBlog();
    renderFAQ();
    updateCartUI();
    initNav();
    initCart();
    initScrollProgress();
    initLiveStock();

    // 2. Idle: interactions decorativas (no bloquean el render crítico)
    const idle = window.requestIdleCallback
      ? (cb) => requestIdleCallback(cb, { timeout: 1500 })
      : (cb) => setTimeout(cb, 200);

    idle(() => {
      initRippleButtons();
      initTextScramble();
      initGlassLight();
    });
  }
}

function initLiveStock() {
  if (!window.DSTAR_CART || !window.DSTAR_CART.syncStock) return;
  if (!$('#productsGrid') && !window._pdProduct && cart.length === 0) return;
  window.addEventListener('dstar:stock', applyLiveStock);
  window.DSTAR_CART.syncStock();
}

// ============================================
// NAV
// ============================================
function initNav() {
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  if (!menuBtn || !mobileNav) return;

  const setNav = (open) => {
    menuBtn.classList.toggle('active', open);
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileNav.inert = !open;
    if (open) $('.header')?.classList.remove('header--hidden');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) mobileNav.querySelector('a, button')?.focus();
  };
  mobileNav.inert = true;

  menuBtn.addEventListener('click', () => setNav(!mobileNav.classList.contains('open')));

  $$('[data-close-nav]').forEach(link => {
    link.addEventListener('click', () => setNav(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !mobileNav.classList.contains('open')) return;
    setNav(false);
    menuBtn.focus();
  });

  // Smooth scroll para todos los anchor links — offset dinámico del header
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    if (mobileNav.classList.contains('open')) setNav(false);

    // Offset = header height + top position + breathing room (works whether header is visible or hidden)
    const headerEl = $('.header');
    const offset = headerEl ? headerEl.offsetHeight + 48 : 116;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });

  // Header scroll behavior — rAF throttled + passive to avoid blocking scroll
  let lastScroll = 0;
  let headerTicking = false;
  const header = $('.header');
  const root = document.documentElement;
  window.addEventListener('scroll', () => {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      root.classList.toggle('is-scrolled', y > 100);
      header.classList.toggle('header--scrolled', y > 100);
      header.classList.toggle('header--hidden', y > 100 && y > lastScroll);
      lastScroll = y;
      headerTicking = false;
    });
  }, { passive: true });
}

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProducts() {
  const grid = $('#productsGrid');
  // Guard: blog pages and other sub-pages load app.js but don't have #productsGrid.
  // Without this check, null.innerHTML throws and kills initNav/initCart on those pages.
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map((p, i) => {
    const isSoldOut = isProductSoldOut(p);
    const name = escapeHtml(p.name);
    const tag = isSoldOut ? 'div' : 'a';
    const attrs = isSoldOut
      ? 'aria-disabled="true"'
      : `href="producto.html?id=${encodeURIComponent(p.id)}"`;

    return `
      <${tag} class="product-card fade-in${isSoldOut ? ' sold-out' : ''}"
           data-product-index="${i}"
           ${attrs}>
        <div class="product-card__image">
          ${cdnPicture(p.image, {
            w: 600,
            widths: [400, 600, 900],
            sizes: '(max-width: 1024px) 50vw, 380px',
            limit: true,
            attrs: `alt="${isSoldOut ? name : ''}" width="600" height="400" loading="lazy" decoding="async" data-fallback="card"`
          })}
          ${cardBadgeHtml(p, isSoldOut)}
        </div>
        <div class="product-card__info">${cardInfoHtml(p, isSoldOut)}</div>
      </${tag}>
    `;
  }).join('');
}

function isProductSoldOut(p) {
  return p.stock === 0 || p.badge === 'SOLDOUT';
}

function cardBadgeHtml(p, isSoldOut) {
  if (isSoldOut) return '<span class="product-card__badge product-card__badge--soldout">AGOTADO</span>';
  return p.badge === 'NEW' ? '<span class="product-card__badge product-card__badge--new">NUEVO</span>' : '';
}

function cardInfoHtml(p, isSoldOut) {
  const name = escapeHtml(p.name);
  const ctaHtml = isSoldOut ? '' : '<span class="product-card__cta">VER PIEZA <span aria-hidden="true">→</span></span>';
  const scarcityHtml = isSoldOut ? '' : `
          <div class="product-card__scarcity product-card__scarcity--${p.stock <= 3 ? 'low' : 'medium'}">
            <span class="product-card__scarcity-dot" aria-hidden="true"></span>
            <span>QUEDAN ${p.stock} ${p.stock === 1 ? 'PIEZA' : 'PIEZAS'}</span>
          </div>`;
  return `
          <span class="product-card__accent" aria-hidden="true"></span>
          <h3 class="product-card__name" data-name="${name}">${name}</h3>
          <div class="product-card__meta">
            <span class="product-card__price">${isSoldOut ? 'AGOTADO' : formatPrice(p.price)}</span>
            ${ctaHtml}
          </div>${scarcityHtml}`;
}

function patchProductCard(card, p) {
  const isSoldOut = isProductSoldOut(p);
  const info = card.querySelector('.product-card__info');
  if (info) info.innerHTML = cardInfoHtml(p, isSoldOut);
  const imageWrap = card.querySelector('.product-card__image');
  card.querySelector('.product-card__badge')?.remove();
  if (imageWrap) imageWrap.insertAdjacentHTML('beforeend', cardBadgeHtml(p, isSoldOut));
  if (isSoldOut) {
    card.classList.add('sold-out');
    card.removeAttribute('href');
    card.removeAttribute('aria-label');
    card.setAttribute('aria-disabled', 'true');
  }
}

function applyLiveStock() {
  if (window.DSTAR_CART) {
    cart = window.DSTAR_CART.load();
    saveCart();
  }
  updateCartUI();
  const grid = $('#productsGrid');
  if (grid) {
    PRODUCTS.forEach((p, i) => {
      const card = grid.querySelector(`[data-product-index="${i}"]`);
      if (card) patchProductCard(card, p);
    });
  }
  if (window._pdProduct) patchProductPageStock(window._pdProduct);
}

function initCardPrefetch() {
  const grid = $('#productsGrid');
  if (!grid) return;
  const warmed = new Set();
  const warm = (card) => {
    const id = new URL(card.href).searchParams.get('id');
    const p = PRODUCTS.find((prod) => prod.id === id);
    if (!p || warmed.has(id)) return;
    warmed.add(id);
    const src = (p.gallery && p.gallery[0]) || p.image;
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.type = 'image/avif';
    source.sizes = PD_SIZES;
    source.srcset = pdSrcset(src, true);
    const img = document.createElement('img');
    img.decoding = 'async';
    picture.append(source, img);
    img.sizes = PD_SIZES;
    img.srcset = pdSrcset(src);
    img.src = cdnOpt(src, 1200);
    (p.gallery || []).forEach((g) => { new Image().src = pdLqipUrl(g, true); });
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = card.href;
    document.head.appendChild(link);
  };
  const cardOf = (e) => e.target.closest && e.target.closest('a.product-card');
  let intent = 0;
  grid.addEventListener('pointerover', (e) => {
    const card = cardOf(e);
    clearTimeout(intent);
    if (card) intent = setTimeout(() => warm(card), 150);
  });
  grid.addEventListener('pointerleave', () => clearTimeout(intent));
  grid.addEventListener('pointerdown', (e) => { const card = cardOf(e); if (card) warm(card); });
  grid.addEventListener('touchstart', (e) => { const card = cardOf(e); if (card) warm(card); }, { passive: true });
}

// ============================================
// CART
// ============================================
function initCart() {
  if (!$('#cartBtn')) return;
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#cartOverlay').addEventListener('click', closeCart);
  $('#checkoutBtn').addEventListener('click', handleCheckout);
  $('#cartItems')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cart-action]');
    if (!btn) return;
    const index = Number(btn.dataset.index);
    if (btn.dataset.cartAction === 'remove') removeFromCart(index);
    else changeQty(index, btn.dataset.cartAction === 'inc' ? 1 : -1);
  });
}

function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartUI() {
  const countEl = $('#cartCount');
  if (!countEl) return;
  const itemsEl = $('#cartItems');
  const emptyEl = $('#cartEmpty');
  const footerEl = $('#cartFooter');
  const totalEl = $('#cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Counter badge
  if (totalItems > 0) {
    countEl.textContent = totalItems;
    countEl.classList.add('visible');
  } else {
    countEl.classList.remove('visible');
  }

  // Cart items
  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';
    totalEl.textContent = formatPrice(totalPrice);

    itemsEl.innerHTML = cart.map((item, i) => {
      const name = escapeHtml(item.name);
      const size = escapeHtml(item.size);
      const atMax = item.qty >= stockDisponible(item.id, item.size);
      return `
      <div class="cart-item">
        ${cdnPicture(item.image, {
          w: 150,
          widths: [150, 300],
          sizes: '72px',
          attrs: `class="cart-item__image" alt="${name}" width="72" height="92" loading="lazy" decoding="async" data-fallback="cart"`
        })}
        <div class="cart-item__info">
          <div class="cart-item__name">${name}</div>
          <div class="cart-item__size">TALLA: ${size}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
          <div class="cart-item__qty">
            <button type="button" data-cart-action="dec" data-index="${i}" aria-label="Quitar una pieza de ${name} talla ${size}">−</button>
            <span aria-live="polite">${item.qty}</span>
            <button type="button" data-cart-action="inc" data-index="${i}" aria-label="Agregar una pieza de ${name} talla ${size}"${atMax ? ' disabled' : ''}>+</button>
          </div>
          <button type="button" class="cart-item__remove" data-cart-action="remove" data-index="${i}" aria-label="Eliminar ${name} talla ${size} del carrito">ELIMINAR</button>
        </div>
      </div>
    `;
    }).join('');
  }
}

function changeQty(index, delta) {
  const item = cart[index];
  if (!item) return;
  if (delta > 0 && item.qty >= stockDisponible(item.id, item.size)) {
    showToast('No hay más piezas en esa talla');
    return;
  }
  item.qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function saveCart() {
  if (window.DSTAR_CART) window.DSTAR_CART.save(cart);
}

function stockDisponible(id, size) {
  const product = PRODUCTS.find(p => p.id === id);
  return window.DSTAR_CART ? window.DSTAR_CART.stockFor(product, size) : 0;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================
// CHECKOUT (Mercado Pago)
// ============================================
function handleCheckout() {
  // El carrito lleva a la página de checkout completa, donde se capturan
  // los datos de envío, se cotiza con Skydropx y se crea la preferencia de
  // pago (mp-preference). El pago directo desde el drawer queda deprecado.
  if (!cart || cart.length === 0) {
    showToast('TU CARRITO ESTÁ VACÍO');
    return;
  }
  window.location.href = 'checkout.html';
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  if (window.gsap) return; // GSAP handles all fade-ins and stagger

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  $$('.fade-in').forEach(el => observer.observe(el));
}

// ============================================
// TOAST
// ============================================
function showToast(msg) {
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================
// LOOKBOOK DATA
// Pon aquí las rutas a tus fotos del lookbook
// Recomendado: fotos en imágenes/lookbook/
// ============================================
const LOOKBOOK = [
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook01_lvl7hb.jpg', caption: '', focus: '50% 30%' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook05_r49ynl.jpg', caption: '', focus: '50% 30%' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook03_zxfrhr.jpg', caption: '', focus: '50% 30%' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook04_hrbtc3.jpg', caption: '', focus: '50% 30%' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook02_gztk5q.jpg', caption: '', focus: '50% 60%' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook06_g3utzp.jpg', caption: '', focus: '50% 30%' },
];

// ============================================
// BLOG DATA
// Edita aquí tus entradas de blog
// ============================================
const BLOG_POSTS = [
  {
    slug: 'born-to-shine-detras-del-drop',
    title: 'BORN TO SHINE: DETRÁS DEL DROP',
    date: 'MAR 2026',
    category: 'DROPS',
    excerpt: 'El proceso detrás del primer drop de DSTAR. Cómo nacieron Born to Shine y Over as F**k, y qué significa esta colección para nosotros.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/blog01_beoifd.jpg',
    gravity: 'g_center',
  },
  {
    slug: 'streetwear-mexico-escena',
    title: 'LA ESCENA STREETWEAR EN MÉXICO',
    date: 'FEB 2026',
    category: 'CULTURA',
    excerpt: 'Qué está pasando con el streetwear nacional. Las marcas, los colectivos y los espacios que están definiendo la moda de la calle.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/blog02_ayh36o.jpg',
    gravity: 'g_center',
  },
  {
    slug: 'como-cuidar-tu-ropa',
    title: 'CÓMO CUIDAR TU ROPA DSTAR',
    date: 'ENE 2026',
    category: 'TIPS',
    excerpt: 'Guía completa para que tus piezas duren lo que tienen que durar. Lavado, secado y almacenaje para prendas de calidad.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/dstar/blog/post-03.webp',
    gravity: 'g_auto',
  },
];

// ============================================
// FAQ DATA
// ============================================
const FAQ_ITEMS = [
  {
    q: '¿CUÁNTO TARDA MI PEDIDO EN LLEGAR?',
    a: 'Los pedidos se procesan en 1-2 días hábiles. El envío estándar tarda 3-5 días hábiles (Estafeta/Redpack). Express 1-3 días. Recibirás tu número de tracking por email una vez que se genere la guía.'
  },
  {
    q: '¿HACEN ENVÍOS A TODA LA REPÚBLICA?',
    a: 'Sí, enviamos a todo México. El costo de envío se calcula al momento del pago.'
  },
  {
    q: '¿PUEDO PAGAR EN EFECTIVO EN OXXO?',
    a: 'No. Para proteger las piezas limitadas solo aceptamos medios de pago inmediatos disponibles en Mercado Pago. OXXO y pagos diferidos están desactivados.'
  },
  {
    q: '¿ACEPTAN DEVOLUCIONES O CAMBIOS?',
    a: 'Tienes 5 días hábiles desde que recibes tu pedido para devolverlo si la prenda está sin usar y con etiquetas. Si llega con defecto o te enviamos otra pieza, nosotros cubrimos el cambio. Los cambios de talla dependen del stock. Todos los detalles en <a href="terminos.html">términos, envíos y devoluciones</a>.'
  },
  {
    q: '¿POR QUÉ LOS TIRAJES SON LIMITADOS?',
    a: 'Es parte de nuestra filosofía. No producimos en masa. Cada drop es un tiraje cerrado — cuando se agotan, no hay restock. Esto garantiza que quien tiene una pieza DSTAR tiene algo real y exclusivo.'
  },
  {
    q: '¿CÓMO SÉ QUÉ TALLA ELEGIR?',
    a: 'Trabajamos con tallaje oversized/boxy en hoodies y playeras. Si usas talla M regular, en DSTAR puedes quedarte en M o bajar a S dependiendo del fit que prefieras. Próximamente subiremos guía de tallas con medidas exactas.'
  },
  {
    q: '¿HACEN COLABORACIONES O CUSTOM?',
    a: 'Sí abrimos colaboraciones seleccionadas con artistas, colectivos y marcas que compartan nuestra visión. Escríbenos a dstarstudioss@gmail.com con tu propuesta.'
  },
];

// ============================================
// RENDER LOOKBOOK
// ============================================
function renderLookbook() {
  const grid = document.getElementById('lookbookGrid');
  if (!grid) return;

  // Horizontal track layout
  grid.className = 'lookbook__horiz-track';

  grid.innerHTML = LOOKBOOK.map((item, i) => `
    <div class="lookbook-panel" data-src="${item.image}">
      <div class="lookbook-panel__img-wrap">
        ${cdnPicture(item.image, {
          w: 600,
          widths: [400, 600, 900, 1200],
          sizes: '(min-width: 1024px) 540px, (min-width: 769px) 80vw, (min-width: 641px) 33vw, 50vw',
          attrs: `alt="${item.caption}" loading="lazy" decoding="async" style="object-position: ${item.focus || 'center'}" data-fallback=""`
        })}
      </div>
      <div class="lookbook-panel__caption">
        <span class="lookbook-panel__num">0${i + 1}</span>
        <span class="lookbook-panel__text">${item.caption}</span>
      </div>
    </div>
  `).join('');
}

// ============================================
// RENDER BLOG
// ============================================
function renderBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = BLOG_POSTS.map((post) => `
    <a href="blog/${post.slug}.html" class="blog-card fade-in">
      <div class="blog-card__image">
        ${cdnPicture(post.image, {
          w: 600,
          widths: [400, 600, 900, 1200],
          sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px',
          crop: `c_fill,ar_16:9,${post.gravity || 'g_auto'}`,
          attrs: `alt="${post.title}" width="600" height="338" loading="lazy" decoding="async" data-fallback="blog"`
        })}
        <span class="blog-card__cat">${post.category}</span>
      </div>
      <div class="blog-card__body">
        <p class="blog-card__date">${post.date}</p>
        <h3 class="blog-card__title">${post.title}</h3>
        <p class="blog-card__excerpt">${post.excerpt}</p>
        <span class="blog-card__read">LEER MÁS</span>
      </div>
    </a>
  `).join('');
}

// ============================================
// RENDER FAQ
// ============================================
function renderFAQ() {
  const list = document.getElementById('faqList');
  if (!list) return;

  list.innerHTML = FAQ_ITEMS.map((item, i) => `
    <div class="faq__item fade-in" id="faq-item-${i}">
      <button
        class="faq__question"
        data-faq="${i}"
        aria-expanded="false"
        aria-controls="faq-answer-${i}"
        id="faq-btn-${i}"
      >
        <span>${item.q}</span>
        <span class="faq__icon" aria-hidden="true">+</span>
      </button>
      <div
        class="faq__answer"
        id="faq-answer-${i}"
        role="region"
        aria-labelledby="faq-btn-${i}"
      >
        <div class="faq__answer-inner">${item.a}</div>
      </div>
    </div>
  `).join('');
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-faq]');
    if (btn) toggleFAQ(Number(btn.dataset.faq));
  });
}

function toggleFAQ(index) {
  const item   = document.getElementById(`faq-item-${index}`);
  const answer = document.getElementById(`faq-answer-${index}`);
  const btn    = document.getElementById(`faq-btn-${index}`);
  const isOpen = item.classList.contains('open');

  // Cerrar todos y actualizar aria-expanded
  document.querySelectorAll('.faq__item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq__answer').style.maxHeight = '0';
    const openBtn = el.querySelector('.faq__question');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  });

  // Abrir el clickeado si estaba cerrado
  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
}

// ============================================
// UTILS
// ============================================
function formatPrice(amount) {
  return `$${amount.toLocaleString('es-MX')} MXN`;
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
  if (window.ScrollTrigger) return;
  const bar = $('#scrollProgress');
  if (!bar || CSS.supports('animation-timeline: scroll()')) return;
  let total = 0;
  let ticking = false;
  const measure = () => { total = document.documentElement.scrollHeight - window.innerHeight; };
  const paint = () => {
    ticking = false;
    if (!total) measure();
    bar.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }, { passive: true });
  window.addEventListener('resize', () => { total = 0; }, { passive: true });
  window.addEventListener('load', () => { total = 0; });
  if (window.ResizeObserver) new ResizeObserver(() => { total = 0; }).observe(document.body);
}

// ============================================
// RIPPLE EFFECT (event delegation)
// ============================================
function initRippleButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest(
      '.product-modal__add, .cart-drawer__checkout, .size-btn, .lookbook__ig-link'
    );
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top:  ${e.clientY - rect.top  - size / 2}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
}

// ============================================
// TEXT SCRAMBLE — TÍTULOS
// ============================================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.frame = 0;
    this.frameReq = null;
    this.queue = [];
  }

  setText(newText) {
    const length = newText.length;
    this.queue = Array.from({ length }, (_, i) => ({
      to: newText[i],
      start: Math.floor(i * 1.2),
      end: Math.floor(i * 1.2) + Math.floor(Math.random() * 8) + 4,
      char: ''
    }));
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
  }

  update() {
    let output = '';
    let complete = 0;
    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to === ' ' ? ' ' : `<span>${item.to}</span>`;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += `<span class="scramble-char">█</span>`;
      }
    }
    this.el.innerHTML = output;
    if (complete < this.queue.length) {
      this.frame++;
      this.frameReq = requestAnimationFrame(() => this.update());
    }
  }
}

function initTextScramble() {
  if (window.gsap) return; // GSAP section title animation replaces this
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const original = el.dataset.original;
      if (!original) return;
      new TextScramble(el).setText(original);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  $$('.section-title').forEach(el => {
    el.dataset.original = el.textContent.trim();
    observer.observe(el);
  });
}

// ============================================
// PRODUCT DETAIL PAGE — Zara-style layout
// ============================================
function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  const p      = PRODUCTS.find(prod => prod.id === id);

  if (!p) { window.location.href = '/'; return; }

  document.title = p.name + ' — DSTAR';

  const isSoldOut = p.stock === 0 || p.badge === 'SOLDOUT';
  const gallery   = (p.gallery && p.gallery.length) ? p.gallery : [p.image];
  const isMobile  = window.innerWidth <= 768;

  // Gallery: desktop stack of images vs mobile swipe carousel
  if (isMobile) {
    _pdBuildCarousel(gallery, p.name);
  } else {
    _pdBuildStack(gallery, p.name);
  }
  _pdBuildLightbox(gallery, p.name);

  // Badge
  const badgeEl = document.getElementById('pdBadge');
  if (badgeEl) {
    if (p.badge === 'LIMITED') {
      badgeEl.textContent = 'LIMITADO'; badgeEl.style.display = 'inline-block';
    } else if (p.badge === 'NEW') {
      badgeEl.textContent = 'NUEVO'; badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // Info text
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('pdDrop',  'DROP: ' + p.drop);
  set('pdName',  p.name);
  set('pdPrice', isSoldOut ? 'AGOTADO' : formatPrice(p.price));
  set('pdDesc',  [p.description, p.material && 'Material: ' + p.material, p.fit && 'Corte: ' + p.fit, p.care && 'Cuidados: ' + p.care, p.measurements && 'Medidas: ' + p.measurements].filter(Boolean).join('\n\n'));

  // Sizes
  const sizesEl = document.getElementById('pdSizes');
  if (sizesEl) {
    sizesEl.innerHTML = p.sizes.map(s => {
      const inStock = (p.sizesStock[s] || 0) > 0;
      return `<button class="size-btn" data-size="${s}"
                      ${!inStock ? 'disabled' : ''}>${s}</button>`;
    }).join('');
    sizesEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.size-btn');
      if (btn && !btn.disabled) pdSelectSize(btn.dataset.size, btn);
    });
  }

  // Stock
  const stockEl = document.getElementById('pdStock');
  if (stockEl) {
    if (isSoldOut) {
      stockEl.textContent = 'AGOTADO';
    } else {
      stockEl.textContent = `QUEDAN ${p.stock} PIEZAS`;
      if (p.stock <= 5) stockEl.classList.add('product-modal__stock--urgent');
    }
  }

  // Add button
  const addBtn = document.getElementById('pdAddBtn');
  if (addBtn) {
    if (isSoldOut) {
      addBtn.disabled = true;
      addBtn.textContent = 'AGOTADO';
    } else {
      addBtn.dataset.state = 'locked';
      addBtn.innerHTML = '<span class="btn-text">SELECCIONA TALLA</span>';
      addBtn.addEventListener('click', pdAddToCart);
    }
  }

  // Store product reference
  window._pdProduct      = p;
  window._pdSelectedSize = null;

  // ── MOBILE UX: sticky CTA bar + size-label pulse + smart-scroll ──
  _pdInitMobileUX(p, isSoldOut);
}

function patchProductPageStock(p) {
  const isSoldOut = isProductSoldOut(p);
  document.querySelectorAll('#pdSizes .size-btn').forEach((btn) => {
    const out = !((p.sizesStock[btn.dataset.size] || 0) > 0);
    btn.disabled = out;
    if (out && btn.classList.contains('active')) {
      btn.classList.remove('active');
      window._pdSelectedSize = null;
      document.body.classList.add('pd-needs-size');
      const addBtn = document.getElementById('pdAddBtn');
      if (addBtn && !isSoldOut) {
        addBtn.dataset.state = 'locked';
        addBtn.innerHTML = '<span class="btn-text">SELECCIONA TALLA</span>';
      }
      const stickyText = document.getElementById('pdStickyBtnText');
      if (stickyText) stickyText.textContent = 'SELECCIONA TALLA';
    }
  });
  const stockEl = document.getElementById('pdStock');
  if (stockEl) {
    stockEl.textContent = isSoldOut ? 'AGOTADO' : `QUEDAN ${p.stock} ${p.stock === 1 ? 'PIEZA' : 'PIEZAS'}`;
    stockEl.classList.toggle('product-modal__stock--urgent', !isSoldOut && p.stock <= 5);
  }
  if (!isSoldOut) return;
  const priceEl = document.getElementById('pdPrice');
  if (priceEl) priceEl.textContent = 'AGOTADO';
  const addBtn = document.getElementById('pdAddBtn');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.textContent = 'AGOTADO';
  }
  const stickyBtn = document.getElementById('pdStickyBtn');
  const stickyText = document.getElementById('pdStickyBtnText');
  const stickyPrice = document.getElementById('pdStickyPrice');
  if (stickyBtn) stickyBtn.disabled = true;
  if (stickyText) stickyText.textContent = 'AGOTADO';
  if (stickyPrice) stickyPrice.textContent = 'AGOTADO';
}

// Sticky CTA: visible siempre desde load (mobile).
// Si no hay talla seleccionada: tap scrollea al size selector; si ya hay: agrega al carrito.
function _pdInitMobileUX(p, isSoldOut) {
  const sticky      = document.getElementById('pdStickyCta');
  const stickyPrice = document.getElementById('pdStickyPrice');
  const stickyBtn   = document.getElementById('pdStickyBtn');
  const stickyText  = document.getElementById('pdStickyBtnText');
  if (!sticky || !stickyBtn) return;

  // Precio
  if (stickyPrice) stickyPrice.textContent = isSoldOut ? 'AGOTADO' : formatPrice(p.price);
  if (isSoldOut) {
    stickyBtn.disabled = true;
    if (stickyText) stickyText.textContent = 'AGOTADO';
    else stickyBtn.textContent = 'AGOTADO';
  }

  // Marcar estado "falta talla"
  document.body.classList.add('pd-needs-size');

  stickyBtn.addEventListener('click', () => {
    if (isSoldOut) return;
    if (!window._pdSelectedSize) {
      const sizes = document.querySelector('.product-detail__sizes');
      if (sizes) {
        sizes.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flashea el label para dirigir la mirada
        const label = document.querySelector('.product-detail__size-label');
        if (label) {
          label.style.transition = 'color 0.3s, text-shadow 0.3s';
          label.style.color = '#fff';
          label.style.textShadow = '0 0 18px rgba(255,255,255,0.4)';
          setTimeout(() => {
            label.style.color = '';
            label.style.textShadow = '';
          }, 1400);
        }
      }
      return;
    }
    // Haptic en tap "agregar al carrito"
    if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) {} }
    pdAddToCart();
  });

  // Sticky aria visible desde load — CSS @media max-width:768px controla display:flex
  sticky.setAttribute('aria-hidden', 'false');

  // Hide sticky when the size selector is already on screen (avoids duplicate buttons).
  // Shows again when user scrolls above or below the sizes section.
  const sizesEl = document.querySelector('.product-detail__sizes');
  if (sizesEl && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      sticky.classList.toggle('pd-sticky-cta--hidden', entries[0].isIntersecting);
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
    io.observe(sizesEl);
  }
}

const PD_SIZES = '(max-width: 768px) 100vw, (max-width: 980px) and (max-height: 600px) 100vw, (max-width: 1440px) 52vw, 744px';
const PD_WIDTHS = [600, 900, 1200, 1600];
const PD_LB_WIDTHS = [600, 900, 1200, 1600, 2400];
const PD_LB_ZOOM = 2.5;
const pdSrcset = (src, avif = false) => cdnSrcset(src, PD_WIDTHS, { avif });
const pdPicture = (src, attrs) => cdnPicture(src, { w: 1200, widths: PD_WIDTHS, sizes: PD_SIZES, attrs });
const pdLqipUrl = (src, avif) => cdnOpt(src, 48, null, { avif, crop: 'e_blur:200' });
const pdLqipStyle = (src) => `--pd-lqip: image-set(url('${pdLqipUrl(src, true)}') type('image/avif'), url('${pdLqipUrl(src, false)}') 1x)`;
const pdReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pdFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const pdRatios = new Map();

function pdMeasure(src) {
  if (pdRatios.has(src)) return Promise.resolve(pdRatios.get(src));
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => {
      if (!pdRatios.has(src) && probe.naturalHeight) pdRatios.set(src, probe.naturalWidth / probe.naturalHeight);
      resolve(pdRatios.get(src) || null);
    };
    probe.onerror = () => resolve(null);
    probe.src = pdLqipUrl(src, true);
  });
}

function pdTrackLoad(el, src, loadingClass) {
  const img = el.querySelector('img');
  if (!img) return;
  pdMeasure(src).then((r) => { if (r) el.style.setProperty('--pd-r', r); });
  let retried = false;
  const done = () => {
    if (img.naturalWidth) pdRatios.set(src, img.naturalWidth / img.naturalHeight);
    el.classList.remove(loadingClass);
  };
  const fail = () => {
    const source = img.closest('picture')?.querySelector('source');
    if (retried || !source) { el.classList.remove(loadingClass); return; }
    retried = true;
    source.remove();
  };
  img.addEventListener('load', done);
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth) done();
}

function _pdBuildStack(gallery, productName) {
  const stack = document.getElementById('pdGalleryStack');
  if (!stack) return;
  const name = escapeHtml(productName);
  stack.innerHTML = gallery.map((src, i) => `
    <button type="button" class="pd-gallery-img pd-gallery-img--loading" data-index="${i}" style="${escapeHtml(pdLqipStyle(src))}" aria-haspopup="dialog" aria-label="Ampliar ${name}, foto ${i + 1} de ${gallery.length}">
      ${pdPicture(src, `alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"`)}
      <span class="pd-gallery-img__zoom" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg></span>
    </button>`).join('');

  stack.querySelectorAll('.pd-gallery-img').forEach((el) => {
    const i = Number(el.dataset.index);
    pdTrackLoad(el, gallery[i], 'pd-gallery-img--loading');
    el.addEventListener('click', () => pdLightboxOpen(i, el));
  });
}

function _pdBuildCarousel(gallery, productName) {
  const carousel = document.getElementById('pdCarousel');
  const dotsEl   = document.getElementById('pdCarouselDots');
  if (!carousel) return;
  const name = escapeHtml(productName);

  carousel.innerHTML = gallery.map((src, i) => `
    <button type="button" class="pd-carousel__item pd-carousel__item--loading" data-index="${i}" style="${escapeHtml(pdLqipStyle(src))}" aria-haspopup="dialog" aria-label="Ampliar ${name}, foto ${i + 1} de ${gallery.length}">
      ${pdPicture(src, `alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false"`)}
    </button>`).join('');

  carousel.querySelectorAll('.pd-carousel__item').forEach((el) => {
    const i = Number(el.dataset.index);
    pdTrackLoad(el, gallery[i], 'pd-carousel__item--loading');
    el.addEventListener('click', () => pdLightboxOpen(i, el));
  });

  if (gallery.length > 1) {
    const galleryEl = carousel.parentElement;
    if (galleryEl && !galleryEl.querySelector('.pd-swipe-hint')) {
      const hint = document.createElement('div');
      hint.className = 'pd-swipe-hint';
      hint.innerHTML = '<span>SWIPE</span><span aria-hidden="true">→</span>';
      if (dotsEl && dotsEl.parentNode === galleryEl) {
        galleryEl.insertBefore(hint, dotsEl);
      } else {
        galleryEl.appendChild(hint);
      }
      const killHint = () => hint.classList.add('pd-swipe-hint--gone');
      carousel.addEventListener('scroll', killHint, { once: true, passive: true });
    }
  }

  const galleryEl = carousel.parentElement;
  if (galleryEl) galleryEl.style.position = 'relative';
  const counterEl = document.createElement('div');
  counterEl.className = 'pd-carousel-counter';
  counterEl.textContent = gallery.length > 1 ? `1 / ${gallery.length}` : '';
  counterEl.style.display = 'block';
  counterEl.setAttribute('aria-hidden', 'true');
  if (galleryEl && gallery.length > 1) galleryEl.appendChild(counterEl);

  if (!dotsEl) return;

  if (gallery.length < 2) { dotsEl.style.display = 'none'; return; }

  dotsEl.innerHTML = gallery.map((_, i) => `
    <button class="pd-carousel-dot${i === 0 ? ' pd-carousel-dot--active' : ''}"
            data-index="${i}" aria-label="Foto ${i + 1}" aria-current="${i === 0}"></button>`).join('');

  const dots = Array.from(dotsEl.querySelectorAll('.pd-carousel-dot'));

  carousel.addEventListener('scroll', () => {
    const idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    dots.forEach((d, i) => {
      d.classList.toggle('pd-carousel-dot--active', i === idx);
      d.setAttribute('aria-current', String(i === idx));
    });
    counterEl.textContent = `${idx + 1} / ${gallery.length}`;
  }, { passive: true });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      carousel.scrollTo({ left: parseInt(dot.dataset.index) * carousel.offsetWidth, behavior: pdReducedMotion() ? 'instant' : 'smooth' });
    });
  });
}

const pdLb = {
  el: null, track: null, scrim: null, ghost: null, ui: [], slides: [], thumbs: [], segs: [], gallery: [],
  index: -1, target: null, origin: null, closing: false, wheelAt: 0, touchAt: 0, tapAt: 0, tapX: 0, tapY: 0, tapTimer: 0, scrollRaf: 0,
  pointers: new Map(), gesture: null,
  zoom: { s: 1, x: 0, y: 0, ts: 1, tx: 0, ty: 0, raf: 0, last: 0 }
};

function _pdBuildLightbox(gallery, productName) {
  const el = document.getElementById('pdLightbox');
  if (!el || typeof el.showModal !== 'function') return;
  const name = escapeHtml(productName);
  const total = gallery.length;

  pdLb.el = el;
  pdLb.gallery = gallery;
  pdLb.track = document.getElementById('pdLbTrack');
  pdLb.scrim = el.querySelector('.pd-lightbox__scrim');
  pdLb.ghost = el.querySelector('.pd-lightbox__ghost');
  pdLb.ui = Array.from(el.querySelectorAll('.pd-lightbox__top, .pd-lightbox__progress, .pd-lightbox__bottom, .pd-lightbox__nav'));
  document.getElementById('pdLbTitle').textContent = productName;
  document.getElementById('pdLbTotal').textContent = String(total).padStart(2, '0');
  el.classList.toggle('pd-lightbox--single', total < 2);

  pdLb.track.innerHTML = gallery.map((src, i) => `
    <figure class="pd-lightbox__slide" role="group" aria-roledescription="diapositiva" aria-label="Foto ${i + 1} de ${total}" aria-hidden="true">
      <div class="pd-lightbox__frame" style="${escapeHtml(pdLqipStyle(src))}">
        ${cdnPicture(src, { w: 1200, widths: PD_LB_WIDTHS, sizes: '100vw', attrs: `class="pd-lightbox__img" alt="${name} — foto ${i + 1}" loading="lazy" decoding="async" draggable="false"` })}
        <span class="pd-lightbox__loader" aria-hidden="true"></span>
      </div>
    </figure>`).join('');

  const thumbsEl = document.getElementById('pdLbThumbs');
  thumbsEl.innerHTML = total > 1 ? gallery.map((src, i) => `
    <button type="button" class="pd-lightbox__thumb" data-index="${i}" aria-label="Ver foto ${i + 1} de ${total}">
      ${cdnPicture(src, { w: 150, widths: [150, 300], sizes: '56px', attrs: 'alt="" loading="lazy" decoding="async" draggable="false"' })}
    </button>`).join('') : '';

  const progressEl = document.getElementById('pdLbProgress');
  progressEl.innerHTML = total > 1 ? gallery.map(() => '<span class="pd-lightbox__seg"></span>').join('') : '';

  pdLb.slides = Array.from(pdLb.track.children).map((slide) => ({
    slide,
    frame: slide.querySelector('.pd-lightbox__frame'),
    img: slide.querySelector('img'),
    hires: false
  }));
  pdLb.thumbs = Array.from(thumbsEl.children);
  pdLb.segs = Array.from(progressEl.children);

  pdLb.slides.forEach(({ frame, img }, i) => {
    img.addEventListener('load', () => {
      if (img.naturalWidth) {
        pdRatios.set(gallery[i], img.naturalWidth / img.naturalHeight);
        frame.style.setProperty('--pd-r', pdRatios.get(gallery[i]));
      }
      frame.classList.add('pd-lightbox__frame--loaded');
    });
    img.addEventListener('error', () => {
      const source = img.closest('picture')?.querySelector('source');
      if (source) source.remove();
      else frame.classList.add('pd-lightbox__frame--failed');
    });
  });

  document.getElementById('pdLbClose').addEventListener('click', pdLightboxClose);
  document.getElementById('pdLbZoom').addEventListener('click', () => pdLbToggleZoom());
  [['pdLbPrev', -1], ['pdLbNext', 1]].forEach(([id, step]) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', () => { if (btn.getAttribute('aria-disabled') !== 'true') pdLightboxGo(pdLb.index + step); });
  });
  pdLb.thumbs.forEach((btn) => btn.addEventListener('click', () => pdLightboxGo(Number(btn.dataset.index))));

  el.addEventListener('cancel', (e) => { e.preventDefault(); pdLightboxClose(); });
  el.addEventListener('close', pdLbCleanup);
  el.addEventListener('keydown', pdLbOnKey);
  el.addEventListener('wheel', pdLbOnWheel, { passive: false });
  pdLb.track.addEventListener('scroll', pdLbOnScroll, { passive: true });
  pdLb.track.addEventListener('scrollend', () => { pdLb.target = null; pdLbOnScroll(); });
  pdLb.track.addEventListener('click', pdLbOnClick);
  pdLb.track.addEventListener('pointerdown', pdLbOnPointerDown);
  pdLb.track.addEventListener('pointermove', pdLbOnPointerMove);
  pdLb.track.addEventListener('pointerup', pdLbOnPointerUp);
  pdLb.track.addEventListener('pointercancel', pdLbOnPointerUp);
  window.addEventListener('resize', () => {
    if (!el.open) return;
    pdLbResetZoom();
    pdLbLayout();
    pdLb.track.scrollTo({ left: pdLb.index * pdLb.track.clientWidth, behavior: 'instant' });
  });
}

function pdLbPageItem(i) {
  const items = document.querySelectorAll(`.pd-gallery-img[data-index="${i}"], .pd-carousel__item[data-index="${i}"]`);
  return Array.from(items).find((n) => n.offsetParent) || null;
}

function pdLbContain(rect, r) {
  if (!r) return rect;
  const w = Math.min(rect.width, rect.height * r);
  const h = w / r;
  return { left: rect.left + (rect.width - w) / 2, top: rect.top + (rect.height - h) / 2, width: w, height: h };
}

function pdLbOriginRect(i) {
  const item = pdLbPageItem(i);
  const img = item && item.querySelector('img');
  if (!img || !img.naturalWidth) return null;
  const rect = pdLbContain(img.getBoundingClientRect(), img.naturalWidth / img.naturalHeight);
  const visible = rect.width > 0 && rect.top < window.innerHeight && rect.top + rect.height > 0 && rect.left < window.innerWidth && rect.left + rect.width > 0;
  return visible ? { rect, src: img.currentSrc } : null;
}

function pdLbSizesFor(slide) {
  const st = getComputedStyle(slide.slide);
  const w = slide.slide.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
  const h = slide.slide.clientHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom);
  const r = parseFloat(slide.frame.style.getPropertyValue('--pd-r')) || 0.75;
  const px = Math.ceil(Math.min(w, h * r) * (slide.hires ? PD_LB_ZOOM : 1));
  return `${Math.max(px, 100)}px`;
}

function pdLbApplySizes(slide) {
  const sizes = pdLbSizesFor(slide);
  slide.slide.querySelectorAll('source, img').forEach((n) => { if (n.sizes !== sizes) n.sizes = sizes; });
}

function pdLbLayout() {
  const top = pdLb.el.querySelector('.pd-lightbox__top');
  const progress = pdLb.el.querySelector('.pd-lightbox__progress');
  const bottom = pdLb.el.querySelector('.pd-lightbox__bottom');
  const topEdge = progress.offsetParent ? progress.offsetTop + progress.offsetHeight : top.offsetTop + top.offsetHeight;
  pdLb.el.style.setProperty('--pd-lb-top', `${Math.round(topEdge)}px`);
  pdLb.el.style.setProperty('--pd-lb-bottom', `${Math.round(pdLb.el.clientHeight - bottom.offsetTop)}px`);
  pdLb.slides.forEach((slide, i) => {
    const r = pdRatios.get(pdLb.gallery[i]);
    if (r) slide.frame.style.setProperty('--pd-r', r);
    const pageImg = pdLbPageItem(i)?.querySelector('img');
    if (pageImg && pageImg.naturalWidth && pageImg.currentSrc) slide.frame.style.setProperty('--pd-lb-preview', `url("${pageImg.currentSrc}")`);
  });
  pdLb.slides.forEach(pdLbApplySizes);
}

function pdLbSetIndex(i, scroll, instant) {
  const total = pdLb.slides.length;
  i = Math.max(0, Math.min(total - 1, i));
  if (scroll) {
    const smooth = !instant && !pdReducedMotion();
    pdLb.target = smooth ? i : null;
    pdLb.track.scrollTo({ left: i * pdLb.track.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
  }
  if (i === pdLb.index) return;
  pdLbResetZoom();
  pdLb.index = i;

  const n = String(i + 1).padStart(2, '0');
  document.getElementById('pdLbCurrent').textContent = n;
  document.getElementById('pdLbLive').textContent = `Foto ${i + 1} de ${total}`;
  document.getElementById('pdLbPrev').setAttribute('aria-disabled', String(i === 0));
  document.getElementById('pdLbNext').setAttribute('aria-disabled', String(i === total - 1));
  pdLb.slides.forEach((s, k) => s.slide.setAttribute('aria-hidden', String(k !== i)));
  pdLb.segs.forEach((seg, k) => {
    seg.classList.toggle('pd-lightbox__seg--done', k < i);
    seg.classList.toggle('pd-lightbox__seg--active', k === i);
  });
  pdLb.thumbs.forEach((btn, k) => btn.setAttribute('aria-current', k === i ? 'true' : 'false'));
  const thumb = pdLb.thumbs[i];
  if (thumb) {
    const strip = thumb.parentElement;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: instant || pdReducedMotion() ? 'instant' : 'smooth' });
  }
  [i, i + 1, i - 1].forEach((k) => { const s = pdLb.slides[k]; if (s) s.img.loading = 'eager'; });
}

function pdLightboxGo(i) {
  if (!pdLb.el || !pdLb.el.open || pdLb.closing) return;
  pdLbSetIndex(i, true);
}

function pdLbOnScroll() {
  if (pdLb.scrollRaf) return;
  pdLb.scrollRaf = requestAnimationFrame(() => {
    pdLb.scrollRaf = 0;
    const w = pdLb.track.clientWidth;
    if (!w || pdLb.closing) return;
    if (pdLb.target !== null) {
      if (Math.abs(pdLb.track.scrollLeft - pdLb.target * w) > 2) return;
      pdLb.target = null;
    }
    pdLbSetIndex(Math.round(pdLb.track.scrollLeft / w), false);
  });
}

function pdLightboxOpen(index, originEl) {
  const el = pdLb.el;
  if (!el || el.open) return;
  pdLb.origin = originEl || null;
  pdLb.closing = false;
  pdLb.index = -1;
  el.classList.remove('pd-lightbox--immersive', 'pd-lightbox--dragging', 'pd-lightbox--zoomed');
  el.showModal();
  document.documentElement.classList.add('pd-lightbox-open');
  pdLbLayout();
  pdLbSetIndex(index, true, true);
  pdLbAnimateIn(pdLb.index);
}

function pdLbAnimateIn(i) {
  if (!window.gsap) return;
  const { scrim, ui, ghost } = pdLb;
  const cur = pdLb.slides[i];
  gsap.killTweensOf([scrim, ghost, cur.frame, ...ui]);
  if (pdReducedMotion()) {
    gsap.fromTo(pdLb.el, { opacity: 0 }, { opacity: 1, duration: 0.2, clearProps: 'opacity' });
    return;
  }
  gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
  gsap.fromTo(ui,
    { opacity: 0, y: (k, t) => (t.classList.contains('pd-lightbox__bottom') ? 18 : t.classList.contains('pd-lightbox__nav') ? 0 : -10) },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.16, stagger: 0.04, clearProps: 'opacity,transform' }
  );
  const from = pdLbOriginRect(i);
  if (from) {
    pdLbFly(cur.frame, from.rect, from.src, false);
  } else {
    gsap.fromTo(cur.frame, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' });
  }
}

function pdLbFly(frame, rect, src, reverse, onDone) {
  const ghost = pdLb.ghost;
  gsap.killTweensOf(ghost);
  const to = frame.getBoundingClientRect();
  if (!to.width || !src) { if (onDone) onDone(); return; }
  Object.assign(ghost.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, backgroundImage: `url("${src}")` });
  ghost.hidden = false;
  frame.style.visibility = 'hidden';
  const away = { x: rect.left - to.left, y: rect.top - to.top, scaleX: rect.width / to.width, scaleY: rect.height / to.height };
  const home = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
  gsap.fromTo(ghost, reverse ? home : away, {
    ...(reverse ? away : home),
    duration: reverse ? 0.45 : 0.62,
    ease: reverse ? 'power3.inOut' : 'expo.out',
    onComplete() {
      if (!reverse) {
        frame.style.visibility = '';
        ghost.hidden = true;
        gsap.set(ghost, { clearProps: 'transform' });
      }
      if (onDone) onDone();
    }
  });
}

function pdLbSyncPage(i) {
  const item = pdLbPageItem(i);
  if (!item) return;
  const carousel = item.closest('.pd-carousel');
  if (carousel) {
    carousel.scrollTo({ left: i * carousel.offsetWidth, behavior: 'instant' });
    return;
  }
  const rect = item.getBoundingClientRect();
  if (rect.top < 80 || rect.bottom > window.innerHeight) item.scrollIntoView({ block: 'center', behavior: 'instant' });
}

function pdLightboxClose() {
  const el = pdLb.el;
  if (!el || !el.open || pdLb.closing) return;
  pdLb.closing = true;
  const i = pdLb.index;
  const cur = pdLb.slides[i];
  clearTimeout(pdLb.tapTimer);

  const finish = () => el.close();

  pdLbSyncPage(i);
  if (!window.gsap) { finish(); return; }
  if (pdReducedMotion()) {
    gsap.to(el, { opacity: 0, duration: 0.15, onComplete() { gsap.set(el, { clearProps: 'opacity' }); finish(); } });
    return;
  }
  pdLbResetZoom();
  gsap.killTweensOf([pdLb.scrim, pdLb.ghost, cur.frame, ...pdLb.ui]);
  gsap.to(pdLb.scrim, { opacity: 0, duration: 0.42, ease: 'power2.inOut' });
  gsap.to(pdLb.ui, { opacity: 0, duration: 0.18, ease: 'power1.out' });
  const to = pdLbOriginRect(i);
  const src = cur.img.naturalWidth ? cur.img.currentSrc : to && to.src;
  if (to && src) {
    pdLbFly(cur.frame, to.rect, src, true, finish);
  } else {
    gsap.to(cur.frame, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in', onComplete: finish });
  }
}

function pdLbCleanup() {
  const i = pdLb.index;
  const nodes = [pdLb.el, pdLb.scrim, pdLb.ghost, ...pdLb.ui, ...pdLb.slides.map((s) => s.frame)];
  clearTimeout(pdLb.tapTimer);
  pdLb.pointers.clear();
  pdLb.gesture = null;
  pdLbResetZoom();
  document.documentElement.classList.remove('pd-lightbox-open');
  pdLb.el.classList.remove('pd-lightbox--dragging', 'pd-lightbox--immersive');
  if (window.gsap) {
    gsap.killTweensOf(nodes);
    gsap.set(nodes, { clearProps: 'opacity,transform' });
  }
  pdLb.slides.forEach((s) => { s.frame.style.visibility = ''; });
  pdLb.ghost.hidden = true;
  pdLbSyncInert();
  pdLb.closing = false;
  const target = pdLbPageItem(i) || (pdLb.origin && pdLb.origin.offsetParent ? pdLb.origin : document.querySelector('.pd-gallery-img, .pd-carousel__item'));
  if (target) target.focus({ preventScroll: true });
}

function pdLbSetImmersive(on) {
  pdLb.el.classList.toggle('pd-lightbox--immersive', on);
  pdLbSyncInert();
}

function pdLbSyncInert() {
  const el = pdLb.el;
  const immersive = el.classList.contains('pd-lightbox--immersive');
  const zoomed = el.classList.contains('pd-lightbox--zoomed');
  const hidden = (n) => immersive || (zoomed && !n.classList.contains('pd-lightbox__top'));
  if (pdLb.ui.some((n) => hidden(n) && n.contains(document.activeElement))) el.focus({ preventScroll: true });
  pdLb.ui.forEach((n) => { n.inert = hidden(n); });
}

function pdLbToggleZoom() {
  if (!pdLbCurrent()) return;
  if (pdLb.zoom.ts > 1) pdLbZoomTo(1, 0, 0);
  else pdLbZoomTo(PD_LB_ZOOM, 0, 0);
}

function pdLbOnKey(e) {
  if (pdLb.el.classList.contains('pd-lightbox--immersive')) pdLbSetImmersive(false);
  if (pdLb.closing || e.altKey || e.ctrlKey || e.metaKey) return;
  const z = pdLb.zoom;
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    if (z.ts <= 1) pdLbToggleZoom();
    return;
  }
  if (e.key === '-' || e.key === '_' || e.key === '0') {
    if (z.ts > 1) { e.preventDefault(); pdLbZoomTo(1, 0, 0); }
    return;
  }
  if (z.ts > 1 && e.key.startsWith('Arrow')) {
    e.preventDefault();
    const d = 120;
    pdLbZoomTo(z.ts, z.tx + ({ ArrowLeft: d, ArrowRight: -d }[e.key] || 0), z.ty + ({ ArrowUp: d, ArrowDown: -d }[e.key] || 0));
    return;
  }
  if (e.shiftKey) return;
  const keys = { ArrowRight: pdLb.index + 1, ArrowLeft: pdLb.index - 1, Home: 0, End: pdLb.slides.length - 1 };
  if (!(e.key in keys)) return;
  e.preventDefault();
  pdLightboxGo(keys[e.key]);
}

function pdLbOnWheel(e) {
  if (pdLb.zoom.ts > 1 || pdLb.closing) { e.preventDefault(); return; }
  if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
  e.preventDefault();
  const now = performance.now();
  const idle = now - pdLb.wheelAt > 350;
  pdLb.wheelAt = now;
  if (idle && Math.abs(e.deltaY) > 4) pdLightboxGo(pdLb.index + Math.sign(e.deltaY));
}

function pdLbCurrent() {
  return pdLb.slides[pdLb.index];
}

function pdLbBounds(s) {
  const cur = pdLbCurrent();
  const sr = cur.slide.getBoundingClientRect();
  const fr = cur.frame.getBoundingClientRect();
  const cx = fr.left + fr.width / 2;
  const cy = fr.top + fr.height / 2;
  const axis = (lo, hi, center, half) => {
    const a = hi - center - half;
    const b = lo - center + half;
    return [Math.min(a, b), Math.max(a, b)];
  };
  return { sr, cx, cy, x: axis(sr.left, sr.right, cx, (fr.width * s) / 2), y: axis(sr.top, sr.bottom, cy, (fr.height * s) / 2) };
}

function pdLbClamp(s, x, y) {
  const b = pdLbBounds(s);
  return { x: Math.min(b.x[1], Math.max(b.x[0], x)), y: Math.min(b.y[1], Math.max(b.y[0], y)) };
}

function pdLbPanFor(e, s) {
  const b = pdLbBounds(s);
  const fx = Math.min(1, Math.max(0, (e.clientX - b.sr.left) / b.sr.width));
  const fy = Math.min(1, Math.max(0, (e.clientY - b.sr.top) / b.sr.height));
  return { x: b.x[1] + (b.x[0] - b.x[1]) * fx, y: b.y[1] + (b.y[0] - b.y[1]) * fy };
}

function pdLbCenter() {
  const b = pdLbBounds(1);
  return { x: b.cx, y: b.cy };
}

function pdLbSetZoomed(on) {
  const el = pdLb.el;
  const cur = pdLbCurrent();
  if (on && cur && !cur.hires) {
    cur.hires = true;
    pdLbApplySizes(cur);
  }
  if (el.classList.contains('pd-lightbox--zoomed') === on) return;
  el.classList.toggle('pd-lightbox--zoomed', on);
  const btn = document.getElementById('pdLbZoom');
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Alejar foto' : 'Acercar foto');
  pdLbSyncInert();
}

function pdLbPaint() {
  const cur = pdLbCurrent();
  if (!cur) return;
  const z = pdLb.zoom;
  cur.img.style.transform = z.s > 1.001 ? `translate3d(${z.x}px, ${z.y}px, 0) scale(${z.s})` : '';
}

function pdLbTick(now) {
  const z = pdLb.zoom;
  const dt = Math.min(64, now - (z.last || now - 16.7));
  z.last = now;
  const k = 1 - Math.pow(0.8, dt / 16.7);
  z.s += (z.ts - z.s) * k;
  z.x += (z.tx - z.x) * k;
  z.y += (z.ty - z.y) * k;
  const settled = Math.abs(z.ts - z.s) < 0.002 && Math.abs(z.tx - z.x) < 0.3 && Math.abs(z.ty - z.y) < 0.3;
  if (settled) { z.s = z.ts; z.x = z.tx; z.y = z.ty; }
  pdLbPaint();
  z.raf = settled ? 0 : requestAnimationFrame(pdLbTick);
  if (settled) z.last = 0;
}

function pdLbZoomTo(s, x, y, instant) {
  if (!pdLbCurrent()) return;
  const z = pdLb.zoom;
  const c = pdLbClamp(s, x, y);
  z.ts = s; z.tx = c.x; z.ty = c.y;
  pdLbSetZoomed(s > 1);
  if (instant || pdReducedMotion()) {
    cancelAnimationFrame(z.raf);
    z.raf = 0;
    z.s = s; z.x = c.x; z.y = c.y;
    pdLbPaint();
    return;
  }
  if (!z.raf) z.raf = requestAnimationFrame(pdLbTick);
}

function pdLbResetZoom() {
  const z = pdLb.zoom;
  cancelAnimationFrame(z.raf);
  Object.assign(z, { s: 1, x: 0, y: 0, ts: 1, tx: 0, ty: 0, raf: 0, last: 0 });
  pdLb.slides.forEach((s) => { s.img.style.transform = ''; });
  if (pdLb.el) pdLbSetZoomed(false);
}

function pdLbOnClick(e) {
  if (performance.now() - pdLb.touchAt < 800 || pdLb.closing) return;
  const cur = pdLbCurrent();
  if (!cur) return;
  if (cur.frame.contains(e.target)) {
    if (pdLb.zoom.ts > 1) pdLbZoomTo(1, 0, 0);
    else { const p = pdLbPanFor(e, PD_LB_ZOOM); pdLbZoomTo(PD_LB_ZOOM, p.x, p.y); }
  } else if (pdLb.zoom.ts > 1) {
    pdLbZoomTo(1, 0, 0);
  } else {
    pdLightboxClose();
  }
}

function pdLbOnPointerDown(e) {
  if (e.pointerType === 'mouse' || pdLb.closing) return;
  pdLb.touchAt = performance.now();
  pdLb.target = null;
  pdLb.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const z = pdLb.zoom;
  if (pdLb.pointers.size === 2) {
    const [a, b] = [...pdLb.pointers.values()];
    clearTimeout(pdLb.tapTimer);
    cancelAnimationFrame(z.raf);
    z.raf = 0;
    pdLb.gesture = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: z.s, x0: z.x, y0: z.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    pdLbSetZoomed(true);
  } else if (pdLb.pointers.size === 1) {
    pdLb.gesture = { type: 'pending', sx: e.clientX, sy: e.clientY, x0: z.x, y0: z.y, t0: performance.now() };
  }
}

function pdLbOnPointerMove(e) {
  const z = pdLb.zoom;
  if (e.pointerType === 'mouse') {
    if (z.ts > 1 && !pdLb.closing) { const p = pdLbPanFor(e, z.ts); pdLbZoomTo(z.ts, p.x, p.y); }
    return;
  }
  if (!pdLb.pointers.has(e.pointerId)) return;
  pdLb.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const g = pdLb.gesture;
  if (!g) return;

  if (g.type === 'pinch' && pdLb.pointers.size >= 2) {
    const [a, b] = [...pdLb.pointers.values()];
    const s = Math.min(4, Math.max(1, g.s0 * Math.hypot(a.x - b.x, a.y - b.y) / g.d0));
    const c = pdLbCenter();
    const px = (g.mx - c.x - g.x0) / g.s0;
    const py = (g.my - c.y - g.y0) / g.s0;
    pdLbZoomTo(s, (a.x + b.x) / 2 - c.x - px * s, (a.y + b.y) / 2 - c.y - py * s, true);
    return;
  }

  const dx = e.clientX - g.sx;
  const dy = e.clientY - g.sy;
  if (g.type === 'pending') {
    if (Math.hypot(dx, dy) < 8) return;
    clearTimeout(pdLb.tapTimer);
    if (z.s > 1) g.type = 'pan';
    else if (dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.2) g.type = 'dismiss';
    else { pdLb.gesture = null; return; }
  }
  if (g.type === 'pan') pdLbZoomTo(z.s, g.x0 + dx, g.y0 + dy, true);
  if (g.type === 'dismiss') pdLbDrag(Math.max(0, dy));
}

function pdLbOnPointerUp(e) {
  if (!pdLb.pointers.has(e.pointerId)) return;
  pdLb.pointers.delete(e.pointerId);
  const g = pdLb.gesture;
  const z = pdLb.zoom;
  pdLb.touchAt = performance.now();

  if (g && g.type === 'pinch') {
    if (pdLb.pointers.size === 1) {
      if (z.s < 1.08) { pdLb.gesture = null; pdLbZoomTo(1, 0, 0); return; }
      const [p] = [...pdLb.pointers.values()];
      pdLb.gesture = { type: 'pan', sx: p.x, sy: p.y, x0: z.x, y0: z.y };
      return;
    }
    pdLb.gesture = null;
    if (z.s < 1.08) pdLbZoomTo(1, 0, 0);
    else pdLbSetZoomed(true);
    return;
  }
  if (pdLb.pointers.size) return;
  pdLb.gesture = null;
  if (!g) return;
  if (g.type === 'pan' && z.s < 1.08) { pdLbZoomTo(1, 0, 0); return; }
  if (g.type === 'dismiss') {
    const dy = e.type === 'pointerup' ? e.clientY - g.sy : 0;
    pdLbDragEnd(dy, performance.now() - g.t0);
    return;
  }
  if (g.type === 'pending' && e.type === 'pointerup') pdLbTap(e);
}

function pdLbTap(e) {
  const now = performance.now();
  const isDouble = now - pdLb.tapAt < 300 && Math.hypot(e.clientX - pdLb.tapX, e.clientY - pdLb.tapY) < 40;
  clearTimeout(pdLb.tapTimer);
  if (isDouble) {
    pdLb.tapAt = 0;
    if (pdLb.zoom.ts > 1) {
      pdLbZoomTo(1, 0, 0);
    } else {
      const c = pdLbCenter();
      const s = PD_LB_ZOOM;
      pdLbZoomTo(s, -(e.clientX - c.x) * (s - 1), -(e.clientY - c.y) * (s - 1));
    }
    return;
  }
  pdLb.tapAt = now;
  pdLb.tapX = e.clientX;
  pdLb.tapY = e.clientY;
  pdLb.tapTimer = setTimeout(() => {
    if (pdLb.zoom.ts === 1) pdLbSetImmersive(!pdLb.el.classList.contains('pd-lightbox--immersive'));
  }, 300);
}

function pdLbDrag(dy) {
  const cur = pdLbCurrent();
  const p = Math.min(1, dy / 420);
  pdLb.el.classList.add('pd-lightbox--dragging');
  if (window.gsap) {
    gsap.set(cur.frame, { y: dy, scale: 1 - p * 0.18 });
    gsap.set(pdLb.scrim, { opacity: 1 - p * 0.9 });
  } else {
    cur.frame.style.transform = `translate3d(0, ${dy}px, 0) scale(${1 - p * 0.18})`;
    pdLb.scrim.style.opacity = String(1 - p * 0.9);
  }
}

function pdLbDragEnd(dy, dt) {
  if (dy > 110 || (dy > 40 && dy / Math.max(dt, 1) > 0.65)) { pdLightboxClose(); return; }
  const cur = pdLbCurrent();
  pdLb.el.classList.remove('pd-lightbox--dragging');
  if (window.gsap && !pdReducedMotion()) {
    gsap.to(cur.frame, { y: 0, scale: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform' });
    gsap.to(pdLb.scrim, { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'opacity' });
  } else {
    if (window.gsap) gsap.set([cur.frame, pdLb.scrim], { clearProps: 'transform,opacity' });
    cur.frame.style.transform = '';
    pdLb.scrim.style.opacity = '';
  }
}

function pdSelectSize(size, btn) {
  document.querySelectorAll('#pdSizes .size-btn').forEach(b => {
    b.classList.remove('active');
    b.classList.remove('size-btn--just-picked');
  });
  btn.classList.add('active');
  // Feedback mobile: scale-bounce + pulse-ring una sola vez
  btn.classList.add('size-btn--just-picked');
  btn.addEventListener('animationend', () => btn.classList.remove('size-btn--just-picked'), { once: true });

  // Haptic feedback al seleccionar talla (Android Chrome / FF; iOS Safari ignora)
  if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) {} }

  // Ya hay talla: quitar parpadeo del label y actualizar sticky CTA con transición
  document.body.classList.remove('pd-needs-size');
  const stickyBtn  = document.getElementById('pdStickyBtn');
  const stickyText = document.getElementById('pdStickyBtnText');
  if (stickyBtn && !stickyBtn.disabled) {
    const wasNotReady = (stickyText ? stickyText.textContent : stickyBtn.textContent).trim() !== 'AGREGAR AL CARRITO';
    if (stickyText && wasNotReady) {
      stickyBtn.classList.add('is-swapping');
      setTimeout(() => {
        stickyText.textContent = 'AGREGAR AL CARRITO';
        stickyBtn.classList.remove('is-swapping');
        stickyBtn.classList.remove('is-ready');
        // Retrigger pulse-ring
        // eslint-disable-next-line no-unused-expressions
        void stickyBtn.offsetWidth;
        stickyBtn.classList.add('is-ready');
        stickyBtn.addEventListener('animationend', () => stickyBtn.classList.remove('is-ready'), { once: true });
      }, 220);
    } else if (stickyText) {
      stickyText.textContent = 'AGREGAR AL CARRITO';
    } else {
      stickyBtn.textContent = 'AGREGAR AL CARRITO';
    }
  }
  window._pdSelectedSize = size;

  const addBtn  = document.getElementById('pdAddBtn');
  if (!addBtn) return;
  addBtn.dataset.state = 'ready';
  const span = addBtn.querySelector('.btn-text');
  if (span) span.textContent = 'AGREGAR AL CARRITO';
}

// ============================================
// BFCACHE — popstate reload
// When the user hits back/forward, the browser may
// restore a page from bfcache. If the restored page
// is index.html or producto.html (which need full JS
// init), reload so all state is fresh.
// ============================================
window.addEventListener('popstate', function () {
  const path = window.location.pathname;
  // Pages that need full JS reinit on back/forward navigation
  if (
    path === '/' ||
    path.endsWith('/index.html') ||
    path.endsWith('/producto.html')
  ) {
    window.location.reload();
  }
});

function pdAddToCart() {
  const addBtn = document.getElementById('pdAddBtn');
  const p      = window._pdProduct;
  const size   = window._pdSelectedSize;

  if (!size || !addBtn || addBtn.dataset.state === 'locked') {
    if (addBtn) {
      addBtn.classList.remove('shake');
      void addBtn.offsetWidth;
      addBtn.classList.add('shake');
      addBtn.addEventListener('animationend', () => addBtn.classList.remove('shake'), { once: true });
    }
    return;
  }

  const existing = cart.find(item => item.id === p.id && item.size === size);
  if ((existing ? existing.qty : 0) >= stockDisponible(p.id, size)) {
    showToast('Ya tienes todas las piezas disponibles de esa talla');
    return;
  }
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, size, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast('¡Agregado al carrito!');

  // Haptic feedback al confirmar agregado
  if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) {} }

  // Abrir carrito
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}


// ============================================
// PRODUCT CARD HOVER — foto real de la prenda (desktop)
// ============================================
// ============================================
// LIQUID GLASS — reflejo que sigue al puntero en el header (desktop)
// ============================================
function initGlassLight() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const glass = $('.header__inner');
  if (!glass) return;
  let frame = 0;
  glass.addEventListener('pointermove', (e) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const r = glass.getBoundingClientRect();
      glass.style.setProperty('--glass-x', `${e.clientX - r.left}px`);
      glass.style.setProperty('--glass-y', `${e.clientY - r.top}px`);
      frame = 0;
    });
  }, { passive: true });
}

// ============================================
// PWA — service worker (nunca intercepta checkout ni pagos)
// ============================================
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
