---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/mail.js"
lineas: 19
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mail.js

`dstar-store/netlify/lib/mail.js` · 19 líneas

Envío de correo: Resend si hay RESEND_API_KEY y MAIL_FROM (con Idempotency-Key); si no, nodemailer por SMTP_* o Gmail (GMAIL_USER, GMAIL_APP_PASSWORD) con Message-ID estable.

Parte de: [[Backend]]

## Conexiones

- Importa: [[http.js]]
- Usa: [[Gmail SMTP]], [[Resend]]
- Lee la variable: [[RESEND_API_KEY]], [[MAIL_FROM]], [[SMTP_USER]], [[GMAIL_USER]], [[SMTP_PASSWORD]], [[GMAIL_APP_PASSWORD]], [[SMTP_HOST]], [[SMTP_PORT]]

## Funciones y clases

- `send` (línea 3)

## Últimos cambios

- 2026-10-20 · `b116e0b` · Operación de la tienda: inventario persistente, conciliación de pagos, seguimiento y correcciones de pedidos anteriores

