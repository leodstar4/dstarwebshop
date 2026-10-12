---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Backend

Netlify Functions y las librerías que comparten.

Parte de: [[DSTAR]]

## Contenido

- [[cotizar-envio.js]] — Función /api/cotizar-envio: cotiza tarifas de envío con Skydropx Pro.
- [[mp-preference.js]] — Función /api/mp-preference: valida el pedido, el stock y el precio del envío, y crea la preferencia de pago en Mercado Pago.
- [[mp-webhook.js]] — Webhook de Mercado Pago: valida la firma, descuenta el stock una sola vez por pago, crea una sola guía en Skydropx y manda correos; avisa a la tienda (alertarTienda) si la guía falla, el monto no coincide, hay sobreventa o faltan datos.
- [[orders-store.js]] — Registro de pedidos en Netlify Blobs (evita guías duplicadas); en memoria en local.
- [[skydropx.js]] — Cliente de Skydropx: token OAuth con caché y consulta del precio de una tarifa.
- [[stock-store.js]] — Stock = base del catálogo menos piezas vendidas, guardado en Netlify Blobs con reintentos.
- [[stock.js]] — Función /api/stock: devuelve el stock disponible por producto y talla.
- [[validate.js]] — Validación de datos del cliente y del pedido, y verificación del origen de la petición.

