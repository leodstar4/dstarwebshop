---
tags: [contexto]
---
# Pendientes

La lista completa y priorizada está en [[PLANNER]]. Ya resueltos: términos ([[terminos.html]]), stock real ([[stock-store.js]], [[stock.js]]), alertas de pedidos con problemas (`alertarTienda` en [[mp-webhook.js]]) y, el 2026-10-17, enlaces de redes, límite de peticiones ([[rate-limit.js]]), CSP sin `'unsafe-inline'` ([[csp-hashes.js]]), panel de pedidos ([[pedidos.html]]), SEO básico ([[producto-meta.js]], [[sitemap.js]]), `viewport-fit=cover` y el indicador SCROLL ([[style.css]]).

Dónde toca cada tema pendiente:

- Configurar [[PANEL_PASSWORD]] (mínimo 16 caracteres) en Netlify → Environment variables; hasta entonces el panel responde 503: [[pedidos.js (functions)]].
- Aviso de privacidad: [[checkout.html]], [[terminos.html]].
- Datos del proveedor que pide PROFECO (razón social, domicilio, teléfono): [[terminos.html]].
- Probar en un iPhone real el logo 3D con modo de ahorro, el video del loader (`logo-3d-loader.mp4` con `mix-blend-mode: lighten`, también con autoplay bloqueado, donde debe quedar el póster), que drops y lookbook aparezcan y las safe areas con notch: [[index.html]], [[loader.js]], [[logo-3d.js]], [[gsap-animations.js]], [[style.css]].
- Correo transaccional con dominio propio: [[mp-webhook.js]], [[Gmail SMTP]].
- Enlace de TikTok cuando exista la cuenta: [[index.html]] y los footers.

Sugeridos tras la auditoría de fluidez del 2026-10-12, todavía no están en [[PLANNER]]:

- Probar en dispositivos reales (iPhone y Android) el video del loader, el logo en el worker y las fotos AVIF en Safari: [[index.html]], [[logo-3d-worker.js]], [[logo-3d.js]], [[app.js]]. Incluye el MP4 re-exportado del 2026-10-13 (sin cuadros B), el canvas a DPR 3, el salto de hasta 3 cuadros cuando el decodificador se atrasa, el worker creado desde el loader con `hold` y cuánto tarda en irse el loader; hasta ahora solo se probó con emulación en Chrome (CPU limitada 4x) y en el WebKit de Playwright.

Detalles conocidos, menores:

- [[checkout.html]] carga [[style.css]] pero no tiene `viewport-fit=cover`, así que el bloque SAFE AREAS no aplica ahí.
- `PANEL_PASSWORD` no está en `.env.example`.

Parte de: [[DSTAR]]
