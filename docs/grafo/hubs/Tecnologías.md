---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Tecnologías

Servicios externos, librerías y herramientas que usa el proyecto.

Parte de: [[DSTAR]]

## Contenido

- [[Cloudinary]] — servicio. CDN de imágenes: q_auto, dpr_auto y ancho responsive; AVIF (f_avif) en `<picture>` con f_auto de respaldo y recorte c_fill,ar_16:9 en las fotos del blog.
- [[Gmail SMTP]] — servicio. Correo transaccional con nodemailer por Gmail o por un SMTP propio (SMTP_*): confirmación y guía al cliente, copia y alertas a la tienda. Se usa si no está configurado Resend.
- [[Google Fonts]] — servicio. Tipografías (fonts.googleapis.com y fonts.gstatic.com) con font-display: swap.
- [[GSAP]] — librería. Animación del sitio (hero, contador, cursor, botones magnéticos; SplitText en el index, el blog y términos). Se sirve desde js/vendor del propio sitio.
- [[http-server]] — herramienta. Servidor estático que usa netlify dev como target en local.
- [[Lighthouse]] — herramienta. Auditoría de rendimiento, accesibilidad y SEO (Lighthouse CI).
- [[Mercado Pago]] — servicio. Pasarela de pago: preferencias de checkout, webhooks de pago y firma de notificaciones.
- [[Netlify]] — servicio. Hosting, CDN y Netlify Functions del sitio. Headers y redirects viven en netlify.toml.
- [[Netlify Blobs]] — servicio. Almacén clave-valor de Netlify, con lectura fuerte y escritura condicional desde netlify/lib/storage.js: pedidos, inventario (stock/vendidas), catálogo y datos de la tienda (catalogo), cotizaciones, límites de peticiones (limites) y cursor de la conciliación (operacion).
- [[Netlify CLI]] — herramienta. netlify dev (puerto 8888) y deploy a producción.
- [[node-fetch]] — librería. fetch para Node (las funciones usan el fetch global de Node 22).
- [[Playwright]] — herramienta. Pruebas E2E y mediciones de rendimiento en desktop, tablet y móvil.
- [[Resend]] — servicio. API de correo opcional (RESEND_API_KEY y MAIL_FROM); si está configurada tiene prioridad sobre SMTP y envía con Idempotency-Key.
- [[sharp]] — herramienta. Redimensiona y comprime imágenes antes de subirlas.
- [[Skydropx]] — servicio. Paquetería: cotización de envíos y creación de guías (Skydropx Pro, API v1 con OAuth2).
- [[Vite]] — herramienta. Configuración heredada; el despliegue actual no compila nada.

