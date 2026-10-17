---
tags: [contexto]
---
# Despliegue

- Hosting en [[Netlify]]. La raíz tiene [[netlify.toml (raíz)]] solo para fijar la base en `dstar-store`; el resto está en [[netlify.toml (dstar-store)]].
- Sitio estático: no hay paso de build, aunque exista [[vite.config.mjs]].
- Node 22 para las funciones.
- Local: `npm run dev` dentro de `dstar-store` ([[Netlify CLI]] en el puerto 8888); producción: se despliega solo con `git push` a `main` (Netlify construye desde GitHub).
- Edge functions en `netlify/edge-functions/` (Netlify las detecta solas, cada una declara su `path` en `config`): [[producto-meta.js]] en `/producto.html` y `/producto` y [[sitemap.js]] en `/sitemap.xml`. Las dos leen [[products-data.js]], así que un producto nuevo aparece solo en el sitemap y en las vistas previas al compartir.
- SEO y redes: `robots.txt` bloquea `/api/` y `/.netlify/` y apunta al sitemap. Las páginas indexables ([[index.html]], [[producto.html]], [[terminos.html]], [[agradecimientos.html]] y el blog) tienen canonical, `og:*` y `twitter:card`. La imagen para compartir es `assets/brand/og-dstar.jpg` (1200×630); los artículos del blog usan su propia foto de [[Cloudinary]] recortada a 1200×630 (`f_jpg,q_auto,c_fill,g_auto`). [[index.html]] lleva además JSON-LD `Organization` con el Instagram en `sameAs`. [[producto-meta.js]] reescribe por prenda title, description, canonical y `og:*` con su foto vía [[Cloudinary]] (`f_jpg,q_auto,c_pad,b_auto,w_1200,h_630`) y agrega `product:price:*` y JSON-LD `Product`. Las privadas ([[checkout.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[offline.html]], [[pedidos.html]] y [[404.html]]) llevan `meta robots noindex`. Netlify sirve [[404.html]] en cualquier ruta que no existe. Redes: solo Instagram (`@dstar_.4`); TikTok se quitó hasta que haya cuenta.
- Si el cambio edita un script inline de cualquier HTML, correr [[csp-hashes.js]] (`node scripts/csp-hashes.js`) para actualizar `script-src`; si no, la CSP bloquea el script en producción ([[Seguridad]]).
- Si el cambio agrega o cambia fotos de productos, correr [[calentar-cloudinary.js]] (`node scripts/calentar-cloudinary.js`) después de subirlas, para que los clientes no esperen a que [[Cloudinary]] genere cada tamaño (incluida la imagen para compartir).
- Variables de entorno: [[Variables de entorno]]. El panel de pedidos necesita [[PANEL_PASSWORD]] (mínimo 16 caracteres) en Netlify; sin ella [[pedidos.js (functions)]] responde 503.

Parte de: [[DSTAR]]
