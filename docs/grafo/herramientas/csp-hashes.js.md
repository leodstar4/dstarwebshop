---
tags: [codigo, herramienta]
ruta: "scripts/csp-hashes.js"
lineas: 51
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# csp-hashes.js

`scripts/csp-hashes.js` · 51 líneas

Calcula el sha256 de los scripts inline de las páginas y los escribe en script-src de dstar-store/netlify.toml; con --check solo verifica; seguridad-y-seo.spec.js compara la CSP con su scriptSrc().

Parte de: [[Herramientas]]

## Funciones y clases

- `paginas` (línea 12)
- `html` (línea 13)
- `hashes` (línea 17)
- `scriptSrc` (línea 33)

## Últimos cambios

- 2026-10-17 · `fc178da` · Auditoría: foto al compartir, 404 de marca, SEO, límite de peticiones, CSP sin inline, OXXO, panel de pedidos y accesibi

