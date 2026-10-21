---
tags: [contexto]
---
# Despliegue

- Hosting en [[Netlify]]. La raíz tiene [[netlify.toml (raíz)]] solo para fijar la base en `dstar-store`; el resto está en [[netlify.toml (dstar-store)]].
- Sitio estático: no hay paso de build, aunque exista [[vite.config.mjs]].
- Node 22 para las funciones.
- Local: `npm run dev` dentro de `dstar-store` ([[Netlify CLI]] en el puerto 8888); producción: se despliega solo con `git push` a `main` (Netlify construye desde GitHub).
- **Antes del primer deploy de la versión del 2026-10-19**, seguir [[OPERACION]]:
  - Respaldar el blob `stock/vendidas` y los pedidos.
  - Configurar [[PANEL_PASSWORD]] y [[MP_WEBHOOK_SECRET]].
  - Registrar el webhook en Mercado Pago.
  - Después del deploy, verificar los headers `no-store` y hacer una compra de prueba ([[Pendientes]]).
- **Formato de funciones (v2):** cada función es un `netlify/functions/*.mjs` de tres líneas que envuelve el handler de `netlify/handlers/` con [[v2.js]]. Es obligatorio: con `exports.handler` (modo Lambda) `@netlify/blobs` no configura `uncachedEdgeURL` y toda lectura strong truena con `BlobsConsistencyError` (pasó en producción el 2026-10-20: `/api/catalogo` 503 y `/api/stock` 429). La lógica y los tests siguen usando `handler(event)`. Cada envoltorio importa `@netlify/blobs` y `nodemailer` de forma estática: Netlify empaqueta con esbuild dejando los paquetes externos y nft no reconoce los `__require()` que genera, así que sin esos imports los paquetes no se copian y la función falla al cargar (502).
- **Local:** `netlify dev` desde la raíz necesita `NODE_PATH=dstar-store/node_modules` para que las funciones v2 encuentren sus dependencias. El sandbox local de Blobs no devuelve `etag` al leer, así que las escrituras condicionales fallan solo en local; en producción sí funcionan.
- **Funciones fuera de petición:**
  - [[reconcile-payments.js]] está programada cada 10 minutos (`[functions."reconcile-payments"] schedule`). Solo actúa con `CONTEXT=production` y, como las programadas tienen 30 s, encola el trabajo.
  - [[payment-jobs-background.js]] es una Background Function (sufijo `-background`): la llaman [[jobs.js]] desde el webhook y la conciliación, con [[URL_SITIO]] HTTPS.
  - En el panel, la última conciliación aparece junto al estado de configuración.
- **Datos:** todo vive en [[Netlify Blobs]] vía [[storage.js]]: pedidos, inventario (`stock/vendidas`), catálogo y datos de la tienda (`catalogo`), cotizaciones, límites (`limites`) y cursor de conciliación (`operacion`). Fuera de producción (salvo `netlify dev`) cada store lleva un sufijo por deploy, así los deploy previews no tocan los datos reales.
- **Edge functions** en `netlify/edge-functions/` (Netlify las detecta solas; cada una declara su `path` en `config`):
  - [[producto-meta.js]] en `/producto.html` y `/producto`, y [[sitemap.js]] en `/sitemap.xml`.
  - Las dos piden `/api/catalogo` ([[catalogo.js]]) con 3 s de tope y, si falla, usan [[products-data.js]]. Solo listan o describen productos activos, así que un producto nuevo del panel aparece solo en el sitemap y en las vistas previas al compartir.
- **SEO y redes:**
  - `robots.txt` bloquea `/api/` y `/.netlify/` y apunta al sitemap, que también incluye [[privacidad.html]].
  - Las páginas indexables ([[index.html]], [[producto.html]], [[terminos.html]], [[agradecimientos.html]] y el blog) tienen canonical, `og:*` y `twitter:card`; [[privacidad.html]] todavía no ([[Pendientes]]).
  - La imagen para compartir es `assets/brand/og-dstar.jpg` (1200×630). Los artículos del blog usan su propia foto de [[Cloudinary]] recortada a 1200×630 (`f_jpg,q_auto,c_fill,g_auto`).
  - [[index.html]] lleva además JSON-LD `Organization` con el Instagram en `sameAs`.
  - [[producto-meta.js]] reescribe por prenda title, description, canonical y `og:*` con su foto vía [[Cloudinary]] (`f_jpg,q_auto,c_pad,b_auto,w_1200,h_630`) y agrega `product:price:*` y JSON-LD `Product`.
  - Las privadas llevan `meta robots noindex`: [[checkout.html]], [[gracias.html]], [[error-pago.html]], [[pago-pendiente.html]], [[offline.html]], [[pedidos.html]], [[seguimiento.html]] y [[404.html]]. Netlify sirve [[404.html]] en cualquier ruta que no existe.
  - Redes: solo Instagram (`@dstar_.4`); TikTok se quitó hasta que haya cuenta.
- Si el cambio edita un script inline de cualquier HTML, correr [[csp-hashes.js]] (`node scripts/csp-hashes.js`) para actualizar `script-src`; si no, la CSP bloquea el script en producción ([[Seguridad]]).
- Si el cambio agrega o cambia fotos de productos, correr [[calentar-cloudinary.js]] (`node scripts/calentar-cloudinary.js`) después de subirlas, para que los clientes no esperen a que [[Cloudinary]] genere cada tamaño (incluida la imagen para compartir).
- **Variables de entorno:** [[Variables de entorno]].
  - El panel necesita [[PANEL_PASSWORD]] (mínimo 16 caracteres); sin ella [[pedidos.js (handlers)]] y [[admin-store.js]] responden 503.
  - El correo usa [[Resend]] si están [[RESEND_API_KEY]] y [[MAIL_FROM]]; si no, SMTP propio (`SMTP_*`) o [[Gmail SMTP]].
  - Nunca configurar [[DSTAR_MEMORY_STORE]] en Netlify.

Parte de: [[DSTAR]]
