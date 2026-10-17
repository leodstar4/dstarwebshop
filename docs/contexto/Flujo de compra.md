---
tags: [contexto]
---
# Flujo de compra

1. **Catálogo.** [[index.html]] pinta los drops con [[app.js]] a partir de [[products-data.js]]. El detalle vive en [[producto.html]] (galería con lightbox). Al agregar o cambiar fotos en [[products-data.js]] hay que correr `node scripts/calentar-cloudinary.js` ([[calentar-cloudinary.js]]) para que [[Cloudinary]] tenga generados todos los tamaños, incluida la imagen para compartir de cada prenda.
2. **Carrito.** [[cart-store.js]] guarda el carrito en localStorage (`dstar_cart`) y pide el stock en vivo a [[stock.js]] (`/api/stock`), que lee [[stock-store.js]].
3. **Checkout.** [[checkout.html]] (con su lógica en [[checkout.js]]) cotiza el envío con [[cotizar-envio.js]] y crea el pago con [[mp-preference.js]] ([[Mercado Pago]]). La cotización la hace `cotizar(destino, parcel)` de [[skydropx.js]] ([[Skydropx]]). El envío se cobra junto con la prenda en el mismo pago.
4. **Validación.** [[validate.js]] revisa datos del cliente y pedido contra el catálogo y el stock, y rechaza peticiones hechas desde otros sitios. [[rate-limit.js]] corta con 429 a una IP que abusa (ver [[Seguridad]]).
5. **Preferencia.** [[mp-preference.js]] pone `date_of_expiration` a 3 días (hora -06:00), el plazo para pagar en efectivo (OXXO), y guarda en `metadata` el `quotation_id` y `envio` (`carrier`, `service`, `price`) además del `rate_id` y el paquete.
6. **Resultado.** Mercado Pago regresa a [[gracias.html]] ([[gracias.js]] vacía `dstar_cart` si el pago se aprobó), [[error-pago.html]] o [[pago-pendiente.html]].
7. **Webhook.** [[mp-webhook.js]] valida la firma, consulta el pago, crea una sola guía en Skydropx por pago ([[orders-store.js]]), descuenta stock y manda correos por [[Gmail SMTP]]: al cliente solo el rastreo, a la tienda la etiqueta. Un pago en OXXO puede aprobarse días después, cuando la tarifa ya venció: `crearGuiaConRespaldo` intenta con el `rate_id` original y, si falla, vuelve a cotizar y crea la guía con la tarifa de la misma paquetería y servicio; en ese caso avisa a la tienda con lo que pagó el cliente de envío y lo que costó ahora. Si la guía falla, el monto no coincide o hay sobreventa, manda una alerta a la tienda.
8. **Registro.** Cada pago queda en [[orders-store.js]] con `pedido` (`cliente`, `items`, `total`), `tracking` y `guia` (`carrier`, `label_url`, `tracking_url`), o con `revisar: true` si requiere revisión manual.
9. **Panel.** [[pedidos.html]] con [[pedidos.js (js)]] lista esos pedidos a través de [[pedidos.js (functions)]] (contraseña [[PANEL_PASSWORD]]): filtros TODOS, POR REVISAR y CON GUÍA, datos del cliente con enlace de WhatsApp, prendas, etiqueta y rastreo de la guía.
10. **Términos.** [[terminos.html]] explica envíos, devoluciones y quejas; [[checkout.html]] la enlaza junto al botón PAGAR.

Variables que intervienen: ver [[Variables de entorno]].

Parte de: [[DSTAR]]
