---
tags: [contexto]
---
# Pruebas y calidad

- E2E con [[Playwright]]: [[flujo-compra.spec.js]], [[audit-bugs.spec.js]], [[stock-y-animaciones.spec.js]] y [[seguridad-y-seo.spec.js]], configuradas en [[playwright.config.js]]. [[flujo-compra.spec.js]] incluye el lightbox de la galería: abre, navega con flechas, acerca y aleja con `+`/`-` y cierra con Escape devolviendo el foco a la foto vista.
- [[seguridad-y-seo.spec.js]] (2026-10-17): inyecta la CSP real de [[netlify.toml (dstar-store)]] en cada página, indexable o privada, y falla con cualquier violación o error de JS en los 3 navegadores; comprueba que `script-src` no tenga `'unsafe-inline'` y que sus hashes coincidan con [[csp-hashes.js]]; canonical e imagen para compartir en las páginas indexables y `noindex` en las privadas; la página [[404.html]]; que no queden `href="#"` y que haya enlace a Instagram; las edge functions [[producto-meta.js]] y [[sitemap.js]] sin red; el 429 de [[cotizar-envio.js]]; y el panel de pedidos ([[pedidos.html]] con la función simulada, y [[pedidos.js (functions)]] con 503 sin [[PANEL_PASSWORD]] y 401 con una contraseña incorrecta).
- [[playwright.config.js]] usa 2 workers en local (1 en CI): con los workers por defecto la máquina se saturaba y aparecían fallos intermitentes ajenos al cambio. Al 2026-10-17 pasan 234 y se omiten 33.
- Viewports: 375px, 768px y 1440px o más.
- Accesibilidad: [[index.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[terminos.html]] y los artículos del blog tienen `<main>`; las tarjetas de producto de [[app.js]] ya no llevan `aria-label` (el enlace toma el nombre de su contenido y la foto lleva `alt=""`; las agotadas no son enlace y su foto conserva el nombre); en [[gsap-animations.js]] el SplitText que parte solo en líneas va con `aria: 'none'`. Lighthouse de accesibilidad del index: 100.
- Checklist manual antes de cada deploy: [[TESTING]].
- Rendimiento: [[diagnostico.js]] y [[Lighthouse]].
- Antes de cada commit se revisa que no queden console.log de debug, código muerto ni errores de accesibilidad ([[CLAUDE]]).

Parte de: [[DSTAR]]
