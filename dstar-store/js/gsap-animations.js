/* ============================================
   DSTAR STORE — GSAP ANIMATIONS
   ScrollTrigger + SplitText + Lookbook CSS-snap
   ============================================ */

gsap.registerPlugin(ScrollTrigger, SplitText);

// ============================================
// HERO TAGLINE — SplitText char-by-char entrada + breathing
// ============================================
function initHeroTagline() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tagline = document.querySelector('.hero__tagline');
  if (!tagline) return;

  const isMobile = window.innerWidth <= 768;

  // Quitar la CSS animation y tomar control con GSAP
  tagline.style.animation = 'none';
  tagline.style.opacity = '0';

  // Separar el texto en caracteres individuales
  const split = SplitText.create(tagline, { type: 'chars', charsClass: 'split-char' });

  // Móvil: animación más ligera (sin rotationX 3D que puede causar jank)
  // Desktop: efecto cinematográfico completo
  gsap.fromTo(split.chars,
    {
      opacity: 0,
      y: isMobile ? 22 : 36,
      rotationX: isMobile ? 0 : -50,
      transformOrigin: '50% 100%'
    },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: isMobile ? 0.55 : 0.65,
      stagger: isMobile ? 0.035 : 0.045,
      ease: 'power3.out',
      delay: 2.3,
      onStart() {
        tagline.style.opacity = '1';
      },
      onComplete() {
        // Breathing sutil — solo en desktop para no afectar rendimiento móvil
        if (!isMobile) {
          gsap.to(tagline, {
            scale: 1.006,
            duration: 3.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            transformOrigin: 'center center'
          });
        }
      }
    }
  );
}

// ============================================
// HERO PARALLAX — ScrollTrigger scrub
// ============================================
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Móvil: solo fade del contenido (sin parallax de profundidad — ahorra
  // composite layers y evita jank con el fondo fijo)
  const isMobile = window.innerWidth <= 768;

  const content         = hero.querySelector('.hero__content');
  const logo            = hero.querySelector('.hero__logo');
  const tagline         = hero.querySelector('.hero__tagline');
  const scrollIndicator = hero.querySelector('.hero__scroll-indicator');

  if (!isMobile) {
    // Desktop: parallax completo con lag suave (scrub: 1 = ~1s de suavizado)
    if (logo) {
      gsap.to(logo, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
    if (tagline) {
      gsap.to(tagline, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
  }

  // Fade del bloque completo — tanto móvil como desktop (scrub suave)
  if (content) {
    gsap.to(content, {
      opacity: 0,
      ease: 'power1.in',
      scrollTrigger: {
        trigger: hero,
        start: isMobile ? '45% top' : '55% top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  }

  // Scroll indicator: desaparece rápido al empezar a scrollear
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 0,
      ease: 'power1.in',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: isMobile ? '18% top' : '22% top',
        scrub: 0.4
      }
    });
  }
}

// ============================================
// SECTION TITLES — SplitText char drop
// ============================================
function initSectionTitles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile = window.innerWidth <= 768;

  // Very low-end devices (≤480px): skip SplitText entirely — char-by-char layout
  // recalculation causes measurable jank on budget Android phones. Use simple fade.
  if (window.innerWidth <= 480) {
    document.querySelectorAll('.section-title, .about__title').forEach(el => {
      gsap.set(el, { opacity: 0, y: 18 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
      });
    });
    return;
  }

  document.querySelectorAll('.section-title, .about__title').forEach(el => {
    const split = SplitText.create(el, {
      type: 'chars',
      charsClass: 'split-char'
    });

    // Móvil: sin skewX (más ligero), desktop: efecto completo
    gsap.set(split.chars, { opacity: 0, y: isMobile ? 18 : 28, skewX: isMobile ? 0 : 10 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(split.chars, {
          opacity: 1,
          y: 0,
          skewX: 0,
          duration: isMobile ? 0.45 : 0.55,
          stagger: isMobile ? 0.025 : 0.03,
          ease: 'power3.out'
        });
      }
    });
  });
}

// ============================================
// SECTION LINES — scale reveal
// ============================================
function initSectionLines() {
  document.querySelectorAll('.section-line').forEach(line => {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });

    ScrollTrigger.create({
      trigger: line,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(line, { scaleX: 1, duration: 0.9, ease: 'power3.out' });
      }
    });
  });
}

// ============================================
// SCROLL PROGRESS — scrub
// ============================================
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  bar.style.transition = 'none'; // GSAP owns this now

  gsap.to(bar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.2 }
  });
}

// ============================================
// FADE-IN ELEMENTS — ScrollTrigger.batch
// ============================================
function initFadeIns() {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const isMobile = window.innerWidth <= 768;
  const dy = isMobile ? 18 : 30;
  gsap.set(fadeEls, { opacity: 0, y: dy });

  ScrollTrigger.batch(fadeEls, {
    start: 'top 105%',   // fire as soon as any part nears the viewport
    once: true,
    interval: 0.08,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: isMobile ? 0.55 : 0.75,
        stagger: 0.07,
        ease: 'power2.out'
      });
    }
  });

  // Safety net: after all assets load, force-animate any element
  // still stuck at opacity:0 that is already in (or near) the viewport.
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight + 80;
        const stillHidden = parseFloat(gsap.getProperty(el, 'opacity')) < 0.1;
        if (inView && stillHidden) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        }
      });
    });
  }, { once: true });
}

// ============================================
// ABOUT VALUES — counter animation
// ============================================
function initAboutCounters() {
  document.querySelectorAll('.about__value-num').forEach(numEl => {
    const target = parseInt(numEl.textContent.trim(), 10);
    if (isNaN(target)) return;

    const obj = { n: 0 };

    ScrollTrigger.create({
      trigger: numEl,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          n: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate() {
            numEl.textContent = String(Math.round(obj.n)).padStart(2, '0');
          }
        });
      }
    });
  });
}

// ============================================
// LOOKBOOK — gsap.matchMedia() responsive
// Mobile/tablet (< 1024): CSS scroll-snap + flechas + dots
// Desktop (≥ 1024): masonry entrance con IntersectionObserver
// ============================================
function initLookbook() {
  const mm = gsap.matchMedia();

  // ── MOBILE ≤768px: GRID + LIGHTBOX ────────────────────────────────
  mm.add('(max-width: 768px)', () => {
    const track = document.querySelector('.lookbook__horiz-track');
    if (!track) return;

    const panels = Array.from(track.querySelectorAll('.lookbook-panel'));
    if (!panels.length) return;

    // Fade-in stagger on scroll into view
    const fadeIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = panels.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('lb-in-mobile'), (idx % 6) * 70);
        fadeIO.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    panels.forEach(p => fadeIO.observe(p));

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
      fadeIO.disconnect();
      panels.forEach(p => {
        if (p._lbHandler) p.removeEventListener('click', p._lbHandler);
        p.classList.remove('lb-in-mobile');
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

    panels.forEach(panel => {
      const caption = panel.querySelector('.lookbook-panel__caption');
      if (caption) gsap.set(caption, { opacity: 0, y: 18 });
    });

    const captionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const caption = entry.target.querySelector('.lookbook-panel__caption');
        if (caption) gsap.to(caption, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' });
        captionObserver.unobserve(entry.target);
      });
    }, { root: wrap, threshold: 0.25 });

    panels.forEach(panel => captionObserver.observe(panel));

    return () => {
      captionObserver.disconnect();
      navContainer.parentNode?.removeChild(navContainer);
      panels.forEach(panel => {
        const caption = panel.querySelector('.lookbook-panel__caption');
        if (caption) gsap.set(caption, { clearProps: 'all' });
      });
    };
  });

  // ── DESKTOP ───────────────────────────────────────────────────────
  mm.add('(min-width: 1024px)', () => {
    const panels = document.querySelectorAll('.lookbook-panel');
    if (!panels.length) return;

    const STAGGER_MS = 110;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = Array.from(panels).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('lb-in'), idx * STAGGER_MS);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    panels.forEach(panel => observer.observe(panel));

    return () => {
      observer.disconnect();
      panels.forEach(p => p.classList.remove('lb-in'));
    };
  });
}

// ============================================
// BLOG CARDS — staggered reveal
// ============================================
function initBlogReveal() {
  const cards = document.querySelectorAll('.blog-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 32 });

  ScrollTrigger.batch(cards, {
    start: 'top 91%',
    once: true,
    interval: 0.1,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out'
      });
    }
  });
}

// ============================================
// LOOKBOOK — DESKTOP MASONRY ENTRANCE  (≥1024px)
// ============================================
function initLookbookMasonry() {
  if (window.innerWidth < 1024) return;

  const panels = document.querySelectorAll('.lookbook-panel');
  if (!panels.length) return;

  // Stagger delay per panel (ms) — each item enters slightly after the previous
  const STAGGER_MS = 110;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const panel = entry.target;
      const idx   = Array.from(panels).indexOf(panel);
      setTimeout(() => panel.classList.add('lb-in'), idx * STAGGER_MS);
      observer.unobserve(panel);
    });
  }, { threshold: 0.12 });

  panels.forEach(panel => observer.observe(panel));
}

// ============================================
// PRODUCT CARD → PAGE TRANSITION
// Click en tarjeta: imagen se expande a pantalla completa, luego navega.
// Usa capture phase para interceptar antes que blog-transitions.
// ============================================
function initProductCardClick() {
  document.addEventListener('click', function (e) {
    const card = e.target.closest('a.product-card:not(.sold-out)');
    if (!card) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const href = card.getAttribute('href');
    const img  = card.querySelector('.product-card__image img');
    // Si la imagen no cargó aún (lazy) o no tiene src, navegar directo sin animación
    if (!img || !img.src || img.src === window.location.href || img.naturalWidth === 0) {
      window.location.href = href;
      return;
    }

    const rect = card.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    // ── Clon de la imagen que se va a expandir ──
    const clone = document.createElement('div');
    clone.dataset.pdTransit = '1';
    clone.style.cssText = [
      'position:fixed',
      `top:${rect.top}px`, `left:${rect.left}px`,
      `width:${rect.width}px`, `height:${rect.height}px`,
      `background:url("${img.src}") center/cover no-repeat`,
      'z-index:99995', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(clone);

    // ── Nombre del producto centrado sobre el clon ──
    const nameEl = card.querySelector('.product-card__name');
    const label  = document.createElement('div');
    label.dataset.pdTransit = '1';
    label.style.cssText = [
      'position:fixed', 'inset:0', 'opacity:0',
      'display:flex', 'align-items:center', 'justify-content:center',
      'z-index:99996', 'pointer-events:none',
      'text-align:center', 'padding:0 24px'
    ].join(';');
    const nameText = nameEl ? (nameEl.dataset.name || nameEl.textContent) : '';
    label.innerHTML = `<span style="
      font-family:'Archivo Black',sans-serif;
      font-size:clamp(28px,7vw,88px);
      letter-spacing:6px;
      color:#f0ede8;
      text-shadow:0 4px 60px rgba(0,0,0,0.9);
      line-height:1
    ">${nameText}</span>`;
    document.body.appendChild(label);

    // ── Velo negro final ──
    const dark = document.createElement('div');
    dark.dataset.pdTransit = '1';
    dark.style.cssText = [
      'position:fixed', 'inset:0', 'background:#0a0a0a',
      'z-index:99997', 'pointer-events:none', 'opacity:0'
    ].join(';');
    document.body.appendChild(dark);

    const tl = gsap.timeline({
      onComplete() {
        sessionStorage.setItem('dstar-fade-transit', '1');
        window.location.href = href;
      }
    });

    // 1. Apagar otras tarjetas
    const others = document.querySelectorAll('.product-card:not([data-product-index="' + card.dataset.productIndex + '"])');
    tl.to(others, { opacity: 0, scale: 0.96, duration: 0.35, ease: 'power2.out', stagger: 0.03 }, 0);

    // 2. Micro-bounce en la tarjeta clicada
    tl.to(card, { scale: 1.04, duration: 0.1, ease: 'power2.out' }, 0)
      .to(card, { scale: 1, duration: 0.12, ease: 'power2.inOut' }, 0.1);

    // 3. Expansión de la imagen al viewport completo
    tl.to(clone, {
      top:    0,
      left:   0,
      width:  vw,
      height: vh,
      duration: 0.7,
      ease: 'expo.inOut'
    }, 0.06);

    // 4. Nombre aparece en el centro de la imagen expandida
    tl.to(label, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.42)
      .to(label, { opacity: 0, duration: 0.2,  ease: 'power2.in'  }, 0.72);

    // 5. Fade negro tapa todo antes de navegar
    tl.to(dark, { opacity: 1, duration: 0.28, ease: 'power2.in' }, 0.6);

  }, true); // capture phase → antes que blog-transitions

  // pageshow — force reload on bfcache restore so GSAP entry animations re-run
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

// ============================================
// PRODUCT PAGE ENTRY ANIMATION
// Corre en producto.html: imagen y panel info entran con cinética.
// ============================================
function initProductPageEntry() {
  if (!document.body.classList.contains('page-product')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const DELAY = 0.52; // post fade-overlay (animatePageEnter dura 0.48s)

  // Imagen principal: escala desde 1.1 → 1, opacity 0 → 1
  const mainImgEl = document.getElementById('pdMainImg');
  if (mainImgEl) {
    gsap.fromTo(mainImgEl,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out', delay: DELAY }
    );
  }

  // Panel de info: elementos entran desde la derecha en stagger
  const infoEls = document.querySelectorAll([
    '.product-detail__back',
    '.product-detail__badge',
    '.product-detail__drop',
    '.product-detail__name',
    '.product-detail__price',
    '.product-detail__desc',
    '.product-detail__size-label',
    '.product-detail__sizes',
    '.product-detail__stock',
    '.product-detail__add'
  ].join(','));

  if (infoEls.length) {
    gsap.fromTo(infoEls,
      { opacity: 0, x: 48 },
      {
        opacity: 1, x: 0,
        duration: 0.65,
        stagger: 0.055,
        ease: 'power3.out',
        delay: DELAY + 0.08
      }
    );
  }

  // Thumbnails: pequeño bounce desde abajo
  const thumbs = document.querySelectorAll('.pd-thumb');
  if (thumbs.length) {
    gsap.fromTo(thumbs,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.4)', delay: DELAY + 0.3 }
    );
  }
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

  // Lerp toward target
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;

  // Track the mouse globally (so dot doesn't snap when entering grid)
  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
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

  // Render loop con lerp suave
  const LERP = 0.28;
  function render() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

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

  const selectors = '.hero__cta, .product-detail__add, .product-modal__add, .cart-drawer__checkout';
  document.querySelectorAll(selectors).forEach(btn => {
    let r = null;
    function update() { r = btn.getBoundingClientRect(); }
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });

    document.addEventListener('mousemove', e => {
      if (!r) return;
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
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (document.body.classList.contains('page-product')) {
        // ── Página de detalle de producto ──
        initProductPageEntry();
        initButtonEffects();
        initCustomCursor();
        initMagneticButtons();
      } else {
        // ── Página principal ──
        initHeroTagline();
        initHeroParallax();
        initSectionTitles();
        initSectionLines();
        initScrollProgress();
        initFadeIns();
        initAboutCounters();
        initBlogReveal();
        initLookbook();          // reemplaza initLookbookSnap + initLookbookMasonry
        initProductCardClick();
        initButtonEffects();
        initCustomCursor();
        initMagneticButtons();
        ScrollTrigger.refresh();

        // Segundo refresh cuando todas las imágenes lazy terminan de cargar
        // (cambian el layout y desplazan los triggers de ScrollTrigger)
        window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });
  });
});
