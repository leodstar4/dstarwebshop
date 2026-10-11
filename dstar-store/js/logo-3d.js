// Logo 3D girando: MP4 H.264 con el color arriba y la transparencia abajo (en grises),
// compuesto en WebGL. Así el iPhone lo decodifica por hardware (fluido y nítido) y
// todos los navegadores lo ven igual. Si el navegador bloquea el video (modo de bajo
// consumo en iPhone) gira el póster con CSS 3D; si no hay WebGL se queda el póster.
(function () {
  const SRC = '/assets/brand/logo-3d.mp4?v=1';
  const els = Array.from(document.querySelectorAll('[data-logo-3d]'));
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const FRAG = 'precision mediump float;varying vec2 uv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;float a=texture2D(t,vec2(uv.x,.5+uv.y*.5)).r;gl_FragColor=vec4(c*a,a);}';

  const cssSpin = (on) => els.forEach((el) => {
    el.classList.toggle('logo-3d--css', on);
    if (on) el.dispatchEvent(new CustomEvent('logo3d:live', { bubbles: true }));
  });

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
    view.resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.min(560, Math.round(el.clientWidth * dpr));
      const h = Math.round(w * 820 / 560);
      if (w && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    view.resize();
    return view;
  }

  const views = els.map(createView).filter(Boolean);
  if (!views.length) {
    cssSpin(true);
    return;
  }

  const host = document.querySelector('.hero__logo[data-logo-3d]') || els[0];
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  ['muted', 'autoplay', 'loop', 'playsinline', 'webkit-playsinline'].forEach((a) => video.setAttribute(a, ''));
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.className = 'logo-3d__source';
  video.src = SRC;
  host.appendChild(video);

  const visible = (v) => v.inView && !v.el.closest('.loader.hidden');

  const draw = () => {
    if (video.readyState >= 2) {
      for (const v of views) {
        if (!visible(v)) continue;
        const gl = v.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!v.ready) {
          v.ready = true;
          v.el.classList.add('logo-3d--live');
          v.el.classList.remove('logo-3d--css');
          v.el.dispatchEvent(new CustomEvent('logo3d:live', { bubbles: true }));
        }
      }
    }
    schedule();
  };
  let pending = false;
  const schedule = () => {
    if (video.paused) {
      pending = false;
      return;
    }
    pending = true;
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(draw);
    else requestAnimationFrame(draw);
  };
  const play = () => {
    const p = video.play();
    if (p && p.then) {
      p.then(() => { if (!pending) schedule(); }).catch((err) => {
        if (err && err.name === 'NotAllowedError') cssSpin(true);
      });
    }
  };

  video.addEventListener('playing', () => { if (!pending) schedule(); });
  video.addEventListener('error', () => {
    views.forEach((v) => v.canvas.remove());
    cssSpin(true);
  });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = views.find((x) => x.el === e.target);
      if (v) v.inView = e.isIntersecting;
    }
  });
  views.forEach((v) => io.observe(v.el));

  document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : play()));
  window.addEventListener('resize', () => views.forEach((v) => v.resize()), { passive: true });
  ['pointerdown', 'touchstart', 'keydown'].forEach((t) => window.addEventListener(t, () => { if (video.paused) play(); }, { once: true, passive: true }));
  window.addEventListener('pageshow', (e) => { if (e.persisted) play(); });
  play();
  setTimeout(() => { if (video.paused && !views.some((v) => v.ready)) cssSpin(true); }, 2500);
})();
