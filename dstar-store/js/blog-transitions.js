/* ============================================
   DSTAR — BLOG TRANSITIONS + ARTICLE ANIMATIONS
   Blade wipe · card hover · scroll reveal
   Vanilla GSAP, no framework dependencies
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // REGISTER PLUGINS (safe to call multiple times)
  // ============================================
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.gsap && window.SplitText)     gsap.registerPlugin(SplitText);

  // ============================================
  // PAGE TRANSITION — pure opacity overlay
  //
  // Exit : overlay fades IN  (200ms) → navigate
  // Enter: overlay already visible (injected in <head>),
  //        fades OUT (480ms power2.out)
  //
  // The overlay is injected synchronously in <head> via
  // an inline <script> so it covers the page before
  // first paint — zero flash guaranteed.
  // ============================================
  var TRANSIT_FLAG = 'dstar-fade-transit';
  var OVERLAY_ID   = 'dstarPageFade';

  function animatePageEnter() {
    var cover = document.getElementById(OVERLAY_ID);
    if (!cover) return;                       // no flag → direct visit, nothing to do
    sessionStorage.removeItem(TRANSIT_FLAG);

    gsap.to(cover, {
      opacity: 0,
      duration: 0.48,
      ease: 'power2.out',
      onComplete: function () { cover.parentNode && cover.parentNode.removeChild(cover); }
    });
  }

  function animatePageExit(href) {
    // Build the overlay fresh on each exit
    var cover = document.createElement('div');
    cover.id = OVERLAY_ID;
    cover.style.cssText = [
      'position:fixed', 'inset:0',
      'background:#0a0a0a',
      'z-index:99999',
      'pointer-events:none',
      'opacity:0'
    ].join(';');
    document.body.appendChild(cover);

    sessionStorage.setItem(TRANSIT_FLAG, '1');

    gsap.to(cover, {
      opacity: 1,
      duration: 0.2,
      ease: 'power1.in',
      onComplete: function () {
        window.location.href = href;
      }
    });
  }

  // ============================================
  // LINK INTERCEPTION
  // ============================================
  function initLinkInterception() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');

      // Skip: no href, hash-only, external protocols, new tab
      if (!href)                          return;
      if (href.startsWith('#'))           return;
      if (href.startsWith('mailto:'))     return;
      if (href.startsWith('tel:'))        return;
      if (href.startsWith('javascript:')) return;
      if (link.target === '_blank')       return;

      // Skip: genuinely external domains, or same-page hash-only navigation
      try {
        const resolved = new URL(href, window.location.href);
        if (resolved.hostname !== window.location.hostname) return;
        // Same pathname + hash → browser handles native anchor scroll, no transition needed.
        // Covers cases like "index.html#drops" or "./page.html#section" resolved on that same page.
        if (resolved.pathname === window.location.pathname && resolved.hash) return;
      } catch (_) {
        return;
      }

      // All good — animate out then navigate
      e.preventDefault();
      animatePageExit(href);
    });
  }

  // ============================================
  // ARTICLE ENTRY ANIMATIONS
  // Only runs on blog post pages (.blog-post__hero exists)
  // ============================================
  function initArticleAnimations() {
    if (!document.querySelector('.blog-post__hero')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const BASE_DELAY = 0.3; // wait for blade to finish exiting

    // --- BACK LINK ---
    const backLink = document.querySelector('.blog-post__back');
    if (backLink) {
      gsap.from(backLink, {
        opacity: 0, x: -20,
        duration: 0.5, ease: 'power2.out', delay: BASE_DELAY
      });
    }

    // --- CATEGORY + DATE --- (small items, fast)
    ['.blog-post__cat', '.blog-post__date'].forEach(function (sel, i) {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        opacity: 0, y: 12,
        duration: 0.45, ease: 'power2.out',
        delay: BASE_DELAY + 0.08 + i * 0.06
      });
    });

    // --- TITLE — word-by-word reveal ---
    const title = document.querySelector('.blog-post__title');
    if (title) {
      if (window.SplitText) {
        const split = SplitText.create(title, { type: 'words', wordsClass: 'split-word--post' });
        gsap.from(split.words, {
          opacity: 0,
          y: 48,
          skewX: -8,
          duration: 0.6,
          stagger: 0.075,
          ease: 'power3.out',
          delay: BASE_DELAY + 0.1
        });
      } else {
        gsap.from(title, {
          opacity: 0, y: 36,
          duration: 0.7, ease: 'power3.out',
          delay: BASE_DELAY + 0.1
        });
      }
    }

    // --- FEATURED IMAGE — scale reveal ---
    const featuredImg = document.querySelector('.blog-post__featured img');
    if (featuredImg) {
      // Clip via wrapper so the image doesn't overflow during scale
      const wrapper = featuredImg.closest('.blog-post__featured');
      if (wrapper) {
        wrapper.style.overflow = 'hidden';
      }
      gsap.from(featuredImg, {
        scale: 1.08,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: BASE_DELAY + 0.15
      });
    }

    // --- BODY PARAGRAPHS — IntersectionObserver stagger ---
    var contentEls = Array.from(document.querySelectorAll(
      '.blog-post__content p, ' +
      '.blog-post__content h2, ' +
      '.blog-post__content h3, ' +
      '.blog-post__content blockquote, ' +
      '.blog-post__divider'
    ));

    if (contentEls.length) {
      gsap.set(contentEls, { opacity: 0, y: 24 });

      var io = new IntersectionObserver(function (entries) {
        var entering = [];
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entering.push(entry.target);
            io.unobserve(entry.target);
          }
        });
        if (entering.length) {
          gsap.to(entering, {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out'
          });
        }
      }, { threshold: 0.1 });

      contentEls.forEach(function (el) { io.observe(el); });
    }
  }

  // ============================================
  // SCROLL PROGRESS (blog article pages only)
  // index.html handles this via gsap-animations.js
  // ============================================
  function initScrollProgress() {
    if (!document.querySelector('.blog-post__hero')) return;
    var bar = document.getElementById('scrollProgress');
    if (!bar || !window.ScrollTrigger) return;
    bar.style.transition = 'none';
    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0 }
    });
  }

  // ============================================
  // BLOG GRID — scroll reveal with stagger
  // Enhances existing initBlogReveal in gsap-animations.js
  // when this script is loaded on index.html
  // ============================================
  function initBlogGridReveal() {
    // Only on index (blog cards live there); article pages don't have them
    var cards = document.querySelectorAll('.blog-card');
    if (!cards.length || !window.ScrollTrigger) return;

    // gsap-animations.js already handles this — skip if it ran
    // We detect by checking if opacity was already set to 1
    if (parseFloat(window.getComputedStyle(cards[0]).opacity) === 0) return;
  }

  // ============================================
  // BFCACHE FIX — pageshow fires on back/forward
  // When the browser restores a cached page the
  // black exit-overlay is still in the DOM at opacity:1.
  // event.persisted === true → clean up and rebuild.
  // ============================================
  function bfcacheCleanup() {
    // 1. Eliminar el overlay de transición de inmediato (sin animación).
    //    También limpiar el flag de sessionStorage para que no se re-inyecte.
    sessionStorage.removeItem(TRANSIT_FLAG);
    var cover = document.getElementById(OVERLAY_ID);
    if (cover && cover.parentNode) cover.parentNode.removeChild(cover);

    // 2. Desbloquear el scroll del body (overflow + position — iOS Safari usa position:fixed).
    document.body.style.overflow  = '';
    document.body.style.position  = '';

    // 3. Reanudar GSAP y restaurar timeScale por si quedó pausado o lento.
    if (window.gsap) {
      gsap.globalTimeline.resume();
      gsap.globalTimeline.timeScale(1);
    }

    // 4. Matar todas las instancias de ScrollTrigger y reconstruirlas desde cero.
    //    Esto evita que posiciones scrubbed queden congeladas en el estado de salida.
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
      ScrollTrigger.refresh();
    }

    // 5. Resetear tarjetas de producto — limpia cualquier transform/opacity residual.
    if (window.gsap) {
      gsap.set('.product-card', { clearProps: 'all' });
    }

    // 6. Eliminar elementos inyectados por transiciones de tarjeta de producto
    //    (clone, label, overlay oscuro — marcados con data-pd-transit).
    document.querySelectorAll('[data-pd-transit]').forEach(function (el) {
      el.parentNode && el.parentNode.removeChild(el);
    });

    // 7. iOS Safari: scroll a cero y volver a refrescar ScrollTrigger tras 50ms
    //    para que recalcule posiciones correctamente después de la restauración.
    window.scrollTo(0, 0);
    if (window.ScrollTrigger) {
      setTimeout(function () { ScrollTrigger.refresh(); }, 50);
    }
  }

  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    bfcacheCleanup();
  });

  // ============================================
  // VISIBILITYCHANGE FIX — iOS a veces no dispara
  // pageshow de forma fiable al restaurar desde bfcache.
  // Cuando la pestaña vuelve a ser visible y había un
  // overlay de tránsito activo, ejecutamos la misma limpieza.
  // ============================================
  var _wasHidden = false;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      _wasHidden = true;
      return;
    }
    // visibilityState === 'visible'
    if (!_wasHidden) return;
    _wasHidden = false;

    // Solo limpiar si hay rastros de una transición de salida pendiente.
    var hasCover  = !!document.getElementById(OVERLAY_ID);
    var hasFlag   = !!sessionStorage.getItem(TRANSIT_FLAG);
    var hasLocked = document.body.style.overflow === 'hidden' ||
                    document.body.style.position === 'fixed';
    if (hasCover || hasFlag || hasLocked) {
      bfcacheCleanup();
    }
  });

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.gsap) {
      console.warn('[blog-transitions] GSAP not found');
      return;
    }

    animatePageEnter();
    initLinkInterception();
    initArticleAnimations();
    initScrollProgress();
    initBlogGridReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
