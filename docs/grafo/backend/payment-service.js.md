---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/payment-service.js"
lineas: 158
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# payment-service.js

`dstar-store/netlify/lib/payment-service.js` · 158 líneas

Núcleo de pagos: syncPayment consulta el pago en Mercado Pago bajo lock (locked), registra estado, monto y reembolsos, descuenta stock con descontar, detecta monto distinto, sobreventa, reversos y pagos duplicados y llama a fulfill (una sola guía; failed o uncertain y nunca recompra tras respuesta ambigua) y notify (correo de confirmación y de guía por mail.js, hasta 3 intentos por fase); los pedidos legacy (isLegacy) solo registran reversos posteriores.

Parte de: [[Backend]]

## Conexiones

- Importa: [[orders-store.js]], [[stock-store.js]], [[http.js]], [[mail.js]], [[skydropx.js]], [[mp-webhook.js]]
- Referencia a: [[seguimiento.html]]
- Usa: [[Skydropx]], [[Gmail SMTP]]
- Lee la variable: [[EMAIL_ORIGEN]], [[GMAIL_USER]], [[URL_SITIO]]

## Funciones y clases

- `isLegacy` (línea 8)
- `history` (línea 9)
- `locked` (línea 11)
- `syncPayment` (línea 17)
- `parseShipment` (línea 87)
- `fulfill` (línea 91)
- `notify` (línea 122)
- `alertStore` (línea 144)

