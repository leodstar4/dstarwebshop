---
tags: [codigo, backend]
ruta: "dstar-store/netlify/handlers/mp-webhook.js"
lineas: 227
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-webhook.js

`dstar-store/netlify/handlers/mp-webhook.js` · 227 líneas

Webhook de Mercado Pago: valida la firma (MP_WEBHOOK_SECRET) y en producción solo encola un trabajo firmado a payment-jobs-background.js con dispatch() de lib/jobs.js (fuera de producción llama a syncPayment directo); exporta crearGuiaSkydropx (marca notSent los errores previos al POST) y buildEmailHtml, que usa payment-service.js.

Parte de: [[Backend]]

## Conexiones

- Importa: [[skydropx.js]], [[jobs.js]], [[payment-service.js]]
- Usa: [[Netlify]], [[Mercado Pago]], [[Skydropx]]
- Lee la variable: [[MP_WEBHOOK_SECRET]], [[DIRECCION_ORIGEN]], [[NOMBRE_ORIGEN]], [[EMPRESA_ORIGEN]], [[TELEFONO_ORIGEN]], [[EMAIL_ORIGEN]], [[REFERENCIA_ORIGEN]], [[SKYDROPX_CONSIGNMENT_NOTE]], [[SKYDROPX_PACKAGE_TYPE]]

## Funciones y clases

- `reply` (línea 20)
- `firmaValida` (línea 23)
- `handler` (línea 46)
- `crearGuiaSkydropx` (línea 68)
- `fmtMXN` (línea 133)
- `esc` (línea 137)
- `buildEmailHtml` (línea 141)
- `crearGuiaSkydropx` (línea 225)
- `buildEmailHtml` (línea 226)

## Últimos cambios

- 2026-10-20 · `cb71c3f` · Funciones en formato v2 de Netlify para que las lecturas strong de Blobs funcionen en producción

