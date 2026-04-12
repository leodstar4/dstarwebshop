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

  // Quitar la CSS animation y tomar control con GSAP
  tagline.style.animation = 'none';
  tagline.style.opacity = '0';

  // Separar el texto en caracteres individuales
  const split = SplitText.create(tagline, { type: 'chars', charsClass: 'split-char' });

  // Animar chars con delay post-loader (~2.4s coincide con el loader)
  gsap.fromTo(split.chars,
    { opacity: 0, y: 36, rotationX: -50, transformOrigin: '50% 100%' },
    {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.65,
      stagger: 0.045,
      ease: 'power3.out',
      delay: 2.3,
      onStart() {
        tagline.style.opacity = '1'; // mostrar el contenedor
      },
      onComplete() {
        // Efecto "breathing" sutil después de la entrada
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
  );
}

// ============================================
// HERO PARALLAX — ScrollTrigger scrub
// ============================================
function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const content        = hero.querySelector('.hero__content');
  const logo           = hero.querySelector('.hero__logo');
  const tagline        = hero.querySelector('.hero__tagline');
  const scrollIndicator = hero.querySelector('.hero__scroll-indicator');

  // Parallax depth — content moves down slower than the hero scrolls up,
  // creating a floating-in-space effect. Positive yPercent = moves down
  // relative to the hero frame (correct parallax direction).
  if (logo) {
    gsap.to(logo, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  if (tagline) {
    gsap.to(tagline, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Fade the whole content block out in the last 45% of the hero scroll
  // so it never visually bleeds into the section below.
  if (content) {
    gsap.to(content, {
      opacity: 0,
      ease: 'power1.in',
      scrollTrigger: { trigger: hero, start: '55% top', end: 'bottom top', scrub: true }
    });
  }

  // Scroll indicator fades quickly at the top of the scroll
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '22% top', scrub: true }
    });
  }
}

// ============================================
// SECTION TITLES — SplitText char drop
// ============================================
function initSectionTitles() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.section-title, .about__title').forEach(el => {
    const split = SplitText.create(el, {
      type: 'chars',
      charsClass: 'split-char'
    });

    gsap.set(split.chars, { opacity: 0, y: 28, skewX: 10 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        gsap.to(split.chars, {
          opacity: 1,
          y: 0,
          skewX: 0,
          duration: 0.55,
          stagger: 0.03,
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
    scrollTrigger: { start: 0, end: 'max', scrub: 0 }
  });
}

// ============================================
// FADE-IN ELEMENTS — ScrollTrigger.batch
// ============================================
function initFadeIns() {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  gsap.set(fadeEls, { opacity: 0, y: 30 });

  ScrollTrigger.batch(fadeEls, {
    start: 'top 91%',
    once: true,
    interval: 0.1,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: 'power2.out'
      });
    }
  });
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

  // ── MOBILE / TABLET ──────────────────────────────────────────────
  mm.add('(max-width: 1023px)', () => {
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

    // Caption reveal — threshold 0.25 (era 0.45, demasiado alto en móvil)
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

    // Cleanup al salir del breakpoint
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
    label.innerHTML = `<span style="
      font-family:'Archivo Black',sans-serif;
      font-size:clamp(28px,7vw,88px);
      letter-spacing:6px;
      color:#f0ede8;
      text-shadow:0 4px 60px rgba(0,0,0,0.9);
      line-height:1
    ">${nameEl ? nameEl.textContent : ''}</span>`;
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
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (document.body.classList.contains('page-product')) {
        // ── Página de detalle de producto ──
        initProductPageEntry();
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
        ScrollTrigger.refresh();

        // Segundo refresh cuando todas las imágenes lazy terminan de cargar
        // (cambian el layout y desplazan los triggers de ScrollTrigger)
        window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });
  });
});
