# DSTAR — Lo que falta

Actualizado: 2026-10-11, después de la auditoría de seguridad.

## Prioridad alta (afecta ventas o es obligatorio)

- [ ] **Aviso de privacidad.** El checkout pide nombre, correo, teléfono y dirección; en México la LFPDPPP exige un aviso de privacidad visible antes de recolectarlos. Crear `aviso-de-privacidad.html` y enlazarlo en el footer y junto al botón PAGAR.
- [ ] **Términos, envíos y devoluciones.** PROFECO pide que la tienda en línea informe precio total, tiempos de entrega, política de cambios/devoluciones y datos de contacto. Crear `terminos.html`.
- [ ] **El stock no baja al vender.** `js/products-data.js` es estático: si quedan 1 pieza talla S y dos personas pagan, se venden 2. Opción simple: guardar el stock en Netlify Blobs, descontarlo en `mp-webhook` y leerlo en `mp-preference` y en la página.
- [ ] **Alerta de pedidos con problemas.** Si Skydropx falla al crear la guía, o el monto pagado no coincide, solo queda en los logs de Netlify. Mandar un correo a la tienda en esos casos.
- [ ] **Probar en un iPhone real** el logo 3D con modo de ahorro de batería activado.

## Prioridad media

- [ ] **Enlaces rotos de redes:** INSTAGRAM y TIKTOK con `href="#"` en `index.html`, `producto.html`, `agradecimientos.html` y los 3 artículos del blog.
- [ ] **Límite de peticiones** en `/api/cotizar-envio` y `/api/mp-preference`. Ya se rechazan peticiones de otros sitios, pero un script puede llamarlas directo. Migrar a Netlify Functions v2 y usar `config.rateLimit`.
- [ ] **Quitar `'unsafe-inline'` de `script-src`.** Mover los scripts inline (loader, fade de transición, checkout) a archivos `.js`, o usar hashes en la CSP.
- [ ] **Panel de pedidos.** Hoy los pedidos solo existen en los correos y en Mercado Pago. Una página protegida (Netlify Identity o contraseña) que liste los pedidos de Blobs con su guía.
- [ ] **SEO básico:** no hay `robots.txt`, `sitemap.xml` ni `<link rel="canonical">`.
- [ ] **Correo transaccional:** Gmail SMTP tiene límite diario y puede caer en spam. Considerar Resend o Brevo con dominio propio (SPF/DKIM).

## Prioridad baja

- [ ] Dominio propio (hoy `dstarshop.netlify.app`).
- [ ] Agregar productos sin tocar código (Cloudinary + JSON o un CMS ligero).
- [ ] Analítica respetuosa de privacidad (Plausible o Netlify Analytics).
- [ ] Prueba E2E del logo con autoplay bloqueado (necesita Chrome con H.264: `channel: 'chrome'`).

## Hecho en esta ronda

- Logo 3D idéntico en modo de ahorro de batería (WebCodecs en vez de giro CSS).
- Webhook de Mercado Pago: rechaza avisos sin firma válida y ya no puede crear dos guías para el mismo pago cuando llegan avisos simultáneos.
- `cotizar-envio` y `mp-preference` rechazan peticiones hechas desde otros sitios.
- SRI en los scripts de GSAP del CDN; `rel="noopener noreferrer"` en enlaces externos.
- CSP más estricta, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `/dist/` y `/test-results/` bloqueados.
- 117 pruebas E2E pasando (desktop, tablet, móvil), incluidas pruebas nuevas de firma del webhook, avisos duplicados y origen.
