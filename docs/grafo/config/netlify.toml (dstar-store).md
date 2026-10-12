---
tags: [codigo, config]
ruta: "dstar-store/netlify.toml"
lineas: 178
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# netlify.toml (dstar-store)

`dstar-store/netlify.toml` · 178 líneas

Configuración de Netlify: functions, redirects (/api/* y rutas internas bloqueadas), headers de seguridad y caché.

Parte de: [[Configuración]]

## Conexiones

- Referencia a: [[producto.html]], [[playwright.config.js]], [[optimize-images.js (dstar-store)]], [[.lighthouserc.js]], [[sw.js]], [[manifest.webmanifest]]
- Enruta /api/* a: [[cotizar-envio.js]], [[mp-preference.js]], [[mp-webhook.js]], [[stock.js]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Cloudinary]], [[Google Fonts]], [[Lighthouse]], [[http-server]]

## Resumen

17 redirects y 9 bloques de headers.

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `453b5f9` · Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache
- 2026-10-10 · `8e69a51` · Logo 3D girando (AVIF animada) en loader y hero, script de diagnóstico de fluidez
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

