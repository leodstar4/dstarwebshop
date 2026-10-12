/* ============================================
   DSTAR STORE — ANIMACIONES (GSAP + SplitText)
   El contenido es visible por defecto en el CSS: aquí se oculta justo antes
   de animarlo, así que si algo falla nunca se queda invisible.
   ============================================ */

if (window.SplitText) gsap.registerPlugin(SplitText);

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.innerWidth <= 768;
const EASE_OUT = 'expo.out';
const EASE_IN_OUT = 'expo.inOut';

// Reveal de una sola vez con IntersectionObserver: no corre trabajo en cada cuadro del scroll.
function revealOnEnter(els, onEnter, rootMargin = '0px 0px -10% 0px') {
  const list = Array.from(els).filter(Boolean);
  if (!list.length) return;
  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!batch.length) return;
    batch.forEach((el) => io.unobserve(el));
    batch.sort((a, b) => list.indexOf(a) - list.indexOf(b));
    onEnter(batch);
  }, { rootMargin });
  list.forEach((el) => io.observe(el));
}

// Si una animación falla a la mitad, devuelve el contenido a su estado visible.
function safely(roots, fn) {
  try {
    fn();
  } catch (err) {
    const els = [];
    Array.from(roots).filter(Boolean).forEach((root) => els.push(root, ...root.querySelectorAll('*')));
    gsap.set(els, { clearProps: 'opacity,transform,clipPath,visibility' });
  }
}

// SplitText mide las líneas con la fuente real; si aún no carga, cortaría mal.
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
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' }).lines;
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
    gsap.set(chars, { opacity: 0, yPercent: 45, scale: 1.25, filter: `blur(${IS_MOBILE ? 6 : 12}px)` });
    if (cta) gsap.set(cta, { opacity: 0, y: 26, clipPath: 'inset(0% 100% 0% 0%)', transition: 'none' });

    const play = () => {
      gsap.timeline({ delay: 0.32 })
        .to(chars, { opacity: 1, yPercent: 0, scale: 1, filter: 'blur(0px)', duration: 1.3, stagger: 0.055, ease: EASE_OUT, clearProps: 'filter,transform' })
        .to(cta, { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: EASE_IN_OUT, clearProps: 'clipPath,transform,transition' }, '-=0.75');
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
      const chars = title ? splitChars(title) : [];
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      if (line) gsap.set(line, { scaleX: 0, transformOrigin: '50% 50%' });
      if (sub) gsap.set(sub, { opacity: 0, y: 14 });
      revealOnEnter([header], () => {
        const tl = gsap.timeline().to(chars, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.04, ease: EASE_OUT });
        if (line) tl.to(line, { scaleX: 1, duration: 1.1, ease: EASE_IN_OUT }, 0.15);
        if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.9, ease: EASE_OUT, clearProps: 'transform' }, 0.45);
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
    cards.forEach((card) => {
      gsap.set(card, { opacity: 0 });
      gsap.set(card.querySelector('.product-card__image'), { yPercent: 10, scale: 0.92 });
      gsap.set(card.querySelector('.product-card__info'), { opacity: 0, y: 22 });
    });
    revealOnEnter(cards, (batch) => {
      const tl = gsap.timeline();
      batch.forEach((card, i) => {
        const at = i * 0.12;
        tl.to(card, { opacity: 1, duration: 0.9, ease: 'power2.out' }, at)
          .to(card.querySelector('.product-card__image'), { yPercent: 0, scale: 1, duration: 1.4, ease: EASE_OUT, clearProps: 'transform' }, at)
          .to(card.querySelector('.product-card__info'), { opacity: 1, y: 0, duration: 1, ease: EASE_OUT, clearProps: 'transform' }, at + 0.18);
      });
    }, '0px 0px -6% 0px');
  });
}

// ============================================
// LOOKBOOK — cada foto se descubre de abajo hacia arriba con un zoom que se asienta
// ============================================
function initLookbookReveal() {
  const panels = Array.from(document.querySelectorAll('.lookbook-panel'));
  if (!panels.length) return;
  safely(panels, () => {
    panels.forEach((panel) => {
      gsap.set(panel, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(panel.querySelector('.lookbook-panel__img-wrap'), { scale: 1.32 });
      gsap.set(panel.querySelector('.lookbook-panel__num'), { yPercent: 100, opacity: 0 });
    });
    revealOnEnter(panels, (batch) => {
      batch.forEach((panel, i) => {
        gsap.timeline({ delay: i * 0.13 })
          .to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: EASE_IN_OUT, clearProps: 'clipPath' })
          .to(panel.querySelector('.lookbook-panel__img-wrap'), { scale: 1, duration: 1.7, ease: EASE_OUT, clearProps: 'transform' }, 0.1)
          .to(panel.querySelector('.lookbook-panel__num'), { yPercent: 0, opacity: 1, duration: 0.9, ease: EASE_OUT, clearProps: 'transform,opacity' }, 0.75);
      });
    }, '0px 0px -8% 0px');
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
    const chars = title ? splitChars(title) : [];
    const lines = desc ? splitLines(desc) : [];
    gsap.set(chars, { yPercent: 115, opacity: 0 });
    gsap.set(subtitle, { opacity: 0, y: 16 });
    gsap.set(lines, { yPercent: 100, opacity: 0 });
    gsap.set(stamp, { opacity: 0, rotate: -25, scale: 0.7 });
    revealOnEnter([heroInner], () => {
      gsap.timeline()
        .to(chars, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: EASE_OUT })
        .to(subtitle, { opacity: 1, y: 0, duration: 0.9, ease: EASE_OUT, clearProps: 'transform' }, 0.3)
        .to(lines, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08, ease: EASE_OUT }, 0.4)
        .to(stamp, { opacity: 1, rotate: 0, scale: 1, duration: 1.4, ease: EASE_OUT, clearProps: 'transform' }, 0.3);
    });
  });

  const values = Array.from(about.querySelectorAll('.about__value'));
  safely(values, () => {
    values.forEach((value) => {
      gsap.set(value.children, { opacity: 0, y: 24 });
      const num = value.querySelector('.about__value-num');
      if (num) num.dataset.target = num.textContent.trim();
    });
    revealOnEnter(values, (batch) => {
      batch.forEach((value, i) => {
        gsap.to(value.children, { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: i * 0.14, ease: EASE_OUT, clearProps: 'transform' });
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
    cards.forEach((card) => {
      gsap.set(card, { opacity: 0 });
      gsap.set(card.querySelector('.blog-card__image'), { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(card.querySelector('.blog-card__body'), { opacity: 0, y: 26 });
    });
    revealOnEnter(cards, (batch) => {
      batch.forEach((card, i) => {
        gsap.timeline({ delay: i * 0.12 })
          .to(card, { opacity: 1, duration: 0.6, ease: 'power2.out' })
          .to(card.querySelector('.blog-card__image'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE_IN_OUT, clearProps: 'clipPath' }, 0)
          .to(card.querySelector('.blog-card__body'), { opacity: 1, y: 0, duration: 1, ease: EASE_OUT, clearProps: 'transform' }, 0.35);
      });
    }, '0px 0px -6% 0px');
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
      gsap.set(els, { opacity: 0, y: 22 });
      revealOnEnter(els, (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: EASE_OUT, clearProps: 'transform' });
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
// PRODUCT CARD → PAGE TRANSITION
// Click en tarjeta: las demás se apagan, la prenda se acerca y funde a negro.
// Usa capture phase para interceptar antes que blog-transitions.
// ============================================
function initProductCardClick() {
  document.addEventListener('click', function (e) {
    const card = e.target.closest('a.product-card:not(.sold-out)');
    if (!card) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const href = card.getAttribute('href');
    const img  = card.querySelector('.product-card__image img');
    // Si la imagen no cargó aún (lazy) o no tiene src, navegar directo sin animación
    if (!img || !img.src || img.src === window.location.href || img.naturalWidth === 0) {
      window.location.href = href;
      return;
    }

    const dark = document.createElement('div');
    dark.dataset.pdTransit = '1';
    dark.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;z-index:99997;pointer-events:none;opacity:0';
    document.body.appendChild(dark);

    const others = document.querySelectorAll('.product-card:not([data-product-index="' + card.dataset.productIndex + '"])');
    gsap.timeline({
      onComplete() {
        sessionStorage.setItem('dstar-fade-transit', '1');
        window.location.href = href;
      }
    })
      .to(others, { opacity: 0, duration: 0.22, ease: 'power2.out' }, 0)
      .to(img, { scale: 1.06, duration: 0.32, ease: 'power2.out' }, 0)
      .to(dark, { opacity: 1, duration: 0.24, ease: 'power2.in' }, 0.1);
  }, true); // capture phase → antes que blog-transitions

  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    document.querySelectorAll('[data-pd-transit], #dstarPageFade').forEach(el => el.remove());
    gsap.set('.product-card, .product-card__image img', { clearProps: 'opacity,scale,transform' });
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
    if (!REDUCED_MOTION) {
      [initProductReveal, initLookbookReveal, initBlogReveal, initRiseIns].forEach(run);
      fontsReady().then(() => [initHero, initSectionHeaders, initAbout].forEach(run));
    }
    [initLookbook, initProductCardClick, initButtonEffects, initCustomCursor, initMagneticButtons].forEach(run);
  });
});
