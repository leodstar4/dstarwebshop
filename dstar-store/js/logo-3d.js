// Logo 3D girando: MP4 H.264 con el color arriba y la transparencia abajo (en grises),
// compuesto en WebGL. En Chrome/Edge/Android lo decodifica y dibuja un Web Worker
// (WebCodecs + OffscreenCanvas), así el hilo principal no hace nada por cuadro.
// En Safari se usa el <video>, que el iPhone decodifica por hardware (fluido y nítido);
// si lo bloquea (modo de bajo consumo) decodifica el mismo MP4 con WebCodecs, que no
// está sujeto a la política de autoplay, y se ve idéntico. Si nada de eso existe se queda el póster.
(function () {
  const SRC = '/assets/brand/logo-3d.mp4?v=2';
  const WORKER = '/js/logo-3d-worker.js?v=2';
  const FRAME_MS = 1000 / 60;
  const els = Array.from(document.querySelectorAll('[data-logo-3d]'));
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const FRAG = 'precision mediump float;varying vec2 uv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;float a=clamp((texture2D(t,vec2(uv.x,.5+uv.y*.5)).r-.04)*1.0417,0.,1.);gl_FragColor=vec4(c*a,a);}';

  const release = () => els.forEach((el) => el.dispatchEvent(new CustomEvent('logo3d:live', { bubbles: true })));
  const sizeOf = (el, width = el.clientWidth) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.min(560, Math.round(width * dpr));
    return { w, h: Math.round(w * 820 / 560) };
  };
  const shown = (el, inView) => inView && !el.closest('.loader.hidden');

  function runWorker() {
    let worker;
    try {
      worker = new Worker(WORKER);
    } catch (err) {
      return false;
    }
    const views = els.map((el, id) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'logo-3d__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);
      return { el, canvas, id, inView: true };
    });
    let stopped = false;
    const sync = () => {
      if (stopped) return;
      views.forEach((v) => worker.postMessage({ type: 'visible', id: v.id, visible: shown(v.el, v.inView) }));
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = views.find((x) => x.el === e.target);
        if (v) v.inView = e.isIntersecting;
      }
      sync();
    });
    const onVisibility = () => {
      if (!stopped) worker.postMessage({ type: 'hidden', hidden: document.hidden });
    };
    const ro = new ResizeObserver((entries) => {
      if (stopped) return;
      for (const e of entries) {
        const v = views.find((x) => x.el === e.target);
        if (v) worker.postMessage({ type: 'size', id: v.id, ...sizeOf(v.el, e.contentRect.width) });
      }
    });
    const stop = () => {
      if (stopped) return;
      stopped = true;
      worker.terminate();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('dstar:loaded', sync);
      document.removeEventListener('visibilitychange', onVisibility);
      views.forEach((v) => {
        v.canvas.remove();
        v.el.classList.remove('logo-3d--live');
      });
      runVideo();
    };
    worker.onerror = stop;
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'error') {
        stop();
        return;
      }
      if (m.type === 'live') {
        const v = views[m.id];
        v.el.classList.add('logo-3d--live');
        v.el.dispatchEvent(new CustomEvent('logo3d:live', { bubbles: true }));
      }
    };
    try {
      views.forEach((v) => {
        const canvas = v.canvas.transferControlToOffscreen();
        worker.postMessage({ type: 'view', id: v.id, canvas, loader: !!v.el.closest('.loader'), visible: shown(v.el, true), ...sizeOf(v.el) }, [canvas]);
      });
    } catch (err) {
      stop();
      return true;
    }
    views.forEach((v) => {
      io.observe(v.el);
      ro.observe(v.el);
    });
    window.addEventListener('dstar:loaded', sync);
    document.addEventListener('visibilitychange', onVisibility);
    worker.postMessage({ type: 'start', src: SRC });
    return true;
  }

  function runVideo() {
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
      view.resize = (width) => {
        const { w, h } = sizeOf(el, width);
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
      release();
      return;
    }

    const visible = (v) => shown(v.el, v.inView);

    let staging = null;
    const upload = (gl, source) => {
      if (!staging) {
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
          return;
        } catch (err) {
          staging = document.createElement('canvas').getContext('2d');
        }
      }
      const w = source.displayWidth || source.videoWidth;
      const h = source.displayHeight || source.videoHeight;
      if (staging.canvas.width !== w || staging.canvas.height !== h) {
        staging.canvas.width = w;
        staging.canvas.height = h;
      }
      staging.drawImage(source, 0, 0, w, h);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, staging.canvas);
    };

    const inLoader = (v) => !!v.el.closest('.loader');
    const render = (source) => {
      const loaderUp = views.some((v) => inLoader(v) && visible(v));
      for (const v of views) {
        if (!visible(v) || (loaderUp && v.ready && !inLoader(v))) continue;
        upload(v.gl, source);
        v.gl.drawArrays(v.gl.TRIANGLE_STRIP, 0, 4);
        if (!v.ready) {
          v.ready = true;
          v.el.classList.add('logo-3d--live');
          v.el.dispatchEvent(new CustomEvent('logo3d:live', { bubbles: true }));
        }
      }
    };

    function parseMp4(buf) {
      const dv = new DataView(buf);
      const bytes = new Uint8Array(buf);
      const boxes = (start, end) => {
        const out = {};
        for (let o = start; o + 8 <= end;) {
          let size = dv.getUint32(o);
          let head = 8;
          if (size === 1) {
            size = Number(dv.getBigUint64(o + 8));
            head = 16;
          } else if (size === 0) {
            size = end - o;
          }
          if (size < head) break;
          out[String.fromCharCode(...bytes.subarray(o + 4, o + 8))] = { start: o + head, end: o + size };
          o += size;
        }
        return out;
      };
      const path = (names) => names.reduce((box, n) => box && boxes(box.start, box.end)[n], { start: 0, end: buf.byteLength });
      const stbl = path(['moov', 'trak', 'mdia', 'minf', 'stbl']);
      if (!stbl) return null;
      const t = boxes(stbl.start, stbl.end);
      const avc1 = t.stsd && boxes(t.stsd.start + 8, t.stsd.end).avc1;
      const avcC = avc1 && boxes(avc1.start + 78, avc1.end).avcC;
      const chunkBox = t.stco || t.co64;
      if (!avcC || !t.stsz || !t.stsc || !chunkBox) return null;

      const description = bytes.slice(avcC.start, avcC.end);
      const hex = (i) => description[i].toString(16).padStart(2, '0');
      const codec = `avc1.${hex(1)}${hex(2)}${hex(3)}`;

      const count = dv.getUint32(t.stsz.start + 8);
      const fixed = dv.getUint32(t.stsz.start + 4);
      const sizes = Array.from({ length: count }, (_, i) => fixed || dv.getUint32(t.stsz.start + 12 + i * 4));

      const wide = !!t.co64;
      const chunks = Array.from({ length: dv.getUint32(chunkBox.start + 4) }, (_, i) => (wide
        ? Number(dv.getBigUint64(chunkBox.start + 8 + i * 8))
        : dv.getUint32(chunkBox.start + 8 + i * 4)));

      const runs = Array.from({ length: dv.getUint32(t.stsc.start + 4) }, (_, i) => ({
        first: dv.getUint32(t.stsc.start + 8 + i * 12) - 1,
        per: dv.getUint32(t.stsc.start + 12 + i * 12),
      }));

      const keys = new Set();
      if (t.stss) {
        const n = dv.getUint32(t.stss.start + 4);
        for (let i = 0; i < n; i++) keys.add(dv.getUint32(t.stss.start + 8 + i * 4) - 1);
      } else {
        keys.add(0);
      }

      const samples = [];
      for (let c = 0, s = 0; c < chunks.length && s < count; c++) {
        const run = runs.filter((r) => r.first <= c).pop();
        let off = chunks[c];
        for (let k = 0; k < run.per && s < count; k++, s++) {
          samples.push({ data: bytes.subarray(off, off + sizes[s]), key: keys.has(s) });
          off += sizes[s];
        }
      }
      return samples.length && samples[0].key ? { codec, description, samples } : null;
    }

    let decoded = null;

    async function playDecoded(buf) {
      if (!buf || !('VideoDecoder' in window)) return false;
      const mp4 = parseMp4(buf);
      if (!mp4) return false;
      const config = { codec: mp4.codec, description: mp4.description, optimizeForLatency: true };
      if (!(await VideoDecoder.isConfigSupported(config)).supported) return false;

      const BUFFER = 12;
      const queue = [];
      let decoder;
      let fed = 0;
      let running = false;
      let failed = false;
      let last = 0;
      let debt = 0;

      const feed = () => {
        while (decoder.state === 'configured' && decoder.decodeQueueSize < 4 && queue.length + decoder.decodeQueueSize < BUFFER) {
          const s = mp4.samples[fed % mp4.samples.length];
          decoder.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: Math.round(fed * FRAME_MS * 1000), data: s.data }));
          fed++;
        }
      };

      decoder = new VideoDecoder({
        output: (frame) => {
          queue.push(frame);
          feed();
        },
        error: () => {
          failed = true;
          queue.splice(0).forEach((f) => f.close());
        },
      });
      decoder.configure(config);
      decoder.addEventListener('dequeue', feed);
      feed();

      const tick = (now) => {
        if (!running || failed) return;
        if (last) debt += Math.min(now - last, 100) / FRAME_MS;
        last = now;
        let frame = null;
        while (debt >= 0.5 && queue.length) {
          if (frame) frame.close();
          frame = queue.shift();
          debt--;
        }
        debt = Math.min(debt, 3);
        if (frame) {
          render(frame);
          frame.close();
        }
        feed();
        requestAnimationFrame(tick);
      };
      let primed = false;
      const resume = () => {
        if (!primed || running || failed || parked || document.hidden) return;
        running = true;
        last = 0;
        debt = 1;
        requestAnimationFrame(tick);
      };
      decoded = { resume, pause: () => { running = false; } };

      document.addEventListener('visibilitychange', () => (document.hidden ? (running = false) : resume()));
      window.addEventListener('pageshow', (e) => { if (e.persisted) resume(); });
      const t0 = performance.now();
      let first = false;
      const preroll = () => {
        if (failed) return;
        if (!first && queue.length) {
          first = true;
          render(queue[0]);
        }
        if (queue.length >= 6 || performance.now() - t0 > 1500) {
          primed = true;
          resume();
        } else {
          requestAnimationFrame(preroll);
        }
      };
      preroll();
      return true;
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

    let mode = 'video';
    const fallback = () => {
      if (mode !== 'video') return;
      mode = 'decoder';
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
      els.forEach((el) => el.dispatchEvent(new CustomEvent('logo3d:decoding', { bubbles: true })));
      fetch(SRC).then((r) => (r.ok ? r.arrayBuffer() : null)).then(playDecoded).catch(() => false).then((ok) => { if (!ok) release(); });
    };

    const draw = () => {
      if (mode !== 'video') return;
      if (video.readyState >= 2) render(video);
      schedule();
    };
    let pending = false;
    const schedule = () => {
      if (video.paused || mode !== 'video') {
        pending = false;
        return;
      }
      pending = true;
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(draw);
      else requestAnimationFrame(draw);
    };
    let parked = false;
    const park = () => {
      const wasParked = parked;
      parked = !views.some(visible);
      if (mode === 'decoder') {
        if (decoded) {
          if (parked) decoded.pause();
          else decoded.resume();
        }
        return;
      }
      if (parked) video.pause();
      else if (wasParked) play();
    };
    const play = () => {
      if (mode !== 'video' || parked) return;
      const p = video.play();
      if (p && p.then) {
        p.then(() => { if (!pending) schedule(); }).catch((err) => {
          if (err && err.name === 'NotAllowedError' && !document.hidden) fallback();
        });
      }
    };

    video.addEventListener('playing', () => { if (!pending) schedule(); });
    video.addEventListener('error', fallback);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = views.find((x) => x.el === e.target);
        if (v) v.inView = e.isIntersecting;
      }
      park();
    });
    window.addEventListener('dstar:loaded', park);
    views.forEach((v) => io.observe(v.el));

    document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : play()));
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const v = views.find((x) => x.el === e.target);
        if (v) v.resize(e.contentRect.width);
      }
    });
    views.forEach((v) => ro.observe(v.el));
    window.addEventListener('pageshow', (e) => { if (e.persisted) play(); });
    play();
    setTimeout(() => { if (mode === 'video' && !parked && !document.hidden && video.paused && !views.some((v) => v.ready)) fallback(); }, 2500);
  }

  const offscreen = !!navigator.userAgentData && 'transferControlToOffscreen' in HTMLCanvasElement.prototype && 'VideoDecoder' in window;
  if (!offscreen || !runWorker()) runVideo();
})();
