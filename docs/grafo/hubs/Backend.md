---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Backend

Netlify Functions, edge functions y las librerías que comparten.

Parte de: [[DSTAR]]

## Contenido

- [[admin-store.js]] — Función /api/admin-store del panel (PANEL_PASSWORD): GET devuelve catálogo, stock, libro de inventario, datos legales y qué servicios están configurados con la última conciliación; POST product (saveProduct), stock (ajustar con operationId y motivo) y settings; límite de 100 peticiones por IP cada 10 min.
- [[catalog-store.js]] — Catálogo persistente en Netlify Blobs (store catalogo, clave products) con products-data.js de respaldo; saveProduct valida con cleanProduct (fotos HTTPS de Cloudinary, tallas, peso y medidas) y un producto nuevo entra con stock 0.
- [[catalogo.js]] — Función /api/catalogo: catálogo activo de catalog-store.js con el stock vivo de stock-store.js; lo leen cart-store.js y las edge functions.
- [[cotizar-envio.js]] — Función /api/cotizar-envio: exige CP, estado, ciudad y colonia, arma el paquete en servidor (parcel de quotes.js con el catálogo de catalog-store.js), cotiza con cotizar() de lib/skydropx.js y guarda la cotización ligada a destino y carrito (saveQuote, vence a los 15 min); límite de 20 peticiones por IP cada 10 min.
- [[datos-tienda.js]] — Función /api/datos-tienda: datos públicos del proveedor (legalName, address, phone, privacyEmail, contactEmail) guardados por admin-store.js; los muestra js/legal.js.
- [[http.js]] — Utilidades de las funciones: reply con no-store, body (JSON de máximo 100 KB), admin (PANEL_PASSWORD con timingSafeEqual y origen permitido), failure, request con timeout de 20 s y mp() para la API de Mercado Pago.
- [[jobs.js]] — Trabajos internos: dispatch firma con HMAC de MP_WEBHOOK_SECRET y manda el trabajo a payment-jobs-background.js en URL_SITIO; authorized exige firma válida y de menos de 5 min.
- [[mail.js]] — Envío de correo: Resend si hay RESEND_API_KEY y MAIL_FROM (con Idempotency-Key); si no, nodemailer por SMTP_* o Gmail (GMAIL_USER, GMAIL_APP_PASSWORD) con Message-ID estable.
- [[mp-preference.js]] — Función /api/mp-preference: con el checkout_id del navegador (pedido dstar_<uuid>) valida cliente, catálogo, stock y cotización (verifyQuote y getRatePrice), aparta el stock 25 min (reservar), guarda el pedido con trackingToken en orders-store.js y crea la preferencia en modo binario sin ticket, cajero ni transferencia, que vence a los 15 min y regresa a seguimiento.html; reusa la preferencia vigente, permite reintentar si Mercado Pago falló y responde restart:true si la anterior venció; límite de 10 peticiones por IP cada 10 min.
- [[mp-webhook.js]] — Webhook de Mercado Pago: valida la firma (MP_WEBHOOK_SECRET) y en producción solo encola un trabajo firmado a payment-jobs-background.js con dispatch() de lib/jobs.js (fuera de producción llama a syncPayment directo); exporta crearGuiaSkydropx (marca notSent los errores previos al POST) y buildEmailHtml, que usa payment-service.js.
- [[orders-store.js]] — Pedidos en Netlify Blobs (store pedidos) sobre storage.js: get, set, update, list y claim/release, el lock con vencimiento que usan mp-preference.js y payment-service.js.
- [[payment-jobs-background.js]] — Background Function que ejecuta los trabajos firmados de lib/jobs.js: reconcile (reconcile.js; lanza error si quedaron pedidos con fallo para que se reintente) y payment (syncPayment de payment-service.js); 401 sin firma válida.
- [[payment-service.js]] — Núcleo de pagos: syncPayment consulta el pago en Mercado Pago bajo lock (locked), registra estado, monto y reembolsos, descuenta stock con descontar, detecta monto distinto, sobreventa, reversos y pagos duplicados y llama a fulfill (una sola guía; failed o uncertain y nunca recompra tras respuesta ambigua) y notify (correo de confirmación y de guía por mail.js, hasta 3 intentos por fase); los pedidos legacy (isLegacy) solo registran reversos posteriores.
- [[pedidos.js (functions)]] — Función del panel de pedidos (admin() de lib/http.js con PANEL_PASSWORD): GET lista los pedidos sin token ni lock; POST con acciones sync, note, fulfillment (pendiente/guía lista → preparado → enviado → entregado), cancel (solo pagos pendientes), address, retry_shipping (solo tras falla definitiva y con precio confirmado), attach_shipping y retry_mail; cualquier otra (refund, return) se rechaza; límite de 120 peticiones por IP cada 10 min.
- [[producto-meta.js]] — Edge function en /producto.html y /producto: con ?id= busca la prenda activa en /api/catalogo (3 s; si falla usa products-data.js) y reescribe title, description, canonical y og:* con la foto vía Cloudinary (f_jpg,c_pad,b_auto,w_1200,h_630), y agrega product:price y JSON-LD Product.
- [[quotes.js]] — Cotizaciones: parcel calcula peso y medidas desde el catálogo (+0.1 kg y 2 cm; más de 10 kg o 60 cm pide cotización especial), saveQuote las guarda 15 min ligadas a CP, estado, ciudad, colonia y carrito, y verifyQuote las comprueba antes de pagar.
- [[rate-limit.js]] — Límite de peticiones por IP (guardada como hash) con ventana fija y escritura condicional en Netlify Blobs (store limites); sin IP no limita y si el almacén falla rechaza 60 s; demasiadas() arma el 429 con Retry-After.
- [[reconcile-payments.js]] — Función programada cada 10 min (netlify.toml): solo en producción encola el trabajo reconcile con dispatch() de lib/jobs.js, porque las programadas tienen 30 s.
- [[reconcile.js]] — Conciliación: reconcile revisa hasta 20 pedidos activos por lote rotando el cursor (store operacion) con tope de 5 min; reconcileOrder sincroniza el pago conocido, busca otros intentos del mismo checkout por external_reference, vence apartados sin pago y despacha aprobados; ignora legacy, vencidos, entregados, reembolsados, cancelados, contracargos y enviados de más de 30 días salvo sincronización manual.
- [[seguimiento.js (functions)]] — Función /api/seguimiento: POST con id dstar_<uuid> y token de 64 hex comparado con timingSafeEqual; devuelve pago, preparación, total, rastreo y artículos, sin domicilio ni etiqueta; 404 si no coincide; límite de 60 peticiones por IP cada 10 min.
- [[sitemap.js]] — Edge function /sitemap.xml: lista las páginas públicas (incluida privacidad.html) y cada producto activo de /api/catalogo, con products-data.js de respaldo.
- [[skydropx.js]] — Cliente de Skydropx: token OAuth con caché (getSkydropxToken), precio actual de una tarifa (getRatePrice, con carrier y service) y cotizar(destino, parcel); lo usan cotizar-envio.js, mp-preference.js, pedidos.js, payment-service.js y mp-webhook.js.
- [[stock-store.js]] — Libro de inventario versión 2 en un solo blob (stock/vendidas): unidades, apartados, ventas y movimientos con escritura condicional; migra el formato anterior conservándolo, reservar/liberar apartados, descontar una vez por pago, ajustar con motivo sin invadir apartados, y prune poda apartados vencidos hace más de un día, ventas de más de 200 días y deja 2000 movimientos más el de migración.
- [[stock.js]] — Función /api/stock: devuelve el stock disponible por producto y talla (leerStock sobre el catálogo de catalog-store.js, ya sin piezas apartadas); límite de 120 peticiones por IP cada 10 min.
- [[storage.js]] — Acceso a Netlify Blobs con lectura fuerte y escritura condicional por etag (update reintenta hasta 12 veces y si no da 409); stores con sufijo por deploy fuera de producción; memoria solo con DSTAR_MEMORY_STORE y NODE_ENV=test sin NETLIFY.
- [[validate.js]] — Validación de datos del cliente (incluida la referencia) y del pedido contra el catálogo y el stock vivo (sin volver al stock base si falta), y verificación del origen de la petición.

