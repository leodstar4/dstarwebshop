# DSTAR — Lo que falta

Actualizado: 2026-10-20.

## Cambios locales del 19/10/2026 (pendientes de publicar)

- [x] OXXO desactivado; checkout de 15 minutos y reservas de inventario.
- [x] Cotizaciones ligadas a dirección y carrito; paquete calculado en servidor.
- [x] Inventario persistente sin reinicio de ventas al editar stock base, ajustes con motivo y protección de concurrencia.
- [x] Panel operativo: notas, cancelación de pagos pendientes, preparación/despacho, guías y correo.
- [x] Catálogo editable y seguimiento privado con confirmación real del servidor.
- [x] Detección de estados de Mercado Pago y conciliación en segundo plano.
- [x] Dependencias sin uso retiradas y reglas no-store del panel/seguimiento.
- [x] Aviso de privacidad y campos de datos del proveedor implementados.
- [x] Validación local: 23 pruebas backend y 246 de navegador aprobadas, 0 fallos; 33 casos de navegador omitidos según sus condiciones.
- [x] Correcciones del 20/10/2026: pedidos legacy (clave numérica sin `paymentStatus`) marcados `legacy`, nunca despachados ni re-notificados; tarjeta rechazada no libera el apartado; reintento de la preferencia tras una falla de Mercado Pago; preferencia vencida responde `restart: true`; errores de Skydropx antes del POST quedan como guía fallida reintentable; la conciliación ignora pedidos terminados; poda del libro de inventario; respaldo de `AbortController` en `cart-store.js` para iOS 15. Backend: 34 pruebas aprobadas.
- [ ] Completar datos legales reales y verificar pesos/medidas físicos.
- [ ] Respaldar el blob `stock/vendidas` y los pedidos desde Netlify antes de publicar (la migración del inventario no tiene vuelta atrás con el código anterior).
- [ ] Configurar `PANEL_PASSWORD` y `MP_WEBHOOK_SECRET` en Netlify (ámbito Functions).
- [ ] Registrar en Mercado Pago el webhook de pagos (`/.netlify/functions/mp-webhook`) con eventos de pagos.
- [ ] Compra de prueba real autorizada: pago, apartado, stock, guía, correo, seguimiento y conciliación.
- [ ] Verificar en un iPhone físico la compra completa (catálogo remoto, checkout, regreso a `seguimiento.html` y carrito), incluido iOS 15.
- [ ] Inventario en un solo blob de Netlify Blobs: en un drop muy grande las escrituras compiten y habrá reintentos o 409. Para volumen alto, mover el libro a una base transaccional y paginar pedidos.
- [ ] `initApp` (y checkout y animaciones) espera hasta 5 s a `/api/catalogo` antes de renderizar; en iOS 15 sin `AbortController` no hay corte. Valorar pintar primero con `products-data.js` y actualizar después.
- **Excluido por decisión del usuario:** emitir reembolsos, gestionar devoluciones y facturación. No hay botones ni operaciones API para esas funciones; la detección de pagos revertidos sigue activa por seguridad.
- Ver [OPERACION.md](OPERACION.md) para configuración, migración, límites y pruebas.

## Prioridad alta (afecta ventas o es obligatorio)

- [ ] **Completar el aviso de privacidad.** `privacidad.html` ya está implementado y enlazado; faltan los datos reales del responsable, revisión de las prácticas de tratamiento y publicación.
- [ ] **Completar los datos del proveedor.** Los campos públicos ya están implementados en el panel y `terminos.html`; falta registrar la identidad, domicilio y teléfono reales antes de publicar.
- [ ] **Probar en un iPhone real** el logo 3D con modo de ahorro de batería activado, el video del loader (`logo-3d-loader.mp4`) y que drops y lookbook aparezcan.

## Prioridad media

- [ ] **Configurar `PANEL_PASSWORD`** (mínimo 16 caracteres) en Netlify → Environment variables. Sin ella el panel de pedidos (`/pedidos.html`) y `admin-store` responden 503. Ya está en `.env.example`.
- [ ] **Correo transaccional con dominio propio:** el código ya admite Resend (`RESEND_API_KEY`, `MAIL_FROM`) o un SMTP propio (`SMTP_*`) en `netlify/lib/mail.js`; falta el dominio con SPF/DKIM. Mientras tanto se usa Gmail SMTP, con límite diario y riesgo de spam.
- [x] **Enlaces rotos de redes:** Instagram (`https://www.instagram.com/dstar_.4/`) en todas las páginas; TikTok quitado hasta que haya cuenta.
- [x] **Límite de peticiones** en `/api/cotizar-envio`, `/api/mp-preference`, `/api/stock` y el panel (`netlify/lib/rate-limit.js`).
- [x] **Quitar `'unsafe-inline'` de `script-src`.** Scripts a archivos `.js` y los 3 inline que quedan por hash (`scripts/csp-hashes.js`).
- [x] **Panel de pedidos** con contraseña (`pedidos.html`).
- [x] **SEO básico:** `robots.txt`, `sitemap.xml`, canonical y metadatos para compartir.

## Prioridad baja

- [ ] Dominio propio (hoy `dstarshop.netlify.app`).
- [ ] Enlace de TikTok cuando exista la cuenta.
- [x] Agregar productos sin tocar código (panel y catálogo persistente; pendiente de despliegue).
- [ ] Analítica respetuosa de privacidad (Plausible o Netlify Analytics).
- [ ] Prueba E2E del logo con autoplay bloqueado (necesita Chrome con H.264: `channel: 'chrome'`).

## Hecho el 2026-10-17 (auditoría)

- Redes: Instagram real en todas las páginas y JSON-LD `Organization`; TikTok quitado.
- SEO: canonical, `og:*` y `twitter:card` en las páginas indexables con `assets/brand/og-dstar.jpg` (1200×630); `noindex` en checkout, resultados del pago, offline, pedidos y 404; título nuevo del index. Edge functions `producto-meta.js` (title, description, canonical, `og:*` con la foto de la prenda, precio y JSON-LD `Product`) y `sitemap.js` (`/sitemap.xml` desde el catálogo); `robots.txt`.
- Página 404 de la marca con el logo 3D entre dos 4.
- Límite de peticiones por IP en Netlify Blobs: cotizar-envio 20, mp-preference 10, stock 120 y pedidos 30 cada 10 min, con 429 y `Retry-After`.
- CSP sin `'unsafe-inline'` en `script-src`: `js/loader.js`, `js/checkout.js` y `js/gracias.js` en vez de scripts inline, listeners en vez de handlers inline y hashes para los 3 inline que quedan (`node scripts/csp-hashes.js`, `--check` para verificar).
- OXXO: la preferencia vence a los 3 días y, si la tarifa venció cuando se aprueba el pago, el webhook vuelve a cotizar con la misma paquetería y servicio y avisa a la tienda.
- Panel de pedidos (`pedidos.html`): contraseña, filtros, cliente, prendas, etiqueta, rastreo y WhatsApp.
- Accesibilidad: `<main>` en todas las páginas, tarjetas sin `aria-label` redundante, SplitText de líneas con `aria: 'none'`; Lighthouse a11y del index 100.
- `viewport-fit=cover` y bloque SAFE AREAS en `style.css`; el indicador SCROLL se desvanece con `filter: opacity()` y ya no choca con su entrada.
- Service worker `dstar-v11`; `calentar-cloudinary.js` también calienta la imagen para compartir de cada producto.
- Prueba nueva `seguridad-y-seo.spec.js`; Playwright con 2 workers en local; 234 pruebas pasando y 33 omitidas.

## Hecho el 2026-10-17 (galería, ya en producción)

- Galería de producto con placeholder borroso (LQIP) que reserva el alto, y un solo lightbox en `<dialog>` para móvil y desktop: animación FLIP al abrir y cerrar, zoom con click, teclado, doble tap y pellizco, deslizar hacia abajo para cerrar y fotos de hasta 2400 px solo con zoom.
- Service worker `dstar-v10`: las imágenes de Cloudinary se piden en modo CORS y solo se guardan si responden bien; una foto que fallaba una vez ya no queda rota en caché.
- `scripts/calentar-cloudinary.js` para generar de antemano todas las variantes de Cloudinary (correrlo tras agregar o cambiar fotos).
- Prueba E2E del lightbox; 136 pasando con `--workers=2`.

## Hecho el 2026-10-12

- Términos, envíos y devoluciones en `terminos.html`, enlazados en los footers y junto a PAGAR; FAQ de devoluciones actualizada.
- Stock vivo en Netlify Blobs: el webhook descuenta cada venta una sola vez, `mp-preference` valida contra el stock real y `/api/stock` actualiza tarjetas, tallas y carrito.
- Alertas por correo a la tienda: guía de Skydropx fallida, monto que no coincide, sobreventa y pago sin datos.
- Animaciones rehechas sin ocultar contenido si GSAP falla; GSAP servido desde el sitio; sin pantalla negra en transiciones; logo 3D sin rectángulo.
- Fluidez en desktop: reveals con clases y transición CSS en vez de tweens de GSAP, sin SplitText en el index, logo 3D a 30 fps con dpr máximo 2 y en pausa fuera de pantalla, un solo contexto WebGL en visitas repetidas, marquesina pausada al hacer scroll y prefetch de producto solo con intención de hover.
- Animaciones ricas de vuelta (hero letra por letra, títulos con SplitText, tarjetas con zoom, cortina del lookbook, Nosotros, blog) con revelados por WAAPI en el compositor en vez de tweens de GSAP o clases `.rv`; logo 3D sin tope de 30 fps (dibuja cada cuadro del video, dpr máximo 2, en pausa fuera de pantalla); logo del hero de desktop más grande sin chocar con el header; scroll de `app.js` sin recálculo forzado de estilos.
- 136 pruebas E2E pasando.
- Auditoría de fluidez y proporciones: logo 3D en un Web Worker en Chromium (`logo-3d-worker.js`, WebCodecs + OffscreenCanvas) con el `<video>` como respaldo y canvas medido con ResizeObserver; fotos en AVIF con `<picture>` y `f_auto` de respaldo (tarjetas, lookbook, blog, carrito, producto y checkout, que ya no baja las fotos originales); service worker con imágenes de Cloudinary cache-first; hero de móvil sin `min-height: 700px` y con regla para celular en horizontal; tarjetas en 4:3; ficha de producto a dos columnas en tablets verticales; blur del hero más corto; revelados que no se pierden con un scroll rápido; sin transiciones al aplicarse el CSS asíncrono; escalonado del menú móvil restaurado; `vh` cambiado a `svh`/`dvh`.
- 133 pruebas E2E pasando después de la auditoría (23 omitidas, 0 fallando).

## Hecho el 2026-10-11

- Logo 3D idéntico en modo de ahorro de batería (WebCodecs en vez de giro CSS).
- Webhook de Mercado Pago: rechaza avisos sin firma válida y ya no puede crear dos guías para el mismo pago cuando llegan avisos simultáneos.
- `cotizar-envio` y `mp-preference` rechazan peticiones hechas desde otros sitios.
- SRI en los scripts de GSAP del CDN; `rel="noopener noreferrer"` en enlaces externos.
- CSP más estricta, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `/dist/` y `/test-results/` bloqueados.
- 117 pruebas E2E pasando (desktop, tablet, móvil), incluidas pruebas nuevas de firma del webhook, avisos duplicados y origen.
