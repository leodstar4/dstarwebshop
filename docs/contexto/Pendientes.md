---
tags: [contexto]
---
# Pendientes

La lista completa y priorizada está en [[PLANNER]]; la guía para publicar esta versión, en [[OPERACION]].

Ya resueltos:

- Hasta el 2026-10-17: términos ([[terminos.html]]), stock real ([[stock-store.js]], [[stock.js]]), alertas de pedidos con problemas, enlaces de redes, límite de peticiones ([[rate-limit.js]]), CSP sin `'unsafe-inline'` ([[csp-hashes.js]]), panel de pedidos ([[pedidos.html]]), SEO básico ([[producto-meta.js]], [[sitemap.js]]), `viewport-fit=cover` y el indicador SCROLL ([[style.css]]).
- Cambios locales del 2026-10-19 y sus correcciones, todavía sin publicar ([[Flujo de compra]]):
  - Sin OXXO y en modo binario. Checkout de 15 min y apartado de 25 ([[mp-preference.js]]).
  - Inventario persistente con reservas, ajustes con motivo y poda del libro ([[stock-store.js]]).
  - Webhook que encola un trabajo firmado y conciliación cada 10 min ([[jobs.js]], [[reconcile.js]]).
  - Seguimiento privado por token ([[seguimiento.html]]) y panel con estados de preparación.
  - Catálogo editable ([[catalog-store.js]]) y correo con [[Resend]] o SMTP ([[mail.js]]).
  - Aviso de privacidad ([[privacidad.html]]) y campos del proveedor ([[legal.js]], [[datos-tienda.js]]).
  - Correcciones: pedidos legacy que nunca se despachan ni se re-notifican; tarjeta rechazada que no libera el apartado; reintento de preferencia tras una falla de Mercado Pago y `restart: true` si venció; fallas de Skydropx antes del POST como `failed`; conciliación que ignora pedidos terminados; respaldo de `AbortController` en [[cart-store.js]] para iOS 15.
- [[PANEL_PASSWORD]] ya está en `.env.example`, con [[RESEND_API_KEY]], [[MAIL_FROM]] y las `SMTP_*`.
- Configurados en Netlify (según el dueño, 2026-10-29): [[PANEL_PASSWORD]] y [[MP_WEBHOOK_SECRET]], y el webhook de pagos registrado en Mercado Pago ([[mp-webhook.js]]).
- Cambios locales del 2026-10-29, todavía sin commit:
  - La tienda ya no espera a `/api/catalogo`: [[cart-store.js]] arranca con la copia `dstar_catalog` o [[products-data.js]] y [[app.js]] se actualiza con `dstar:catalog`. Solo la ficha de una pieza que no está en local y [[checkout.js]] esperan, con tope de 5 s también sin `AbortController`. [[catalogo.js]] tiene caché de CDN de 15 s ([[Flujo de compra]]).
  - Analítica propia sin cookies: [[metricas.js]], [[evento.js]], [[analytics.js]] y la sección ANALÍTICA del panel ([[analitica.js]]).
  - Avisos por correo (próximo drop y talla agotada): [[avisame.js]], [[avisos.js (lib)]], [[avisos.js (handlers)]] y la sección AVISOS Y LISTA DE DROPS del panel.
  - `viewport-fit=cover` y safe areas en [[checkout.html]]; canonical, `og:*` y `twitter:card` en [[privacidad.html]]; [[operacion.css]] con BEM (`.ops__*`) y custom properties; versiones `?v=` subidas.
- Cambios locales del 2026-11-10, todavía sin commit junto con los del 2026-10-29 (avisos, analítica y [[metricas.js]] incluidos):
  - Botones: consolidados en un solo bloque de [[style.css]] ("BOTONES — diseño de producción"), sin `!important`, con el aspecto de la versión publicada; el dueño rechazó los dos rediseños de ese día (liquid glass y placas con esquina cortada). Ripple y reflejo de puntero delegados en [[app.js]]; se quitó `initButtonEffects` de [[gsap-animations.js]] ([[Rendimiento y PWA]], [[Reglas de estilo]]).
  - Carrito accesible (`role="dialog"`, `inert`, foco, Escape y Tab), miniatura que vuela al ícono, píldora del nav, inclinación del logo del hero y view transition `pd-photo` de la tarjeta a la ficha.
  - Hero rehecho sin `scale` sobre texto (`initHero` de [[gsap-animations.js]]) y botones del museo en cápsulas de vidrio con iconos ([[museo.css]], [[museo.html]]); detalle en [[Rendimiento y PWA]].
  - [[sw.js]] en `dstar-v19`, [[style.css]] en `?v=44`, [[gsap-animations.js]] en `?v=22`, [[app.js]] en `?v=42` y [[museo.css]] y [[museo.js]] en `?v=4`; [[CLAUDE]] al día (Node 22 y Functions v2, sin `npm run build` ni `npm run lh`).
  - Museo DSTAR (Fase 4): página aparte [[museo.html]] con [[museo.css]] y [[museo.js]] sobre [[Three.js]] servido desde el sitio; recorrido en 3D con una sala por drop y lista 2D de respaldo ([[Rendimiento y PWA]]). Entradas desde la tienda: enlace MUSEO en el header y el menú móvil y bloque `.museo-teaser` en [[index.html]]. Pruebas en [[museo.spec.js]]; [[sitemap.js]] ya la lista. En la segunda tanda pasó a tercera persona: se guía a un gato negro modelado por código, la cámara se orbita arrastrando y el botón `#museoCamara` la pone de frente o detrás; además [[museo.html]] ya carga [[metricas.js]], así que sus visitas entran a la analítica.
  - Inmersión: banda tipográfica `.kinetic` en [[index.html]], animaciones ligadas al scroll, transición entre páginas `pageOut`/`pageIn` e inclinación 3D de las tarjetas (`initCardTilt` de [[app.js]]), todo en el bloque INMERSIÓN de [[style.css]] ([[Rendimiento y PWA]]).

Antes de publicar:

- Averiguar por qué Netlify no desplegó el push del commit `4d7afee`: está en `origin/main`, pero producción sigue en `ee825c3` ([[sw.js]] `dstar-v13`, `style.css?v=38`). Resolverlo antes de publicar lo nuevo ([[Despliegue]]).
- Hacer commit de todo el trabajo local (2026-10-29 y 2026-11-10, incluido el museo, cuyos archivos nuevos todavía no están en git) y publicarlo; producción se despliega con `git push` a `main` ([[Despliegue]]).

- Respaldar el blob `stock/vendidas` y los pedidos desde Netlify antes del primer deploy: [[stock-store.js]] migra el inventario a la versión 2 al primer acceso y el código anterior no entiende el formato nuevo ([[OPERACION]]).
- Hacer una compra de prueba real autorizada y verificar pago, apartado y descuento de stock, guía, correo, seguimiento y conciliación. Las pruebas automáticas usan proveedores simulados: [[payment-service.js]], [[reconcile.js]].
- Completar en el panel los datos legales reales (razón social, domicilio, teléfono, correos de atención y privacidad) y revisar el aviso: [[admin-store.js]], [[privacidad.html]], [[terminos.html]].
- Medir peso y medidas plegadas reales de cada prenda; hoy son estimaciones de 0.4 kg y 30 × 25 × 3 cm: [[catalog-store.js]], [[quotes.js]].

Dónde toca cada tema pendiente:

- Probar en un iPhone físico:
  - Compra completa: catálogo remoto, checkout, regreso a [[seguimiento.html]] y carrito. Incluye un iOS 15 sin `AbortController` ([[cart-store.js]]).
  - Logo 3D con modo de ahorro y video del loader (`logo-3d-loader.mp4` con `mix-blend-mode: lighten`, también con autoplay bloqueado, donde debe quedar el póster).
  - Que drops y lookbook aparezcan, y las safe areas con notch.
  - Archivos: [[index.html]], [[loader.js]], [[logo-3d.js]], [[gsap-animations.js]], [[style.css]].
- Probar con un correo real el aviso de talla y su enlace de baja, que se arma con [[URL_SITIO]]: [[avisos.js (lib)]], [[avisame.js]].
- El inventario sigue en un solo blob ([[stock-store.js]] sobre [[storage.js]]). Cada apartado, venta o ajuste reescribe el documento completo con escritura condicional, y con muchos compradores a la vez en un drop muy grande habrá reintentos y 409. Para volumen alto: paginar pedidos y mover el libro a una base transaccional ([[OPERACION]]).
- La conciliación revisa 20 pedidos por lote; con muchos pedidos activos, la vuelta completa tarda más de 10 minutos: [[reconcile.js]].
- Correo con dominio propio (SPF/DKIM) para usar [[Resend]] o un SMTP propio en vez de [[Gmail SMTP]]: [[mail.js]].
- Enlace de TikTok cuando exista la cuenta: [[index.html]] y los footers.
- Probar el museo en un teléfono real: fluidez del recorrido (ahora dibuja de forma continua por el gato; vigilar calor y batería), arrastrar para orbitar la cámara, el botón VER GATO / VER SALA, tocar el piso para mandar al gato, tocar una obra, la ficha y las safe areas. Hasta ahora solo corrió en los navegadores de Playwright: [[museo.html]], [[museo.js]], [[museo.css]].
- Reactivar el formulario del próximo drop (`#dropAlert`) en [[index.html]]: se quitó el 2026-11-10 a petición del dueño, de forma temporal. Al volver a ponerlo basta el marcado, porque siguen `initAlertForm` en [[app.js]], los estilos `.alert-form--drop` de [[style.css]], [[avisame.js]] con `tipo: 'drop'` y la lista del panel; hay que quitar el `test.skip` de [[avisos-y-catalogo.spec.js]].
- Confirmar en un iPhone real que la página sigue respondiendo después de abrir y cerrar el carrito: en el WebKit headless de Playwright `requestAnimationFrame` a veces deja de disparar tras abrirlo, y el commit `4d7afee` se comporta igual ([[Pruebas y calidad]]). Archivos: [[app.js]], [[style.css]].

Sugeridos tras la auditoría de fluidez del 2026-10-12, todavía no están en [[PLANNER]]:

- Probar en dispositivos reales (iPhone y Android) el video del loader, el logo en el worker y las fotos AVIF en Safari: [[index.html]], [[logo-3d-worker.js]], [[logo-3d.js]], [[app.js]].
  - Incluye el MP4 re-exportado del 2026-10-13 (sin cuadros B), el canvas a DPR 3 y el salto de hasta 3 cuadros cuando el decodificador se atrasa.
  - También el worker creado desde el loader con `hold` y cuánto tarda en irse el loader.
  - Hasta ahora solo se probó con emulación en Chrome (CPU limitada 4x) y en el WebKit de Playwright.

Detalles conocidos, menores:

- La lista del próximo drop no recibe altas nuevas mientras el formulario esté fuera del home, y no se envía desde la tienda: el panel la exporta en CSV para mandarla con otra herramienta de correo, que debe incluir la baja ([[pedidos.js (js)]]).
- AVISAR manda como máximo 10 correos por clic ([[avisos.js (lib)]]); con muchas personas esperando la misma talla hay que repetirlo.
- Playwright en Mobile (WebKit): `audit-bugs.spec.js:74` (stock por talla) y `flujo-compra.spec.js:87` (lightbox) fallan de forma intermitente. El 2026-11-10 una corrida completa pasó sin fallos (282 aprobadas, 36 omitidas) y la última, tras el hero y los botones del museo, volvió a fallar en esas dos (280 aprobadas, 36 omitidas); repetidas solas pasan 3 de 6 ([[Pruebas y calidad]]).
- El gato del museo ([[museo.js]], `createCat`) se modeló solo con la descripción en texto de la cabeza: el dibujo de referencia no llegó adjunto. Ajustarlo cuando se tenga.
- [[analitica.js]] y [[avisos.js (handlers)]] comparten con [[pedidos.js (handlers)]] el límite `panel` de 120 peticiones cada 10 min, y el panel llama a las tres al entrar ([[Seguridad]]).

Parte de: [[DSTAR]]
