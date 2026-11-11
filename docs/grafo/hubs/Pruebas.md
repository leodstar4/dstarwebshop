---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Pruebas

Pruebas E2E, medición de rendimiento y su configuración.

Parte de: [[DSTAR]]

## Contenido

- [[audit-bugs.spec.js]] — Pruebas de regresión de la auditoría: stock por talla, localStorage corrupto, código postal del checkout, firma del webhook y origen.
- [[avisos-analitica.test.cjs]] — Pruebas de backend con node --test: analítica agregada sin datos personales, robots, eventos desconocidos y productos inexistentes ignorados, contraseña en /api/analitica, validación de avisos (correo, consentimiento, talla) y aviso de talla enviado una sola vez, solo con stock y con baja que funciona.
- [[avisos-y-catalogo.spec.js]] — Pruebas E2E: la tienda pinta sin esperar al catálogo remoto, el catálogo remoto actualiza las tarjetas y queda en caché para la siguiente visita, formulario del próximo drop con consentimiento (en test.skip mientras el formulario no esté en index.html), aviso solo para las tallas agotadas en la ficha y panel con embudo y avisos.
- [[correcciones.test.cjs]] — Pruebas de backend de las correcciones: pedidos legacy sin guía, stock ni correos, conciliación que ignora terminados, tarjeta rechazada que conserva el apartado, Skydropx sin credenciales como failed, reintento tras falla de Mercado Pago, preferencia vencida con restart y poda del inventario.
- [[diagnostico.js]] — Mide fluidez y carga con Playwright en varios perfiles y escribe reportes en tests/perf/reportes.
- [[flujo-compra.spec.js]] — Pruebas E2E del flujo de compra: carrito, checkout vacío, menú móvil, página de producto, selector de talla, lightbox de la galería (teclado, zoom y cierre con Escape) y redirección a un Mercado Pago simulado con checkout_id.
- [[museo.spec.js]] — Pruebas E2E del museo: la lista muestra todas las piezas activas con enlace a producto.html?id= y sin desborde horizontal, sin WebGL cae a la lista con aviso, con movimiento reducido abre en lista, recorrido 3D (ENTRAR, Anterior/Siguiente, ficha, botones de 44 px y salto a la ficha del producto; se omite sin WebGL), probador (PROBAR, combinar dos prendas, QUITAR y #museoQuitar, con Cloudinary sustituido por una imagen local con CORS; se omite sin WebGL) y entradas desde el home (.museo-teaser, header y menú móvil) con regreso a la tienda.
- [[operacion.spec.js]] — Pruebas E2E de la operación: el panel no ofrece reembolsos ni devoluciones y el ajuste conserva su ID al reintentar, seguimiento consultado al servidor que descuenta del carrito una sola vez, catálogo remoto con pieza nueva y datos legales en privacidad.html.
- [[operacion.test.cjs]] — Pruebas de backend con node --test y almacén en memoria: migración de inventario, reservas concurrentes, ajustes, cotización ligada, paquete, límite de peticiones, estados que no despachan, refund/return rechazados, seguimiento con token, conciliación de otro intento, firma de trabajos y checkout sin OXXO.
- [[playwright.config.js]] — Configuración de Playwright (proyectos desktop, tablet y móvil; 2 workers en local, 1 en CI).
- [[seguridad-y-seo.spec.js]] — Pruebas de la auditoría del 2026-10-17: CSP real sin violaciones por página, metadatos de SEO y noindex, 404, enlaces a Instagram, edge functions producto-meta y sitemap, 429 de cotizar-envio y panel de pedidos; museo.html está entre las páginas indexables que revisa.
- [[stock-y-animaciones.spec.js]] — Pruebas de stock vivo y alertas (descuento por pago, reintento sin doble descuento, sobreventa, monto distinto) y de que el contenido se vea aunque GSAP no cargue y ningún elemento renderizado (incluidos los .split-char) se quede con opacidad menor a 0.05.

