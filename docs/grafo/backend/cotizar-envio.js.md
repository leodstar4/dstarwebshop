---
tags: [codigo, backend]
ruta: "dstar-store/netlify/functions/cotizar-envio.js"
lineas: 144
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# cotizar-envio.js

`dstar-store/netlify/functions/cotizar-envio.js` · 144 líneas

Función /api/cotizar-envio: cotiza tarifas de envío con Skydropx Pro.

Parte de: [[Backend]]

## Conexiones

- Importa: [[skydropx.js]], [[validate.js]]
- Usa: [[Netlify]], [[Skydropx]]
- Lee la variable: [[CP_ORIGEN]], [[ORIGEN_ESTADO]], [[ORIGEN_MUNICIPIO]], [[ORIGEN_COLONIA]]

## Funciones y clases

- `sleep` (línea 16)
- `handler` (línea 18)
- `clamp` (línea 35)

## Últimos cambios

- 2026-10-11 · `8d6aea5` · Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; lo
- 2026-10-10 · `8b73af2` · Rediseño premium, seguridad de pagos, fluidez y PWA
- 2026-06-19 · `e3d0817` · Skydropx auth: sanitiza credenciales y loguea error_description completo
- 2026-06-07 · `89b8f32` · Checkout completo: envíos Skydropx Pro v2 + correo de confirmación
- 2026-04-11 · `f6a6bd0` · Clean start — imágenes migradas a Cloudinary CDN

