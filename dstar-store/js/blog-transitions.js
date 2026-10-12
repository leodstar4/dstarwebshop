/* ============================================
   DSTAR — BLOG TRANSITIONS + ARTICLE ANIMATIONS
   Article entry animations · scroll reveal
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
  // ARTICLE ENTRY ANIMATIONS
  // Only runs on blog post pages (.blog-post__hero exists)
  // ============================================
  function initArticleAnimations() {
    if (!document.querySelector('.blog-post__hero')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const BASE_DELAY = 0.15;

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
        scale: 1.05,
        duration: 1.1,
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
    if (!bar || !window.ScrollTrigger || CSS.supports('animation-timeline: scroll()')) return;
    bar.style.transition = 'none';
    gsap.set(bar, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.to(bar, {
      scaleX: 1,
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
  // INIT
  // ============================================
  function init() {
    if (!window.gsap) return;

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
