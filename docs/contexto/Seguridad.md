---
tags: [contexto]
---
# Seguridad

Headers, CSP y redirects están en [[netlify.toml (dstar-store)]].

- **Webhook.** [[mp-webhook.js]] rechaza avisos sin firma válida de [[MP_WEBHOOK_SECRET]]; sin la variable rechaza todo, salvo en `netlify dev`. En producción no procesa el pago en la petición: encola un trabajo firmado con [[jobs.js]] (HMAC con [[MP_WEBHOOK_SECRET]] sobre la hora y el cuerpo, enviado a [[URL_SITIO]]). [[payment-jobs-background.js]] responde 401 si la firma no coincide o tiene más de 5 minutos. [[mp-preference.js]] también se niega a crear pagos sin [[MP_ACCESS_TOKEN]], [[MP_WEBHOOK_SECRET]] o una [[URL_SITIO]] HTTPS.
- **Un solo efecto por pago.** [[payment-service.js]] procesa cada pago bajo un lock con vencimiento (`claim`/`release` de [[orders-store.js]]) y vuelve a consultar el pago dentro del lock, así un aviso atrasado no revierte un estado más nuevo. [[storage.js]] lee con consistencia fuerte y escribe de forma condicional por etag (12 reintentos; luego 409). El stock se descuenta una vez por pago ([[stock-store.js]]) y una guía con respuesta ambigua nunca se vuelve a comprar (ver [[Flujo de compra]]).
- **Precios en el servidor.** Precio, stock, peso y paquete salen del catálogo de [[catalog-store.js]]; la cotización queda ligada a destino y carrito ([[quotes.js]]) y el precio de la tarifa se vuelve a consultar antes de pagar. Si no se puede leer el catálogo o el inventario, el pago falla cerrado.
- **Origen.** [[cotizar-envio.js]], [[mp-preference.js]] y las funciones del panel rechazan peticiones de otros sitios (`origenPermitido` de [[validate.js]]). [[http.js]] limita los cuerpos JSON a 100 KB.
- **Límite de peticiones** por IP con [[rate-limit.js]], ventana fija de 10 minutos:

  | Función | Máximo |
  |---|---|
  | [[cotizar-envio.js]] | 20 |
  | [[mp-preference.js]] | 10 |
  | [[stock.js]] | 120 |
  | [[pedidos.js (handlers)]] | 120 |
  | [[admin-store.js]] | 100 |
  | [[seguimiento.js (handlers)]] | 60 |

  Al pasarse responde 429 con `Retry-After`. La IP se guarda como hash sha256 en [[Netlify Blobs]] (store `limites`) con escritura condicional. Sin IP (llamadas internas o pruebas) no limita. Si el almacén falla, rechaza la petición 60 s; ya no hay respaldo en memoria. No se usó el rate limit nativo de [[Netlify]] porque el plan gratis permite 2 reglas y exige Functions v2.
- **Almacén en memoria solo en pruebas.** [[storage.js]] usa memoria únicamente con [[DSTAR_MEMORY_STORE]], `NODE_ENV=test` y sin `NETLIFY`; nunca configurarlo en Netlify. Fuera de producción (deploy previews) los stores llevan un sufijo por deploy y no tocan los datos reales.
- **Panel** ([[pedidos.html]], [[pedidos.js (js)]], [[pedidos.js (handlers)]], [[admin-store.js]]):
  - `admin()` de [[http.js]] exige `Authorization: Bearer` igual a [[PANEL_PASSWORD]], comparado con `timingSafeEqual` sobre hashes. Responde 503 si la variable falta o tiene menos de 16 caracteres, 401 si no coincide y 403 si el origen no es el sitio.
  - Las acciones `refund` y `return` no existen: el servidor responde "Acción no permitida".
  - El listado no devuelve `trackingToken`, `fingerprint` ni el lock.
  - El navegador guarda la contraseña en sessionStorage (`dstar_panel`) y solo muestra enlaces de etiqueta y rastreo que empiezan con `https://`. El registro manual de una guía también exige URLs HTTPS.
- **Seguimiento.** [[seguimiento.js (handlers)]] solo acepta POST con un pedido `dstar_<uuid>` y un token de 64 hex (32 bytes aleatorios de [[mp-preference.js]]), comparado con `timingSafeEqual`; si no coincide responde 404. No devuelve domicilio ni etiqueta. El token va en el hash de la URL, que no llega al servidor ni a los logs.
- **Headers sin caché.** `/pedidos.html`, `/pedidos`, `/seguimiento.html` y `/seguimiento` llevan `Cache-Control: no-store` y `X-Robots-Tag: noindex, nofollow`; los dos de seguimiento, además, `Referrer-Policy: no-referrer`. Las respuestas de las funciones que usan `reply` de [[http.js]] van con `no-store`, y [[sw.js]] no intercepta `/pedidos` ni `/seguimiento`.
- **Carrito.** Ya no se vacía por los parámetros de la URL de regreso, que no prueban el pago: [[gracias.js]] no toca `dstar_cart` y [[seguimiento.js (js)]] solo resta las piezas compradas después de que el servidor confirma el pago.
- **Catálogo editable.** `cleanProduct` de [[catalog-store.js]] valida id, precio, tallas, peso y medidas y solo acepta fotos HTTPS de `res.cloudinary.com`.
- **CSP sin `'unsafe-inline'` en `script-src`.**
  - Los scripts inline se movieron a [[loader.js]], [[checkout.js]] y [[gracias.js]]. Los handlers inline (`onerror`, `onclick`, `onload`) se cambiaron por listeners: imágenes con `data-fallback` y un listener de `error` en captura en [[app.js]] y [[checkout.js]], FAQ con `data-faq` y tallas por delegación en `#pdSizes`.
  - Quedan 3 scripts inline permitidos por hash: `speculationrules` y `css-pending` en [[index.html]] y la precarga de la primera foto en [[producto.html]]. [[seguimiento.html]] y [[privacidad.html]] no tienen scripts inline.
  - [[csp-hashes.js]] recalcula los hashes y escribe `script-src` en [[netlify.toml (dstar-store)]]: **correr `node scripts/csp-hashes.js` después de editar cualquier script inline**. Con `--check` solo verifica (el 2026-10-20 respondió "CSP al día"), y [[seguridad-y-seo.spec.js]] falla si la CSP no coincide con `scriptSrc()`.
  - Los `application/ld+json` no cuentan. `style-src` todavía permite `'unsafe-inline'`.
- **GSAP y enlaces.** [[GSAP]] se sirve desde el propio sitio (`js/vendor/`), así que la CSP no permite cdn.jsdelivr.net. Los enlaces externos llevan `rel="noopener noreferrer"`.
- **Otros headers.** Permissions-Policy y Cross-Origin-Opener-Policy. /dist/, /test-results/, /tests/, /netlify/ y archivos internos responden 404.
- **Worker y video del logo.** La CSP permite `worker-src 'self'`: el logo 3D de Chromium corre en [[logo-3d-worker.js]], cargado desde el propio sitio (lo crea [[loader.js]] o [[logo-3d.js]]). Si la CSP lo bloqueara, el worker falla y [[logo-3d.js]] cae al `<video>` en el hilo principal. El video del loader (`logo-3d-loader.mp4`) también sale del propio sitio, cubierto por `media-src 'self'`.
- **Secretos.** Solo por nombre en [[Variables de entorno]]; el `.env` real está en .gitignore. El panel muestra si cada servicio está configurado, no si las credenciales son válidas.

Parte de: [[DSTAR]]
