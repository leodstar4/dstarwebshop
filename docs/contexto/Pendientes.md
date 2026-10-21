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

Antes de publicar:

- Respaldar el blob `stock/vendidas` y los pedidos desde Netlify antes del primer deploy: [[stock-store.js]] migra el inventario a la versión 2 al primer acceso y el código anterior no entiende el formato nuevo ([[OPERACION]]).
- Configurar [[PANEL_PASSWORD]] (16 caracteres o más) y [[MP_WEBHOOK_SECRET]] en Netlify (ámbito Functions). Sin la primera el panel responde 503 ([[http.js]]). Sin la segunda, [[mp-webhook.js]] rechaza los avisos, [[jobs.js]] no puede firmar trabajos y [[mp-preference.js]] no crea pagos.
- Registrar en Mercado Pago el webhook de pagos en `/.netlify/functions/mp-webhook` del sitio, con eventos de pagos: [[mp-webhook.js]].
- Hacer una compra de prueba real autorizada y verificar pago, apartado y descuento de stock, guía, correo, seguimiento y conciliación. Las pruebas automáticas usan proveedores simulados: [[payment-service.js]], [[reconcile.js]].
- Completar en el panel los datos legales reales (razón social, domicilio, teléfono, correos de atención y privacidad) y revisar el aviso: [[admin-store.js]], [[privacidad.html]], [[terminos.html]].
- Medir peso y medidas plegadas reales de cada prenda; hoy son estimaciones de 0.4 kg y 30 × 25 × 3 cm: [[catalog-store.js]], [[quotes.js]].

Dónde toca cada tema pendiente:

- Probar en un iPhone físico:
  - Compra completa: catálogo remoto, checkout, regreso a [[seguimiento.html]] y carrito. Incluye un iOS 15 sin `AbortController` ([[cart-store.js]]).
  - Logo 3D con modo de ahorro y video del loader (`logo-3d-loader.mp4` con `mix-blend-mode: lighten`, también con autoplay bloqueado, donde debe quedar el póster).
  - Que drops y lookbook aparezcan, y las safe areas con notch.
  - Archivos: [[index.html]], [[loader.js]], [[logo-3d.js]], [[gsap-animations.js]], [[style.css]].
- `initApp` de [[app.js]] (y [[checkout.js]] y [[gsap-animations.js]]) espera hasta 5 s a `/api/catalogo` ([[catalogo.js]]) antes de pintar. Si la función tarda, la página se queda sin productos ese tiempo; en iOS 15 sin `AbortController` no hay corte: [[cart-store.js]].
- El inventario sigue en un solo blob ([[stock-store.js]] sobre [[storage.js]]). Cada apartado, venta o ajuste reescribe el documento completo con escritura condicional, y con muchos compradores a la vez en un drop muy grande habrá reintentos y 409. Para volumen alto: paginar pedidos y mover el libro a una base transaccional ([[OPERACION]]).
- La conciliación revisa 20 pedidos por lote; con muchos pedidos activos, la vuelta completa tarda más de 10 minutos: [[reconcile.js]].
- Correo con dominio propio (SPF/DKIM) para usar [[Resend]] o un SMTP propio en vez de [[Gmail SMTP]]: [[mail.js]].
- Enlace de TikTok cuando exista la cuenta: [[index.html]] y los footers.

Sugeridos tras la auditoría de fluidez del 2026-10-12, todavía no están en [[PLANNER]]:

- Probar en dispositivos reales (iPhone y Android) el video del loader, el logo en el worker y las fotos AVIF en Safari: [[index.html]], [[logo-3d-worker.js]], [[logo-3d.js]], [[app.js]].
  - Incluye el MP4 re-exportado del 2026-10-13 (sin cuadros B), el canvas a DPR 3 y el salto de hasta 3 cuadros cuando el decodificador se atrasa.
  - También el worker creado desde el loader con `hold` y cuánto tarda en irse el loader.
  - Hasta ahora solo se probó con emulación en Chrome (CPU limitada 4x) y en el WebKit de Playwright.

Detalles conocidos, menores:

- [[checkout.html]] carga [[style.css]] pero no tiene `viewport-fit=cover`, así que el bloque SAFE AREAS no aplica ahí.
- [[pago-pendiente.html]] todavía dice "Si pagaste en OXXO o por SPEI", aunque esos medios ya están excluidos; ya no es página de regreso de Mercado Pago.
- [[app.js]] y [[gsap-animations.js]] cambiaron (esperan `DSTAR_CATALOG_READY`) pero conservan `app.js?v=37` y `gsap-animations.js?v=18` en los HTML; con el caché de 1 día de los `.js`, un visitante recurrente puede tener la versión anterior junto a `cart-store.js?v=3` ([[Rendimiento y PWA]]).
- [[operacion.css]] (estilos de [[seguimiento.html]] y [[privacidad.html]]) usa colores fijos y clases sin BEM (`.ops`, `.eyebrow`) en vez de las custom properties de [[style.css]] ([[Reglas de estilo]]).
- [[privacidad.html]] es indexable pero no tiene canonical, `og:*` ni `twitter:card`, a diferencia de las otras páginas públicas ([[Despliegue]]).

Parte de: [[DSTAR]]
