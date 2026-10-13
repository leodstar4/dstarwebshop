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
- Probar en un iPhone real el logo 3D con modo de ahorro y que drops y lookbook aparezcan: [[logo-3d.js]], [[gsap-animations.js]].

Sugeridos tras la auditoría de fluidez del 2026-10-12, todavía no están en [[PLANNER]]:

- Probar en dispositivos reales el logo en el worker en Android y las fotos AVIF en Safari: [[logo-3d-worker.js]], [[logo-3d.js]], [[app.js]].
- Agregar `viewport-fit=cover` al meta viewport: ninguna de las 12 páginas lo tiene aunque [[style.css]] usa `env(safe-area-inset-*)`; por ejemplo [[index.html]], [[producto.html]], [[checkout.html]].

Parte de: [[DSTAR]]
