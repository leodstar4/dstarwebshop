/* ============================================
   DSTAR STORE — ANIMACIONES (GSAP + SplitText + WAAPI)
   El contenido es visible por defecto en el CSS: aquí se oculta justo antes
   de animarlo, así que si algo falla nunca se queda invisible.
   Los revelados de scroll usan element.animate() sobre transform/opacity:
   corren en el compositor y no escriben estilos en cada cuadro.
   ============================================ */

if (window.SplitText) gsap.registerPlugin(SplitText);

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CSS_EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
  soft: 'cubic-bezier(0.33, 1, 0.68, 1)'
};

// El margen superior enorme hace que un elemento que ya quedó arriba (scroll rápido) también se revele.
function revealOnEnter(els, onEnter, bottom = '-10%') {
  const list = Array.from(els).filter(Boolean);
  if (!list.length) return;
  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!batch.length) return;
    batch.forEach((el) => io.unobserve(el));
    batch.sort((a, b) => list.indexOf(a) - list.indexOf(b));
    onEnter(batch);
  }, { rootMargin: `100000px 0px ${bottom} 0px` });
  list.forEach((el) => io.observe(el));
}

// Oculta el elemento con estilos inline estáticos y devuelve la función que lo revela con WAAPI.
// La animación termina en el estilo natural del elemento (respeta opacidades y transforms propios).
function prepare(el, from, duration, easing = CSS_EASE.out) {
  if (!el) return () => {};
  Object.assign(el.style, from);
  return (delay = 0) => {
    Object.keys(from).forEach((prop) => { el.style[prop] = ''; });
    el.animate([{ ...from, offset: 0 }], { duration: duration * 1000, delay: delay * 1000, easing, fill: 'backwards' });
  };
}

function prepareAll(els, from, duration, easing) {
  const starts = Array.from(els).map((el) => prepare(el, from, duration, easing));
  return (delay = 0, stagger = 0) => starts.forEach((start, i) => start(delay + i * stagger));
}

function safely(roots, fn) {
  try {
    fn();
  } catch (err) {
    const els = [];
    Array.from(roots).filter(Boolean).forEach((root) => els.push(root, ...root.querySelectorAll('*')));
    gsap.set(els, { clearProps: 'opacity,transform,translate,scale,clipPath,visibility' });
  }
}

function fontsReady(maxMs = 1800) {
  if (!document.fonts || !document.fonts.ready) return Promise.resolve();
  return Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, maxMs))]);
}

function splitChars(el) {
  if (!window.SplitText) return [el];
  return SplitText.create(el, { type: 'lines,chars', mask: 'lines', linesClass: 'split-line', charsClass: 'split-char' }).chars;
}

function splitLines(el) {
  if (!window.SplitText) return [el];
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' }).lines;
}

// ============================================
// HERO — "TODO CON AMOR" entra letra por letra cuando se va el loader
// ============================================
function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero || window.__dstarLoaded) return;
  const tagline = hero.querySelector('.hero__tagline');
  const cta = hero.querySelector('.hero__cta');
  if (!tagline) return;

  safely([tagline, cta], () => {
    hero.classList.add('hero--gsap');
    const chars = window.SplitText ? SplitText.create(tagline, { type: 'chars', charsClass: 'split-char' }).chars : [tagline];
    const charsIn = prepareAll(chars, { opacity: 0, transform: 'translateY(45%) scale(1.25)' }, 1.3);
    if (cta) cta.style.opacity = '0';
    const ctaIn = (delay) => {
      if (!cta) return;
      cta.style.opacity = '';
      cta.animate([{ opacity: 0, transform: 'translateY(26px) scale(0.96)', offset: 0 }], { duration: 800, delay: delay * 1000, easing: CSS_EASE.out, fill: 'backwards' });
    };

    const play = () => {
      charsIn(0.32, 0.055);
      ctaIn(0.47);
    };
    if (window.__dstarLoaded) play();
    else window.addEventListener('dstar:loaded', play, { once: true });
  });
}

// ============================================
// TÍTULOS DE SECCIÓN — letras que suben desde una máscara + línea que se dibuja
// ============================================
function initSectionHeaders() {
  document.querySelectorAll('.section-header').forEach((header) => {
    const title = header.querySelector('.section-title');
    const line = header.querySelector('.section-line');
    const sub = header.querySelector('.section-sub');
    safely([header], () => {
      const chars = prepareAll(title ? splitChars(title) : [], { transform: 'translateY(115%)', opacity: 0 }, 1.05);
      const lineIn = prepare(line, { transform: 'scaleX(0)' }, 1.1, CSS_EASE.inOut);
      const subIn = prepare(sub, { opacity: 0, transform: 'translateY(14px)' }, 0.9);
      revealOnEnter([header], () => {
        chars(0, 0.04);
        lineIn(0.15);
        subIn(0.45);
      });
    });
  });
}

// ============================================
// DROPS — cada prenda sube y se asienta, en cascada
// ============================================
function initProductReveal() {
  const cards = Array.from(document.querySelectorAll('.product-card'));
  if (!cards.length) return;
  safely(cards, () => {
    const starts = cards.map((card) => [
      prepare(card, { opacity: 0 }, 0.9, CSS_EASE.soft),
      prepare(card.querySelector('.product-card__image'), { transform: 'translateY(10%) scale(0.92)' }, 1.4),
      prepare(card.querySelector('.product-card__info'), { opacity: 0, transform: 'translateY(22px)' }, 1)
    ]);
    revealOnEnter(cards, (batch) => {
      batch.forEach((card, i) => {
        const [cardIn, imageIn, infoIn] = starts[cards.indexOf(card)];
        const at = i * 0.12;
        cardIn(at);
        imageIn(at);
        infoIn(at + 0.18);
      });
    }, '-6%');
  });
}

// ============================================
// LOOKBOOK — cada foto se descubre de abajo hacia arriba con un zoom que se asienta
// ============================================
function initLookbookReveal() {
  const panels = Array.from(document.querySelectorAll('.lookbook-panel'));
  if (!panels.length) return;
  safely(panels, () => {
    const starts = panels.map((panel) => {
      const wrap = panel.querySelector('.lookbook-panel__img-wrap');
      return [
        prepare(panel, { opacity: 0 }, 0.5, CSS_EASE.soft),
        prepare(wrap, { translate: '0 100%' }, 1.3, CSS_EASE.inOut),
        prepare(wrap, { scale: '1.32' }, 1.7),
        prepare(panel.querySelector('.lookbook-panel__num'), { transform: 'translateY(100%)', opacity: 0 }, 0.9)
      ];
    });
    revealOnEnter(panels, (batch) => {
      batch.forEach((panel, i) => {
        const [panelIn, slideIn, zoomIn, numIn] = starts[panels.indexOf(panel)];
        const at = i * 0.13;
        panelIn(at);
        slideIn(at);
        zoomIn(at + 0.1);
        numIn(at + 0.75);
      });
    }, '-8%');
  });
}

// ============================================
// NOSOTROS — texto por líneas, sello que gira, valores en cascada
// ============================================
function initAbout() {
  const about = document.querySelector('.about');
  if (!about) return;
  const title = about.querySelector('.about__title');
  const subtitle = about.querySelector('.about__subtitle');
  const desc = about.querySelector('.about__desc');
  const stamp = about.querySelector('.about__stamp');
  const heroInner = about.querySelector('.about__hero-inner');

  safely([heroInner], () => {
    const chars = prepareAll(title ? splitChars(title) : [], { transform: 'translateY(115%)', opacity: 0 }, 1.1);
    const subIn = prepare(subtitle, { opacity: 0, transform: 'translateY(16px)' }, 0.9);
    const lines = prepareAll(desc ? splitLines(desc) : [], { transform: 'translateY(100%)', opacity: 0 }, 1);
    const stampIn = prepare(stamp, { opacity: 0, transform: 'rotate(-25deg) scale(0.7)' }, 1.4);
    revealOnEnter([heroInner], () => {
      chars(0, 0.06);
      subIn(0.3);
      lines(0.4, 0.08);
      stampIn(0.3);
    });
  });

  const values = Array.from(about.querySelectorAll('.about__value'));
  safely(values, () => {
    const starts = values.map((value) => prepareAll(value.children, { opacity: 0, transform: 'translateY(24px)' }, 1));
    values.forEach((value) => {
      const num = value.querySelector('.about__value-num');
      if (num) num.dataset.target = num.textContent.trim();
    });
    revealOnEnter(values, (batch) => {
      batch.forEach((value, i) => {
        starts[values.indexOf(value)](i * 0.14, 0.1);
        const num = value.querySelector('.about__value-num');
        const target = num ? parseInt(num.dataset.target, 10) : NaN;
        if (isNaN(target)) return;
        const counter = { n: 0 };
        gsap.to(counter, {
          n: target,
          duration: 1.4,
          delay: i * 0.14,
          ease: 'power2.out',
          onUpdate() { num.textContent = String(Math.round(counter.n)).padStart(2, '0'); }
        });
      });
    });
  });
}

// ============================================
// BLOG — la imagen se descubre y el texto sube
// ============================================
function initBlogReveal() {
  const cards = Array.from(document.querySelectorAll('.blog-card'));
  if (!cards.length) return;
  safely(cards, () => {
    const starts = cards.map((card) => [
      prepare(card, { opacity: 0 }, 0.6, CSS_EASE.soft),
      prepare(card.querySelector('.blog-card__image'), { opacity: 0, transform: 'scale(1.08)' }, 1.2),
      prepare(card.querySelector('.blog-card__body'), { opacity: 0, transform: 'translateY(26px)' }, 1)
    ]);
    revealOnEnter(cards, (batch) => {
      batch.forEach((card, i) => {
        const [cardIn, imageIn, bodyIn] = starts[cards.indexOf(card)];
        const at = i * 0.12;
        cardIn(at);
        imageIn(at);
        bodyIn(at + 0.35);
      });
    }, '-6%');
  });
}

// ============================================
// RESTO — FAQ, contacto, enlaces y footer suben en cascada
// ============================================
function initRiseIns() {
  const groups = [
    '.lookbook__footer > *',
    '.contact__text, .contact__link',
    '.faq__title',
    '.faq__item',
    '.footer__inner > *'
  ];
  groups.forEach((selector) => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;
    safely(els, () => {
      const starts = els.map((el) => prepare(el, { opacity: 0, transform: 'translateY(22px)' }, 0.9));
      revealOnEnter(els, (batch) => {
        batch.forEach((el, i) => starts[els.indexOf(el)](i * 0.07));
      }, '0px');
    });
  });
}

// ============================================
// LOOKBOOK — lightbox en móvil, flechas y puntos en tablet
// ============================================
function initLookbook() {
  const mm = gsap.matchMedia();

  // ── MOBILE ≤768px: GRID + LIGHTBOX ────────────────────────────────
  mm.add('(max-width: 768px)', () => {
    const track = document.querySelector('.lookbook__horiz-track');
    if (!track) return;

    const panels = Array.from(track.querySelectorAll('.lookbook-panel'));
    if (!panels.length) return;


    // Build fullscreen lightbox (once) — reusa las mismas imágenes pero pide w=1600
    const lb = document.createElement('div');
    lb.id = 'lookbookLightbox';
    lb.innerHTML = `
      <button id="lookbookLightbox__close" aria-label="Cerrar">✕</button>
      <div id="lookbookLightbox__counter" aria-live="polite">1 / ${panels.length}</div>
      <div id="lookbookLightbox__track">
        ${panels.map((panel, i) => {
          const attrs = `alt="Lookbook ${i + 1}" loading="lazy" decoding="async" draggable="false"`;
          if (window.cdnPicture && panel.dataset.src) return `<div class="lookbook-lb__slide">${cdnPicture(panel.dataset.src, { w: 1600, attrs })}</div>`;
          const img = panel.querySelector('img');
          return `<div class="lookbook-lb__slide"><img src="${img ? img.src.replace(/w_\d+/, 'w_1600') : ''}" ${attrs}></div>`;
        }).join('')}
      </div>
    `;
    document.body.appendChild(lb);

    const lbTrack = lb.querySelector('#lookbookLightbox__track');
    const counter = lb.querySelector('#lookbookLightbox__counter');
    const closeBtn = lb.querySelector('#lookbookLightbox__close');

    function openAt(index) {
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // Esperar a que el layout se aplique antes de scrollear
      requestAnimationFrame(() => {
        lbTrack.scrollLeft = index * lbTrack.offsetWidth;
        counter.textContent = `${index + 1} / ${panels.length}`;
      });
    }
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    panels.forEach((panel, i) => {
      panel._lbHandler = () => openAt(i);
      panel.addEventListener('click', panel._lbHandler);
      panel.style.cursor = 'pointer';
    });

    closeBtn.addEventListener('click', closeLb);
    lbTrack.addEventListener('scroll', () => {
      const idx = Math.round(lbTrack.scrollLeft / lbTrack.offsetWidth);
      counter.textContent = `${idx + 1} / ${panels.length}`;
    }, { passive: true });
    // Tap en slide pero fuera del IMG → cerrar (background oscuro)
    lbTrack.addEventListener('click', (e) => {
      if (e.target.tagName !== 'IMG') closeLb();
    });
    // ESC para teclado en caso de debug desktop
    const onKey = (e) => { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb(); };
    document.addEventListener('keydown', onKey);

    return () => {
      panels.forEach(p => {
        if (p._lbHandler) p.removeEventListener('click', p._lbHandler);
        p.style.cursor = '';
      });
      document.removeEventListener('keydown', onKey);
      lb.remove();
    };
  });

  // ── TABLET 769–1023: HORIZONTAL SCROLL con flechas + dots ─────────
  mm.add('(min-width: 769px) and (max-width: 1023px)', () => {
    const wrap  = document.querySelector('.lookbook__horiz-wrap');
    const track = document.querySelector('.lookbook__horiz-track');
    if (!wrap || !track) return;

    const panels = Array.from(track.querySelectorAll('.lookbook-panel'));
    if (!panels.length) return;

    const navContainer = document.createElement('div');
    navContainer.className = 'lookbook__nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'lookbook__nav-arrow';
    prevBtn.innerHTML = '←';
    prevBtn.setAttribute('aria-label', 'Foto anterior');

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'lookbook__dots';
    panels.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'lookbook__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dotsContainer.appendChild(dot);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lookbook__nav-arrow';
    nextBtn.innerHTML = '→';
    nextBtn.setAttribute('aria-label', 'Foto siguiente');

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(dotsContainer);
    navContainer.appendChild(nextBtn);
    wrap.parentNode.insertBefore(navContainer, wrap.nextSibling);

    const dots = Array.from(dotsContainer.querySelectorAll('.lookbook__dot'));
    let currentIndex = 0;

    function scrollToPanel(index) {
      index = Math.max(0, Math.min(panels.length - 1, index));
      const panel = panels[index];
      const targetLeft = panel.offsetLeft - (wrap.offsetWidth - panel.offsetWidth) / 2;
      wrap.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setActive(index);
    }

    function setActive(index) {
      dots[currentIndex].classList.remove('active');
      currentIndex = index;
      dots[currentIndex].classList.add('active');
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === panels.length - 1;
    }

    prevBtn.addEventListener('click', () => scrollToPanel(currentIndex - 1));
    nextBtn.addEventListener('click', () => scrollToPanel(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToPanel(i)));

    let scrollTimer;
    wrap.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const wrapCenter = wrap.scrollLeft + wrap.offsetWidth / 2;
        let closest = 0, minDist = Infinity;
        panels.forEach((panel, i) => {
          const dist = Math.abs((panel.offsetLeft + panel.offsetWidth / 2) - wrapCenter);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        if (closest !== currentIndex) setActive(closest);
      }, 60);
    }, { passive: true });

    prevBtn.disabled = true;


    return () => {
      navContainer.parentNode?.removeChild(navContainer);
    };
  });

}


// ============================================
// BUTTON GLOW SYSTEM — iluminación premium
// Mouse-tracking spotlight, ripple on click, magnetic cart
// ============================================
function initButtonEffects() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── 1. Cursor-tracking spotlight on primary CTA buttons ──
  // JS sets --bx/--by CSS vars so the ::after radial-gradient follows the cursor
  const ctaSelector = '.product-detail__add, .product-modal__add, .cart-drawer__checkout';
  document.querySelectorAll(ctaSelector).forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--bx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
      btn.style.setProperty('--by', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--bx', '50%');
      btn.style.setProperty('--by', '50%');
    });
  });

  // ── 2. Ripple on click (event delegation — works on dynamic buttons too) ──
  function spawnRipple(btn, e, isLight) {
    if (btn.disabled) return;
    const r = btn.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'btn-ripple ' + (isLight ? 'btn-ripple--light' : 'btn-ripple--dark');
    span.style.left = (e.clientX - r.left - 4) + 'px';
    span.style.top  = (e.clientY - r.top  - 4) + 'px';
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  }

  document.addEventListener('click', e => {
    // Dark buttons (white bg): light ripple
    const ctaBtn = e.target.closest(
      '.product-detail__add, .product-modal__add, .cart-drawer__checkout, .hero__cta'
    );
    if (ctaBtn) { spawnRipple(ctaBtn, e, true); return; }

    // Size buttons (dark bg): light ripple
    const sizeBtn = e.target.closest('.size-btn');
    if (sizeBtn) { spawnRipple(sizeBtn, e, true); return; }

    // Lookbook arrows (dark bg): light ripple
    const arrow = e.target.closest('.lookbook__nav-arrow');
    if (arrow) { spawnRipple(arrow, e, true); return; }
  });

  // ── 3. Magnetic cart button (desktop only) ──
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn && window.innerWidth > 768) {
    cartBtn.addEventListener('mousemove', e => {
      const r  = cartBtn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      gsap.to(cartBtn, {
        x: (e.clientX - cx) * 0.38,
        y: (e.clientY - cy) * 0.38,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    cartBtn.addEventListener('mouseleave', () => {
      gsap.to(cartBtn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    });
  }

  // ── 4. GSAP hover animations on lookbook nav arrows ──
  document.querySelectorAll('.lookbook__nav-arrow').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) gsap.to(btn, { scale: 1.12, duration: 0.2, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.3, ease: 'elastic.out(1.2, 0.5)' });
    });
  });
}

// ============================================
// CUSTOM CURSOR — punto blanco con lerp sobre el grid de productos
// + magnetic hover sobre hero/CTAs principales (desktop fine pointer)
// ============================================
function initCustomCursor() {
  // Solo desktop con puntero fino y sin reduced-motion
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce        = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || reduce || window.innerWidth <= 768) return;

  // Solo crea el dot si la página tiene grid de productos
  if (!document.getElementById('productsGrid')) return;

  // Crear el dot
  const dot = document.createElement('div');
  dot.className = 'dstar-cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.classList.add('dstar-cursor-active');

  gsap.set(dot, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const moveX = gsap.quickTo(dot, 'x', { duration: 0.25, ease: 'power3.out' });
  const moveY = gsap.quickTo(dot, 'y', { duration: 0.25, ease: 'power3.out' });
  let following = false;

  document.addEventListener('mousemove', e => {
    if (!following) return;
    moveX(e.clientX);
    moveY(e.clientY);
  }, { passive: true });

  // Mostrar dot solo sobre el grid de productos (spec del user)
  const grid = document.getElementById('productsGrid');
  if (grid) {
    grid.addEventListener('mouseenter', (e) => {
      moveX(e.clientX, e.clientX);
      moveY(e.clientY, e.clientY);
      following = true;
      dot.classList.add('is-active');
    });
    grid.addEventListener('mouseleave', () => {
      following = false;
      dot.classList.remove('is-active');
    });
    // Crece sobre cada product-card
    grid.addEventListener('mouseover', e => {
      if (e.target.closest('.product-card')) dot.classList.add('is-grow');
    });
    grid.addEventListener('mouseout', e => {
      if (e.target.closest('.product-card')) dot.classList.remove('is-grow');
    });
  }

  // Hide on touch (some hybrid devices)
  window.addEventListener('touchstart', () => {
    dot.classList.remove('is-active');
    document.body.classList.remove('dstar-cursor-active');
  }, { once: true, passive: true });
}

// Hover magnético: el botón sigue el cursor cuando está cerca, máx 8px
function initMagneticButtons() {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce        = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || reduce || window.innerWidth <= 768 || !window.gsap) return;

  const MAX = 8; // px de desplazamiento máximo
  const RADIUS_FACTOR = 1.6; // zona magnética = 1.6x el bounding-box

  const selectors = '.hero__cta, .product-detail__add, .cart-drawer__checkout';
  document.querySelectorAll(selectors).forEach(btn => {
    let r = null;
    const invalidate = () => { r = null; };
    window.addEventListener('resize', invalidate, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });

    document.addEventListener('mousemove', e => {
      if (!r) r = btn.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reachX = (r.width  / 2) * RADIUS_FACTOR;
      const reachY = (r.height / 2) * RADIUS_FACTOR;
      if (Math.abs(dx) < reachX && Math.abs(dy) < reachY) {
        // Normalize → clamp a MAX px
        const nx = Math.max(-1, Math.min(1, dx / reachX));
        const ny = Math.max(-1, Math.min(1, dy / reachY));
        gsap.to(btn, { x: nx * MAX, y: ny * MAX, duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
      } else if (btn._magActive) {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        btn._magActive = false;
      }
      btn._magActive = (Math.abs(dx) < reachX && Math.abs(dy) < reachY);
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
      btn._magActive = false;
    });
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await window.DSTAR_CATALOG_READY;
  requestAnimationFrame(() => {
    const run = (fn) => { try { fn(); } catch {} };
    if (document.body.classList.contains('page-product')) {
      [initButtonEffects, initCustomCursor, initMagneticButtons].forEach(run);
      return;
    }
    if (!REDUCED_MOTION && window.gsap) {
      [initProductReveal, initLookbookReveal, initBlogReveal, initRiseIns].forEach(run);
      fontsReady().then(() => [initHero, initSectionHeaders, initAbout].forEach(run));
    }
    [initLookbook, initButtonEffects, initCustomCursor, initMagneticButtons].forEach(run);
  });
});
