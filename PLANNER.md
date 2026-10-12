# DSTAR — Lo que falta

Actualizado: 2026-10-12.

## Prioridad alta (afecta ventas o es obligatorio)

- [ ] **Aviso de privacidad.** El checkout pide nombre, correo, teléfono y dirección; en México la LFPDPPP exige un aviso de privacidad visible antes de recolectarlos. Crear `aviso-de-privacidad.html` y enlazarlo en el footer y junto al botón PAGAR.
- [ ] **Datos del proveedor en los términos.** PROFECO pide razón social, domicilio y teléfono; agregarlos en `terminos.html`.
- [ ] **Probar en un iPhone real** el logo 3D con modo de ahorro de batería activado y que drops y lookbook aparezcan.

## Prioridad media

- [ ] **Enlaces rotos de redes:** INSTAGRAM y TIKTOK con `href="#"` en `index.html`, `producto.html`, `agradecimientos.html` y los 3 artículos del blog.
- [ ] **Límite de peticiones** en `/api/cotizar-envio`, `/api/mp-preference` y `/api/stock`. Ya se rechazan peticiones de otros sitios, pero un script puede llamarlas directo. Migrar a Netlify Functions v2 y usar `config.rateLimit`.
- [ ] **Quitar `'unsafe-inline'` de `script-src`.** Mover los scripts inline que quedan (loader de `index.html`, checkout) a archivos `.js`, o usar hashes en la CSP. El script inline del velo de transición ya se quitó de las páginas.
- [ ] **Panel de pedidos.** Hoy los pedidos solo existen en los correos y en Mercado Pago. Una página protegida (Netlify Identity o contraseña) que liste los pedidos de Blobs con su guía.
- [ ] **SEO básico:** no hay `robots.txt`, `sitemap.xml` ni `<link rel="canonical">`.
- [ ] **Correo transaccional:** Gmail SMTP tiene límite diario y puede caer en spam. Considerar Resend o Brevo con dominio propio (SPF/DKIM).

## Prioridad baja

- [ ] Dominio propio (hoy `dstarshop.netlify.app`).
- [ ] Agregar productos sin tocar código (Cloudinary + JSON o un CMS ligero).
- [ ] Analítica respetuosa de privacidad (Plausible o Netlify Analytics).
- [ ] Prueba E2E del logo con autoplay bloqueado (necesita Chrome con H.264: `channel: 'chrome'`).

## Hecho el 2026-10-12

- Términos, envíos y devoluciones en `terminos.html`, enlazados en los footers y junto a PAGAR; FAQ de devoluciones actualizada.
- Stock vivo en Netlify Blobs: el webhook descuenta cada venta una sola vez, `mp-preference` valida contra el stock real y `/api/stock` actualiza tarjetas, tallas y carrito.
- Alertas por correo a la tienda: guía de Skydropx fallida, monto que no coincide, sobreventa y pago sin datos.
- Animaciones rehechas sin ocultar contenido si GSAP falla; GSAP servido desde el sitio; sin pantalla negra en transiciones; logo 3D sin rectángulo.
- Fluidez en desktop: reveals con clases y transición CSS en vez de tweens de GSAP, sin SplitText en el index, logo 3D a 30 fps con dpr máximo 2 y en pausa fuera de pantalla, un solo contexto WebGL en visitas repetidas, marquesina pausada al hacer scroll y prefetch de producto solo con intención de hover.
- Animaciones ricas de vuelta (hero letra por letra, títulos con SplitText, tarjetas con zoom, cortina del lookbook, Nosotros, blog) con revelados por WAAPI en el compositor en vez de tweens de GSAP o clases `.rv`; logo 3D sin tope de 30 fps (dibuja cada cuadro del video, dpr máximo 2, en pausa fuera de pantalla); logo del hero de desktop más grande sin chocar con el header; scroll de `app.js` sin recálculo forzado de estilos.
- 136 pruebas E2E pasando.

## Hecho el 2026-10-11

- Logo 3D idéntico en modo de ahorro de batería (WebCodecs en vez de giro CSS).
- Webhook de Mercado Pago: rechaza avisos sin firma válida y ya no puede crear dos guías para el mismo pago cuando llegan avisos simultáneos.
- `cotizar-envio` y `mp-preference` rechazan peticiones hechas desde otros sitios.
- SRI en los scripts de GSAP del CDN; `rel="noopener noreferrer"` en enlaces externos.
- CSP más estricta, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `/dist/` y `/test-results/` bloqueados.
- 117 pruebas E2E pasando (desktop, tablet, móvil), incluidas pruebas nuevas de firma del webhook, avisos duplicados y origen.
