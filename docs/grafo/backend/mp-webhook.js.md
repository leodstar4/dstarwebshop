---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/mp-webhook.js"
lineas: 404
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# mp-webhook.js

`dstar-store/netlify/functions/mp-webhook.js` · 404 líneas

Webhook de Mercado Pago: valida la firma, descuenta el stock una sola vez por pago, crea una sola guía en Skydropx y manda correos; avisa a la tienda (alertarTienda) si la guía falla, el monto no coincide, hay sobreventa o faltan datos.

Parte de: [[Backend]]

## Conexiones

- Importa: [[skydropx.js]], [[orders-store.js]], [[stock-store.js]]
- Usa: [[Gmail SMTP]], [[Netlify]], [[Mercado Pago]], [[Skydropx]]
- Lee la variable: [[MP_WEBHOOK_SECRET]], [[MP_ACCESS_TOKEN]], [[DIRECCION_ORIGEN]], [[NOMBRE_ORIGEN]], [[EMPRESA_ORIGEN]], [[TELEFONO_ORIGEN]], [[EMAIL_ORIGEN]], [[REFERENCIA_ORIGEN]], [[SKYDROPX_CONSIGNMENT_NOTE]], [[SKYDROPX_PACKAGE_TYPE]], [[GMAIL_USER]], [[GMAIL_APP_PASSWORD]]

## Funciones y clases

- `reply` (línea 22)
- `firmaValida` (línea 25)
- `handler` (línea 48)
- `crearGuiaSkydropx` (línea 172)
- `fmtMXN` (línea 234)
- `esc` (línea 238)
- `transporte` (línea 242)
- `datosCliente` (línea 249)
- `lineasPedido` (línea 257)
- `alertarTienda` (línea 262)
- `enviarCorreoConfirmacion` (línea 284)
- `buildEmailHtml` (línea 321)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `12b2567` · Email: separar etiqueta de envío — cliente solo rastreo, tienda con etiqueta
- 2026-06-19 · `e3d0817` · Skydropx auth: sanitiza credenciales y loguea error_description completo

