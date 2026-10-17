(function () {
  var loader = document.getElementById('loader');
  var box = loader.querySelector('.loader__logo');
  var logo = box.querySelector('img');
  var video = null;
  var hide = function () {
    if (window.__dstarLoaded) return;
    window.__dstarLoaded = true;
    document.documentElement.classList.remove('css-pending');
    document.documentElement.classList.add('is-loaded');
    loader.classList.add('hidden');
    window.dispatchEvent(new Event('dstar:loaded'));
    setTimeout(function () {
      loader.classList.add('loader--gone');
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    }, 650);
  };
  var wait = function (el, ms) {
    return new Promise(function (resolve) {
      if (!el) return resolve();
      el.addEventListener('load', resolve, { once: true });
      el.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, ms);
    });
  };
  var css = document.getElementById('mainCss');
  var root = document.documentElement;
  var activar = function () {
    css.media = 'all';
    root.classList.remove('css-pending');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('no-tr'); }); });
  };
  if (css.sheet) activar();
  else css.addEventListener('load', activar, { once: true });
  var fonts = document.getElementById('fontsCss');
  if (fonts) {
    if (fonts.sheet) fonts.media = 'all';
    else fonts.addEventListener('load', function () { fonts.media = 'all'; }, { once: true });
  }
  var visto = false;
  try { visto = sessionStorage.getItem('dstar-intro') === '1'; sessionStorage.setItem('dstar-intro', '1'); } catch (e) {}
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!quieto && navigator.userAgentData && 'transferControlToOffscreen' in HTMLCanvasElement.prototype && 'VideoDecoder' in window) {
    try {
      var worker = new Worker('/js/logo-3d-worker.js?v=3');
      worker.onmessage = function (e) { if (e.data.type === 'error') worker.failed = true; };
      worker.onerror = function () { worker.failed = true; };
      worker.postMessage({ type: 'start', src: '/assets/brand/logo-3d.mp4?v=2' });
      window.__logo3dWorker = worker;
    } catch (e) {}
  }
  if (!quieto) {
    video = document.createElement('video');
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    ['muted', 'autoplay', 'loop', 'playsinline'].forEach(function (a) { video.setAttribute(a, ''); });
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.className = 'loader__video';
    video.poster = logo.getAttribute('src');
    video.src = '/assets/brand/logo-3d-loader.mp4?v=1';
    box.replaceChild(video, logo);
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }
  if (visto) {
    loader.style.transition = 'none';
    Promise.resolve(css && css.media !== 'all' ? wait(css, 2500) : null).then(hide);
    return;
  }
  Promise.all([
    new Promise(function (resolve) { setTimeout(resolve, 450); }),
    css && css.media !== 'all' ? wait(css, 2500) : null,
    quieto ? null : new Promise(function (resolve) {
      var cap = setTimeout(resolve, 2600);
      var girado = false;
      var listo = false;
      var check = function () { if (girado && listo) { clearTimeout(cap); resolve(); } };
      video.addEventListener('playing', function () { setTimeout(function () { girado = true; check(); }, 900); }, { once: true });
      document.addEventListener('logo3d:live', function () { listo = true; check(); }, { once: true });
    })
  ]).then(hide);
  setTimeout(hide, 3000);
})();
