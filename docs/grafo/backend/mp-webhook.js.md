---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/mp-webhook.js"
lineas: 227
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-webhook.js

`dstar-store/netlify/functions/mp-webhook.js` · 227 líneas

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

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi
- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `12b2567` · Email: separar etiqueta de envío — cliente solo rastreo, tienda con etiqueta

