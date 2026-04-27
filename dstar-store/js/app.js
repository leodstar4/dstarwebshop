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
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp',
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
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/overasdosvistas_lwrtst.webp',
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
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/undermyskindosvistas_foypii.webp',
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
    image: 'https://res.cloudinary.com/dflyysqln/image/upload/beadepredatordosvistas_wxwbp2.webp',
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
function cdnOpt(url, w, h, { limit = false } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  const isJpg = /\.(jpe?g|jpg)(\?|$)/i.test(url);
  const transforms = ['f_auto', 'q_auto', 'dpr_auto'];
  if (isJpg) transforms.push('fl_progressive');
  if (w) transforms.push(`w_${w}`);
  if (h) transforms.push(`h_${h}`);
  if (limit) transforms.push('c_limit');
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
    initTouchDirectionLock();
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
    initCardHoverScramble();
    initTouchDirectionLock();
  }
});

// ============================================
// BFCACHE — force reload on back/forward so GSAP entry animations re-run
// ============================================
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    window.location.reload();
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

  // Smooth scroll para todos los anchor links — offset dinámico del header
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    // Cerrar mobile nav si está abierto
    menuBtn.classList.remove('active');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';

    // Offset = header height + top position + breathing room (works whether header is visible or hidden)
    const headerEl = $('.header');
    const offset = headerEl ? headerEl.offsetHeight + 48 : 116;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
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
    const delay = Math.min(i, 5) * 0.08;

    const badgeVariant = isSoldOut      ? 'soldout' :
                         p.badge === 'NEW' ? 'new'     : null;
    const badgeText    = isSoldOut      ? 'AGOTADO' :
                         p.badge === 'NEW' ? 'NUEVO'   : '';

    const tag   = isSoldOut ? 'div' : 'a';
    const href  = isSoldOut ? '' : `href="producto.html?id=${p.id}"`;
    const badgeHtml = badgeVariant
      ? `<span class="product-card__badge product-card__badge--${badgeVariant}">${badgeText}</span>`
      : '';
    const priceText = isSoldOut ? 'AGOTADO' : formatPrice(p.price);
    const ctaHtml   = isSoldOut
      ? ''
      : '<span class="product-card__cta">VER PIEZA <span>→</span></span>';

    const scarcityHtml = isSoldOut ? '' : `
      <div class="product-card__scarcity product-card__scarcity--${p.stock <= 3 ? 'low' : 'medium'}">
        <span class="product-card__scarcity-dot" aria-hidden="true"></span>
        <span class="product-card__scarcity-text">QUEDAN ${p.stock} ${p.stock === 1 ? 'PIEZA' : 'PIEZAS'}</span>
      </div>
    `;

    return `
      <${tag} class="product-card fade-in ${isSoldOut ? 'sold-out' : ''}"
           data-product-index="${i}"
           style="--stagger-delay: ${delay}s"
           ${href}>
        <div class="product-card__image">
          <img src="${cdnOpt(p.image, 600, null, { limit: true })}" alt="${p.name}"
               ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2020/svg%22 viewBox=%220 0 300 400%22%3E%3Crect fill=%22%23141414%22 width=%22300%22 height=%22400%22/%3E%3Ctext fill=%22%235c5c57%22 font-family=%22monospace%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EDSTAR%3C/text%3E%3C/svg%3E'">
          ${badgeHtml}
        </div>
        <div class="product-card__info">
          <span class="product-card__accent"></span>
          <h3 class="product-card__name" data-name="${p.name}">${p.name}</h3>
          <div class="product-card__meta">
            <span class="product-card__price">${priceText}</span>
            ${ctaHtml}
          </div>
          ${scarcityHtml}
        </div>
      </${tag}>
    `;
  }).join('');

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
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook01_lvl7hb.jpg', caption: '' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook02_gztk5q.jpg', caption: '' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook03_zxfrhr.jpg', caption: '' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook04_hrbtc3.jpg', caption: '' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook05_r49ynl.jpg', caption: '' },
  { image: 'https://res.cloudinary.com/dflyysqln/image/upload/lookbook06_g3utzp.jpg', caption: '' },
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
// TOUCH DIRECTION LOCK
// Locks scroll to the primary axis once a swipe is detected.
// Only activates after 12px total movement — genuine taps stay
// well below this threshold and are never affected.
// Horizontal swipes outside carousel/lookbook containers are
// cancelled so the page can't shift sideways.
// ============================================
function initTouchDirectionLock() {
  if (!('ontouchstart' in window)) return;
  let startX = 0, startY = 0, dir = null;

  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dir = null;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!e.cancelable || e.touches.length !== 1) return;
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    // 12px slop: below this the gesture is a tap — never cancel it
    if (dx + dy < 12) return;
    if (!dir) dir = dx > dy ? 'h' : 'v';
    if (dir === 'h') {
      const inHoriz = e.target.closest(
        '.pd-carousel, .lookbook__horiz-wrap, #pdLightboxMobile__track'
      );
      if (!inHoriz) e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend',   () => { dir = null; }, { passive: true });
  document.addEventListener('touchcancel', () => { dir = null; }, { passive: true });
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
    _pdBuildLightbox(gallery, p.name);
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
  window._pdProduct      = p;
  window._pdSelectedSize = null;
  window._pdLightboxIndex = 0;

  // ── MOBILE UX: sticky CTA bar + size-label pulse + smart-scroll ──
  _pdInitMobileUX(p, isSoldOut);
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

// ── Desktop: render all gallery images as a vertical stack ──
function _pdBuildStack(gallery, productName) {
  const stack = document.getElementById('pdGalleryStack');
  if (!stack) return;

  stack.innerHTML = gallery.map((src, i) => `
    <div class="pd-gallery-img pd-gallery-img--loading" data-index="${i}">
      <img src="${cdnOpt(src, 900)}" alt="${productName} — foto ${i + 1}"
           loading="${i === 0 ? 'eager' : 'lazy'}"
           fetchpriority="${i === 0 ? 'high' : 'auto'}"
           decoding="async">
    </div>`).join('');

  stack.querySelectorAll('.pd-gallery-img').forEach(el => {
    // Drop the shimmer (and its 3:4 placeholder box) once the image
    // settles — whether it loaded or errored — so the wrapper can
    // collapse to the image's natural height.
    const img = el.querySelector('img');
    if (img) {
      const done = () => el.classList.remove('pd-gallery-img--loading');
      if (img.complete) {
        done();
      } else {
        img.addEventListener('load',  done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    }
    el.addEventListener('click', () => pdLightboxOpen(parseInt(el.dataset.index)));
  });

  // GSAP entrance — stagger images up into view
  if (window.gsap) {
    gsap.fromTo('.pd-gallery-img',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.3 }
    );

    // Per-image parallax scroll
    if (window.ScrollTrigger) {
      stack.querySelectorAll('.pd-gallery-img').forEach(el => {
        gsap.to(el, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }
  }
}

// ── Mobile: horizontal swipe carousel with dot indicators ──
function _pdBuildCarousel(gallery, productName) {
  const carousel = document.getElementById('pdCarousel');
  const dotsEl   = document.getElementById('pdCarouselDots');
  if (!carousel) return;

  // w=1200 + dpr_auto: en retina @2-3x la pantalla recibe 1200×(dpr),
  // suficientes píxeles para que el carrusel se vea nítido al contain
  carousel.innerHTML = gallery.map((src, i) => `
    <div class="pd-carousel__item pd-carousel__item--loading" data-index="${i}">
      <img src="${cdnOpt(src, 1200)}" alt="${productName} — foto ${i + 1}"
           loading="${i === 0 ? 'eager' : 'lazy'}"
           fetchpriority="${i === 0 ? 'high' : 'auto'}"
           decoding="async">
    </div>`).join('');

  // Drop shimmer once each image settles (load or error)
  carousel.querySelectorAll('.pd-carousel__item').forEach(el => {
    const img = el.querySelector('img');
    if (!img) return;
    const done = () => el.classList.remove('pd-carousel__item--loading');
    if (img.complete) {
      done();
    } else {
      img.addEventListener('load',  done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  // Tap en item: abre lightbox mobile en esa imagen
  _pdBuildMobileLightbox(gallery, productName);
  carousel.querySelectorAll('.pd-carousel__item').forEach(el => {
    el.addEventListener('click', () => {
      pdLightboxMobileOpen(parseInt(el.dataset.index));
    });
  });

  // SWIPE HINT: muestra "SWIPE →" debajo del carrusel si hay más de una imagen;
  // desaparece tras el primer scroll. Inserta una sola vez por carga de página.
  if (gallery.length > 1) {
    const galleryEl = carousel.parentElement;
    if (galleryEl && !galleryEl.querySelector('.pd-swipe-hint')) {
      const hint = document.createElement('div');
      hint.className = 'pd-swipe-hint';
      hint.innerHTML = '<span>SWIPE</span><span aria-hidden="true">→</span>';
      // Insertar entre carrusel y dots
      if (dotsEl && dotsEl.parentNode === galleryEl) {
        galleryEl.insertBefore(hint, dotsEl);
      } else {
        galleryEl.appendChild(hint);
      }
      const killHint = () => hint.classList.add('pd-swipe-hint--gone');
      carousel.addEventListener('scroll', killHint, { once: true, passive: true });
    }
  }

  // Image counter overlay (mobile only — desktop uses stacked gallery)
  const galleryEl = carousel.parentElement;
  if (galleryEl) galleryEl.style.position = 'relative';
  const counterEl = document.createElement('div');
  counterEl.className = 'pd-carousel-counter';
  counterEl.textContent = gallery.length > 1 ? `1 / ${gallery.length}` : '';
  counterEl.style.display = 'block'; // visible on mobile via CSS; hidden on desktop via @media
  if (galleryEl) galleryEl.appendChild(counterEl);

  if (!dotsEl) return;

  if (gallery.length < 2) { dotsEl.style.display = 'none'; return; }

  dotsEl.innerHTML = gallery.map((_, i) => `
    <button class="pd-carousel-dot${i === 0 ? ' pd-carousel-dot--active' : ''}"
            data-index="${i}" aria-label="Foto ${i + 1}"></button>`).join('');

  const dots = Array.from(dotsEl.querySelectorAll('.pd-carousel-dot'));

  // Scroll → update active dot + counter
  carousel.addEventListener('scroll', () => {
    const idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    dots.forEach((d, i) => d.classList.toggle('pd-carousel-dot--active', i === idx));
    counterEl.textContent = `${idx + 1} / ${gallery.length}`;
  }, { passive: true });

  // Dot click → scroll to image
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      carousel.scrollTo({ left: parseInt(dot.dataset.index) * carousel.offsetWidth, behavior: 'smooth' });
    });
  });
}

// ── Desktop: build lightbox structure (thumbnails + main view) ──
function _pdBuildLightbox(gallery, productName) {
  const thumbsEl = document.getElementById('pdLbThumbs');
  const closeBtn = document.getElementById('pdLbClose');
  const prevBtn  = document.getElementById('pdLbPrev');
  const nextBtn  = document.getElementById('pdLbNext');
  const lb       = document.getElementById('pdLightbox');
  if (!thumbsEl || !lb) return;

  thumbsEl.innerHTML = gallery.map((src, i) => `
    <button class="pd-lb-thumb${i === 0 ? ' pd-lb-thumb--active' : ''}"
            data-index="${i}" aria-label="Foto ${i + 1}">
      <img src="${cdnOpt(src, 150)}" alt="${productName} foto ${i + 1}" loading="lazy" decoding="async">
    </button>`).join('');

  thumbsEl.querySelectorAll('.pd-lb-thumb').forEach(btn => {
    btn.addEventListener('click', () => pdLightboxGo(parseInt(btn.dataset.index)));
  });

  if (closeBtn) closeBtn.addEventListener('click', pdLightboxClose);

  if (prevBtn) prevBtn.addEventListener('click', () => {
    const total = gallery.length;
    pdLightboxGo((window._pdLightboxIndex - 1 + total) % total);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const total = gallery.length;
    pdLightboxGo((window._pdLightboxIndex + 1) % total);
  });

  // ESC + arrow key navigation
  document.addEventListener('keydown', e => {
    const open = lb.classList.contains('is-open');
    if (!open) return;
    if (e.key === 'Escape') { pdLightboxClose(); return; }
    const total = gallery.length;
    if (e.key === 'ArrowDown'  || e.key === 'ArrowRight') pdLightboxGo((window._pdLightboxIndex + 1) % total);
    if (e.key === 'ArrowUp'    || e.key === 'ArrowLeft')  pdLightboxGo((window._pdLightboxIndex - 1 + total) % total);
  });
}

// ── Open lightbox at a given image index ──
function pdLightboxOpen(index) {
  const lb  = document.getElementById('pdLightbox');
  const img = document.getElementById('pdLbImg');
  if (!lb) return;
  lb.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  pdLightboxGo(index);
  if (window.gsap) {
    const thumbs = Array.from(document.querySelectorAll('.pd-lb-thumb'));
    gsap.killTweensOf([lb, img, ...thumbs]);
    gsap.fromTo(lb,
      { opacity: 0 },
      { opacity: 1, duration: 0.28, ease: 'power3.out' }
    );
    if (img) {
      gsap.fromTo(img,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.36, ease: 'power3.out', delay: 0.06 }
      );
    }
    if (thumbs.length) {
      gsap.fromTo(thumbs,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.32, stagger: 0.05, ease: 'power3.out', delay: 0.08 }
      );
    }
  }
}

// ── Close lightbox ──
function pdLightboxClose() {
  const lb = document.getElementById('pdLightbox');
  if (!lb) return;
  if (window.gsap) {
    gsap.to(lb, {
      opacity: 0, duration: 0.22, ease: 'power2.in',
      onComplete() {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  } else {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

// ── Navigate lightbox to a given index ──
function pdLightboxGo(index) {
  const img      = document.getElementById('pdLbImg');
  const thumbsEl = document.getElementById('pdLbThumbs');
  const p        = window._pdProduct;
  if (!img || !p) return;

  const gallery = (p.gallery && p.gallery.length) ? p.gallery : [p.image];
  index = Math.max(0, Math.min(gallery.length - 1, index));

  const newSrc = cdnOpt(gallery[index], 1400, null, { limit: true });
  const newAlt = p.name + ` — foto ${index + 1}`;

  if (window.gsap && window._pdLightboxIndex !== index) {
    // Slide current image out, then swap and slide in
    gsap.to(img, {
      x: -20, opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete() {
        img.src = newSrc;
        img.alt = newAlt;
        window._pdLightboxIndex = index;
        gsap.fromTo(img,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }
        );
      }
    });
  } else {
    img.src = newSrc;
    img.alt = newAlt;
    window._pdLightboxIndex = index;
  }

  if (thumbsEl) {
    thumbsEl.querySelectorAll('.pd-lb-thumb').forEach((btn, i) => {
      btn.classList.toggle('pd-lb-thumb--active', i === index);
    });
    const active = thumbsEl.querySelector('.pd-lb-thumb--active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ── Mobile: build/open/close lightbox (swipe track fullscreen) ──
function _pdBuildMobileLightbox(gallery, productName) {
  // Idempotent: si ya existe, sólo re-sincroniza los slides al gallery actual
  let lb = document.getElementById('pdLightboxMobile');
  if (lb) lb.remove();

  lb = document.createElement('div');
  lb.id = 'pdLightboxMobile';
  lb.innerHTML = `
    <button id="pdLightboxMobile__close" aria-label="Cerrar">✕</button>
    <div id="pdLightboxMobile__counter" aria-live="polite">1 / ${gallery.length}</div>
    <div id="pdLightboxMobile__track">
      ${gallery.map((src, i) => `
        <div class="pd-lb-m__slide">
          <img src="${cdnOpt(src, 1600, null, { limit: true })}"
               alt="${productName} — foto ${i + 1}"
               loading="lazy" decoding="async" draggable="false">
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(lb);

  const track   = lb.querySelector('#pdLightboxMobile__track');
  const counter = lb.querySelector('#pdLightboxMobile__counter');
  const closeBtn = lb.querySelector('#pdLightboxMobile__close');
  const total = gallery.length;

  closeBtn.addEventListener('click', pdLightboxMobileClose);
  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / track.offsetWidth);
    counter.textContent = `${idx + 1} / ${total}`;
  }, { passive: true });
  // Tap en slide fuera del IMG cierra
  track.addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') pdLightboxMobileClose();
  });
  // ESC
  const onKey = (e) => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) pdLightboxMobileClose();
  };
  document.addEventListener('keydown', onKey);
  lb._pdKeyHandler = onKey;
}

function pdLightboxMobileOpen(index) {
  const lb = document.getElementById('pdLightboxMobile');
  if (!lb) return;
  const track = lb.querySelector('#pdLightboxMobile__track');
  const counter = lb.querySelector('#pdLightboxMobile__counter');
  const total = track.children.length;
  lb.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    track.scrollLeft = index * track.offsetWidth;
    counter.textContent = `${index + 1} / ${total}`;
  });
}

function pdLightboxMobileClose() {
  const lb = document.getElementById('pdLightboxMobile');
  if (!lb) return;
  lb.classList.remove('is-open');
  document.body.style.overflow = '';
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
// PRODUCT CARD HOVER — text scramble + image zoom (desktop)
// ============================================
function initCardHoverScramble() {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || reduce || window.innerWidth <= 768) return;

  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const CHARS = '!<>-_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const DURATION_MS = 300;
  const FRAME_MS = 35;

  function scramble(el) {
    const target = el.dataset.name || el.textContent;
    if (el.dataset.scrambling === '1') return;
    el.dataset.scrambling = '1';
    const start = performance.now();
    const len = target.length;

    function tick(now) {
      const t = Math.min(1, (now - start) / DURATION_MS);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = target[i];
        const reveal = i / len;
        if (t >= reveal + 0.18 || ch === ' ') {
          out += ch;
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = out;
      if (t < 1) {
        el._scrambleReq = setTimeout(() => requestAnimationFrame(tick), FRAME_MS);
      } else {
        el.textContent = target;
        el.dataset.scrambling = '';
      }
    }
    requestAnimationFrame(tick);
  }

  grid.addEventListener('mouseenter', (e) => {
    const card = e.target.closest('.product-card:not(.sold-out)');
    if (!card) return;
    const nameEl = card.querySelector('.product-card__name');
    if (nameEl) scramble(nameEl);
  }, true);
}
