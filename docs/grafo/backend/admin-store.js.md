---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/admin-store.js"
lineas: 32
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# admin-store.js

`dstar-store/netlify/handlers/admin-store.js` · 32 líneas

Función /api/admin-store del panel (PANEL_PASSWORD): GET devuelve catálogo, stock, libro de inventario, datos legales y qué servicios están configurados con la última conciliación; POST product (saveProduct), stock (ajustar con operationId y motivo) y settings; límite de 100 peticiones por IP cada 10 min.

Parte de: [[Backend]]

## Conexiones

- Importa: [[http.js]], [[catalog-store.js]], [[stock-store.js]], [[storage.js]], [[rate-limit.js]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]], [[Gmail SMTP]], [[Resend]]
- Lee la variable: [[MP_ACCESS_TOKEN]], [[MP_WEBHOOK_SECRET]], [[SKYDROPX_CLIENT_ID]], [[SKYDROPX_CLIENT_SECRET]], [[RESEND_API_KEY]], [[MAIL_FROM]], [[SMTP_USER]], [[SMTP_PASSWORD]], [[GMAIL_USER]], [[GMAIL_APP_PASSWORD]]

## Funciones y clases

- `handler` (línea 6)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción

