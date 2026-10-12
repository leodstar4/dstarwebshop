---
tags: [contexto]
---
# Seguridad

Headers, CSP y redirects están en [[netlify.toml (dstar-store)]].

- El webhook de [[Mercado Pago]] ([[mp-webhook.js]]) rechaza avisos sin firma válida y no puede crear dos guías para el mismo pago ([[orders-store.js]]).
- [[cotizar-envio.js]] y [[mp-preference.js]] rechazan peticiones de otros sitios ([[validate.js]]).
- [[GSAP]] se sirve desde el propio sitio (`js/vendor/`), así que la CSP ya no permite cdn.jsdelivr.net; `rel="noopener noreferrer"` en enlaces externos.
- El stock se valida en el servidor contra [[stock-store.js]] antes de crear el pago, y el webhook avisa a la tienda por correo de pagos que requieren revisión manual.
- CSP estricta, Permissions-Policy y Cross-Origin-Opener-Policy; /dist/, /test-results/, /tests/, /netlify/ y archivos internos responden 404.
- Secretos solo por nombre en [[Variables de entorno]]; el `.env` real está en .gitignore.
- Pendiente: quitar `'unsafe-inline'` de script-src y limitar peticiones a las funciones (ver [[Pendientes]]).

Parte de: [[DSTAR]]
