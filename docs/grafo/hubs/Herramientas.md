---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Herramientas

Scripts de apoyo (imágenes, caché de Cloudinary, hashes de la CSP, Lighthouse).

Parte de: [[DSTAR]]

## Contenido

- [[.lighthouserc.js]] — Configuración de Lighthouse CI sobre localhost:8888.
- [[calentar-cloudinary.js]] — Pide una vez a Cloudinary todas las variantes que usa la web a partir de products-data.js (tarjetas, galería y lightbox hasta 2400, miniaturas, LQIP y la imagen para compartir de 1200x630) para que ningún cliente espere a que se generen; se corre tras agregar o cambiar fotos.
- [[csp-hashes.js]] — Calcula el sha256 de los scripts inline de las páginas y los escribe en script-src de dstar-store/netlify.toml; con --check solo verifica; seguridad-y-seo.spec.js compara la CSP con su scriptSrc().
- [[optimize-images.js (dstar-store)]] — Optimiza imágenes con sharp (carpetas y archivos extra del sitio).
- [[optimize-images.js (scripts)]] — Genera tamaños optimizados de las fotos de productos con sharp.

