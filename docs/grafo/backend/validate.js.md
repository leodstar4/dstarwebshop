---
tags: [codigo, backend]
ruta: "dstar-store/netlify/lib/validate.js"
lineas: 80
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# validate.js

`dstar-store/netlify/lib/validate.js` · 80 líneas

Validación de datos del cliente (incluida la referencia) y del pedido contra el catálogo y el stock vivo (sin volver al stock base si falta), y verificación del origen de la petición.

Parte de: [[Backend]]

## Conexiones

- Importa: [[products-data.js]]
- Usa: [[Netlify]]
- Lee la variable: [[URL_SITIO]]

## Funciones y clases

- `str` (línea 5)
- `origenPermitido` (línea 7)
- `validarCliente` (línea 20)
- `construirPedido` (línea 45)

## Últimos cambios

- 2026-10-12 · `17c7774` · Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido
- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA

