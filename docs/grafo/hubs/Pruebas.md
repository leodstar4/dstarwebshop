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
- [[flujo-compra.spec.js]] — Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto y selector de talla.
- [[playwright.config.js]] — Configuración de Playwright (proyectos desktop, tablet y móvil).
- [[stock-y-animaciones.spec.js]] — Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue.

