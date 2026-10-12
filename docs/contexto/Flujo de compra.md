---
tags: [contexto]
---
# Flujo de compra

1. **Catálogo.** [[index.html]] pinta los drops con [[app.js]] a partir de [[products-data.js]]. El detalle vive en [[producto.html]].
2. **Carrito.** [[cart-store.js]] guarda el carrito en localStorage (`dstar_cart`) y pide el stock en vivo a [[stock.js]] (`/api/stock`), que lee [[stock-store.js]].
3. **Checkout.** [[checkout.html]] cotiza el envío con [[cotizar-envio.js]] ([[Skydropx]]) y crea el pago con [[mp-preference.js]] ([[Mercado Pago]]). El envío se cobra junto con la prenda en el mismo pago.
4. **Validación.** [[validate.js]] revisa datos del cliente y pedido contra el catálogo y el stock, y rechaza peticiones hechas desde otros sitios.
5. **Resultado.** Mercado Pago regresa a [[gracias.html]], [[error-pago.html]] o [[pago-pendiente.html]].
6. **Webhook.** [[mp-webhook.js]] valida la firma, consulta el pago, crea una sola guía en Skydropx por pago ([[orders-store.js]]), descuenta stock y manda correos por [[Gmail SMTP]]: al cliente solo el rastreo, a la tienda la etiqueta. Si la guía falla, el monto no coincide o hay sobreventa, manda una alerta a la tienda.
7. **Términos.** [[terminos.html]] explica envíos, devoluciones y quejas; [[checkout.html]] la enlaza junto al botón PAGAR.

Variables que intervienen: ver [[Variables de entorno]].

Parte de: [[DSTAR]]
