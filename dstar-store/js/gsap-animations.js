/* ============================================
   DSTAR STORE — ANIMACIONES
   Los revelados solo cambian clases: la transición la hace CSS en el compositor
   (opacity + transform), sin trabajo de JS por cuadro. El contenido es visible por
   defecto; aquí se oculta justo antes de observarlo.
   ============================================ */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const REVEAL_MS = 900;

function reveal(els, { stagger = 60, rootMargin = '0px 0px 6% 0px', cls = '' } = {}) {
  const list = Array.from(els).filter(Boolean);
  if (!list.length) return;
  list.forEach((el) => el.classList.add('rv', ...(cls ? [cls] : [])));
  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    batch.sort((a, b) => list.indexOf(a) - list.indexOf(b));
    batch.forEach((el, i) => {
      io.unobserve(el);
      const delay = Math.min(i * stagger, 300);
      if (delay) el.style.setProperty('--rv-d', `${delay}ms`);
      el.classList.add('rv-run');
      el.classList.remove('rv');
      setTimeout(() => {
        el.classList.remove('rv-run', ...(cls ? [cls] : []));
        el.style.removeProperty('--rv-d');
      }, REVEAL_MS + delay + 100);
    });
  }, { rootMargin });
  list.forEach((el) => io.observe(el));
}

function initReveals() {
  document.querySelectorAll('.section-header').forEach((header) => {
    reveal([header.querySelector('.section-title'), header.querySelector('.section-sub')], { stagger: 120 });
    reveal([header.querySelector('.section-line')], { cls: 'rv--line' });
  });
  reveal(document.querySelectorAll('.product-card'));
  reveal(document.querySelectorAll('.lookbook-panel'), { cls: 'rv--zoom' });
  reveal(document.querySelectorAll('.blog-card'), { stagger: 90 });
  const about = document.querySelector('.about');
  if (about) {
    reveal([about.querySelector('.about__title'), about.querySelector('.about__subtitle'), about.querySelector('.about__desc')], { stagger: 110 });
    reveal([about.querySelector('.about__stamp')], { cls: 'rv--stamp' });
    reveal(about.querySelectorAll('.about__value'), { stagger: 110 });
  }
  ['.lookbook__footer > *', '.contact__text, .contact__link', '.faq__title', '.faq__item', '.footer__inner > *']
    .forEach((selector) => reveal(document.querySelectorAll(selector), { stagger: 50, rootMargin: '0px' }));
}

function initCounters() {
  const nums = Array.from(document.querySelectorAll('.about__value-num'));
  if (!nums.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const num = entry.target;
      const target = parseInt(num.textContent.trim(), 10);
      if (isNaN(target)) return;
      const counter = { n: 0 };
      gsap.to(counter, { n: target, duration: 1, ease: 'power2.out', onUpdate() { num.textContent = String(Math.round(counter.n)).padStart(2, '0'); } });
    });
  });
  nums.forEach((num) => io.observe(num));
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
          const img = panel.querySelector('img');
          const src = img ? img.src.replace(/w_\d+/, 'w_1600') : '';
          return `<div class="lookbook-lb__slide"><img src="${src}" alt="Lookbook ${i + 1}" loading="lazy" decoding="async" draggable="false"></div>`;
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

  document.addEventListener('mousemove', e => {
    moveX(e.clientX);
    moveY(e.clientY);
  }, { passive: true });

  // Mostrar dot solo sobre el grid de productos (spec del user)
  const grid = document.getElementById('productsGrid');
  if (grid) {
    grid.addEventListener('mouseenter', () => dot.classList.add('is-active'));
    grid.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
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
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    const run = (fn) => { try { fn(); } catch {} };
    if (document.body.classList.contains('page-product')) {
      [initButtonEffects, initCustomCursor, initMagneticButtons].forEach(run);
      return;
    }
    if (!REDUCED_MOTION && window.gsap) {
      [initReveals, initCounters].forEach(run);
    }
    [initLookbook, initButtonEffects, initCustomCursor, initMagneticButtons].forEach(run);
  });
});
