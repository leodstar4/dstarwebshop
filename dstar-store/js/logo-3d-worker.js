const FRAME_MS = 1000 / 60;
const BUFFER = 12;
const VERT = 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FRAG = 'precision mediump float;varying vec2 uv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;float a=clamp((texture2D(t,vec2(uv.x,.5+uv.y*.5)).r-.04)*1.0417,0.,1.);gl_FragColor=vec4(c*a,a);}';

const views = new Map();
const queue = [];
let mp4 = null;
let decoder = null;
let fed = 0;
let failed = false;
let running = false;
let rafId = 0;
let last = 0;
let debt = 0;
let hidden = false;
let held = false;
let spare = null;
let primed = false;
let started = 0;

function fail(reason) {
  if (failed) return;
  failed = true;
  running = false;
  queue.splice(0).forEach((f) => f.close());
  postMessage({ type: 'error', reason });
}

function createGL(canvas) {
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
  return gl;
}

function resize(v, w, h) {
  if (!w || (v.canvas.width === w && v.canvas.height === h)) return;
  v.canvas.width = w;
  v.canvas.height = h;
  v.gl.viewport(0, 0, w, h);
  v.dirty = true;
}

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

function feed() {
  while (decoder && decoder.state === 'configured' && decoder.decodeQueueSize < 4 && queue.length + decoder.decodeQueueSize < BUFFER) {
    const s = mp4.samples[fed % mp4.samples.length];
    decoder.decode(new EncodedVideoChunk({ type: s.key ? 'key' : 'delta', timestamp: Math.round(fed * FRAME_MS * 1000), data: s.data }));
    fed++;
  }
}

function draw(frame) {
  for (const v of views.values()) {
    if (!v.visible || (held && v.ready)) continue;
    v.gl.texImage2D(v.gl.TEXTURE_2D, 0, v.gl.RGBA, v.gl.RGBA, v.gl.UNSIGNED_BYTE, frame);
    v.gl.drawArrays(v.gl.TRIANGLE_STRIP, 0, 4);
    v.dirty = false;
    if (!v.ready) {
      v.ready = true;
      postMessage({ type: 'live', id: v.id });
    }
  }
}

function tick(now) {
  rafId = 0;
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
    draw(frame);
    frame.close();
  } else if (queue.length && [...views.values()].some((v) => v.visible && v.dirty)) {
    draw(queue[0]);
  }
  feed();
  rafId = requestAnimationFrame(tick);
}

function update() {
  const want = !failed && !hidden && !held && primed && [...views.values()].some((v) => v.visible);
  if (want && !running) {
    running = true;
    last = 0;
    debt = 1;
    rafId = requestAnimationFrame(tick);
  } else if (!want && running) {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

function prime() {
  if (!failed && queue.length && [...views.values()].some((v) => v.visible && !v.ready)) draw(queue[0]);
}

function preroll() {
  if (failed || primed) return;
  prime();
  if (queue.length >= 6 || performance.now() - started > 1500) {
    primed = true;
    update();
  } else {
    requestAnimationFrame(preroll);
  }
}

async function start(src) {
  try {
    if (!('VideoDecoder' in self) || typeof requestAnimationFrame !== 'function') return fail('sin-soporte');
    const req = fetch(src);
    if (!views.size && typeof OffscreenCanvas === 'function') spare = createGL(new OffscreenCanvas(1, 1));
    const res = await req;
    if (!res.ok) return fail('http');
    mp4 = parseMp4(await res.arrayBuffer());
    if (!mp4) return fail('mp4');
    const config = { codec: mp4.codec, description: mp4.description, optimizeForLatency: true };
    if (!(await VideoDecoder.isConfigSupported(config)).supported) return fail('codec');
    decoder = new VideoDecoder({
      output: (frame) => {
        if (failed) return frame.close();
        queue.push(frame);
        feed();
      },
      error: () => fail('decoder'),
    });
    decoder.configure(config);
    decoder.addEventListener('dequeue', feed);
    started = performance.now();
    feed();
    preroll();
  } catch (err) {
    fail('init');
  }
}

onmessage = (e) => {
  const m = e.data;
  if (m.type === 'view') {
    const gl = createGL(m.canvas);
    if (!gl) return fail('webgl');
    const v = { id: m.id, canvas: m.canvas, gl, visible: m.visible, ready: false, dirty: true };
    views.set(m.id, v);
    resize(v, m.w, m.h);
    if (spare) {
      const lose = spare.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      spare = null;
    }
    prime();
  } else if (m.type === 'size') {
    const v = views.get(m.id);
    if (v) resize(v, m.w, m.h);
  } else if (m.type === 'visible') {
    const v = views.get(m.id);
    if (v) v.visible = m.visible;
    prime();
    update();
  } else if (m.type === 'hold') {
    held = m.held;
    update();
  } else if (m.type === 'hidden') {
    hidden = m.hidden;
    update();
  } else if (m.type === 'start') {
    start(m.src);
  }
};
