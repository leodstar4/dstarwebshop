---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Backend

Netlify Functions, edge functions y las librerías que comparten.

Parte de: [[DSTAR]]

## Contenido

- [[cotizar-envio.js]] — Función /api/cotizar-envio: cotiza tarifas de envío con cotizar() de lib/skydropx.js; límite de 20 peticiones por IP cada 10 min.
- [[mp-preference.js]] — Función /api/mp-preference: valida el pedido, el stock y el precio del envío y crea la preferencia de pago en Mercado Pago con vencimiento a 3 días (OXXO) y quotation_id y envio en metadata; límite de 10 peticiones por IP cada 10 min.
- [[mp-webhook.js]] — Webhook de Mercado Pago: valida la firma, descuenta el stock una sola vez por pago, crea una sola guía en Skydropx (crearGuiaConRespaldo re-cotiza con la misma paquetería y servicio si la guía falla) y manda correos; guarda pedido y guia en orders-store.js para el panel y avisa a la tienda (alertarTienda) si la guía falla o se re-cotizó, el monto no coincide, hay sobreventa o faltan datos.
- [[orders-store.js]] — Registro de pedidos en Netlify Blobs (evita guías duplicadas y guarda pedido y guía de cada pago); list() alimenta el panel; en memoria en local.
- [[pedidos.js (functions)]] — Función del panel de pedidos: solo GET con Authorization Bearer igual a PANEL_PASSWORD (503 si falta o tiene menos de 16 caracteres, 401 si no coincide); devuelve los pedidos de orders-store.js del más reciente al más viejo; límite de 30 peticiones por IP cada 10 min.
- [[producto-meta.js]] — Edge function en /producto.html y /producto: con ?id= reescribe title, description, canonical y og:* con los datos de products-data.js y la foto vía Cloudinary (f_jpg,c_pad,b_auto,w_1200,h_630), y agrega product:price y JSON-LD Product.
- [[rate-limit.js]] — Límite de peticiones por IP (guardada como hash) con ventana fija en Netlify Blobs (store limites) o en memoria; sin IP no limita y si falla deja pasar; demasiadas() arma el 429 con Retry-After.
- [[sitemap.js]] — Edge function /sitemap.xml: lista las páginas públicas y cada producto de products-data.js.
- [[skydropx.js]] — Cliente de Skydropx: token OAuth con caché, consulta del precio de una tarifa (con carrier y service) y cotizar(destino, parcel), que usan cotizar-envio.js y mp-webhook.js.
- [[stock-store.js]] — Stock = base del catálogo menos piezas vendidas, guardado en Netlify Blobs con reintentos.
- [[stock.js]] — Función /api/stock: devuelve el stock disponible por producto y talla; límite de 120 peticiones por IP cada 10 min.
- [[validate.js]] — Validación de datos del cliente y del pedido, y verificación del origen de la petición.

