---
tags: [contexto]
---
# Pruebas y calidad

- E2E con [[Playwright]]: [[flujo-compra.spec.js]], [[audit-bugs.spec.js]] y [[stock-y-animaciones.spec.js]], configuradas en [[playwright.config.js]].
- Viewports: 375px, 768px y 1440px o más.
- Checklist manual antes de cada deploy: [[TESTING]].
- Rendimiento: [[diagnostico.js]] y [[Lighthouse]].
- Antes de cada commit se revisa que no queden console.log de debug, código muerto ni errores de accesibilidad ([[CLAUDE]]).

Parte de: [[DSTAR]]
