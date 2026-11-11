import * as THREE from './vendor/three.module.min.js?v=170';
import { ROPA, fotoRopa } from './museo-ropa.js?v=1';

const $ = (id) => document.getElementById(id);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;

const HALL = { width: 9, height: 4.6, eye: 1.65, margin: 0.9, back: 6.5 };
const SPACING = 4.4;
const ROOM_GAP = 3.2;
const LEAD = 4.6;
const VIEW_DISTANCE = 2.3;
const CAT = { speed: 2.9, turn: 7, scale: 0.86, startZ: 4.4 };
const CAMERA = { dist: 2.7, height: 2.05, lookY: 1.38, near: { dist: 1.75, height: 0.98, lookY: 0.64 }, tall: { dist: 2.25, lookY: 0.1 } };
const ART = { maxW: 2.6, maxH: 1.85, y: 1.95 };
const PLAQUE = { w: 0.66, h: 0.33, gap: 0.14 };
const MAX_LIGHTS = 8;
const TEXTURE_W = COARSE ? 600 : 900;
const COLORS = { black: 0x0a0a0a, wall: 0xc2c2c2, floor: 0x8f8f8f, ceiling: 0x777777, frame: 0x0c0c0c, lamp: 0xf4f1ea, warm: 0xfff6ea, white: '#f0ede8', gray: '#8a8a83', plaque: '#0d0d0d' };

const ui = {
  canvas: $('museoCanvas'), sala: $('museoSala'), lista: $('museoLista'), grid: $('museoListaGrid'), nota: $('museoListaNota'),
  modo: $('museoModo'), intro: $('museoIntro'), entrar: $('museoEntrar'), estado: $('museoEstado'), hud: $('museoHud'),
  prev: $('museoPrev'), camara: $('museoCamara'), probar: $('museoFichaProbar'), quitar: $('museoQuitar'), next: $('museoNext'), actual: $('museoActual'), total: $('museoTotal'), voz: $('museoVoz'),
  ficha: $('museoFicha'), fichaCerrar: $('museoFichaCerrar'), fichaDrop: $('museoFichaDrop'), fichaNombre: $('museoFichaNombre'),
  fichaPrecio: $('museoFichaPrecio'), fichaDesc: $('museoFichaDesc'), fichaTallas: $('museoFichaTallas'), fichaLink: $('museoFichaLink')
};

const catalog = () => (window.DSTAR_PRODUCTS || []).filter((p) => p && p.active !== false && p.image && p.name);
const signature = (list) => JSON.stringify(list.map((p) => [p.id, p.name, p.drop, p.price, p.image, p.stock, p.badge, p.sizesStock]));
const cdn = (url, format, w) => (url.includes('res.cloudinary.com') ? url.replace('/image/upload/', `/image/upload/f_${format},q_auto,dpr_auto,w_${w},c_limit/`) : url);
const formatPrice = (amount) => `$${Number(amount).toLocaleString('es-MX')} MXN`;
const soldOut = (p) => p.stock === 0 || p.badge === 'SOLDOUT';
const sizesLeft = (p) => (p.sizes || []).filter((s) => ((p.sizesStock || {})[s] || 0) > 0);
const productUrl = (p) => `producto.html?id=${encodeURIComponent(p.id)}`;
const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function renderList(products) {
  ui.grid.replaceChildren(...products.map((p) => {
    const item = document.createElement('li');
    item.className = 'museo-pieza';
    const link = document.createElement('a');
    link.className = 'museo-pieza__link';
    link.href = productUrl(p);
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.type = 'image/avif';
    source.srcset = [400, 600, 900].map((w) => `${cdn(p.image, 'avif', w)} ${w}w`).join(', ');
    source.sizes = '(max-width: 600px) 100vw, (max-width: 768px) 50vw, 380px';
    const img = document.createElement('img');
    img.className = 'museo-pieza__img';
    img.src = cdn(p.image, 'auto', 600);
    img.alt = '';
    img.width = 600;
    img.height = 400;
    img.loading = 'lazy';
    img.decoding = 'async';
    picture.append(source, img);
    const info = document.createElement('div');
    info.className = 'museo-pieza__info';
    const drop = document.createElement('p');
    drop.className = 'museo-pieza__drop';
    drop.textContent = p.drop ? `DROP: ${p.drop}` : 'DSTAR';
    const name = document.createElement('h3');
    name.className = 'museo-pieza__name';
    name.textContent = p.name;
    const price = document.createElement('p');
    price.className = 'museo-pieza__price';
    price.textContent = soldOut(p) ? 'AGOTADO' : formatPrice(p.price);
    info.append(drop, name, price);
    link.append(picture, info);
    item.append(link);
    return item;
  }));
}

function setMode(mode, { forced = false } = {}) {
  const isList = mode === 'lista';
  ui.sala.hidden = isList;
  ui.lista.hidden = !isList;
  document.body.classList.toggle('museo--sala', !isList);
  ui.modo.setAttribute('aria-pressed', String(isList));
  ui.modo.querySelector('.museo-btn__label').textContent = isList ? 'VER EN 3D' : 'VER LISTA';
  if (forced) {
    ui.modo.hidden = true;
    ui.nota.hidden = false;
  }
  if (!isList && gallery) gallery.wake();
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function fitText(g, text, font, size, maxWidth) {
  let px = size;
  do {
    g.font = `${px}px ${font}`;
    px -= 2;
  } while (g.measureText(text).width > maxWidth && px > 12);
}

function concreteTexture() {
  const texture = canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#8a8a8a';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 28; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 40 + Math.random() * 120;
      const blot = g.createRadialGradient(x, y, 0, x, y, r);
      const tone = Math.random() < 0.5 ? '0,0,0' : '255,255,255';
      blot.addColorStop(0, `rgba(${tone},0.07)`);
      blot.addColorStop(1, `rgba(${tone},0)`);
      g.fillStyle = blot;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 9000; i++) {
      const v = Math.floor(70 + Math.random() * 110);
      g.fillStyle = `rgba(${v},${v},${v},${0.05 + Math.random() * 0.14})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.4, 1 + Math.random() * 2.4);
    }
    g.strokeStyle = 'rgba(0,0,0,0.3)';
    g.lineWidth = 3;
    g.strokeRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.38)';
    [[70, 70], [w - 70, 70], [70, h - 70], [w - 70, h - 70]].forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 7, 0, Math.PI * 2);
      g.fill();
    });
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function glowTexture() {
  return canvasTexture(128, 128, (g, w, h) => {
    const glow = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    glow.addColorStop(0, 'rgba(255,244,224,0.55)');
    glow.addColorStop(0.5, 'rgba(255,244,224,0.16)');
    glow.addColorStop(1, 'rgba(255,244,224,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
  });
}

function boardTexture() {
  return canvasTexture(256, 256, (g, w, h) => {
    const light = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h / 2, w * 0.75);
    light.addColorStop(0, '#9a9a96');
    light.addColorStop(0.6, '#6c6c69');
    light.addColorStop(1, '#3d3d3b');
    g.fillStyle = light;
    g.fillRect(0, 0, w, h);
  });
}

function plaqueTexture(p) {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = COLORS.plaque;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.22)';
    g.lineWidth = 3;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.textBaseline = 'alphabetic';
    g.fillStyle = COLORS.gray;
    fitText(g, (p.drop || 'DSTAR').toUpperCase(), '"Space Mono", monospace', 20, w - 64);
    g.fillText((p.drop || 'DSTAR').toUpperCase(), 32, 62);
    g.fillStyle = COLORS.white;
    fitText(g, p.name.toUpperCase(), '"Bebas Neue", sans-serif', 76, w - 64);
    g.fillText(p.name.toUpperCase(), 32, 144);
    g.fillStyle = soldOut(p) ? '#e63232' : COLORS.white;
    g.font = '40px "Bebas Neue", sans-serif';
    g.fillText(soldOut(p) ? 'AGOTADO' : formatPrice(p.price), 32, 212);
  });
}

function titleTexture(label, title) {
  return canvasTexture(2048, 200, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.textAlign = 'center';
    g.fillStyle = COLORS.gray;
    g.font = '30px "Space Mono", monospace';
    g.fillText(label, w / 2, 52);
    g.fillStyle = COLORS.white;
    fitText(g, title, '"Archivo Black", sans-serif', 104, w - 120);
    g.fillText(title, w / 2, 160);
  });
}

function starPath(g, cx, cy, unit) {
  const tips = [0.15, 0.062, 0.1, 0.062, 0.2, 0.062, 0.1, 0.062];
  g.beginPath();
  tips.forEach((len, k) => {
    const a = (k * Math.PI) / 4;
    const b = a + Math.PI / 8;
    g.lineTo(cx + Math.sin(a) * len * unit, cy - Math.cos(a) * len * unit);
    g.lineTo(cx + Math.sin(b) * 0.034 * unit, cy - Math.cos(b) * 0.034 * unit);
  });
  g.closePath();
}

function catFaceTexture() {
  return canvasTexture(640, 480, (g, w) => {
    const unit = w / 1.2;
    const X = (x) => (x + 0.6) * unit;
    const Y = (y) => (0.5 - y) * unit;
    [[1, 0], [-1, 0.06]].forEach(([side, tilt]) => {
      g.save();
      g.translate(X(side * 0.22), Y(0.07));
      g.rotate(tilt);
      g.translate(-X(side * 0.22), -Y(0.07));
      g.beginPath();
      g.moveTo(X(side * 0.03), Y(0.09));
      g.lineTo(X(side * 0.43), Y(0.33));
      g.bezierCurveTo(X(side * 0.5), Y(0.12), X(side * 0.41), Y(-0.15), X(side * 0.2), Y(-0.17));
      g.bezierCurveTo(X(side * 0.09), Y(-0.18), X(side * 0.03), Y(-0.1), X(side * 0.03), Y(0.09));
      g.closePath();
      g.fillStyle = COLORS.white;
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = '#000';
      g.stroke();
      g.fillStyle = '#050505';
      starPath(g, X(side * 0.225), Y(0.05), unit);
      g.fill();
      g.restore();
    });
    g.fillStyle = '#8f8c85';
    g.beginPath();
    g.moveTo(X(-0.04), Y(-0.19));
    g.lineTo(X(0.04), Y(-0.19));
    g.quadraticCurveTo(X(0.012), Y(-0.25), X(0), Y(-0.25));
    g.quadraticCurveTo(X(-0.012), Y(-0.25), X(-0.04), Y(-0.19));
    g.fill();
  });
}

function shadowTexture() {
  return canvasTexture(128, 128, (g, w, h) => {
    const blob = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    blob.addColorStop(0, 'rgba(0,0,0,0.55)');
    blob.addColorStop(0.6, 'rgba(0,0,0,0.22)');
    blob.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = blob;
    g.fillRect(0, 0, w, h);
  });
}

function createCat() {
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.58, metalness: 0 });
  const group = new THREE.Group();
  const rig = new THREE.Group();
  const body = new THREE.Group();
  group.add(rig);
  rig.add(body);

  const k = 0.5;
  const side = [[0.12, 0.45], [0.44, 1], [0.5, 0.42], [0.62, 0.34], [0.5, 0.25], [0.88, 0.08], [0.5, -0.02], [0.63, -0.31], [0.36, -0.27]];
  const outline = new THREE.Shape();
  outline.moveTo(0, 0.43 * k);
  outline.lineTo(side[0][0] * k, side[0][1] * k);
  outline.quadraticCurveTo(0.3 * k, 0.5 * k, side[1][0] * k, side[1][1] * k);
  side.slice(2).forEach(([x, y]) => outline.lineTo(x * k, y * k));
  outline.quadraticCurveTo(0.16 * k, -0.39 * k, 0, -0.39 * k);
  outline.quadraticCurveTo(-0.16 * k, -0.39 * k, -side[8][0] * k, side[8][1] * k);
  side.slice(2, 8).reverse().forEach(([x, y]) => outline.lineTo(-x * k, y * k));
  outline.lineTo(-side[1][0] * k, side[1][1] * k);
  outline.quadraticCurveTo(-0.3 * k, 0.5 * k, -side[0][0] * k, side[0][1] * k);
  outline.closePath();

  const depth = 0.2;
  const bevel = 0.045;
  const headGeometry = new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: 0.022, bevelSegments: 4, curveSegments: 10 });
  headGeometry.translate(0, 0, -depth / 2);
  const head = new THREE.Group();
  head.position.y = 0.99;
  head.add(new THREE.Mesh(headGeometry, vinyl));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2 * k, 0.9 * k), new THREE.MeshBasicMaterial({ map: catFaceTexture(), transparent: true, depthWrite: false, toneMapped: false }));
  face.position.set(0, 0.05 * k, depth / 2 + bevel + 0.004);
  head.add(face);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.165, 0.2, 6, 14), vinyl);
  torso.position.y = 0.55;
  body.add(torso, head);

  const limb = (radius, length, x, y, lean) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    pivot.rotation.z = lean;
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 5, 10), vinyl);
    mesh.position.y = -(length / 2 + radius * 0.6);
    pivot.add(mesh);
    return pivot;
  };
  const legs = [-1, 1].map((s) => {
    const leg = limb(0.075, 0.15, s * 0.1, 0.34, 0);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), vinyl);
    foot.scale.set(1.05, 0.55, 1.5);
    foot.position.set(0, -0.29, 0.045);
    leg.add(foot);
    rig.add(leg);
    return leg;
  });
  const arms = [-1, 1].map((s) => {
    const arm = limb(0.055, 0.2, s * 0.2, 0.72, s * 0.2);
    body.add(arm);
    return arm;
  });

  const tail = new THREE.Group();
  tail.position.set(0, 0.31, -0.05);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.04, 0.02, -0.2), new THREE.Vector3(0.17, 0.16, -0.31), new THREE.Vector3(0.24, 0.38, -0.27)]);
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.028, 7), vinyl));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), vinyl);
  tip.position.copy(curve.getPoint(1));
  tail.add(tip);
  body.add(tail);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  group.add(shadow);
  group.scale.setScalar(CAT.scale);

  let phase = 0;
  let stride = 0;
  let wave = 0;
  let flair = 0;
  function animate(dt, time, moving, greeting) {
    stride += ((moving ? 1 : 0) - stride) * (1 - Math.exp(-dt * 9));
    wave += ((greeting ? 1 : 0) - wave) * (1 - Math.exp(-dt * 7));
    phase += dt * 10.5 * stride;
    const swing = Math.sin(phase) * stride;
    legs[0].rotation.x = swing * 0.75;
    legs[1].rotation.x = -swing * 0.75;
    arms[0].rotation.x = -swing * 0.55;
    arms[1].rotation.x = swing * 0.55 * (1 - wave);
    arms[1].rotation.z = 0.2 + wave * (2.35 + Math.sin(time * 11) * 0.28);
    body.position.y = Math.abs(Math.sin(phase)) * 0.035 * stride + Math.sin(time * 2.1) * 0.007;
    body.rotation.z = swing * 0.045;
    head.rotation.z = Math.sin(time * 1.3) * 0.035 * (1 - stride) - swing * 0.03;
    tail.rotation.y = Math.sin(time * 2.3) * 0.3 + swing * 0.22;
    if (flair > 0) {
      flair = Math.max(0, flair - dt / 1.3);
      const t = 1 - flair;
      const turn = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      rig.rotation.y = turn * Math.PI * 2;
      rig.position.y = Math.sin(Math.PI * t) * 0.14;
    }
    shadow.scale.setScalar(0.95 - (body.position.y + rig.position.y) * 2);
    return flair > 0;
  }

  return { group, body, arms, legs, animate, celebrate() { flair = 1; } };
}

const MOLDES = {
  longsleeve: {
    slot: 'arriba',
    perfil: [[0.224, 0.33], [0.221, 0.45], [0.212, 0.6], [0.2, 0.7], [0.17, 0.765], [0.12, 0.8], [0.07, 0.815]],
    tubo: { largo: 0.28, arriba: 0.075, abajo: 0.084, tope: 0.02, giro: 0.6 }
  },
  camisa: {
    slot: 'arriba',
    perfil: [[0.243, 0.37], [0.238, 0.5], [0.224, 0.65], [0.203, 0.72], [0.168, 0.77], [0.115, 0.8], [0.07, 0.815]],
    tubo: { largo: 0.14, arriba: 0.086, abajo: 0.102, tope: 0.03, giro: 0.6 }
  },
  jort: {
    slot: 'abajo',
    perfil: [[0.218, 0.2], [0.214, 0.3], [0.2, 0.4], [0.182, 0.48]],
    tubo: { largo: 0.15, arriba: 0.1, abajo: 0.108, tope: -0.095, giro: 0 }
  }
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const loadPhoto = (archivo) => loadImage(fotoRopa(archivo, 'avif')).catch(() => loadImage(fotoRopa(archivo, 'auto')));

function cropZone(img, zona) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d', { willReadFrequently: true });
  if (zona.rect) {
    const [x0, y0, x1, y1] = zona.rect;
    canvas.width = Math.round((x1 - x0) * W);
    canvas.height = Math.round((y1 - y0) * H);
    g.drawImage(img, x0 * W, y0 * H, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  const ax = zona.de[0] * W;
  const ay = zona.de[1] * H;
  const dx = zona.a[0] * W - ax;
  const dy = zona.a[1] * H - ay;
  canvas.width = Math.round(zona.ancho * W);
  canvas.height = Math.round(Math.hypot(dx, dy));
  g.translate(canvas.width / 2, 0);
  g.rotate(Math.atan2(dx, dy));
  g.translate(-ax, -ay);
  g.drawImage(img, 0, 0);
  return canvas;
}

function fabricColor(crop) {
  const g = crop.getContext('2d');
  const band = Math.max(1, Math.round(crop.width * 0.06));
  const top = Math.round(crop.height * 0.3);
  const rows = Math.max(1, Math.round(crop.height * 0.4));
  const sum = [0, 0, 0];
  let count = 0;
  [0, crop.width - band].forEach((x) => {
    const data = g.getImageData(x, top, band, rows).data;
    for (let i = 0; i < data.length; i += 4) {
      sum[0] += data[i];
      sum[1] += data[i + 1];
      sum[2] += data[i + 2];
      count += 1;
    }
  });
  return `rgb(${sum.map((v) => Math.round(v / count)).join(',')})`;
}

function panelTexture(crop, aspect, color) {
  const H = 320;
  const W = Math.max(48, Math.round(H * aspect));
  return canvasTexture(W, H, (g) => {
    g.fillStyle = color;
    g.fillRect(0, 0, W, H);
    if (!crop) return;
    const fill = Math.min(1, (crop.width / crop.height / aspect) * 1.3);
    const w = Math.round(W * fill);
    if (fill > 0.97) {
      g.drawImage(crop, 0, 0, W, H);
      return;
    }
    const piece = document.createElement('canvas');
    piece.width = w;
    piece.height = H;
    const p = piece.getContext('2d');
    p.drawImage(crop, 0, 0, w, H);
    const fade = p.createLinearGradient(0, 0, w, 0);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.12, '#000');
    fade.addColorStop(0.88, '#000');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    p.globalCompositeOperation = 'destination-in';
    p.fillStyle = fade;
    p.fillRect(0, 0, w, H);
    g.drawImage(piece, Math.round((W - w) / 2), 0);
  });
}

function clothMesh(geometry, texture) {
  return new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
}

function halfShell(perfil, back, texture) {
  const points = perfil.map(([r, y]) => new THREE.Vector2(r, y));
  const geometry = new THREE.LatheGeometry(points, 20, back ? Math.PI / 2 : -Math.PI / 2, Math.PI);
  const uv = geometry.attributes.uv;
  const y0 = perfil[0][1];
  const span = perfil[perfil.length - 1][1] - y0;
  for (let i = 0; i < uv.count; i++) uv.setY(i, (points[i % points.length].y - y0) / span);
  return clothMesh(geometry, texture);
}

function halfTube(tubo, back, twist, texture) {
  const geometry = new THREE.CylinderGeometry(tubo.arriba, tubo.abajo, tubo.largo, 12, 1, true, (back ? Math.PI / 2 : -Math.PI / 2) + twist, Math.PI);
  const mesh = clothMesh(geometry, texture);
  mesh.position.y = tubo.tope - tubo.largo / 2;
  return mesh;
}

async function buildGarment(spec, kitty) {
  const molde = MOLDES[spec.molde];
  const [front, back] = await Promise.all([loadPhoto(spec.frente.foto), loadPhoto(spec.espalda.foto)]);
  const sides = [{ vista: spec.frente, img: front, back: false }, { vista: spec.espalda, img: back, back: true }];
  const limbs = molde.slot === 'arriba' ? kitty.arms : kitty.legs;
  const radius = molde.perfil.reduce((sum, [r]) => sum + r, 0) / molde.perfil.length;
  const shellAspect = (Math.PI * radius) / (molde.perfil[molde.perfil.length - 1][1] - molde.perfil[0][1]);
  const tubeAspect = (Math.PI * (molde.tubo.arriba + molde.tubo.abajo)) / 2 / molde.tubo.largo;
  const parts = [];
  sides.forEach(({ vista, img, back: isBack }) => {
    const body = cropZone(img, vista.cuerpo);
    const color = fabricColor(body);
    const shell = halfShell(molde.perfil, isBack, panelTexture(body, shellAspect, color));
    kitty.body.add(shell);
    parts.push(shell);
    limbs.forEach((limb, i) => {
      const side = i === 0 ? -1 : 1;
      const zona = (side === -1) !== isBack ? vista.izq : vista.der;
      const tube = halfTube(molde.tubo, isBack, side * molde.tubo.giro, panelTexture(zona ? cropZone(img, zona) : null, tubeAspect, color));
      limb.add(tube);
      parts.push(tube);
    });
  });
  return { slot: molde.slot, parts };
}

function disposeGarment(garment) {
  garment.parts.forEach((mesh) => {
    mesh.removeFromParent();
    mesh.geometry.dispose();
    mesh.material.map.dispose();
    mesh.material.dispose();
  });
}

function createGallery() {
  const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.black);
  scene.fog = new THREE.Fog(COLORS.black, 7, 36);
  scene.add(new THREE.HemisphereLight(0xe4e6e8, 0x5a5a5a, 1.1));

  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 80);
  camera.rotation.order = 'YXZ';

  const concrete = concreteTexture();
  concrete.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const glowMap = glowTexture();
  const boardMap = boardTexture();
  const loader = new THREE.TextureLoader();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const unit = new THREE.PlaneGeometry(1, 1);
  const cube = new THREE.BoxGeometry(1, 1, 1);

  let exhibit = null;
  let pieces = [];
  let floor = null;
  let bounds = { minX: -3, maxX: 3, minZ: -10, maxZ: HALL.back - 0.9 };
  let current = -1;
  let dismissed = -1;
  let started = false;
  let dirty = true;
  let running = false;
  let last = 0;
  let loaded = 0;

  const cat = { x: 0, z: CAT.startZ, heading: 0 };
  const orbit = { yaw: REDUCED ? 0 : Math.PI, pitch: 0 };
  const view = { x: 0, y: CAMERA.height, z: 0 };
  const keys = new Set();
  const kitty = createCat();
  scene.add(kitty.group);
  let target = null;
  let drag = null;
  let snap = true;
  let orbitGoal = null;
  let dressing = false;
  let flairing = false;
  let camFront = false;
  let showcase = 0;
  let closeup = 0;
  let lookY = CAMERA.lookY;
  const outfit = { arriba: null, abajo: null };
  let introHold = 0;
  let drawn = 0;

  function concreteMaterial(color, repeatX, repeatY) {
    const map = concrete.clone();
    map.repeat.set(repeatX, repeatY);
    map.needsUpdate = true;
    return new THREE.MeshLambertMaterial({ color, map });
  }

  function box(material, w, h, d, x, y, z) {
    const mesh = new THREE.Mesh(cube, material);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    exhibit.add(mesh);
    return mesh;
  }

  function plane(material, w, h, x, y, z, rotX = 0, rotY = 0) {
    const mesh = new THREE.Mesh(unit, material);
    mesh.scale.set(w, h, 1);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, rotY, 0);
    exhibit.add(mesh);
    return mesh;
  }

  function disposeExhibit() {
    if (!exhibit) return;
    exhibit.traverse((node) => {
      if (!node.material) return;
      if (node.material.map && node.material.map !== glowMap && node.material.map !== boardMap) node.material.map.dispose();
      node.material.dispose();
    });
    scene.remove(exhibit);
  }

  function placePlaque(piece, w, h) {
    piece.plaque.position.set(-w / 2 - 0.08 + PLAQUE.w / 2, -h / 2 - 0.08 - PLAQUE.gap - PLAQUE.h / 2, 0.02);
  }

  function loadArtwork(piece) {
    const apply = (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const ratio = texture.image.width / texture.image.height || 1.5;
      const w = Math.min(ART.maxW, ART.maxH * ratio);
      const h = w / ratio;
      piece.picture.material.map = texture;
      piece.picture.material.needsUpdate = true;
      piece.picture.visible = true;
      piece.picture.scale.set(w, h, 1);
      piece.board.scale.set(w, h, 1);
      piece.frame.scale.set(w + 0.16, h + 0.16, 0.06);
      piece.glow.scale.set(w * 2.3, h * 2.6, 1);
      placePlaque(piece, w, h);
      loaded += 1;
      ui.estado.textContent = loaded < pieces.length ? `CARGANDO OBRAS ${loaded}/${pieces.length}` : '';
      dirty = true;
      wake();
    };
    const failed = () => {
      loaded += 1;
      ui.estado.textContent = loaded < pieces.length ? `CARGANDO OBRAS ${loaded}/${pieces.length}` : '';
    };
    loader.load(cdn(piece.product.image, 'avif', TEXTURE_W), apply, undefined, () => {
      loader.load(cdn(piece.product.image, 'auto', TEXTURE_W), apply, undefined, failed);
    });
  }

  function build(products) {
    disposeExhibit();
    exhibit = new THREE.Group();
    scene.add(exhibit);
    pieces = [];
    loaded = 0;

    const half = HALL.width / 2;
    const rooms = [];
    let z = -LEAD;
    products.forEach((product, i) => {
      const newRoom = i === 0 || product.drop !== products[i - 1].drop;
      if (newRoom) {
        if (i > 0) z -= ROOM_GAP;
        rooms.push({ drop: product.drop || 'DSTAR', z: z + SPACING / 2 + 0.2 });
      }
      pieces.push({ product, z, left: i % 2 === 0 });
      z -= SPACING;
    });
    const endZ = z - 1.5;
    const length = HALL.back - endZ;
    const midZ = (HALL.back + endZ) / 2;
    bounds = { minX: -half + HALL.margin, maxX: half - HALL.margin, minZ: endZ + 1.4, maxZ: HALL.back - 0.9 };

    floor = plane(concreteMaterial(COLORS.floor, HALL.width / 2.3, length / 2.3), HALL.width, length, 0, 0, midZ, -Math.PI / 2);
    plane(concreteMaterial(COLORS.ceiling, HALL.width / 2.3, length / 2.3), HALL.width, length, 0, HALL.height, midZ, Math.PI / 2);
    const wallMaterial = concreteMaterial(COLORS.wall, length / 2.3, HALL.height / 2.3);
    plane(wallMaterial, length, HALL.height, -half, HALL.height / 2, midZ, 0, Math.PI / 2);
    plane(wallMaterial, length, HALL.height, half, HALL.height / 2, midZ, 0, -Math.PI / 2);
    const endMaterial = concreteMaterial(COLORS.wall, HALL.width / 2.3, HALL.height / 2.3);
    plane(endMaterial, HALL.width, HALL.height, 0, HALL.height / 2, endZ, 0, 0);
    plane(endMaterial, HALL.width, HALL.height, 0, HALL.height / 2, HALL.back, 0, Math.PI);

    const portalMaterial = concreteMaterial(COLORS.ceiling, 3, 0.5);
    rooms.forEach((room, i) => {
      box(portalMaterial, HALL.width, 0.95, 0.45, 0, HALL.height - 0.475, room.z);
      box(portalMaterial, 0.5, HALL.height, 0.45, -half + 0.25, HALL.height / 2, room.z);
      box(portalMaterial, 0.5, HALL.height, 0.45, half - 0.25, HALL.height / 2, room.z);
      const title = new THREE.MeshBasicMaterial({ map: titleTexture(`SALA ${pad(i + 1)} — DROP`, room.drop.toUpperCase()), transparent: true, toneMapped: false, fog: false });
      plane(title, 7.6, 0.74, 0, HALL.height - 0.475, room.z + 0.24);
    });

    const frameMaterial = new THREE.MeshLambertMaterial({ color: COLORS.frame });
    const lampMaterial = new THREE.MeshBasicMaterial({ color: COLORS.lamp, toneMapped: false });
    const lightEvery = Math.max(1, Math.ceil(pieces.length / MAX_LIGHTS));
    pieces.forEach((piece, i) => {
      const side = piece.left ? -1 : 1;
      const group = new THREE.Group();
      group.position.set(side * (half - 0.02), ART.y, piece.z);
      group.rotation.y = piece.left ? Math.PI / 2 : -Math.PI / 2;
      exhibit.add(group);

      const w = ART.maxW;
      const h = ART.maxW / 1.5;
      piece.glow = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: glowMap, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      piece.glow.scale.set(w * 2.3, h * 2.6, 1);
      piece.glow.position.z = 0.005;
      piece.frame = new THREE.Mesh(cube, frameMaterial);
      piece.frame.scale.set(w + 0.16, h + 0.16, 0.06);
      piece.frame.position.z = 0.04;
      piece.board = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: boardMap, toneMapped: false }));
      piece.board.scale.set(w, h, 1);
      piece.board.position.z = 0.072;
      piece.board.userData.index = i;
      piece.picture = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
      piece.picture.scale.set(w, h, 1);
      piece.picture.position.z = 0.078;
      piece.picture.visible = false;
      piece.plaque = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: plaqueTexture(piece.product), toneMapped: false }));
      piece.plaque.scale.set(PLAQUE.w, PLAQUE.h, 1);
      placePlaque(piece, w, h);
      group.add(piece.glow, piece.frame, piece.board, piece.picture, piece.plaque);

      const lampX = side * (half - 1.9);
      plane(lampMaterial, 0.5, 1.7, lampX, HALL.height - 0.02, piece.z, Math.PI / 2);
      if (i % lightEvery === 0) {
        const light = new THREE.PointLight(COLORS.warm, 26, 11, 1.8);
        light.position.set(lampX, HALL.height - 0.6, piece.z);
        exhibit.add(light);
      }
      piece.spot = { x: side * (half - VIEW_DISTANCE), z: piece.z, yaw: piece.left ? Math.PI / 2 : -Math.PI / 2 };
      loadArtwork(piece);
    });

    const closing = new THREE.MeshBasicMaterial({ map: titleTexture('DSTAR — HECHO EN MÉXICO', 'TODO CON AMOR'), transparent: true, toneMapped: false });
    plane(closing, 6.4, 0.62, 0, 2.2, endZ + 0.03);
    const endLight = new THREE.PointLight(COLORS.warm, 18, 9, 1.8);
    endLight.position.set(0, HALL.height - 0.8, endZ + 2.4);
    exhibit.add(endLight);

    ui.total.textContent = pad(pieces.length);
    ui.estado.textContent = pieces.length ? `CARGANDO OBRAS 0/${pieces.length}` : '';
    if (current >= pieces.length) current = -1;
    if (current >= 0 && !ui.ficha.hidden) showFicha(current);
    else hideFicha();
    const entry = new THREE.PointLight(COLORS.warm, 16, 9, 1.8);
    entry.position.set(0, HALL.height - 0.7, CAT.startZ - 1.6);
    exhibit.add(entry);
    cat.x = clamp(cat.x, bounds.minX, bounds.maxX);
    cat.z = clamp(cat.z, bounds.minZ, bounds.maxZ);
    target = null;
    dirty = true;
  }

  function showFicha(index, announce = true) {
    const p = pieces[index].product;
    const available = sizesLeft(p);
    const out = soldOut(p) || !available.length;
    current = index;
    ui.actual.textContent = pad(index + 1);
    ui.fichaDrop.textContent = p.drop ? `DROP: ${p.drop}` : 'DSTAR';
    ui.fichaNombre.textContent = p.name;
    ui.fichaPrecio.textContent = out ? 'AGOTADO' : formatPrice(p.price);
    ui.fichaDesc.textContent = p.description || '';
    ui.fichaTallas.textContent = out ? 'ESTA PIEZA YA NO ESTÁ DISPONIBLE' : `TALLAS: ${available.join(' · ')}`;
    ui.fichaTallas.classList.toggle('museo-ficha__sizes--out', out);
    ui.fichaLink.href = productUrl(p);
    ui.fichaLink.textContent = out ? 'VER DETALLE' : 'VER PIEZA';
    if (ui.ficha.hidden) ui.ficha.hidden = false;
    if (announce) ui.voz.textContent = `Obra ${index + 1} de ${pieces.length}: ${p.name}, ${out ? 'agotada' : formatPrice(p.price)}.`;
    syncWardrobe();
  }

  function hideFicha() {
    ui.ficha.hidden = true;
  }

  function angleDiff(to, from) {
    const turn = Math.PI * 2;
    return ((((to - from) % turn) + turn + Math.PI) % turn) - Math.PI;
  }

  function turnToward(from, to, maxStep) {
    return from + clamp(angleDiff(to, from), -maxStep, maxStep);
  }

  function focusPiece(index) {
    if (!pieces.length) return;
    const i = ((index % pieces.length) + pieces.length) % pieces.length;
    const spot = pieces[i].spot;
    target = { x: spot.x, z: spot.z, heading: spot.yaw };
    orbitGoal = 0;
    syncCamButton(false);
    dismissed = -1;
    showFicha(i);
    dirty = true;
  }

  function pick(event) {
    const rect = ui.canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects([...pieces.map((piece) => piece.board), floor], false)[0];
    if (!hit) return null;
    return hit.object === floor ? { floor: hit.point } : { index: hit.object.userData.index };
  }

  function resize() {
    const w = ui.canvas.clientWidth;
    const h = ui.canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect >= 1 ? 62 : clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(27)) / camera.aspect)), 62, 96);
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function moveCat(dt) {
    const forward = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const turn = (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0);
    let moving = false;
    if (forward || turn) {
      target = null;
      cat.heading += turn * 2.6 * dt;
      const advance = CAT.speed * dt * forward * (forward < 0 ? 0.55 : 1);
      cat.x -= Math.sin(cat.heading) * advance;
      cat.z -= Math.cos(cat.heading) * advance;
      moving = true;
    } else if (target) {
      const dx = target.x - cat.x;
      const dz = target.z - cat.z;
      const dist = Math.hypot(dx, dz);
      if (REDUCED) {
        if (target.heading !== undefined) cat.heading = target.heading;
        else if (dist > 0.06) cat.heading = Math.atan2(-dx, -dz);
        cat.x = target.x;
        cat.z = target.z;
        target = null;
        snap = true;
        moving = true;
      } else if (dist > 0.06) {
        const want = Math.atan2(-dx, -dz);
        cat.heading = turnToward(cat.heading, want, CAT.turn * dt);
        const facing = Math.cos(angleDiff(want, cat.heading));
        if (facing > (dist < 0.9 ? 0.96 : 0.3)) {
          const advance = Math.min(dist, CAT.speed * dt * facing);
          cat.x -= Math.sin(cat.heading) * advance;
          cat.z -= Math.cos(cat.heading) * advance;
        }
        moving = true;
      } else if (target.heading !== undefined && Math.abs(angleDiff(target.heading, cat.heading)) > 0.01) {
        cat.heading = turnToward(cat.heading, target.heading, CAT.turn * dt);
        moving = true;
      } else {
        target = null;
      }
    }
    cat.x = clamp(cat.x, bounds.minX, bounds.maxX);
    cat.z = clamp(cat.z, bounds.minZ, bounds.maxZ);
    return moving;
  }

  function step(dt, now) {
    const moving = started ? moveCat(dt) : false;

    if (introHold > 0) {
      introHold -= dt;
    } else if (!drag && orbitGoal !== null) {
      const ease = 1 - Math.exp(-dt * 2.6);
      orbit.yaw += angleDiff(orbitGoal, orbit.yaw) * ease;
      orbit.pitch -= orbit.pitch * ease;
      if (REDUCED || Math.abs(angleDiff(orbitGoal, orbit.yaw)) < 0.004) {
        orbit.yaw = orbitGoal;
        orbit.pitch = 0;
        orbitGoal = null;
      }
    }

    const yaw = cat.heading + orbit.yaw;
    if (moving) showcase = 0;
    else if (showcase > 0) showcase -= dt;
    const wantClose = camFront || showcase > 0 ? 1 : 0;
    const zooming = Math.abs(wantClose - closeup) > 0.002;
    closeup = REDUCED || !zooming ? wantClose : closeup + (wantClose - closeup) * (1 - Math.exp(-dt * 3.4));
    const mix = (far, near) => far + (near - far) * closeup;
    const near = camera.aspect < 1 && !ui.ficha.hidden ? CAMERA.tall : CAMERA.near;
    const dist = mix(CAMERA.dist, near.dist);
    const wantLook = mix(CAMERA.lookY, near.lookY);
    const tilting = Math.abs(wantLook - lookY) > 0.002;
    lookY = REDUCED || !tilting ? wantLook : lookY + (wantLook - lookY) * (1 - Math.exp(-dt * 5));
    const reach = dist * Math.cos(orbit.pitch);
    const half = HALL.width / 2 - 0.6;
    const wantX = clamp(cat.x + Math.sin(yaw) * reach, -half, half);
    const wantZ = clamp(cat.z + Math.cos(yaw) * reach, bounds.minZ - 1.1, HALL.back - 0.3);
    const wantY = clamp(mix(CAMERA.height, CAMERA.near.height) + Math.sin(orbit.pitch) * dist, 0.45, HALL.height - 0.5);
    const settling = Math.abs(wantX - view.x) + Math.abs(wantY - view.y) + Math.abs(wantZ - view.z) > 0.003;
    if (snap || REDUCED) {
      view.x = wantX;
      view.y = wantY;
      view.z = wantZ;
      snap = false;
    } else if (settling) {
      const follow = 1 - Math.exp(-dt * 6.5);
      view.x += (wantX - view.x) * follow;
      view.y += (wantY - view.y) * follow;
      view.z += (wantZ - view.z) * follow;
    }
    camera.position.set(view.x, view.y, view.z);
    camera.lookAt(cat.x, lookY, cat.z);

    kitty.group.position.set(cat.x, 0, cat.z);
    kitty.group.rotation.y = cat.heading + Math.PI;
    flairing = !REDUCED && kitty.animate(dt, now / 1000, moving, introHold > 0);

    if (started && pieces.length) {
      const here = target || cat;
      let nearest = -1;
      let best = Infinity;
      pieces.forEach((piece, i) => {
        const d = Math.hypot(piece.spot.x - cat.x, piece.spot.z - cat.z);
        if (d < best) { best = d; nearest = i; }
      });
      if (dismissed >= 0 && Math.hypot(pieces[dismissed].spot.x - cat.x, pieces[dismissed].spot.z - cat.z) > 2.2) dismissed = -1;
      if (ui.ficha.hidden) {
        if (best < 1.1 && nearest !== dismissed) showFicha(nearest);
      } else if (current >= 0 && Math.hypot(pieces[current].spot.x - here.x, pieces[current].spot.z - here.z) > 2.6) {
        hideFicha();
      }
    }
    return moving || settling || zooming || tilting || showcase > 0 || !!drag || introHold > 0 || orbitGoal !== null || flairing;
  }

  function frame(now) {
    running = false;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const active = step(dt, now);
    const idleDue = started && !REDUCED && now - drawn > 33;
    if (dirty || active || idleDue) {
      renderer.render(scene, camera);
      drawn = now;
      dirty = false;
    }
    if (active || keys.size || (started && !REDUCED)) wake();
  }

  function wake() {
    if (running || ui.sala.hidden) return;
    running = true;
    requestAnimationFrame(frame);
  }

  let hoverFrame = 0;
  ui.canvas.addEventListener('pointerdown', (e) => {
    if (drag || !started) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, at: performance.now() };
    ui.canvas.setPointerCapture(e.pointerId);
    ui.canvas.classList.add('is-dragging');
  });
  ui.canvas.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) {
      const sensitivity = e.pointerType === 'touch' ? 0.0058 : 0.004;
      orbit.yaw -= (e.clientX - drag.x) * sensitivity;
      orbit.pitch = clamp(orbit.pitch + (e.clientY - drag.y) * sensitivity, -0.45, 0.9);
      orbitGoal = null;
      introHold = 0;
      syncCamButton();
      drag.x = e.clientX;
      drag.y = e.clientY;
      wake();
      return;
    }
    if (!started || e.pointerType !== 'mouse' || hoverFrame) return;
    hoverFrame = requestAnimationFrame(() => {
      hoverFrame = 0;
      const hit = pick(e);
      ui.canvas.classList.toggle('is-over', !!hit && hit.index !== undefined);
    });
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const tap = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 7 && performance.now() - drag.at < 500;
    drag = null;
    ui.canvas.classList.remove('is-dragging');
    if (!tap || e.type === 'pointercancel') return;
    const hit = pick(e);
    if (!hit) return;
    if (hit.index !== undefined) focusPiece(hit.index);
    else target = { x: clamp(hit.floor.x, bounds.minX, bounds.maxX), z: clamp(hit.floor.z, bounds.minZ, bounds.maxZ) };
    wake();
  };
  ui.canvas.addEventListener('pointerup', endDrag);
  ui.canvas.addEventListener('pointercancel', endDrag);
  ui.canvas.addEventListener('wheel', (e) => {
    if (!started) return;
    e.preventDefault();
    const amount = clamp(-e.deltaY * 0.006, -1.6, 1.6);
    const yaw = cat.heading + orbit.yaw;
    target = { x: clamp(cat.x - Math.sin(yaw) * amount, bounds.minX, bounds.maxX), z: clamp(cat.z - Math.cos(yaw) * amount, bounds.minZ, bounds.maxZ) };
    wake();
  }, { passive: false });

  const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  window.addEventListener('keydown', (e) => {
    if (!started || ui.sala.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Escape' && !ui.ficha.hidden) {
      dismissed = current;
      hideFicha();
      return;
    }
    if (!MOVE_KEYS.has(e.code)) return;
    e.preventDefault();
    keys.add(e.code);
    wake();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  ui.prev.addEventListener('click', () => { focusPiece(current < 0 ? pieces.length - 1 : current - 1); wake(); });
  ui.next.addEventListener('click', () => { focusPiece(current + 1); wake(); });
  function syncWardrobe() {
    const product = current >= 0 && pieces[current] ? pieces[current].product : null;
    const spec = product ? ROPA[product.id] : null;
    ui.quitar.hidden = !outfit.arriba && !outfit.abajo;
    ui.probar.hidden = !spec;
    if (!spec) return;
    const worn = outfit[MOLDES[spec.molde].slot];
    const on = !!worn && worn.id === product.id;
    ui.probar.setAttribute('aria-pressed', String(on));
    ui.probar.querySelector('.museo-btn__label').textContent = on ? 'QUITAR' : 'PROBAR';
  }

  function undress(slot) {
    if (!outfit[slot]) return;
    disposeGarment(outfit[slot]);
    outfit[slot] = null;
    dirty = true;
  }

  async function tryOn(product) {
    if (dressing) return;
    dressing = true;
    ui.probar.setAttribute('aria-busy', 'true');
    try {
      const garment = await buildGarment(ROPA[product.id], kitty);
      undress(garment.slot);
      outfit[garment.slot] = { id: product.id, parts: garment.parts };
      kitty.celebrate();
      showcase = 4.5;
      ui.voz.textContent = `El gato se puso ${product.name}.`;
    } catch {
      ui.voz.textContent = `No se pudo cargar ${product.name}. Intenta de nuevo.`;
    }
    dressing = false;
    ui.probar.removeAttribute('aria-busy');
    syncWardrobe();
    dirty = true;
    wake();
  }

  ui.probar.addEventListener('click', () => {
    const product = current >= 0 && pieces[current] ? pieces[current].product : null;
    if (!product || !ROPA[product.id] || dressing) return;
    const slot = MOLDES[ROPA[product.id].molde].slot;
    if (outfit[slot] && outfit[slot].id === product.id) {
      undress(slot);
      ui.voz.textContent = `El gato se quitó ${product.name}.`;
      syncWardrobe();
      wake();
      return;
    }
    tryOn(product);
  });
  ui.quitar.addEventListener('click', () => {
    undress('arriba');
    undress('abajo');
    ui.voz.textContent = 'El gato se quitó la ropa.';
    syncWardrobe();
    wake();
  });

  function syncCamButton(front = Math.abs(angleDiff(Math.PI, orbitGoal === null ? orbit.yaw : orbitGoal)) < Math.PI / 2) {
    camFront = front;
    ui.camara.setAttribute('aria-pressed', String(front));
    ui.camara.querySelector('.museo-btn__label').textContent = front ? 'VER SALA' : 'VER GATO';
  }
  ui.camara.addEventListener('click', () => {
    const front = ui.camara.getAttribute('aria-pressed') === 'true';
    orbitGoal = front ? 0 : Math.PI;
    introHold = 0;
    syncCamButton(!front);
    wake();
  });
  ui.fichaCerrar.addEventListener('click', () => {
    dismissed = current;
    hideFicha();
    ui.canvas.focus({ preventScroll: true });
  });
  ui.entrar.addEventListener('click', () => {
    started = true;
    if (!REDUCED) {
      introHold = 1.5;
      orbitGoal = 0;
    }
    ui.intro.classList.add('is-gone');
    ui.intro.inert = true;
    ui.hud.hidden = false;
    ui.canvas.focus({ preventScroll: true });
    wake();
  });
  ui.canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    setMode('lista', { forced: true });
  });

  if (window.ResizeObserver) new ResizeObserver(() => { resize(); wake(); }).observe(ui.canvas);
  else window.addEventListener('resize', () => { resize(); wake(); }, { passive: true });

  resize();
  return {
    build(products) { build(products); wake(); },
    wake() { resize(); dirty = true; wake(); }
  };
}

function webglAvailable() {
  try {
    const probe = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (probe.getContext('webgl2') || probe.getContext('webgl')));
  } catch {
    return false;
  }
}

function fontsReady(maxMs) {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const wanted = ['16px "Bebas Neue"', '16px "Archivo Black"', '16px "Space Mono"'].map((font) => document.fonts.load(font).catch(() => {}));
  return Promise.race([Promise.all(wanted), new Promise((resolve) => setTimeout(resolve, maxMs))]);
}

let gallery = null;
let shown = '';

function sync() {
  const products = catalog();
  const next = signature(products);
  if (next === shown) return;
  shown = next;
  renderList(products);
  if (gallery) gallery.build(products);
}

async function init() {
  ui.modo.addEventListener('click', () => setMode(ui.sala.hidden ? 'sala' : 'lista'));
  renderList(catalog());

  if (!webglAvailable()) {
    setMode('lista', { forced: true });
    window.addEventListener('dstar:catalog', sync);
    return;
  }
  try {
    gallery = createGallery();
  } catch {
    gallery = null;
    setMode('lista', { forced: true });
    window.addEventListener('dstar:catalog', sync);
    return;
  }
  setMode(REDUCED ? 'lista' : 'sala');
  await fontsReady(1500);
  sync();
  window.addEventListener('dstar:catalog', sync);
}

init();
