import * as THREE from './vendor/three.module.min.js?v=170';
import { ROPA, fotoRopa } from './museo-ropa.js?v=3';
import { bindPart, createCat, profileGeometry } from './museo-gato.js?v=5';

const $ = (id) => document.getElementById(id);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;

const HALL = { width: 9, height: 4.6, eye: 1.65, margin: 0.9, back: 6.5 };
const SPACING = 4.4;
const ROOM_GAP = 3.2;
const LEAD = 4.6;
const VIEW_DISTANCE = 2.3;
const CAT = { speed: 3.18, walkSpeed: 2.03, turn: 8.1, scale: 0.93, startZ: 4.4 };
const CAMERA = {
  dist: 2.7, height: 2.05, focusY: 0.54, near: { dist: 1.68, height: 0.92 }, narrowDist: 2.28,
  minPitch: -0.45, maxPitch: 0.9, orbitSpeed: 1.75, clearance: 1.05, minZoom: 0.65, maxZoom: 1.45, zoomStep: 1.2
};
const ART = { maxW: 2.6, maxH: 1.85, y: 1.95 };
const PLAQUE = { w: 0.66, h: 0.33, gap: 0.14 };
const MAX_LIGHTS = 8;
const TEXTURE_W = COARSE ? 600 : 900;
const COLORS = { black: 0x0a0a0a, wall: 0xc2c2c2, floor: 0x8f8f8f, ceiling: 0x777777, frame: 0x0c0c0c, lamp: 0xf4f1ea, warm: 0xfff6ea, white: '#f0ede8', gray: '#8a8a83', plaque: '#0d0d0d' };

const ui = {
  canvas: $('museoCanvas'), sala: $('museoSala'), lista: $('museoLista'), grid: $('museoListaGrid'), nota: $('museoListaNota'),
  modo: $('museoModo'), intro: $('museoIntro'), entrar: $('museoEntrar'), estado: $('museoEstado'), hud: $('museoHud'),
  zoom: $('museoZoom'), acercar: $('museoAcercar'), alejar: $('museoAlejar'),
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

const MOLDES = {
  longsleeve: {
    slot: 'arriba',
    anillos: [[0.291, 0.198, 0.143], [0.285, 0.213, 0.153], [0.299, 0.215, 0.161], [0.410, 0.196, 0.154], [0.510, 0.182, 0.145], [0.582, 0.193, 0.127], [0.613, 0.158, 0.104], [0.638, 0.109, 0.087], [0.653, 0.085, 0.075], [0.648, 0.077, 0.067]],
    pliegue: 0.031,
    cuello: 0.009,
    manga: [[-0.182, 0.036], [-0.190, 0.050], [-0.179, 0.057], [-0.125, 0.066], [-0.065, 0.069], [0.010, 0.069], [0.040, 0.042], [0.052, 0.004]],
    giro: 0.56
  },
  camisa: {
    slot: 'arriba',
    anillos: [[0.316, 0.208, 0.145], [0.308, 0.219, 0.157], [0.325, 0.220, 0.165], [0.423, 0.201, 0.158], [0.519, 0.184, 0.147], [0.580, 0.193, 0.130], [0.614, 0.160, 0.105], [0.638, 0.108, 0.084], [0.652, 0.085, 0.075], [0.648, 0.076, 0.067]],
    pliegue: 0.024,
    cuello: 0.014,
    manga: [[-0.111, 0.061], [-0.120, 0.076], [-0.107, 0.080], [-0.060, 0.082], [0.016, 0.067], [0.042, 0.040], [0.052, 0.003]],
    giro: 0.49
  },
  jort: {
    slot: 'abajo',
    anillos: [[0.251, 0.155, 0.102], [0.241, 0.173, 0.123], [0.269, 0.187, 0.151], [0.314, 0.190, 0.153], [0.359, 0.183, 0.146], [0.373, 0.177, 0.141], [0.370, 0.167, 0.132]],
    pliegue: 0.016,
    manga: [[-0.118, 0.072], [-0.127, 0.090], [-0.114, 0.093], [-0.069, 0.093], [-0.023, 0.090], [0.052, 0.077]],
    giro: 0
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
    canvas.width = Math.max(1, Math.round((x1 - x0) * W));
    canvas.height = Math.max(1, Math.round((y1 - y0) * H));
    if (zona.contorno) {
      g.beginPath();
      zona.contorno.forEach(([x, y]) => g.lineTo((x - x0) * W, (y - y0) * H));
      g.closePath();
      g.clip();
    }
    g.drawImage(img, x0 * W, y0 * H, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  const ax = zona.de[0] * W;
  const ay = zona.de[1] * H;
  const dx = zona.a[0] * W - ax;
  const dy = zona.a[1] * H - ay;
  canvas.width = Math.max(1, Math.round(zona.ancho * W));
  canvas.height = Math.max(1, Math.round(Math.hypot(dx, dy)));
  g.translate(canvas.width / 2, 0);
  g.rotate(Math.atan2(dx, dy));
  g.translate(-ax, -ay);
  g.drawImage(img, 0, 0);
  return canvas;
}

function fabricColor(crop) {
  const data = crop.getContext('2d').getImageData(0, 0, crop.width, crop.height).data;
  const histograms = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < data.length; i += 4) {
    histograms[0][data[i]]++;
    histograms[1][data[i + 1]]++;
    histograms[2][data[i + 2]]++;
  }
  const median = histograms.map((channel) => {
    let count = 0;
    return channel.findIndex((frequency) => (count += frequency) >= data.length / 8);
  });
  return `rgb(${median.join(',')})`;
}

function panelTexture(crop, aspect, color, sleeve = false) {
  const H = 384;
  const W = Math.max(48, Math.round(H * aspect));
  return canvasTexture(W, H, (g) => {
    g.fillStyle = color;
    g.fillRect(0, 0, W, H);
    if (!crop) return;
    const fill = clamp((crop.width / crop.height / aspect) * 1.38, 0.53, 1);
    const w = Math.round(W * fill);
    const piece = document.createElement('canvas');
    piece.width = w;
    piece.height = H;
    const p = piece.getContext('2d');
    p.drawImage(crop, 0, 0, w, H);
    p.globalCompositeOperation = 'destination-in';
    const fades = [
      [p.createLinearGradient(0, 0, w, 0), sleeve ? 0.16 : 0.095, sleeve ? 0.16 : 0.095],
      [p.createLinearGradient(0, 0, 0, H), sleeve ? 0.16 : 0.070, sleeve ? 0.10 : 0.035]
    ];
    for (const [fade, start, end] of fades) {
      fade.addColorStop(0, 'transparent');
      fade.addColorStop(start, '#000');
      fade.addColorStop(1 - end, '#000');
      fade.addColorStop(1, 'transparent');
      p.fillStyle = fade;
      p.fillRect(0, 0, w, H);
    }
    g.drawImage(piece, Math.round((W - w) / 2), 0);
  });
}

function clothMaterial(texture, fillLight) {
  return new THREE.MeshStandardMaterial({
    map: texture, color: new THREE.Color().setScalar(0.29),
    emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: fillLight,
    side: THREE.DoubleSide, roughness: 1, toneMapped: false
  });
}

async function buildGarment(spec, kitty) {
  const molde = MOLDES[spec.molde];
  const [front, back] = await Promise.all([loadPhoto(spec.frente.foto), loadPhoto(spec.espalda.foto)]);
  const color = fabricColor(cropZone(front, { rect: spec.muestra }));
  const { r, g, b } = new THREE.Color(color);
  const lightness = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const fillLight = 0.76 + 0.18 * THREE.MathUtils.smoothstep(lightness, 0.065, 0.34);
  const sides = [{ vista: spec.frente, img: front, back: false }, { vista: spec.espalda, img: back, back: true }];
  const limbs = molde.slot === 'arriba' ? kitty.arms : kitty.legs;
  const mean = (list, at) => list.reduce((sum, item) => sum + item[at], 0) / list.length;
  const shellAspect = (Math.PI * mean(molde.anillos, 1)) / (molde.anillos[molde.anillos.length - 1][0] - molde.anillos[1][0]);
  const tubeAspect = (Math.PI * mean(molde.manga, 1)) / (molde.manga[molde.manga.length - 1][0] - molde.manga[1][0]);
  const parts = [];
  sides.forEach(({ vista, img, back: isBack }) => {
    const body = cropZone(img, vista.cuerpo);
    const shell = profileGeometry(molde.anillos, { back: isBack, fold: molde.pliegue, neckline: molde.cuello });
    parts.push(bindPart(shell, clothMaterial(panelTexture(body, shellAspect, color), fillLight), kitty.body));
    limbs.forEach((limb, i) => {
      const side = i === 0 ? -1 : 1;
      const zona = (side === -1) !== isBack ? vista.izq : vista.der;
      const sleeve = profileGeometry(molde.manga, { back: isBack, twist: side * molde.giro });
      const texture = panelTexture(zona ? cropZone(img, zona) : null, tubeAspect, color, true);
      parts.push(bindPart(sleeve, clothMaterial(texture, fillLight), limb));
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
  const gl = renderer.getContext();
  const gpu = gl.getExtension('WEBGL_debug_renderer_info');
  const software = gpu && /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(gl.getParameter(gpu.UNMASKED_RENDERER_WEBGL));
  const maxPixelRatio = software ? 0.7 : COARSE ? 1.5 : 2;
  const renderInterval = software ? 44 : 0;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
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
  const kitty = createCat(CAT.scale, shadowTexture(), MOLDES);
  scene.add(kitty.group);
  let target = null;
  let drag = null;
  let snap = true;
  let orbitGoal = null;
  let manualOrbit = false;
  let dressing = null;
  let closeView = false;
  let showcase = 0;
  let closeup = 0;
  let zoomGoal = 1;
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

  function keyAxis(positive, negative) {
    return Number(keys.has(positive)) - Number(keys.has(negative));
  }

  function rotateCamera(yaw, pitch) {
    orbit.yaw = angleDiff(orbit.yaw + yaw, 0);
    orbit.pitch = clamp(orbit.pitch + pitch, CAMERA.minPitch, CAMERA.maxPitch);
    orbitGoal = null;
    manualOrbit = true;
    introHold = 0;
    syncCamButton();
    dirty = true;
  }

  function changeZoom(factor) {
    zoomGoal = clamp(zoomGoal * factor, CAMERA.minZoom, CAMERA.maxZoom);
    ui.acercar.setAttribute('aria-disabled', String(zoomGoal === CAMERA.maxZoom));
    ui.alejar.setAttribute('aria-disabled', String(zoomGoal === CAMERA.minZoom));
    wake();
  }

  function focusPiece(index) {
    if (!pieces.length) return;
    const i = ((index % pieces.length) + pieces.length) % pieces.length;
    const spot = pieces[i].spot;
    target = { x: spot.x, z: spot.z, heading: spot.yaw };
    setOrbitPreset(false);
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
    const forward = keyAxis('KeyW', 'KeyS');
    const turn = keyAxis('KeyA', 'KeyD');
    let moving = false;
    if (forward || turn) {
      target = null;
      cat.heading += turn * 3.05 * dt;
      const advance = CAT.walkSpeed * dt * forward * (forward < 0 ? 0.68 : 1);
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
    const previousX = cat.x;
    const previousZ = cat.z;
    const previousHeading = cat.heading;
    const moving = started ? moveCat(dt) : false;
    if (previousHeading !== cat.heading && keyAxis('KeyA', 'KeyD')) {
      manualOrbit = true;
      orbitGoal = null;
      introHold = 0;
    }
    if (manualOrbit && previousHeading !== cat.heading) {
      orbit.yaw = angleDiff(orbit.yaw - (cat.heading - previousHeading), 0);
      syncCamButton();
    }

    const orbitSide = keyAxis('ArrowRight', 'ArrowLeft');
    const orbitHeight = keyAxis('ArrowUp', 'ArrowDown');
    if (orbitSide || orbitHeight) {
      const step = CAMERA.orbitSpeed * dt;
      rotateCamera(orbitSide * step, orbitHeight * step);
    }

    if (introHold > 0) {
      introHold -= dt;
    } else if (!drag && orbitGoal !== null) {
      const ease = 1 - Math.exp(-dt * (showcase > 0 ? 8 : 2.6));
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
    const wantClose = closeView || showcase > 0 ? 1 : 0;
    const closing = Math.abs(wantClose - closeup) > 0.002;
    closeup = REDUCED || !closing ? wantClose : closeup + (wantClose - closeup) * (1 - Math.exp(-dt * 3.4));
    const mix = (far, near) => far + (near - far) * closeup;
    const nearDist = camera.aspect < 1 && !ui.ficha.hidden ? CAMERA.narrowDist : CAMERA.near.dist;
    const dist = mix(CAMERA.dist, nearDist);
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
    const clearance = CAMERA.clearance ** 2 - (view.x - cat.x) ** 2 - (view.z - cat.z) ** 2;
    const safeY = clearance > (view.y - CAMERA.focusY) ** 2 ? CAMERA.focusY + Math.sqrt(clearance) : view.y;
    camera.position.set(view.x, safeY, view.z);
    camera.lookAt(cat.x, CAMERA.focusY, cat.z);
    const zooming = Math.abs(zoomGoal - camera.zoom) > 0.002;
    const zoom = REDUCED || !zooming ? zoomGoal : camera.zoom + (zoomGoal - camera.zoom) * (1 - Math.exp(-dt * 14));
    if (zoom !== camera.zoom) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      dirty = true;
    }

    kitty.group.position.set(cat.x, 0, cat.z);
    kitty.group.rotation.y = cat.heading + Math.PI;
    const travel = (previousX - cat.x) * Math.sin(cat.heading) + (previousZ - cat.z) * Math.cos(cat.heading);
    const pace = travel / (Math.max(dt, 0.001) * CAT.speed);
    const fitting = !REDUCED && kitty.animate(dt, now / 1000, moving, introHold > 0, pace);

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
    return moving || settling || zooming || closing || orbitSide !== 0 || orbitHeight !== 0 || showcase > 0 || !!drag || introHold > 0 || orbitGoal !== null || fitting;
  }

  function frame(now) {
    running = false;
    const dt = Math.min(0.075, (now - last) / 1000 || 0.016);
    last = now;
    const active = step(dt, now);
    const elapsed = now - drawn;
    const idleDue = started && !REDUCED && elapsed > 33;
    dirty ||= active;
    if ((dirty || idleDue) && (!drawn || elapsed >= renderInterval)) {
      renderer.render(scene, camera);
      drawn = now;
      dirty = false;
    }
    if (dirty || active || keys.size || (started && !REDUCED)) wake();
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
      rotateCamera(-(e.clientX - drag.x) * sensitivity, (e.clientY - drag.y) * sensitivity);
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
    const units = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? ui.canvas.clientHeight : 1;
    changeZoom(Math.exp(clamp(-e.deltaY * units * 0.0018, -0.36, 0.36)));
  }, { passive: false });
  ui.acercar.addEventListener('click', () => changeZoom(CAMERA.zoomStep));
  ui.alejar.addEventListener('click', () => changeZoom(1 / CAMERA.zoomStep));

  const HELD_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  window.addEventListener('keydown', (e) => {
    if (!started || ui.sala.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Escape' && !ui.ficha.hidden) {
      dismissed = current;
      hideFicha();
      return;
    }
    const zoomIn = e.key === '+' || e.key === '=' || e.code === 'NumpadAdd';
    const zoomOut = e.key === '-' || e.code === 'NumpadSubtract';
    if (zoomIn || zoomOut) {
      e.preventDefault();
      changeZoom(zoomIn ? CAMERA.zoomStep : 1 / CAMERA.zoomStep);
      return;
    }
    if (!HELD_KEYS.has(e.code)) return;
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
    kitty.unwear(outfit[slot]);
    disposeGarment(outfit[slot]);
    outfit[slot] = null;
    dirty = true;
  }

  async function tryOn(product) {
    if (dressing) return;
    const request = {};
    dressing = request;
    ui.probar.setAttribute('aria-busy', 'true');
    try {
      const garment = await buildGarment(ROPA[product.id], kitty);
      if (dressing !== request) {
        disposeGarment(garment);
        return;
      }
      undress(garment.slot);
      garment.id = product.id;
      outfit[garment.slot] = garment;
      kitty.wear(garment, REDUCED);
      if (!REDUCED) {
        introHold = 0;
        setOrbitPreset(true);
        showcase = 2;
      }
      ui.voz.textContent = `El gato se puso ${product.name}.`;
    } catch {
      if (dressing === request) ui.voz.textContent = `No se pudo cargar ${product.name}. Intenta de nuevo.`;
    }
    if (dressing !== request) return;
    dressing = null;
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
    dressing = null;
    ui.probar.removeAttribute('aria-busy');
    undress('arriba');
    undress('abajo');
    ui.voz.textContent = 'El gato se quitó la ropa.';
    syncWardrobe();
    wake();
  });

  function syncCamButton(front = Math.abs(angleDiff(Math.PI, orbitGoal === null ? orbit.yaw : orbitGoal)) < Math.PI / 2) {
    const pressed = String(front);
    if (ui.camara.getAttribute('aria-pressed') === pressed) return;
    ui.camara.setAttribute('aria-pressed', pressed);
    ui.camara.querySelector('.museo-btn__label').textContent = front ? 'VER SALA' : 'VER GATO';
  }

  function setOrbitPreset(front) {
    closeView = front;
    manualOrbit = false;
    orbitGoal = front ? Math.PI : 0;
    syncCamButton(front);
  }

  ui.camara.addEventListener('click', () => {
    const front = ui.camara.getAttribute('aria-pressed') === 'true';
    setOrbitPreset(!front);
    introHold = 0;
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
    ui.zoom.hidden = false;
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
