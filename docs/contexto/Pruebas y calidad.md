---
tags: [contexto]
---
# Pruebas y calidad

- E2E con [[Playwright]]: [[flujo-compra.spec.js]], [[audit-bugs.spec.js]] y [[stock-y-animaciones.spec.js]], configuradas en [[playwright.config.js]]. [[flujo-compra.spec.js]] incluye el lightbox de la galería: abre, navega con flechas, acerca y aleja con `+`/`-` y cierra con Escape devolviendo el foco a la foto vista.
- Con los workers por defecto la máquina se satura y aparecen fallos intermitentes ajenos al cambio (también con el código anterior). Con `npx playwright test --workers=2` pasan las 136 (2026-10-17).
- Viewports: 375px, 768px y 1440px o más.
- Checklist manual antes de cada deploy: [[TESTING]].
- Rendimiento: [[diagnostico.js]] y [[Lighthouse]].
- Antes de cada commit se revisa que no queden console.log de debug, código muerto ni errores de accesibilidad ([[CLAUDE]]).

Parte de: [[DSTAR]]
