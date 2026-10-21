---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Pruebas

Pruebas E2E, medición de rendimiento y su configuración.

Parte de: [[DSTAR]]

## Contenido

- [[audit-bugs.spec.js]] — Pruebas de regresión de la auditoría: stock por talla, localStorage corrupto, código postal del checkout, firma del webhook y origen.
- [[correcciones.test.cjs]] — Pruebas de backend de las correcciones: pedidos legacy sin guía, stock ni correos, conciliación que ignora terminados, tarjeta rechazada que conserva el apartado, Skydropx sin credenciales como failed, reintento tras falla de Mercado Pago, preferencia vencida con restart y poda del inventario.
- [[diagnostico.js]] — Mide fluidez y carga con Playwright en varios perfiles y escribe reportes en tests/perf/reportes.
- [[flujo-compra.spec.js]] — Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto, selector de talla, lightbox de la galería (teclado, zoom y cierre con Escape) y redirección a un Mercado Pago simulado con checkout_id.
- [[operacion.spec.js]] — Pruebas E2E de la operación: el panel no ofrece reembolsos ni devoluciones y el ajuste conserva su ID al reintentar, seguimiento consultado al servidor que descuenta del carrito una sola vez, catálogo remoto con pieza nueva y datos legales en privacidad.html.
- [[operacion.test.cjs]] — Pruebas de backend con node --test y almacén en memoria: migración de inventario, reservas concurrentes, ajustes, cotización ligada, paquete, límite de peticiones, estados que no despachan, refund/return rechazados, seguimiento con token, conciliación de otro intento, firma de trabajos y checkout sin OXXO.
- [[playwright.config.js]] — Configuración de Playwright (proyectos desktop, tablet y móvil; 2 workers en local, 1 en CI).
- [[seguridad-y-seo.spec.js]] — Pruebas de la auditoría del 2026-10-17: CSP real sin violaciones por página, metadatos de SEO y noindex, 404, enlaces a Instagram, edge functions producto-meta y sitemap, 429 de cotizar-envio y panel de pedidos.
- [[stock-y-animaciones.spec.js]] — Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue y ningún elemento renderizado (incluidos los .split-char) se quede con opacidad menor a 0.05.

