/* ============================================
   DSTAR STORE — APP.JS
   ============================================ */

// ============================================
// PRODUCT DATA
// Edita aquí tus productos. Las imágenes están en Cloudinary: https://res.cloudinary.com/dflyysqln/image/upload/
// ============================================
// DROP 01 — BORN TO SHINE
// DROP 02 — EL ANIMAL PRINT NUNCA MUERE
const PRODUCTS = [
  {
    id: 'dstar-bts-shirt-01',
    name: 'BORN TO SHINE',
    drop: 'BORN TO SHINE',
    price: 450,
    description: 'Camisa del drop Born to Shine. Pieza limitada DSTAR.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_khieim.webp',
    gallery: [
      'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine1_mhdrgc.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/brn1_ixp42v.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine3_apqt8r.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine4_hpg4y8.jpg',
    ],
    badge: 'LIMITED',       // LIMITED | NEW | SOLDOUT
    stock: 2,
    sizes: ['S', 'L'],
    sizesStock: { S: 1, L: 1 }
  },
  {
    id: 'dstar-bts-jort-01',
    name: 'OVER AS F**K',
    drop: 'BORN TO SHINE',
    price: 500,
    description: 'Jort del drop Born to Shine. Pieza limitada DSTAR.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/overasdosvistas_fb4qmr.webp',
    gallery: [
      'https://res.cloudinary.com/dflyysqln/image/upload/overas1_tgmuzs.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/overas2_flxg98.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/overas3_ypmnih.jpg',
    ],
    badge: 'LIMITED',
    stock: 3,
    sizes: ['S', 'M', 'L'],
    sizesStock: { S: 1, M: 1, L: 1 }
  },
  {
    id: 'dstar-apnm-ls-01',
    name: 'UNDER MY SKIN',
    drop: 'EL ANIMAL PRINT NUNCA MUERE',
    price: 400,
    description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/undermyskindosvistas_me1boh.webp',
    gallery: [
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin1_u3ulw1.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin2_brvy0g.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin3_jrteip.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin4_zef1fn.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin5_nzap7h.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin6_f97hki.jpg',
    ],
    badge: 'LIMITED',
    stock: 3,
    sizes: ['S', 'M', 'L'],
    sizesStock: { S: 1, M: 1, L: 1 }
  },
  {
    id: 'dstar-apnm-ls-02',
    name: 'BE A DEPREDATOR',
    drop: 'EL ANIMAL PRINT NUNCA MUERE',
    price: 350,
    description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/beadepredatordosvistas_zrxo9m.webp',
    gallery: [
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator1_btz8nt.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator2_oprlcc.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator3_cffy7u.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator4_h7oyhv.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator5_yyvzh9.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator6_bwigtm.jpg',
    ],
    badge: null,
    stock: 2,
    sizes: ['M', 'L'],
    sizesStock: { M: 1, L: 1 }
  },
  {
    id: 'dstar-apnm-shirt-01',
    name: 'BENDECIDO',
    drop: 'EL ANIMAL PRINT NUNCA MUERE',
    price: 300,
    description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/bendecido_shkmci.webp',
    gallery: [
      'https://res.cloudinary.com/dflyysqln/image/upload/bendecido1_lollup.jpg',
      'https://res.cloudinary.com/dflyysqln/image/upload/bendecido2_f5b9gb.jpg',
    ],
    badge: 'LIMITED',
    stock: 3,
    sizes: ['S', 'M', 'L'],
    sizesStock: { S: 1, M: 1, L: 1 }
  }
];

// ============================================
// CDN HELPER — inyecta transformaciones Cloudinary
// ============================================
function cdnOpt(url, w, h) {
  if (!url || !url.includes('cloudinary.com')) return url;
  const transforms = ['f_auto', 'q_auto'];
  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  return url.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
}

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  freeShippingThreshold: 999,
  currency: 'MXN',
  // Cambia esta URL cuando tengas tu Netlify Function de Mercado Pago
  checkoutEndpoint: '/.netlify/functions/create-preference'
};

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem('dstar_cart') || '[]');
let selectedSize = null;
let currentProduct = null;

// ============================================
// DOM REFS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('page-product')) {
    // ── Página de detalle de producto ──
    updateCartUI();
    initNav();
    initCart();
    initScrollProgress();
    initRippleButtons();
    initProductPage();
  } else {
    // ── Página principal ──
    initLoader();
    renderProducts();
    renderLookbook();
    renderBlog();
    renderFAQ();
    updateCartUI();
    initNav();
    initCart();
    initModal();
    initScrollAnimations();
    initScrollProgress();
    initHeroParallax();
    initMagneticCTA();
    initRippleButtons();
    initTextScramble();
  }
});

// ============================================
// LOADER
// ============================================
function initLoader() {
  const loader = $('#loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 2000);
}

// ============================================
// NAV
// ============================================
function initNav() {
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  $$('[data-close-nav]').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Header scroll behavior
  let lastScroll = 0;
  const header = $('.header');
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      header.style.top = currentScroll > lastScroll ? '-100px' : '12px';
    } else {
      header.style.top = '32px';
    }
    lastScroll = currentScroll;
  });
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
    const isSoldOut = p.stock === 0 || p.badge === 'SOLDOUT';
    const badgeClass = p.badge === 'LIMITED' ? 'limited' :
                       p.badge === 'NEW' ? 'new' : 'soldout';
    const badgeText = p.badge === 'LIMITED' ? 'LIMITADO' :
                      p.badge === 'NEW' ? 'NUEVO' : 'AGOTADO';
    const delay = Math.min(i, 5) * 0.08;

    const tag   = isSoldOut ? 'div' : 'a';
    const href  = isSoldOut ? '' : `href="producto.html?id=${p.id}"`;
    return `
      <${tag} class="product-card fade-in ${isSoldOut ? 'sold-out' : ''}"
           data-product-index="${i}"
           style="--stagger-delay: ${delay}s"
           ${href}>
        <div class="product-card__image">
          <img src="${cdnOpt(p.image, 600)}" alt="${p.name}"
               loading="lazy" decoding="async"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2020/svg%22 viewBox=%220 0 300 400%22%3E%3Crect fill=%22%23141414%22 width=%22300%22 height=%22400%22/%3E%3Ctext fill=%22%235c5c57%22 font-family=%22monospace%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EDSTAR%3C/text%3E%3C/svg%3E'">
          <span class="product-card__badge product-card__badge--${badgeClass}">${badgeText}</span>
        </div>
        <div class="product-card__info">
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__price">${isSoldOut ? 'AGOTADO' : formatPrice(p.price)}</p>
          ${!isSoldOut ? `<p class="product-card__stock">QUEDAN ${p.stock} PIEZAS</p>` : ''}
        </div>
      </${tag}>
    `;
  }).join('');

  initCardTilt();
}

// ============================================
// PRODUCT MODAL — PREMIUM
// ============================================
function initModal() {
  if (!$('#modalClose')) return;
  $('#modalClose').addEventListener('click', closeProductModal);
  $('#modalOverlay').addEventListener('click', closeProductModal);
  $('#modalAddBtn').addEventListener('click', addToCartFromModal);

  // Fullscreen al hacer click en la imagen
  $('#modalImage').addEventListener('click', () => {
    const img = $('#modalImage');
    if (img.src && img.src !== window.location.href) openImageFullscreen(img.src, img.alt);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });
}

function openProductModal(index) {
  const p = PRODUCTS[index];
  currentProduct = p;
  selectedSize = null;

  const modal    = $('#productModal');
  const overlay  = $('#modalOverlay');
  const content  = modal.querySelector('.product-modal__content');
  const infoEls  = content.querySelectorAll(
    '.product-modal__name, .product-modal__price, .product-modal__desc, .product-modal__sizes, .product-modal__stock, .product-modal__add'
  );

  // Poblar datos del producto
  const modalImg = $('#modalImage');
  modalImg.src = cdnOpt(p.image, 800);
  modalImg.onerror = function() {
    this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 500%22%3E%3Crect fill=%22%23141414%22 width=%22400%22 height=%22500%22/%3E%3Ctext fill=%22%235c5c57%22 font-family=%22monospace%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EDSTAR%3C/text%3E%3C/svg%3E';
  };
  $('#modalName').textContent = p.name;
  $('#modalPrice').textContent = formatPrice(p.price);
  $('#modalDesc').textContent = p.description;

  // Badge
  const badgeEl = $('#modalBadge');
  if (p.badge === 'LIMITED') {
    badgeEl.textContent = 'LIMITADO';
    badgeEl.style.cssText = 'display:block; background:var(--red); color:var(--white);';
  } else if (p.badge === 'NEW') {
    badgeEl.textContent = 'NUEVO';
    badgeEl.style.cssText = 'display:block; background:var(--white); color:var(--black);';
  } else {
    badgeEl.style.display = 'none';
  }

  // Tallas
  $('#modalSizes').innerHTML = p.sizes.map(s => {
    const sizeStock = p.sizesStock[s] || 0;
    return `<button class="size-btn"
                    data-size="${s}"
                    ${sizeStock === 0 ? 'disabled' : ''}
                    onclick="selectSize('${s}', this)">
              ${s}
            </button>`;
  }).join('');

  // Stock — urgencia si quedan ≤5 piezas
  const stockEl = $('#modalStock');
  stockEl.textContent = `QUEDAN ${p.stock} PIEZAS EN TOTAL`;
  stockEl.classList.toggle('product-modal__stock--urgent', p.stock > 0 && p.stock <= 5);

  // Botón CTA — estado inicial bloqueado
  const addBtn = $('#modalAddBtn');
  addBtn.dataset.state = 'locked';
  addBtn.classList.remove('product-modal__add--success');
  addBtn.innerHTML = '<span class="btn-text">SELECCIONA TALLA</span>';

  // Abrir modal (visibilidad via clase)
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Resetear estilos inline de animaciones anteriores
  gsap.set(overlay, { opacity: 0 });
  gsap.set(content, { opacity: 0, y: 50 });
  gsap.set(infoEls,  { opacity: 0, y: 16 });

  // GSAP: animación de entrada premium
  // 1. Backdrop fade-in
  gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.out' });

  // 2. Tarjeta slide-up con spring easing
  gsap.to(content, {
    opacity: 1,
    y: 0,
    duration: 0.55,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    delay: 0.05
  });

  // 3. Elementos internos con stagger escalonado
  gsap.to(infoEls, {
    opacity: 1,
    y: 0,
    duration: 0.38,
    stagger: 0.065,
    ease: 'power2.out',
    delay: 0.22
  });
}

function closeProductModal() {
  const modal   = $('#productModal');
  const overlay = $('#modalOverlay');
  const content = modal.querySelector('.product-modal__content');

  // GSAP: animación de cierre (más rápida que la entrada)
  gsap.to(content, { opacity: 0, y: 28, duration: 0.2, ease: 'power2.in' });
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.28,
    delay: 0.04,
    ease: 'power2.in',
    onComplete() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      currentProduct = null;
      selectedSize = null;
    }
  });
}

function selectSize(size, btn) {
  $$('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = size;

  const addBtn = $('#modalAddBtn');
  addBtn.dataset.state = 'ready';

  // Animación de texto: slide-out → slide-in
  const textSpan = addBtn.querySelector('.btn-text');
  if (textSpan && window.gsap) {
    gsap.to(textSpan, {
      y: -10, opacity: 0, duration: 0.15, ease: 'power2.in',
      onComplete() {
        textSpan.textContent = 'AGREGAR AL CARRITO';
        gsap.fromTo(textSpan,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
        );
      }
    });
  } else if (textSpan) {
    textSpan.textContent = 'AGREGAR AL CARRITO';
  }
}

function addToCartFromModal() {
  const addBtn = $('#modalAddBtn');

  // Shake de error si no hay talla seleccionada
  if (addBtn.dataset.state === 'locked' || !selectedSize) {
    addBtn.classList.remove('shake');
    void addBtn.offsetWidth; // reflow para reiniciar la animación
    addBtn.classList.add('shake');
    addBtn.addEventListener('animationend', () => addBtn.classList.remove('shake'), { once: true });
    return;
  }

  if (!currentProduct) return;

  const existing = cart.find(item =>
    item.id === currentProduct.id && item.size === selectedSize
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      size: selectedSize,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();

  // Partícula voladora desde el botón al ícono del carrito
  launchCartParticle(addBtn);

  // Cart icon bounce
  const cartBtn = $('#cartBtn');
  cartBtn.classList.remove('cart-btn--bounce');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-btn--bounce');
  cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('cart-btn--bounce'), { once: true });

  // ✓ AGREGADO — feedback visual 1.5s, luego cerrar
  const productName = currentProduct.name;
  const productSize = selectedSize;
  const textSpan = addBtn.querySelector('.btn-text');

  addBtn.dataset.state = 'ready';
  addBtn.classList.add('product-modal__add--success');
  if (textSpan && window.gsap) {
    gsap.fromTo(textSpan,
      { scale: 0.85, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)',
        onStart() { textSpan.textContent = '✓ AGREGADO'; }
      }
    );
  } else if (textSpan) {
    textSpan.textContent = '✓ AGREGADO';
  }

  showToast(`${productName} (${productSize}) AGREGADO`);

  setTimeout(() => {
    closeProductModal();
    setTimeout(() => openCart(), 350);
  }, 1200);
}

// Imagen en fullscreen al hacer click
function openImageFullscreen(src, alt) {
  const el = document.createElement('div');
  el.className = 'img-fullscreen';
  el.innerHTML = `<img src="${src}" alt="${alt || 'DSTAR'}"><button class="img-fullscreen__close" aria-label="Cerrar">✕</button>`;
  document.body.appendChild(el);

  if (window.gsap) {
    gsap.to(el, { opacity: 1, duration: 0.3, ease: 'power2.out' });
  } else {
    el.style.opacity = '1';
  }

  const close = () => {
    if (window.gsap) {
      gsap.to(el, { opacity: 0, duration: 0.2, onComplete: () => el.remove() });
    } else {
      el.remove();
    }
    document.removeEventListener('keydown', escHandler);
  };

  const escHandler = (e) => { if (e.key === 'Escape') close(); };
  el.addEventListener('click', (e) => {
    if (e.target === el || e.target.closest('.img-fullscreen__close')) close();
  });
  document.addEventListener('keydown', escHandler);
}

// Partícula voladora desde CTA al carrito
function launchCartParticle(originEl) {
  if (!window.gsap || !originEl) return;
  const cartBtn = $('#cartBtn');
  if (!cartBtn) return;

  const startRect = originEl.getBoundingClientRect();
  const endRect   = cartBtn.getBoundingClientRect();

  const particle = document.createElement('div');
  particle.className = 'cart-particle';
  particle.style.left = `${startRect.left + startRect.width / 2}px`;
  particle.style.top  = `${startRect.top  + startRect.height / 2}px`;
  document.body.appendChild(particle);

  gsap.to(particle, {
    left: endRect.left + endRect.width / 2,
    top:  endRect.top  + endRect.height / 2,
    scale: 0,
    opacity: 0.6,
    duration: 0.6,
    ease: 'power3.in',
    onComplete: () => particle.remove()
  });
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

    itemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img class="cart-item__image" src="${cdnOpt(item.image, 150)}" alt="${item.name}" decoding="async"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 70 90%22%3E%3Crect fill=%22%23141414%22 width=%2270%22 height=%2290%22/%3E%3C/svg%3E'">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__size">TALLA: ${item.size}</div>
          <div class="cart-item__price">${formatPrice(item.price)}</div>
          <div class="cart-item__qty">
            <button onclick="changeQty(${i}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${i}, 1)">+</button>
          </div>
          <button class="cart-item__remove" onclick="removeFromCart(${i})">ELIMINAR</button>
        </div>
      </div>
    `).join('');
  }
}

function changeQty(index, delta) {
  cart[index].qty += delta;
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
  localStorage.setItem('dstar_cart', JSON.stringify(cart));
}

// ============================================
// CHECKOUT (Mercado Pago)
// ============================================
async function handleCheckout() {
  const btn = $('#checkoutBtn');
  btn.disabled = true;
  btn.textContent = 'PROCESANDO...';

  try {
    const response = await fetch(CONFIG.checkoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          title: `${item.name} — Talla ${item.size}`,
          unit_price: item.price,
          quantity: item.qty,
          currency_id: CONFIG.currency
        }))
      })
    });

    const data = await response.json();
    
    if (data.init_point) {
      // Redirigir a Mercado Pago
      window.location.href = data.init_point;
    } else {
      throw new Error('No se pudo crear la preferencia de pago');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('ERROR AL PROCESAR — INTENTA DE NUEVO');
    btn.disabled = false;
    btn.textContent = 'PAGAR CON MERCADO PAGO';
  }
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
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook01_lvl7hb.jpg', caption: 'DROP 01 — PHANTOM' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook02_gztk5q.jpg', caption: 'TEE CONCRETE' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook03_zxfrhr.jpg', caption: 'BARRIO SESSIONS' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook04_hrbtc3.jpg', caption: 'HOODIE BARRIO' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook05_r49ynl.jpg', caption: 'CARGO NOCTURNO' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook06_g3utzp.jpg', caption: 'FULL FIT' },
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
  },
  {
    slug: 'streetwear-mexico-escena',
    title: 'LA ESCENA STREETWEAR EN MÉXICO',
    date: 'FEB 2026',
    category: 'CULTURA',
    excerpt: 'Qué está pasando con el streetwear nacional. Las marcas, los colectivos y los espacios que están definiendo la moda de la calle.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/dstar/blog/post-02.webp',
  },
  {
    slug: 'como-cuidar-tu-ropa',
    title: 'CÓMO CUIDAR TU ROPA DSTAR',
    date: 'ENE 2026',
    category: 'TIPS',
    excerpt: 'Guía completa para que tus piezas duren lo que tienen que durar. Lavado, secado y almacenaje para prendas de calidad.',
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/dstar/blog/post-03.webp',
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
    a: 'Sí, enviamos a todo México. El costo de envío se calcula al momento del pago. Envío GRATIS en compras mayores a $999 MXN.'
  },
  {
    q: '¿PUEDO PAGAR EN EFECTIVO EN OXXO?',
    a: 'Sí. Mercado Pago acepta pagos en efectivo en OXXO. Al elegir esa opción en el checkout, recibirás un código de barras para pagar en cualquier sucursal OXXO. Tu pedido se procesa una vez confirmado el pago (puede tardar unas horas).'
  },
  {
    q: '¿ACEPTAN DEVOLUCIONES O CAMBIOS?',
    a: 'Por el momento no contamos con servicio de devoluciones ni cambios. Te recomendamos revisar bien la guía de tallas antes de hacer tu pedido. Si tienes dudas sobre qué talla elegir, escríbenos antes de comprar y con gusto te asesoramos.'
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
    a: 'Sí abrimos colaboraciones seleccionadas con artistas, colectivos y marcas que compartan nuestra visión. Escríbenos a contacto@dstar.mx con tu propuesta.'
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

  // Primera imagen: carga eager (visible de inmediato). Las demás: lazy.
  grid.innerHTML = LOOKBOOK.map((item, i) => `
    <div class="lookbook-panel">
      <div class="lookbook-panel__img-wrap">
        <img src="${cdnOpt(item.image, 900)}" alt="${item.caption}"
             loading="${i === 0 ? 'eager' : 'lazy'}"
             decoding="async"
             onerror="this.parentElement.style.background='var(--dark)'">
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

  grid.innerHTML = BLOG_POSTS.map((post, i) => `
    <a href="blog/${post.slug}.html" class="blog-card fade-in" style="--stagger-delay: ${i * 0.1}s">
      <div class="blog-card__image">
        <img src="${cdnOpt(post.image, 600)}" alt="${post.title}"
             loading="lazy" decoding="async"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 225%22%3E%3Crect fill=%22%23141414%22 width=%22400%22 height=%22225%22/%3E%3Ctext fill=%22%235c5c57%22 font-family=%22monospace%22 font-size=%2212%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EDSTAR%3C/text%3E%3C/svg%3E'">
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
        onclick="toggleFAQ(${i})"
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
  if (window.gsap) return; // GSAP ScrollTrigger handles this
  const bar = $('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
}

// ============================================
// HERO PARALLAX
// ============================================
function initHeroParallax() {
  if (window.gsap) return; // GSAP ScrollTrigger handles parallax
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const logo = $('.hero__logo');
  const tagline = $('.hero__tagline');
  const scrollIndicator = $('.hero__scroll-indicator');
  if (!logo && !tagline) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      if (logo) logo.style.transform = `translateY(${scrolled * 0.12}px)`;
      if (tagline) tagline.style.transform = `translateY(${scrolled * 0.18}px)`;
      if (scrollIndicator) scrollIndicator.style.opacity = Math.max(0, 1 - scrolled / 180);
    }
  }, { passive: true });
}

// ============================================
// MAGNETIC HERO CTA
// ============================================
function initMagneticCTA() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const cta = $('.hero__cta');
  if (!cta) return;
  let active = false;
  window.addEventListener('mousemove', (e) => {
    const rect = cta.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 90) {
      const dx = (e.clientX - cx) * 0.32;
      const dy = (e.clientY - cy) * 0.32;
      cta.style.transform = `translate(${dx}px, ${dy}px)`;
      cta.style.transition = 'transform 0.15s ease';
      active = true;
    } else if (active) {
      cta.style.transform = '';
      cta.style.transition = 'transform 0.45s var(--ease)';
      active = false;
    }
  });
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
// PRODUCT CARD 3D TILT
// ============================================
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  $$('.product-card:not(.sold-out)').forEach(card => {
    // Inject shine layer
    if (!card.querySelector('.product-card__shine')) {
      const shine = document.createElement('div');
      shine.className = 'product-card__shine';
      card.prepend(shine);
    }
    const shine = card.querySelector('.product-card__shine');
    const img = card.querySelector('.product-card__image img');

    let rafId = null;

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.12s ease';
    });

    card.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px) translateY(-4px)`;
        if (img) img.style.transform = `scale(1.04) translate(${x * 6}px, ${y * 6}px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      card.style.transition = 'transform 0.5s var(--ease)';
      card.style.transform = '';
      if (img) img.style.transform = '';
    });
  });
}

// ============================================
// PRODUCT DETAIL PAGE
// ============================================
function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  const p      = PRODUCTS.find(prod => prod.id === id);

  if (!p) { window.location.href = '/'; return; }

  document.title = p.name + ' — DSTAR';

  const isSoldOut = p.stock === 0 || p.badge === 'SOLDOUT';
  const gallery   = (p.gallery && p.gallery.length) ? p.gallery : [p.image];

  // Gallery — main image
  const mainImg = document.getElementById('pdMainImg');
  if (mainImg) {
    mainImg.src = gallery[0];
    mainImg.alt = p.name;
  }

  // Gallery — thumbnails (only if multiple images)
  const thumbsEl = document.getElementById('pdThumbs');
  if (thumbsEl) {
    if (gallery.length > 1) {
      thumbsEl.innerHTML = gallery.map((src, i) => `
        <button class="pd-thumb ${i === 0 ? 'pd-thumb--active' : ''}"
                onclick="pdSelectThumb(this,'${src}')">
          <img src="${src}" alt="${p.name} foto ${i + 1}">
        </button>`).join('');
    } else {
      thumbsEl.style.display = 'none';
    }
  }

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
  set('pdDesc',  p.description);

  // Sizes
  const sizesEl = document.getElementById('pdSizes');
  if (sizesEl) {
    sizesEl.innerHTML = p.sizes.map(s => {
      const inStock = (p.sizesStock[s] || 0) > 0;
      return `<button class="size-btn" data-size="${s}"
                      ${!inStock ? 'disabled' : ''}
                      onclick="pdSelectSize('${s}', this)">${s}</button>`;
    }).join('');
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
  window._pdProduct     = p;
  window._pdSelectedSize = null;
}

function pdSelectThumb(btn, src) {
  document.querySelectorAll('.pd-thumb').forEach(b => b.classList.remove('pd-thumb--active'));
  btn.classList.add('pd-thumb--active');
  const mainImg = document.getElementById('pdMainImg');
  if (mainImg) mainImg.src = src;
}

function pdSelectSize(size, btn) {
  document.querySelectorAll('#pdSizes .size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._pdSelectedSize = size;

  const addBtn  = document.getElementById('pdAddBtn');
  if (!addBtn) return;
  addBtn.dataset.state = 'ready';
  const span = addBtn.querySelector('.btn-text');
  if (span) span.textContent = 'AGREGAR AL CARRITO';
}

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
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, size, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast('¡Agregado al carrito!');

  // Abrir carrito
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
