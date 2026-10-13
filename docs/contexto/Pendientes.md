---
tags: [contexto]
---
# Pendientes

La lista completa y priorizada está en [[PLANNER]]. Ya resueltos: términos ([[terminos.html]]), stock real ([[stock-store.js]], [[stock.js]]) y alertas de pedidos con problemas (`alertarTienda` en [[mp-webhook.js]]).

Dónde toca cada tema pendiente:

- Aviso de privacidad: [[checkout.html]], [[terminos.html]].
- Datos del proveedor que pide PROFECO (razón social, domicilio, teléfono): [[terminos.html]].
- Límite de peticiones: [[cotizar-envio.js]], [[mp-preference.js]], [[stock.js]].
- CSP sin `'unsafe-inline'`: [[netlify.toml (dstar-store)]].
- Redes y SEO: [[index.html]], [[producto.html]], [[agradecimientos.html]].
- Probar en un iPhone real el logo 3D con modo de ahorro, el video del loader (`logo-3d-loader.mp4` con `mix-blend-mode: lighten`, también con autoplay bloqueado, donde debe quedar el póster) y que drops y lookbook aparezcan: [[index.html]], [[logo-3d.js]], [[gsap-animations.js]].

Sugeridos tras la auditoría de fluidez del 2026-10-12, todavía no están en [[PLANNER]]:

- Probar en dispositivos reales (iPhone y Android) el video del loader, el logo en el worker y las fotos AVIF en Safari: [[index.html]], [[logo-3d-worker.js]], [[logo-3d.js]], [[app.js]]. Incluye el MP4 re-exportado del 2026-10-13 (sin cuadros B), el canvas a DPR 3, el salto de hasta 3 cuadros cuando el decodificador se atrasa, el worker creado desde el loader con `hold` y cuánto tarda en irse el loader; hasta ahora solo se probó con emulación en Chrome (CPU limitada 4x) y en el WebKit de Playwright.

Detalles conocidos, menores:

- El indicador SCROLL tiene dos animaciones de `opacity` (`heroFadeIn` y `heroIndicatorOut`, ligada al scroll) que no se componen: [[style.css]].
- Agregar `viewport-fit=cover` al meta viewport: ninguna de las 12 páginas lo tiene aunque [[style.css]] usa `env(safe-area-inset-*)`; por ejemplo [[index.html]], [[producto.html]], [[checkout.html]].

Parte de: [[DSTAR]]
