---
tags: [contexto]
---
# Seguridad

Headers, CSP y redirects están en [[netlify.toml (dstar-store)]].

- El webhook de [[Mercado Pago]] ([[mp-webhook.js]]) rechaza avisos sin firma válida y no puede crear dos guías para el mismo pago ([[orders-store.js]]).
- [[cotizar-envio.js]] y [[mp-preference.js]] rechazan peticiones de otros sitios ([[validate.js]]).
- Límite de peticiones por IP con [[rate-limit.js]]: ventana fija de 10 minutos, 20 en [[cotizar-envio.js]], 10 en [[mp-preference.js]], 120 en [[stock.js]] y 30 en [[pedidos.js (functions)]]. Al pasarse responde 429 con `Retry-After`. La IP se guarda como hash sha256 en [[Netlify Blobs]] (store `limites`), o en memoria si Blobs no está disponible; sin IP (llamadas internas o pruebas) no limita, y si el almacén falla deja pasar la petición. No se usó el rate limit nativo de [[Netlify]] porque el plan gratis permite 2 reglas y exige Functions v2.
- CSP sin `'unsafe-inline'` en `script-src`: los scripts inline se movieron a [[loader.js]], [[checkout.js]] y [[gracias.js]], y los handlers inline (`onerror`, `onclick`, `onload`) se cambiaron por listeners: imágenes con `data-fallback` y un listener de `error` en captura en [[app.js]] y [[checkout.js]], FAQ con `data-faq`, tallas por delegación en `#pdSizes`. Quedan 3 scripts inline permitidos por hash: `speculationrules` y `css-pending` en [[index.html]] y la precarga de la primera foto en [[producto.html]]. [[csp-hashes.js]] los recalcula y escribe `script-src` en [[netlify.toml (dstar-store)]]: **correr `node scripts/csp-hashes.js` después de editar cualquier script inline** (`--check` solo verifica; [[seguridad-y-seo.spec.js]] falla si la CSP no coincide con `scriptSrc()`). Los `application/ld+json` no cuentan. `style-src` todavía permite `'unsafe-inline'`.
- Panel de pedidos ([[pedidos.html]], [[pedidos.js (js)]], [[pedidos.js (functions)]]): la función solo acepta GET con `Authorization: Bearer` igual a [[PANEL_PASSWORD]], comparado con `timingSafeEqual` sobre hashes. Responde 503 si la variable falta o tiene menos de 16 caracteres y 401 si no coincide. El navegador guarda la contraseña en sessionStorage (`dstar_panel`) y los enlaces de etiqueta y rastreo solo se muestran si empiezan con `https://`. [[pedidos.html]] lleva `Cache-Control: no-store` y `X-Robots-Tag: noindex, nofollow`; la respuesta de la función también va con `no-store` y `X-Robots-Tag: noindex`, y [[sw.js]] no cachea `/pedidos`.
- [[GSAP]] se sirve desde el propio sitio (`js/vendor/`), así que la CSP ya no permite cdn.jsdelivr.net; `rel="noopener noreferrer"` en enlaces externos.
- El stock se valida en el servidor contra [[stock-store.js]] antes de crear el pago, y el webhook avisa a la tienda por correo de pagos que requieren revisión manual.
- Permissions-Policy y Cross-Origin-Opener-Policy; /dist/, /test-results/, /tests/, /netlify/ y archivos internos responden 404.
- La CSP permite `worker-src 'self'`: el logo 3D de Chromium corre en [[logo-3d-worker.js]], cargado desde el propio sitio (lo crea [[loader.js]] o [[logo-3d.js]]). Si la CSP lo bloqueara, el worker falla y [[logo-3d.js]] cae al `<video>` en el hilo principal. El video del loader (`logo-3d-loader.mp4`) también sale del propio sitio, cubierto por `media-src 'self'`.
- Secretos solo por nombre en [[Variables de entorno]]; el `.env` real está en .gitignore.

Parte de: [[DSTAR]]
