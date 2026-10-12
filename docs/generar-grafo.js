#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'dstar-store';
const GRAFO = path.join(__dirname, 'grafo');
const CONTEXTO = path.join(__dirname, 'contexto');
const BANNER = '%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%';

const posix = (p) => p.split(path.sep).join('/');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exists = (p) => fs.existsSync(p);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const DESC = {
  'dstar-store/index.html': 'Página principal: loader (solo en la primera visita de la sesión, sessionStorage dstar-intro), hero con logo 3D, drops (grid de productos), lookbook, about, blog, FAQ y contacto.',
  'dstar-store/producto.html': 'Detalle de producto: galería, selector de talla y botón de compra.',
  'dstar-store/checkout.html': 'Checkout: datos del cliente, cotización de envío y pago con Mercado Pago.',
  'dstar-store/gracias.html': 'Confirmación después de un pago exitoso.',
  'dstar-store/error-pago.html': 'Pantalla cuando el pago falla.',
  'dstar-store/pago-pendiente.html': 'Pantalla cuando el pago queda pendiente de confirmar.',
  'dstar-store/agradecimientos.html': 'Página de agradecimientos.',
  'dstar-store/terminos.html': 'Términos, envíos y devoluciones: precios, pagos, tiempos de envío, devolución en 5 días hábiles, defectos y quejas ante PROFECO; enlazada en los footers y junto al botón PAGAR.',
  'dstar-store/offline.html': 'Página sin conexión de la PWA.',
  'dstar-store/blog/born-to-shine-detras-del-drop.html': 'Artículo del blog: detrás del drop Born to Shine.',
  'dstar-store/blog/como-cuidar-tu-ropa.html': 'Artículo del blog: cómo cuidar tu ropa.',
  'dstar-store/blog/streetwear-mexico-escena.html': 'Artículo del blog: la escena del streetwear en México.',
  'dstar-preview.html': 'Vista previa estática grande del sitio, en la raíz del repo.',
  'dstar-store/css/style.css': 'Estilos completos del sitio: BEM, custom properties en :root y mobile-first; incluye la View Transition nativa entre páginas (@view-transition), el hero de desktop que reserva el alto del header y las clases .split-char, .split-line-mask y .hero--gsap que usa gsap-animations.js.',
  'dstar-store/js/app.js': 'Lógica principal: render de productos, carrito (drawer), stock en vivo, lookbook, blog, FAQ, toasts y efectos de texto; marca is-scrolled en <html> y precarga el detalle de producto con intención de hover.',
  'dstar-store/js/cart-store.js': 'Carrito en localStorage (dstar_cart) y sincronización del stock con /api/stock.',
  'dstar-store/js/products-data.js': 'Catálogo estático de productos; lo leen el navegador y el backend (validación de precios y stock).',
  'dstar-store/js/logo-3d.js': 'Logo 3D animado: video con alfa compuesto en WebGL (dpr máximo 2, un dibujo por cuadro de video, video en pausa si ninguna vista es visible), con modo de ahorro de batería.',
  'dstar-store/js/gsap-animations.js': 'Animaciones del index y del detalle: hero letra por letra con GSAP y SplitText, revelados de scroll con IntersectionObserver y element.animate() (WAAPI, en el compositor), contador de Nosotros, lookbook en móvil/tablet, cursor y botones magnéticos con GSAP desde js/vendor. El contenido es visible por defecto y respeta prefers-reduced-motion.',
  'dstar-store/js/blog-transitions.js': 'Animaciones de los artículos del blog: entrada del encabezado, título palabra por palabra con SplitText, reveal del contenido con IntersectionObserver y barra de progreso de lectura con ScrollTrigger cuando el navegador no soporta animation-timeline.',
  'dstar-store/sw.js': 'Service worker de la PWA: precache del shell, network-first para páginas, caché de imágenes; nunca cachea /api ni el checkout.',
  'dstar-store/manifest.webmanifest': 'Manifest de la PWA (nombre, íconos, colores).',
  'dstar-store/netlify/functions/cotizar-envio.js': 'Función /api/cotizar-envio: cotiza tarifas de envío con Skydropx Pro.',
  'dstar-store/netlify/functions/mp-preference.js': 'Función /api/mp-preference: valida el pedido, el stock y el precio del envío, y crea la preferencia de pago en Mercado Pago.',
  'dstar-store/netlify/functions/mp-webhook.js': 'Webhook de Mercado Pago: valida la firma, descuenta el stock una sola vez por pago, crea una sola guía en Skydropx y manda correos; avisa a la tienda (alertarTienda) si la guía falla, el monto no coincide, hay sobreventa o faltan datos.',
  'dstar-store/netlify/functions/stock.js': 'Función /api/stock: devuelve el stock disponible por producto y talla.',
  'dstar-store/netlify/lib/orders-store.js': 'Registro de pedidos en Netlify Blobs (evita guías duplicadas); en memoria en local.',
  'dstar-store/netlify/lib/skydropx.js': 'Cliente de Skydropx: token OAuth con caché y consulta del precio de una tarifa.',
  'dstar-store/netlify/lib/stock-store.js': 'Stock = base del catálogo menos piezas vendidas, guardado en Netlify Blobs con reintentos.',
  'dstar-store/netlify/lib/validate.js': 'Validación de datos del cliente y del pedido, y verificación del origen de la petición.',
  'dstar-store/optimize-images.js': 'Optimiza imágenes con sharp (carpetas y archivos extra del sitio).',
  'scripts/optimize-images.js': 'Genera tamaños optimizados de las fotos de productos con sharp.',
  'dstar-store/tests/e2e/flujo-compra.spec.js': 'Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto y selector de talla.',
  'dstar-store/tests/e2e/stock-y-animaciones.spec.js': 'Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue y ningún elemento renderizado (incluidos los .split-char) se quede con opacidad menor a 0.05.',
  'dstar-store/tests/e2e/audit-bugs.spec.js': 'Pruebas de regresión de la auditoría: stock por talla, localStorage corrupto, código postal del checkout, firma del webhook y origen.',
  'dstar-store/tests/perf/diagnostico.js': 'Mide fluidez y carga con Playwright en varios perfiles y escribe reportes en tests/perf/reportes.',
  'dstar-store/playwright.config.js': 'Configuración de Playwright (proyectos desktop, tablet y móvil).',
  'dstar-store/vite.config.mjs': 'Configuración de Vite heredada; el despliegue es estático y no compila.',
  'dstar-store/.lighthouserc.js': 'Configuración de Lighthouse CI sobre localhost:8888.',
  'dstar-store/netlify.toml': 'Configuración de Netlify: functions, redirects (/api/* y rutas internas bloqueadas), headers de seguridad y caché.',
  'netlify.toml': 'Netlify raíz: solo fija base = dstar-store.',
  'dstar-store/package.json': 'Dependencias y scripts (dev, deploy, test) del sitio.',
  'package.json': 'Dependencias de la raíz del repo (sharp para optimizar imágenes).',
};

const TECH = {
  'Netlify': { tipo: 'servicio', desc: 'Hosting, CDN y Netlify Functions del sitio. Headers y redirects viven en netlify.toml.', test: /exports\.handler|\.netlify\/functions|netlify-cli|process\.env\.(?:NETLIFY|DEPLOY_URL|CONTEXT)/, npm: [], extra: (f) => f.name.startsWith('netlify.toml') },
  'Netlify Blobs': { tipo: 'servicio', desc: 'Almacén clave-valor de Netlify: piezas vendidas (stock) y registro de pedidos.', test: /@netlify\/blobs/, npm: ['@netlify/blobs'] },
  'Mercado Pago': { tipo: 'servicio', desc: 'Pasarela de pago: preferencias de checkout, webhooks de pago y firma de notificaciones.', test: /mercadopago|MP_ACCESS_TOKEN|MP_WEBHOOK_SECRET/i, npm: [] },
  'Skydropx': { tipo: 'servicio', desc: 'Paquetería: cotización de envíos y creación de guías (Skydropx Pro, API v1 con OAuth2).', test: /skydropx/i, npm: [] },
  'Cloudinary': { tipo: 'servicio', desc: 'CDN de imágenes: f_auto, q_auto, dpr_auto y ancho responsive.', test: /cloudinary/i, npm: ['cloudinary'] },
  'Gmail SMTP': { tipo: 'servicio', desc: 'Correo transaccional con nodemailer: confirmación al cliente y aviso a la tienda.', test: /nodemailer|GMAIL_USER|GMAIL_APP_PASSWORD/, npm: ['nodemailer'] },
  'GSAP': { tipo: 'librería', desc: 'Animación del sitio (hero, contador, cursor, botones magnéticos; SplitText en el index, el blog y páginas sueltas). Se sirve desde js/vendor del propio sitio.', test: /\bgsap\b|SplitText/i, npm: ['gsap'] },
  'Google Fonts': { tipo: 'servicio', desc: 'Tipografías (fonts.googleapis.com y fonts.gstatic.com) con font-display: swap.', test: /fonts\.googleapis\.com|fonts\.gstatic\.com/, npm: [] },
  'Playwright': { tipo: 'herramienta', desc: 'Pruebas E2E y mediciones de rendimiento en desktop, tablet y móvil.', test: /@playwright\/test|playwright test/, npm: ['@playwright/test'] },
  'sharp': { tipo: 'herramienta', desc: 'Redimensiona y comprime imágenes antes de subirlas.', test: /require\(['"]sharp['"]\)/, npm: ['sharp'] },
  'Lighthouse': { tipo: 'herramienta', desc: 'Auditoría de rendimiento, accesibilidad y SEO (Lighthouse CI).', test: /lighthouse/i, npm: [] },
  'Vite': { tipo: 'herramienta', desc: 'Configuración heredada; el despliegue actual no compila nada.', test: /from ['"]vite['"]/, npm: [] },
  'http-server': { tipo: 'herramienta', desc: 'Servidor estático que usa netlify dev como target en local.', test: /http-server/, npm: ['http-server'] },
  'node-fetch': { tipo: 'librería', desc: 'fetch para Node (las funciones usan el fetch global de Node 22).', test: /require\(['"]node-fetch['"]\)/, npm: ['node-fetch'] },
  'Netlify CLI': { tipo: 'herramienta', desc: 'netlify dev (puerto 8888) y deploy a producción.', test: /netlify-cli|netlify dev/, npm: ['netlify-cli'] },
};

const ENV_GRUPOS = [
  [/^SKYDROPX_/, 'Skydropx', 'Credenciales y claves de catálogo para guías.'],
  [/ORIGEN$|^ORIGEN_/, 'Skydropx', 'Dirección y datos de contacto del almacén de origen del envío.'],
  [/^GMAIL_/, 'Gmail SMTP', 'Cuenta que envía los correos.'],
  [/^MP_/, 'Mercado Pago', 'Credencial o secreto de Mercado Pago.'],
  [/^URL_SITIO$/, 'Netlify', 'URL pública del sitio, sin slash final.'],
];
const ENV_PROVIDED = new Set(['CONTEXT', 'NETLIFY', 'NETLIFY_DEV', 'DEPLOY_URL', 'DEPLOY_PRIME_URL', 'URL']);

const SKIP_DIRS = new Set(['node_modules', 'dist', 'test-results', 'assets', 'vendor', 'reportes', 'docs', 'images', 'playwright-report']);
const SKIP_FILES = new Set(['package-lock.json', 'deno.lock', 'skills-lock.json', 'settings.local.json', 'state.json', '.last-run.json']);
const EXTS = new Set(['.html', '.js', '.mjs', '.css', '.json', '.toml', '.webmanifest']);

const CATS = {
  paginas: { tag: 'pagina', hub: 'Páginas', dir: 'paginas' },
  frontend: { tag: 'frontend', hub: 'Frontend', dir: 'frontend' },
  backend: { tag: 'backend', hub: 'Backend', dir: 'backend' },
  pruebas: { tag: 'prueba', hub: 'Pruebas', dir: 'pruebas' },
  herramientas: { tag: 'herramienta', hub: 'Herramientas', dir: 'herramientas' },
  config: { tag: 'config', hub: 'Configuración', dir: 'config' },
};

function categoria(rel) {
  if (/^dstar-store\/netlify\/(functions|lib)\//.test(rel)) return 'backend';
  if (/^dstar-store\/tests\//.test(rel) || /playwright\.config/.test(rel)) return 'pruebas';
  if (rel.endsWith('.html')) return 'paginas';
  if (/^dstar-store\/js\//.test(rel) || rel.endsWith('.css') || rel === 'dstar-store/sw.js') return 'frontend';
  if (/optimize-images\.js$/.test(rel) || /lighthouserc/.test(rel)) return 'herramientas';
  return 'config';
}

const files = [];
function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      walk(posix(path.join(dir, e.name)));
    } else {
      const rel = posix(path.join(dir, e.name));
      if (SKIP_FILES.has(e.name) || e.name.includes('.min.')) continue;
      if (!EXTS.has(path.extname(e.name))) continue;
      const content = read(rel);
      files.push({ rel, ext: path.extname(e.name), content, lines: content.split('\n').length, cat: categoria(rel) });
    }
  }
}
walk('');

const byBase = {};
for (const f of files) (byBase[path.basename(f.rel)] ||= []).push(f);
for (const f of files) {
  const base = path.basename(f.rel);
  if (byBase[base].length > 1) {
    const d = path.basename(path.dirname(f.rel));
    f.name = `${base} (${d === '.' || d === '' ? 'raíz' : d})`;
  } else f.name = base;
}
const byRel = new Map(files.map((f) => [f.rel, f]));

const edges = new Map();
function edge(from, to, kind, detail) {
  if (!to || from === to) return;
  const list = edges.get(from) || [];
  if (!list.some((e) => e.to === to && e.kind === kind)) list.push({ to, kind, detail });
  edges.set(from, list);
}
const hasEdgeTo = (from, to) => (edges.get(from) || []).some((e) => e.to === to);

function lookup(rel) {
  const n = path.posix.normalize(rel);
  return byRel.get(n) || byRel.get(n + '.js') || byRel.get(n + '.html') || null;
}
function resolveLocal(fromRel, target) {
  const t = target.split('#')[0].split('?')[0].trim();
  if (!t || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(t)) return null;
  const cands = [];
  if (t === '/') cands.push(`${SITE}/index.html`);
  else if (t.startsWith('/')) cands.push(`${SITE}${t}`);
  else {
    cands.push(path.posix.join(path.posix.dirname(fromRel), t));
    cands.push(`${SITE}/${t}`);
  }
  for (const c of cands) {
    const f = lookup(c);
    if (f) return f;
  }
  return null;
}

const NPM_TO_TECH = {};
for (const [name, t] of Object.entries(TECH)) for (const p of t.npm) NPM_TO_TECH[p] = name;

const envNames = new Set();
if (exists(path.join(ROOT, SITE, '.env.example'))) {
  for (const m of read(`${SITE}/.env.example`).matchAll(/^([A-Z][A-Z0-9_]+)=/gm)) envNames.add(m[1]);
}

const globalDefs = new Map();
for (const f of files) {
  if (!/\.(js|html)$/.test(f.rel)) continue;
  for (const m of f.content.matchAll(/\b\w+\.(DSTAR_[A-Z0-9_]+)\s*(?:\|\|)?=(?!=)/g)) {
    if (!globalDefs.has(m[1])) globalDefs.set(m[1], f);
  }
}

const PAGE_RE = /(?:['"`]|\})\/(index|checkout|gracias|error-pago|pago-pendiente|producto|terminos|agradecimientos|offline)(?:\.html)?(?=[?#'"`\s)])|['"`](checkout|gracias|error-pago|pago-pendiente|producto|terminos|agradecimientos|offline)\.html/g;
const PATH_RE = /['"`](\/?[\w./-]+\.(?:html|js|css|webmanifest))(?:[?#][^'"`]*)?['"`]/g;
const FN_RE = /^\s{0,4}(?:export\s+)?(?:async\s+)?function\s*\*?\s*(\w+)|^\s{0,4}(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>|^\s{0,4}class\s+(\w+)|^\s{0,4}exports\.(\w+)\s*=/;

for (const f of files) {
  const c = f.content;
  const isHtml = f.ext === '.html';
  const isCode = f.ext === '.js' || f.ext === '.mjs' || isHtml;
  const isPkg = f.rel.endsWith('package.json');
  const scan = (f.ext === '.js' || f.ext === '.mjs') ? c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1') : c;

  if (isHtml) {
    for (const m of c.matchAll(/<script[^>]+src=["']([^"']+)["']/g)) {
      const t = resolveLocal(f.rel, m[1]);
      if (t) edge(f.name, t.name, 'script');
    }
    for (const m of c.matchAll(/<link[^>]+href=["']([^"']+)["']/g)) {
      const t = resolveLocal(f.rel, m[1]);
      if (t) edge(f.name, t.name, t.ext === '.css' ? 'style' : 'manifest');
    }
    for (const m of c.matchAll(/<a[^>]+href=["']([^"']+)["']/g)) {
      const t = resolveLocal(f.rel, m[1]);
      if (t && t.ext === '.html') edge(f.name, t.name, 'link');
    }
  }

  if (f.ext === '.js' || f.ext === '.mjs') {
    for (const m of c.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)|from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const spec = m[1] || m[2] || m[3];
      if (spec.startsWith('.')) {
        const t = lookup(path.posix.join(path.posix.dirname(f.rel), spec));
        if (t) edge(f.name, t.name, 'requires');
      } else {
        const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (NPM_TO_TECH[pkg]) edge(f.name, NPM_TO_TECH[pkg], 'tech');
      }
    }
  }

  if (isCode) {
    for (const m of c.matchAll(/\/(?:api|\.netlify\/functions)\/([a-z0-9-]+)/g)) {
      const t = byRel.get(`${SITE}/netlify/functions/${m[1]}.js`);
      if (t) edge(f.name, t.name, 'api', `/api/${m[1]}`);
    }
    for (const m of c.matchAll(/\.(DSTAR_[A-Z0-9_]+)/g)) {
      const def = globalDefs.get(m[1]);
      if (def && def.name !== f.name) edge(f.name, def.name, 'global', m[1]);
    }
    for (const m of c.matchAll(/process\.env\.([A-Z][A-Z0-9_]+)/g)) {
      if (!ENV_PROVIDED.has(m[1])) { envNames.add(m[1]); edge(f.name, m[1], 'env'); }
    }
    for (const m of c.matchAll(/goto\(\s*['"`]([^'"`]+)['"`]/g)) {
      const t = resolveLocal(f.rel, m[1]);
      if (t) edge(f.name, t.name, 'test');
    }
  }

  if (!isPkg) {
    for (const m of c.matchAll(PAGE_RE)) {
      const page = m[1] || m[2];
      const t = byRel.get(`${SITE}/${page}.html`);
      if (t && !hasEdgeTo(f.name, t.name)) edge(f.name, t.name, 'refs');
    }
    for (const m of c.matchAll(PATH_RE)) {
      const t = resolveLocal(f.rel, m[1]);
      if (t && !hasEdgeTo(f.name, t.name)) edge(f.name, t.name, 'refs');
    }
    for (const [name, t] of Object.entries(TECH)) {
      if (t.test.test(scan) || (t.extra && t.extra(f))) edge(f.name, name, 'tech');
    }
  }

  if (f.rel.endsWith('netlify.toml') && c.includes('/api/*')) {
    for (const t of files) if (/netlify\/functions\//.test(t.rel)) edge(f.name, t.name, 'route');
  }

  if (isPkg) {
    let pkg = {};
    try { pkg = JSON.parse(c); } catch (e) { pkg = {}; }
    for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
      let name = NPM_TO_TECH[dep];
      if (!name) {
        name = dep.replace(/^@/, '').replace(/\//g, '-');
        TECH[name] = { tipo: 'librería', desc: `Dependencia npm ${dep}.`, test: /$^/, npm: [dep] };
      }
      edge(f.name, name, 'tech');
    }
  }

  f.funcs = [];
  if (isCode) {
    c.split('\n').forEach((line, i) => {
      const m = FN_RE.exec(line);
      if (m) f.funcs.push({ name: m[1] || m[2] || m[3] || m[4], line: i + 1 });
    });
  }
  f.tests = [];
  if (f.cat === 'pruebas') {
    for (const m of c.matchAll(/\btest(?:\.describe)?\(\s*(['"`])(.+?)\1/g)) f.tests.push(m[2]);
  }
  if (isHtml) {
    const t = /<title>([^<]+)<\/title>/i.exec(c);
    f.title = t ? t[1].trim() : '';
  }
  if (f.ext === '.css') {
    const blocks = new Set();
    for (const m of c.matchAll(/^\.([a-z0-9]+(?:-[a-z0-9]+)*)(?=__|--|[\s{,:.\[>+~])/gm)) blocks.add(m[1]);
    f.bem = [...blocks];
    f.vars = [...new Set([...c.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))];
  }
  if (f.rel.endsWith('netlify.toml')) {
    f.redirects = (c.match(/\[\[redirects\]\]/g) || []).length;
    f.headers = (c.match(/\[\[headers\]\]/g) || []).length;
  }
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { return ''; }
}
const commits = [];
for (const chunk of git(['log', '--no-merges', '--name-only', '--date=short', '--format=@@%h|%ad|%s', '-n', '300']).split('@@').slice(1)) {
  const lines = chunk.split('\n').filter(Boolean);
  const [h, d, ...s] = lines[0].split('|');
  commits.push({ h, d, s: s.join('|'), files: lines.slice(1) });
}
const commitsOf = new Map();
for (const cm of commits) for (const fl of cm.files) (commitsOf.get(fl) || (commitsOf.set(fl, []), commitsOf.get(fl))).push(cm);

const agents = [];
const kiroDir = path.join(ROOT, '.kiro', 'agents');
if (exists(kiroDir)) {
  for (const fn of fs.readdirSync(kiroDir).filter((x) => x.endsWith('.json')).sort()) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(kiroDir, fn), 'utf8'));
      agents.push({ name: `Agente ${j.name || path.basename(fn, '.json')}`, desc: j.description || '', prompt: String(j.prompt || '') });
    } catch (e) { /* json inválido: se omite */ }
  }
}
const skills = [];
const skillsDir = path.join(ROOT, '.agents', 'skills');
let lock = {};
try { lock = JSON.parse(read('skills-lock.json')).skills || {}; } catch (e) { lock = {}; }
if (exists(skillsDir)) {
  for (const d of fs.readdirSync(skillsDir).sort()) {
    const sm = path.join(skillsDir, d, 'SKILL.md');
    if (!exists(sm)) continue;
    const m = /description:\s*(.+)/.exec(fs.readFileSync(sm, 'utf8'));
    skills.push({ name: `Skill ${d}`, desc: m ? m[1].trim() : '', source: lock[d] ? lock[d].source : '' });
  }
}

for (const a of agents) {
  for (const f of files) {
    const base = f.name.replace(/ \(.+\)$/, '');
    if (base.includes('.') && new RegExp(`(^|[^\\w.-])${esc(base)}($|[^\\w-])`).test(a.prompt)) edge(a.name, f.name, 'mentions');
  }
  for (const name of Object.keys(TECH)) {
    if (name.length >= 5 && a.prompt.toLowerCase().includes(name.toLowerCase())) edge(a.name, name, 'mentions');
  }
}

const KIND = {
  script: 'Carga script', style: 'Carga estilos', manifest: 'Carga manifest', link: 'Enlaza a', requires: 'Importa',
  api: 'Llama a la API', global: 'Usa la global', test: 'Visita', refs: 'Referencia a', route: 'Enruta /api/* a',
  tech: 'Usa', env: 'Lee la variable', mentions: 'Menciona',
};

function renderEdges(name) {
  const list = edges.get(name) || [];
  if (!list.length) return [];
  const out = ['## Conexiones', ''];
  for (const k of Object.keys(KIND)) {
    const items = list.filter((e) => e.kind === k);
    if (!items.length) continue;
    out.push(`- ${KIND[k]}: ${items.map((e) => `[[${e.to}]]${e.detail ? ` (\`${e.detail}\`)` : ''}`).join(', ')}`);
  }
  out.push('');
  return out;
}

const usedBy = new Map();
for (const [from, list] of edges) for (const e of list) (usedBy.get(e.to) || (usedBy.set(e.to, []), usedBy.get(e.to))).push(from);

function fm(tags, extra = {}) {
  const l = ['---', `tags: [${tags.join(', ')}]`];
  for (const [k, v] of Object.entries(extra)) l.push(`${k}: ${typeof v === 'number' ? v : JSON.stringify(v)}`);
  l.push('---', BANNER, '');
  return l;
}
const writeNote = (dir, name, lines) => {
  fs.mkdirSync(path.join(GRAFO, dir), { recursive: true });
  fs.writeFileSync(path.join(GRAFO, dir, `${name}.md`), lines.join('\n') + '\n');
};

try { fs.rmSync(GRAFO, { recursive: true, force: true }); } catch (e) { /* se sobrescribe */ }
fs.mkdirSync(GRAFO, { recursive: true });

const hubChildren = {};
const addChild = (hub, name, desc) => (hubChildren[hub] ||= []).push({ name, desc });

for (const f of files) {
  const cat = CATS[f.cat];
  const L = fm(['codigo', cat.tag], { ruta: f.rel, lineas: f.lines });
  L.push(`# ${f.name}`, '', `\`${f.rel}\` · ${f.lines} líneas`, '');
  const desc = DESC[f.rel] || f.title || '';
  if (desc) L.push(desc, '');
  L.push(`Parte de: [[${cat.hub}]]`, '', ...renderEdges(f.name));
  if (f.funcs.length) {
    L.push('## Funciones y clases', '');
    for (const fn of f.funcs.slice(0, 40)) L.push(`- \`${fn.name}\` (línea ${fn.line})`);
    if (f.funcs.length > 40) L.push(`- y ${f.funcs.length - 40} más`);
    L.push('');
  }
  if (f.tests.length) L.push('## Casos de prueba', '', ...f.tests.slice(0, 40).map((t) => `- ${t}`), '');
  if (f.bem && f.bem.length) {
    L.push('## Bloques BEM', '', f.bem.slice(0, 40).map((b) => `\`.${b}\``).join(', '), '');
    if (f.vars.length) L.push('## Variables CSS', '', f.vars.slice(0, 40).map((v) => `\`${v}\``).join(', '), '');
  }
  if (f.redirects !== undefined) L.push('## Resumen', '', `${f.redirects} redirects y ${f.headers} bloques de headers.`, '');
  const hist = commitsOf.get(f.rel) || [];
  if (hist.length) {
    L.push('## Últimos cambios', '');
    for (const cm of hist.slice(0, 5)) L.push(`- ${cm.d} · \`${cm.h}\` · ${cm.s.slice(0, 120)}`);
    L.push('');
  }
  writeNote(cat.dir, f.name, L);
  addChild(cat.hub, f.name, desc);
}

for (const [name, t] of Object.entries(TECH)) {
  const users = [...new Set((usedBy.get(name) || []).filter((u) => !u.startsWith('package.json')))];
  const L = fm(['tecnologia', t.tipo === 'servicio' ? 'servicio' : 'libreria'], { tipo: t.tipo });
  L.push(`# ${name}`, '', t.desc, '');
  if (t.npm.length) L.push(`Paquete npm: ${t.npm.map((p) => `\`${p}\``).join(', ')}`, '');
  L.push('Parte de: [[Tecnologías]]', '');
  if (users.length) L.push('## Usado en', '', ...users.map((u) => `- [[${u}]]`), '');
  writeNote('tecnologias', name, L);
  addChild('Tecnologías', name, `${t.tipo}. ${t.desc}`);
}

for (const name of [...envNames].sort()) {
  const g = ENV_GRUPOS.find(([re]) => re.test(name));
  const users = usedBy.get(name) || [];
  const L = fm(['entorno']);
  L.push(`# ${name}`, '', g ? g[2] : 'Variable de entorno.', '', 'Solo el nombre: el valor vive en `.env` (local, fuera de git) y en Netlify → Environment variables.', '', 'Parte de: [[Variables de entorno]]');
  if (g) L.push(`Relacionada con: [[${g[1]}]]`);
  if (name === 'EMAIL_ORIGEN') L.push('Relacionada con: [[Gmail SMTP]]');
  L.push('');
  if (users.length) L.push('## Leída en', '', ...users.map((u) => `- [[${u}]]`), '');
  writeNote('entorno', name, L);
  addChild('Variables de entorno', name, g ? g[2] : '');
}

for (const a of agents) {
  const L = fm(['agente']);
  L.push(`# ${a.name}`, '', a.desc, '', 'Parte de: [[Agentes y skills]]', '', ...renderEdges(a.name));
  writeNote('agentes', a.name, L);
  addChild('Agentes y skills', a.name, a.desc);
}
for (const s of skills) {
  const L = fm(['skill']);
  L.push(`# ${s.name}`, '', s.desc, '');
  if (s.source) L.push(`Origen: \`${s.source}\``, '');
  L.push('Parte de: [[Agentes y skills]]', '');
  writeNote('agentes', s.name, L);
  addChild('Agentes y skills', s.name, s.desc);
}

const HUB_DESC = {
  'Páginas': 'Todas las páginas HTML del sitio y cómo se enlazan entre sí.',
  'Frontend': 'JavaScript del navegador, estilos y service worker.',
  'Backend': 'Netlify Functions y las librerías que comparten.',
  'Pruebas': 'Pruebas E2E, medición de rendimiento y su configuración.',
  'Herramientas': 'Scripts de apoyo (imágenes, Lighthouse).',
  'Configuración': 'Netlify, package.json, manifest y otros archivos de configuración.',
  'Tecnologías': 'Servicios externos, librerías y herramientas que usa el proyecto.',
  'Variables de entorno': 'Nombres de las variables que lee el backend (sin valores).',
  'Agentes y skills': 'Agentes de .kiro y skills de .agents instalados en el proyecto.',
};
for (const [hub, desc] of Object.entries(HUB_DESC)) {
  const kids = (hubChildren[hub] || []).sort((a, b) => a.name.localeCompare(b.name));
  const L = fm(['hub']);
  L.push(`# ${hub}`, '', desc, '', 'Parte de: [[DSTAR]]', '', '## Contenido', '');
  for (const k of kids) L.push(`- [[${k.name}]]${k.desc ? ` — ${k.desc}` : ''}`);
  L.push('');
  writeNote('hubs', hub, L);
}

{
  const L = fm(['hub']);
  L.push('# Historial', '', 'Commits del repo, del más reciente al más antiguo. Cada archivo de código lista sus últimos cambios en su propia nota.', '', 'Parte de: [[DSTAR]]');
  let day = '';
  for (const cm of commits) {
    if (cm.d !== day) { day = cm.d; L.push('', `## ${day}`, ''); }
    L.push(`- \`${cm.h}\` ${cm.s}`);
  }
  L.push('');
  writeNote('hubs', 'Historial', L);
}

const COLORES = [
  ['hub', '#e53935', 'rojo'], ['pagina', '#4fc3f7', 'celeste'], ['frontend', '#81c784', 'verde'], ['backend', '#ffb74d', 'naranja'],
  ['prueba', '#f06292', 'rosa'], ['herramienta', '#ba68c8', 'morado'], ['config', '#90a4ae', 'gris'], ['tecnologia', '#fff176', 'amarillo'],
  ['entorno', '#a1887f', 'café'], ['agente', '#4dd0e1', 'cian'], ['skill', '#aed581', 'verde claro'], ['contexto', '#ffffff', 'blanco'],
];

{
  const L = fm(['hub']);
  L.push('# DSTAR', '', 'Mapa del proyecto: notas de contexto, páginas, código del navegador, backend, pruebas, servicios y variables de entorno, todo conectado.', '');
  L.push(`Archivos de código mapeados: ${files.length} · tecnologías: ${Object.keys(TECH).length} · variables de entorno: ${envNames.size} · commits: ${commits.length}`, '');
  L.push('## Contexto', '', '- [[Flujo de compra]]', '- [[Reglas de estilo]]', '- [[Seguridad]]', '- [[Rendimiento y PWA]]', '- [[Pruebas y calidad]]', '- [[Despliegue]]', '- [[Pendientes]]', '- [[Historial]]', '');
  L.push('## Documentos del repo', '', '- [[CLAUDE]]', '- [[PLANNER]]', '- [[TESTING]]', '- [[README]]', '');
  L.push('## Mapa por áreas', '', ...Object.keys(HUB_DESC).map((h) => `- [[${h}]] — ${HUB_DESC[h]}`), '');
  L.push('## Colores del grafo', '', 'Se definen por etiqueta en `.obsidian/graph.json`.', '', ...COLORES.map(([t, , n]) => `- #${t}: ${n}`), '');
  writeNote('hubs', 'DSTAR', L);
}

const CTX = {
  'Flujo de compra': `---
tags: [contexto]
---
# Flujo de compra

1. **Catálogo.** [[index.html]] pinta los drops con [[app.js]] a partir de [[products-data.js]]. El detalle vive en [[producto.html]].
2. **Carrito.** [[cart-store.js]] guarda el carrito en localStorage (\`dstar_cart\`) y pide el stock en vivo a [[stock.js]] (\`/api/stock\`), que lee [[stock-store.js]].
3. **Checkout.** [[checkout.html]] cotiza el envío con [[cotizar-envio.js]] ([[Skydropx]]) y crea el pago con [[mp-preference.js]] ([[Mercado Pago]]). El envío se cobra junto con la prenda en el mismo pago.
4. **Validación.** [[validate.js]] revisa datos del cliente y pedido contra el catálogo y el stock, y rechaza peticiones hechas desde otros sitios.
5. **Resultado.** Mercado Pago regresa a [[gracias.html]], [[error-pago.html]] o [[pago-pendiente.html]].
6. **Webhook.** [[mp-webhook.js]] valida la firma, consulta el pago, crea una sola guía en Skydropx por pago ([[orders-store.js]]), descuenta stock y manda correos por [[Gmail SMTP]]: al cliente solo el rastreo, a la tienda la etiqueta.

Variables que intervienen: ver [[Variables de entorno]].

Parte de: [[DSTAR]]
`,
  'Reglas de estilo': `---
tags: [contexto]
---
# Reglas de estilo

Resumen de [[CLAUDE]]; los estilos viven en [[style.css]].

- Vanilla HTML, CSS y JS; sin frameworks ni TypeScript.
- Sin comentarios en el código salvo que sean estrictamente necesarios.
- CSS en BEM (\`.bloque__elemento--modificador\`), mobile-first y con las custom properties de \`:root\`.
- Imágenes siempre desde [[Cloudinary]] con \`f_auto,q_auto,dpr_auto\` y \`w_\` responsive, con \`loading="lazy"\` y \`decoding="async"\`.
- Animaciones respetan \`prefers-reduced-motion\` ([[gsap-animations.js]]).
- Targets táctiles de 44x44px mínimo y \`aria-*\` en todo elemento interactivo.
- \`100svh\` en hero y secciones a pantalla completa, \`100dvh\` solo en overlays fijos; nunca \`100vh\`.
- \`backdrop-filter\` solo en elementos chicos y fijos de navegación.
- \`font-display: swap\` en todas las fuentes ([[Google Fonts]]).

Parte de: [[DSTAR]]
`,
  'Seguridad': `---
tags: [contexto]
---
# Seguridad

Headers, CSP y redirects están en [[netlify.toml (dstar-store)]].

- El webhook de [[Mercado Pago]] ([[mp-webhook.js]]) rechaza avisos sin firma válida y no puede crear dos guías para el mismo pago ([[orders-store.js]]).
- [[cotizar-envio.js]] y [[mp-preference.js]] rechazan peticiones de otros sitios ([[validate.js]]).
- SRI en los scripts de [[GSAP]]; \`rel="noopener noreferrer"\` en enlaces externos.
- CSP estricta, Permissions-Policy y Cross-Origin-Opener-Policy; /dist/, /test-results/, /tests/, /netlify/ y archivos internos responden 404.
- Secretos solo por nombre en [[Variables de entorno]]; el \`.env\` real está en .gitignore.
- Pendiente: quitar \`'unsafe-inline'\` de script-src y limitar peticiones a las funciones (ver [[Pendientes]]).

Parte de: [[DSTAR]]
`,
  'Rendimiento y PWA': `---
tags: [contexto]
---
# Rendimiento y PWA

- PWA: [[sw.js]], [[manifest.webmanifest]] y [[offline.html]].
- Logo 3D: [[logo-3d.js]] reproduce video con alfa compuesto en WebGL y mantiene el mismo aspecto en modo de ahorro de batería.
- Animaciones: [[gsap-animations.js]] usa IntersectionObserver para los reveals (se quitó ScrollTrigger por fluidez) y CSS scroll-driven donde se puede.
- Navegación: View Transition nativa entre documentos en [[style.css]]; precarga de páginas; el sitio respeta bfcache.
- Imágenes: [[optimize-images.js (dstar-store)]] y [[optimize-images.js (scripts)]] con [[sharp]], servidas por [[Cloudinary]].
- Medición: [[diagnostico.js]] y [[Lighthouse]].

Parte de: [[DSTAR]]
`,
  'Pruebas y calidad': `---
tags: [contexto]
---
# Pruebas y calidad

- E2E con [[Playwright]]: [[flujo-compra.spec.js]] y [[audit-bugs.spec.js]], configuradas en [[playwright.config.js]].
- Viewports: 375px, 768px y 1440px o más.
- Checklist manual antes de cada deploy: [[TESTING]].
- Rendimiento: [[diagnostico.js]] y [[Lighthouse]].
- Antes de cada commit se revisa que no queden console.log de debug, código muerto ni errores de accesibilidad ([[CLAUDE]]).

Parte de: [[DSTAR]]
`,
  'Despliegue': `---
tags: [contexto]
---
# Despliegue

- Hosting en [[Netlify]]. La raíz tiene [[netlify.toml (raíz)]] solo para fijar la base en \`dstar-store\`; el resto está en [[netlify.toml (dstar-store)]].
- Sitio estático: no hay paso de build, aunque exista [[vite.config.mjs]].
- Node 22 para las funciones.
- Local: \`npm run dev\` dentro de \`dstar-store\` ([[Netlify CLI]] en el puerto 8888); producción: \`npm run deploy\`.
- Variables de entorno: [[Variables de entorno]].

Parte de: [[DSTAR]]
`,
  'Pendientes': `---
tags: [contexto]
---
# Pendientes

La lista completa y priorizada está en [[PLANNER]] (actualizada el 2026-10-11). Algunos puntos ya tienen código: [[stock-store.js]] y [[stock.js]] para el stock, \`alertarTienda\` en [[mp-webhook.js]] y [[terminos.html]]; conviene revisar el planner contra el código.

Dónde toca cada tema:

- Aviso de privacidad y términos: [[checkout.html]], [[terminos.html]].
- Stock real: [[products-data.js]], [[stock-store.js]], [[mp-webhook.js]].
- Alertas de pedidos con problemas: [[mp-webhook.js]], [[Gmail SMTP]].
- Límite de peticiones: [[cotizar-envio.js]], [[mp-preference.js]].
- CSP sin \`'unsafe-inline'\`: [[netlify.toml (dstar-store)]].
- Redes y SEO: [[index.html]], [[producto.html]], [[agradecimientos.html]].

Parte de: [[DSTAR]]
`,
};

fs.mkdirSync(CONTEXTO, { recursive: true });
for (const [name, body] of Object.entries(CTX)) {
  const p = path.join(CONTEXTO, `${name}.md`);
  if (!exists(p)) fs.writeFileSync(p, body);
}

const obs = path.join(ROOT, '.obsidian');
fs.mkdirSync(obs, { recursive: true });
const graphPath = path.join(obs, 'graph.json');
if (!exists(graphPath)) {
  fs.writeFileSync(graphPath, JSON.stringify({
    'collapse-filter': true, search: '', showTags: false, showAttachments: false, hideUnresolved: true, showOrphans: true,
    'collapse-color-groups': false,
    colorGroups: COLORES.map(([t, h]) => ({ query: `tag:#${t}`, color: { a: 1, rgb: parseInt(h.slice(1), 16) } })),
    'collapse-display': false, showArrow: true, textFadeMultiplier: -0.5, nodeSizeMultiplier: 1.2, lineSizeMultiplier: 1,
    'collapse-forces': false, centerStrength: 0.4, repelStrength: 14, linkStrength: 1, linkDistance: 220, scale: 1, close: false,
  }, null, 2));
}
const appPath = path.join(obs, 'app.json');
const IGNORE = ['node_modules/', '.claude/', '.agents/', '.kiro/', '.husky/', '.netlify/', 'dist/', 'test-results/', 'playwright-report/', 'reportes/'];
let app = {};
try { app = JSON.parse(fs.readFileSync(appPath, 'utf8')); } catch (e) { app = {}; }
app.userIgnoreFilters = [...new Set([...(app.userIgnoreFilters || []), ...IGNORE])];
fs.writeFileSync(appPath, JSON.stringify(app, null, 2));

const known = new Set(['CLAUDE', 'PLANNER', 'TESTING', 'README']);
const mdFiles = [];
(function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith('.md')) { mdFiles.push(p); known.add(e.name.slice(0, -3)); }
  }
})(__dirname);
const broken = new Set();
for (const p of mdFiles) {
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/\[\[([^\]|#]+)/g)) {
    if (!known.has(m[1].trim())) broken.add(`${path.basename(p)} -> [[${m[1].trim()}]]`);
  }
}

const nEdges = [...edges.values()].reduce((a, l) => a + l.length, 0);
console.log(`Notas de código: ${files.length} | tecnologías: ${Object.keys(TECH).length} | entorno: ${envNames.size} | agentes: ${agents.length} | skills: ${skills.length} | conexiones: ${nEdges} | commits: ${commits.length}`);
console.log(broken.size ? `Enlaces sin resolver (${broken.size}):\n  ${[...broken].join('\n  ')}` : 'Todos los enlaces resuelven.');
