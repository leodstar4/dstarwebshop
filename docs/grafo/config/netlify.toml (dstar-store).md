---
tags: [codigo, config]
ruta: "dstar-store/netlify.toml"
lineas: 207
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# netlify.toml (dstar-store)

`dstar-store/netlify.toml` · 207 líneas

Configuración de Netlify: functions, redirects (/api/* y rutas internas bloqueadas), headers de seguridad (CSP con hashes en script-src que escribe scripts/csp-hashes.js), no-store y X-Robots-Tag en /pedidos y /seguimiento (este también con Referrer-Policy no-referrer), reconcile-payments programada cada 10 min y caché.

Parte de: [[Configuración]]

## Conexiones

- Referencia a: [[producto.html]], [[pedidos.html]], [[seguimiento.html]], [[playwright.config.js]], [[optimize-images.js (dstar-store)]], [[.lighthouserc.js]], [[sw.js]], [[manifest.webmanifest]]
- Enruta /api/* a: [[admin-store.js]], [[catalogo.js]], [[cotizar-envio.js]], [[datos-tienda.js]], [[mp-preference.js]], [[mp-webhook.js]], [[payment-jobs-background.js]], [[pedidos.js (functions)]], [[reconcile-payments.js]], [[seguimiento.js (functions)]], [[stock.js]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Cloudinary]], [[Google Fonts]], [[Lighthouse]], [[http-server]]

## Resumen

17 redirects y 13 bloques de headers.

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `8e69a51` · Logo 3D girando (AVIF animada) en loader y hero, script de diagnóstico de fluidez

