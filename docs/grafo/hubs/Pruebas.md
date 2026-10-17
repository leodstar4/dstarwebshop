---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Pruebas

Pruebas E2E, medición de rendimiento y su configuración.

Parte de: [[DSTAR]]

## Contenido

- [[audit-bugs.spec.js]] — Pruebas de regresión de la auditoría: stock por talla, localStorage corrupto, código postal del checkout, firma del webhook y origen.
- [[diagnostico.js]] — Mide fluidez y carga con Playwright en varios perfiles y escribe reportes en tests/perf/reportes.
- [[flujo-compra.spec.js]] — Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto, selector de talla y lightbox de la galería (teclado, zoom y cierre con Escape).
- [[playwright.config.js]] — Configuración de Playwright (proyectos desktop, tablet y móvil; 2 workers en local, 1 en CI).
- [[seguridad-y-seo.spec.js]] — Pruebas de la auditoría del 2026-10-17: CSP real sin violaciones por página, metadatos de SEO y noindex, 404, enlaces a Instagram, edge functions producto-meta y sitemap, 429 de cotizar-envio y panel de pedidos.
- [[stock-y-animaciones.spec.js]] — Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue y ningún elemento renderizado (incluidos los .split-char) se quede con opacidad menor a 0.05.

