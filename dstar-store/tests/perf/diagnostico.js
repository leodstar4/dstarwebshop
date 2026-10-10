#!/usr/bin/env node
/*
 * Diagnóstico de fluidez: mide una URL (producción o local) como móvil gama media
 * y como desktop, y guarda un reporte en tests/perf/reportes/.
 *
 *   node tests/perf/diagnostico.js https://tu-sitio.netlify.app
 *   node tests/perf/diagnostico.js https://tu-sitio.netlify.app http://localhost:8888
 *   node tests/perf/diagnostico.js <url> --path=/producto.html?id=dstar-bts-shirt-01
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const args = process.argv.slice(2);
const pagePath = (args.find((a) => a.startsWith('--path=')) || '--path=/').slice(7);
const urls = args.filter((a) => !a.startsWith('--')).map((u) => u.replace(/\/$/, '') + pagePath);
if (!urls.length) {
  console.error('Uso: node tests/perf/diagnostico.js <url> [url-a-comparar] [--path=/ruta]');
  process.exit(1);
}

const PERFILES = {
  movil: {
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' },
    cpu: 4,
    red: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }
  },
  desktop: { context: { viewport: { width: 1440, height: 900 } }, cpu: 1, red: null }
};

const kb = (b) => Math.round(b / 1024);

async function medir(browser, url, nombre, perfil, frio) {
  const context = await browser.newContext({ ...perfil.context, serviceWorkers: 'allow' });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  if (frio) await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (perfil.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: perfil.cpu });
  if (perfil.red) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...perfil.red });

  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e.message).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)); });

  const recursos = new Map();
  cdp.on('Network.responseReceived', ({ requestId, response, type }) => {
    const h = Object.fromEntries(Object.entries(response.headers).map(([k, v]) => [k.toLowerCase(), v]));
    recursos.set(requestId, {
      url: response.url.slice(0, 140), tipo: type, status: response.status,
      cache: h['cache-control'] || '', compresion: h['content-encoding'] || '',
      cdn: h['cache-status'] || h['x-nf-cache'] || h['x-cache'] || '',
      desdeCache: response.fromDiskCache || response.fromServiceWorker || false, bytes: 0, ms: Math.round(response.timing ? response.timing.receiveHeadersEnd : 0)
    });
  });
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    const r = recursos.get(requestId);
    if (r) r.bytes = encodedDataLength;
  });

  await page.addInitScript(() => {
    window.__diag = { lcp: 0, lcpEl: '', cls: 0, shifts: [], longtasks: [], loaderOculto: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => {
      window.__diag.lcp = Math.round(e.startTime);
      window.__diag.lcpEl = e.element ? (e.element.tagName + '.' + e.element.className).slice(0, 80) : (e.url || '').slice(0, 80);
    })).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => {
      if (e.hadRecentInput) return;
      window.__diag.cls += e.value;
      if (e.value > 0.01) window.__diag.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(3),
        de: (e.sources || []).map((s) => s.node ? (s.node.nodeName + '.' + (s.node.className || '')).slice(0, 60) : '?') });
    })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => {
      window.__diag.longtasks.push({ t: Math.round(e.startTime), ms: Math.round(e.duration) });
    })).observe({ type: 'longtask', buffered: true });
    document.addEventListener('DOMContentLoaded', () => {
      const loader = document.getElementById('loader');
      if (!loader) return;
      new MutationObserver(() => {
        if (loader.classList.contains('hidden') && !window.__diag.loaderOculto) window.__diag.loaderOculto = Math.round(performance.now());
      }).observe(loader, { attributes: true });
    });
  });

  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  const load = Date.now() - t0;
  await page.waitForTimeout(4000);

  const scroll = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    let run = true;
    const loop = (t) => { frames.push(t - last); last = t; if (run) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const ltAntes = window.__diag.longtasks.length;
    const H = document.documentElement.scrollHeight - innerHeight;
    const lentos = [];
    const t0 = performance.now();
    await new Promise((res) => {
      const step = () => {
        const y = Math.min(H, (performance.now() - t0) * 1.4);
        window.scrollTo(0, y);
        const f = frames[frames.length - 1];
        if (f > 50) lentos.push({ y: Math.round(y), ms: Math.round(f), seccion: (document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('section,footer,header')?.className || '?').split(' ')[0] });
        if (y < H) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    await new Promise((r) => setTimeout(r, 500));
    run = false;
    const f = frames.slice(3).sort((a, b) => a - b);
    const p = (q) => Math.round(f[Math.floor(f.length * q)] || 0);
    return { cuadros: f.length, p50: p(0.5), p95: p(0.95), max: Math.round(f[f.length - 1] || 0),
      sobre33ms: f.filter((x) => x > 33).length, sobre50ms: f.filter((x) => x > 50).length,
      longtasksDuranteScroll: window.__diag.longtasks.slice(ltAntes), cuadrosLentos: lentos.slice(0, 15) };
  });

  const pagina = await page.evaluate(() => {
    const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width)
      .map((i) => ({ src: (i.currentSrc || i.src).slice(0, 120), natural: i.naturalWidth, mostrado: Math.round(i.getBoundingClientRect().width * devicePixelRatio) }))
      .filter((i) => i.natural > i.mostrado * 1.6).slice(0, 10);
    const capas = [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return (s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none');
    }).map((el) => (el.tagName + '.' + el.className).slice(0, 60));
    const animaciones = document.getAnimations().filter((a) => a.playState === 'running')
      .map((a) => (a.animationName || a.constructor.name) + ' @ ' + ((a.effect && a.effect.target && a.effect.target.className) || '').toString().slice(0, 40));
    return { ...window.__diag, cls: +window.__diag.cls.toFixed(3), domNodos: document.getElementsByTagName('*').length,
      swControla: !!navigator.serviceWorker?.controller, imagenesSobredimensionadas: imgs,
      backdropFilter: capas, animacionesCorriendo: animaciones.slice(0, 15), heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024) : null };
  });

  await context.close();
  const lista = [...recursos.values()].filter((r) => !r.url.startsWith('data:'));
  const porTipo = {};
  for (const r of lista) {
    porTipo[r.tipo] = porTipo[r.tipo] || { n: 0, kb: 0 };
    porTipo[r.tipo].n++;
    porTipo[r.tipo].kb += kb(r.bytes);
  }
  return {
    perfil: nombre, url, cache: frio ? 'fria' : 'caliente', loadMs: load, errores: errores.slice(0, 10),
    lcpMs: pagina.lcp, lcpElemento: pagina.lcpEl, loaderOcultoMs: pagina.loaderOculto, cls: pagina.cls, shifts: pagina.shifts.slice(0, 8),
    longtasksCarga: pagina.longtasks.filter((t) => t.ms > 50).slice(0, 10),
    scroll, totalKb: lista.reduce((a, r) => a + kb(r.bytes), 0), porTipo,
    masPesados: lista.sort((a, b) => b.bytes - a.bytes).slice(0, 10).map((r) => ({ kb: kb(r.bytes), url: r.url, compresion: r.compresion, cache: r.cache })),
    sinCompresion: lista.filter((r) => ['Script', 'Stylesheet', 'Document'].includes(r.tipo) && !r.compresion && r.bytes > 2048).map((r) => r.url),
    sinCacheLarga: lista.filter((r) => ['Image', 'Font', 'Script', 'Stylesheet'].includes(r.tipo) && /no-cache|max-age=0|^$/.test(r.cache)).map((r) => r.url + ' [' + r.cache + ']').slice(0, 15),
    errores4xx5xx: lista.filter((r) => r.status >= 400).map((r) => r.status + ' ' + r.url),
    domNodos: pagina.domNodos, swControla: pagina.swControla, heapKb: pagina.heap,
    imagenesSobredimensionadas: pagina.imagenesSobredimensionadas, backdropFilter: pagina.backdropFilter, animacionesCorriendo: pagina.animacionesCorriendo
  };
}

function resumen(r) {
  const s = r.scroll;
  return `### ${r.perfil} — caché ${r.cache} — ${r.url}
- Carga: ${r.loadMs} ms · loader oculto: ${r.loaderOcultoMs || '—'} ms · LCP: ${r.lcpMs} ms (${r.lcpElemento}) · CLS: ${r.cls}
- Peso: ${r.totalKb} KB · ${Object.entries(r.porTipo).map(([k, v]) => `${k} ${v.n}/${v.kb}KB`).join(' · ')}
- Scroll: ${s.cuadros} cuadros · p50 ${s.p50} ms · p95 ${s.p95} ms · máx ${s.max} ms · >33ms: ${s.sobre33ms} · >50ms: ${s.sobre50ms}
- Long tasks en carga: ${r.longtasksCarga.map((t) => t.ms + 'ms@' + t.t).join(', ') || 'ninguna'} · durante scroll: ${s.longtasksDuranteScroll.map((t) => t.ms + 'ms').join(', ') || 'ninguna'}
- Cuadros lentos: ${s.cuadrosLentos.map((c) => `${c.ms}ms en ${c.seccion} (y=${c.y})`).join(' · ') || 'ninguno'}
- Errores: ${r.errores.join(' | ') || 'ninguno'} · HTTP ≥400: ${r.errores4xx5xx.join(' | ') || 'ninguno'}
- Sin compresión: ${r.sinCompresion.join(', ') || 'ninguno'}
- Sin caché larga: ${r.sinCacheLarga.join(', ') || 'ninguno'}
- Imágenes sobredimensionadas: ${r.imagenesSobredimensionadas.map((i) => `${i.natural}px>${i.mostrado}px ${i.src}`).join(' · ') || 'ninguna'}
- backdrop-filter activos: ${r.backdropFilter.join(', ') || 'ninguno'} · animaciones corriendo: ${r.animacionesCorriendo.length} · SW controla: ${r.swControla} · DOM: ${r.domNodos} nodos
`;
}

(async () => {
  const browser = await chromium.launch();
  const resultados = [];
  for (const url of urls) {
    for (const [nombre, perfil] of Object.entries(PERFILES)) {
      for (const frio of [true, false]) {
        process.stdout.write(`Midiendo ${nombre} ${frio ? 'fría' : 'caliente'} ${url}...\n`);
        try {
          resultados.push(await medir(browser, url, nombre, perfil, frio));
        } catch (e) {
          resultados.push({ perfil: nombre, url, cache: frio ? 'fria' : 'caliente', fallo: e.message });
        }
      }
    }
  }
  await browser.close();

  const dir = path.join(__dirname, 'reportes');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const md = `# Diagnóstico ${stamp}\n\n` + resultados.map((r) => r.fallo ? `### ${r.perfil} ${r.url}\nFALLÓ: ${r.fallo}\n` : resumen(r)).join('\n');
  fs.writeFileSync(path.join(dir, `${stamp}.json`), JSON.stringify(resultados, null, 2));
  fs.writeFileSync(path.join(dir, `${stamp}.md`), md);
  console.log('\n' + md);
  console.log(`Reporte: tests/perf/reportes/${stamp}.md`);
})();
