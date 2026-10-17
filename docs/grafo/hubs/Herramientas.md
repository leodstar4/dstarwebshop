---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Herramientas

Scripts de apoyo (imágenes, caché de Cloudinary, Lighthouse).

Parte de: [[DSTAR]]

## Contenido

- [[.lighthouserc.js]] — Configuración de Lighthouse CI sobre localhost:8888.
- [[calentar-cloudinary.js]] — Pide una vez a Cloudinary todas las variantes que usa la web a partir de products-data.js (tarjetas, galería y lightbox hasta 2400, miniaturas y LQIP) para que ningún cliente espere a que se generen; se corre tras agregar o cambiar fotos.
- [[optimize-images.js (dstar-store)]] — Optimiza imágenes con sharp (carpetas y archivos extra del sitio).
- [[optimize-images.js (scripts)]] — Genera tamaños optimizados de las fotos de productos con sharp.

