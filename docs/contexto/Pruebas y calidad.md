---
tags: [contexto]
---
# Pruebas y calidad

- E2E con [[Playwright]]: [[flujo-compra.spec.js]], [[audit-bugs.spec.js]], [[stock-y-animaciones.spec.js]], [[seguridad-y-seo.spec.js]] y [[operacion.spec.js]], configuradas en [[playwright.config.js]] (servidor `http-server` en `127.0.0.1:8888`). [[flujo-compra.spec.js]] incluye el lightbox de la galería: abre, navega con flechas, acerca y aleja con `+`/`-` y cierra con Escape devolviendo el foco a la foto vista. El pago termina en un Mercado Pago simulado (`https://www.mercadopago.com.mx/checkout/test` con `page.route`) y ya no espera que el carrito se vacíe en el regreso.
- Backend con `node --test` (`npm run test:backend`): [[operacion.test.cjs]] y [[correcciones.test.cjs]].
  - Usan el almacén en memoria de [[storage.js]] ([[DSTAR_MEMORY_STORE]] con `NODE_ENV=test`, `resetForTests` antes de cada caso) y proveedores simulados. Las pruebas de servidor de los `.spec.js` usan el mismo almacén.
  - Cubren inventario y reservas, cotizaciones, firma de trabajos, webhook encolado, seguimiento con token, checkout sin OXXO y las correcciones: pedidos legacy, tarjeta rechazada, Skydropx sin credenciales, reintento y vencimiento de la preferencia, conciliación de terminados y poda del inventario.
  - El 2026-10-20 pasan 34 de 34.
- [[operacion.spec.js]]: el panel no ofrece reembolsos ni devoluciones y un ajuste conserva su ID al reintentar; [[seguimiento.html]] consulta al servidor y resta del carrito una sola vez; el catálogo remoto muestra una pieza nueva sin perder el carrito; [[privacidad.html]] muestra los datos legales.
- [[seguridad-y-seo.spec.js]] (2026-10-17): inyecta la CSP real de [[netlify.toml (dstar-store)]] en cada página, indexable o privada, y falla con cualquier violación o error de JS en los 3 navegadores; comprueba que `script-src` no tenga `'unsafe-inline'` y que sus hashes coincidan con [[csp-hashes.js]]; canonical e imagen para compartir en las páginas indexables y `noindex` en las privadas; la página [[404.html]]; que no queden `href="#"` y que haya enlace a Instagram; las edge functions [[producto-meta.js]] y [[sitemap.js]] sin red; el 429 de [[cotizar-envio.js]]; y el panel de pedidos ([[pedidos.html]] con la función simulada, y [[pedidos.js (functions)]] con 503 sin [[PANEL_PASSWORD]] y 401 con una contraseña incorrecta).
- [[playwright.config.js]] usa 2 workers en local (1 en CI): con los workers por defecto la máquina se saturaba y aparecían fallos intermitentes ajenos al cambio. Al 2026-10-19, según [[OPERACION]], pasan 246 y se omiten 33 de 279; las omisiones son pruebas de servidor que solo corren en Desktop y el escenario que depende de que el navegador restaure bfcache. Todas usan proveedores simulados: no sustituyen una compra real ni la prueba en iPhone físico ([[Pendientes]]).
- Viewports: 375px, 768px y 1440px o más.
- Accesibilidad: [[index.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[terminos.html]] y los artículos del blog tienen `<main>`; las tarjetas de producto de [[app.js]] ya no llevan `aria-label` (el enlace toma el nombre de su contenido y la foto lleva `alt=""`; las agotadas no son enlace y su foto conserva el nombre); en [[gsap-animations.js]] el SplitText que parte solo en líneas va con `aria: 'none'`. Lighthouse de accesibilidad del index: 100.
- Checklist manual antes de cada deploy: [[TESTING]].
- Rendimiento: [[diagnostico.js]] y [[Lighthouse]].
- Antes de cada commit se revisa que no queden console.log de debug, código muerto ni errores de accesibilidad ([[CLAUDE]]).

Parte de: [[DSTAR]]
