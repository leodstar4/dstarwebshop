// Logo 3D girando: MP4 H.264 con el color arriba y la transparencia abajo (en grises),
// compuesto en WebGL. Así el iPhone lo decodifica por hardware (fluido y nítido) y
// todos los navegadores lo ven igual. Si algo falla, se queda el póster estático.
(function () {
  const SRC = '/assets/brand/logo-3d.mp4?v=1';
  const els = Array.from(document.querySelectorAll('[data-logo-3d]'));
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const FRAG = 'precision mediump float;varying vec2 uv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;float a=texture2D(t,vec2(uv.x,.5+uv.y*.5)).r;gl_FragColor=vec4(c*a,a);}';

  function createView(el) {
    const canvas = document.createElement('canvas');
    canvas.className = 'logo-3d__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!gl) return null;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    el.appendChild(canvas);

    const view = { el, canvas, gl, inView: true, ready: false };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.min(560, Math.round(el.clientWidth * dpr));
      const h = Math.round(w * 820 / 560);
      if (w && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();
    view.resize = resize;
    return view;
  }

  function start() {
    const views = els.map(createView).filter(Boolean);
    if (!views.length) return;

    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.className = 'logo-3d__source';
    video.src = SRC;
    document.body.appendChild(video);

    const visible = (v) => v.inView && !v.el.closest('.loader.hidden');
    let lastScroll = -1e4;
    window.addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
    const draw = () => {
      if (video.readyState >= 2 && performance.now() - lastScroll > 160) {
        for (const v of views) {
          if (!visible(v)) continue;
          const gl = v.gl;
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          if (!v.ready) {
            v.ready = true;
            v.el.classList.add('logo-3d--live');
          }
        }
      }
      schedule();
    };
    const schedule = () => {
      if (video.paused) return;
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(draw);
      else requestAnimationFrame(draw);
    };
    const play = () => {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    const sync = () => {
      const any = views.some(visible);
      if (any && video.paused) play();
      else if (!any && !video.paused) video.pause();
    };

    video.addEventListener('playing', schedule);
    video.addEventListener('error', () => views.forEach((v) => v.canvas.remove()));

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = views.find((x) => x.el === e.target);
        if (v) v.inView = e.isIntersecting;
      }
      sync();
    });
    views.forEach((v) => io.observe(v.el));

    const loader = document.getElementById('loader');
    if (loader) new MutationObserver(sync).observe(loader, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : sync()));
    window.addEventListener('resize', () => views.forEach((v) => v.resize()), { passive: true });
    window.addEventListener('pointerdown', sync, { once: true, passive: true });
    window.addEventListener('pageshow', (e) => { if (e.persisted) sync(); });
    play();
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
