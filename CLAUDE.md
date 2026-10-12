# DSTAR — CLAUDE.md

## Stack
- Vanilla HTML/CSS/JS (sin frameworks)
- Netlify Functions (Node.js 18) para backend serverless
- Cloudinary para imágenes optimizadas
- GSAP 3 (ScrollTrigger, SplitText) para animaciones
- Mercado Pago + Skydropx para pagos y envíos

## Reglas de estilo y calidad
- NO agregues comentarios al código a menos que sea estrictamente necesario
- Sigue la convención BEM para CSS: `.bloque__elemento--modificador`
- Usa las custom properties de CSS de `:root` en vez de valores hardcodeados
- Las imágenes SIEMPRE deben cargarse desde Cloudinary con `f_auto,q_auto,dpr_auto` y tamaño responsive (`w_`)
- Todo JS debe ser vanilla, sin TypeScript
- Las animaciones deben respetar `prefers-reduced-motion`
- Los targets táctiles mínimos: 44x44px
- Usa `100svh` para el hero y secciones de pantalla completa (no cambia al ocultarse la barra del navegador, evita tirones al hacer scroll) y `100dvh` solo en overlays fijos (lightbox, menú); nunca `100vh`
- Siempre incluye `aria-*` attributes en elementos interactivos

## Optimizaciones obligatorias
- Mobile-first CSS (base = mobile, media queries para desktop)
- Imágenes: siempre `loading="lazy"` y `decoding="async"`
- backdrop-filter (liquid glass) solo en elementos chicos y fijos de navegación: header, menú móvil, carrito, toast y barra de compra fija. Nunca en superficies grandes que scrollean (secciones, cards, paneles); en desktop se permite además en `.product-detail__info`
- font-display: swap en todas las fuentes

## Comandos
- `npm run dev` — Inicia servidor local con Netlify CLI
- `npm run build` — Build con Vite
- `npm run deploy` — Deploy a producción
- `npm test` — Ejecuta Playwright tests
- `npm run lh` — Ejecuta Lighthouse

## Testing
- Playwright para E2E
- Probar en 3 viewports: 375px (mobile), 768px (tablet), 1440px+ (desktop)
- Flujo crítico: homepage → seleccionar talle → add to cart → checkout → pago
- Verificar que localStorage(`dstar_cart`) persiste entre páginas
- Verificar bfcache en Safari

## Git hooks
- Pre-commit ejecuta: lint-staged (formatea HTML/CSS/JS si hay herramientas)
- Antes de cada commit, Claude debe revisar que el código no tenga:
  - Console.logs de debug
  - Comentarios de código muerto
  - Errores de accesibilidad

## Contexto del proyecto (grafo)
- Mapa del proyecto en `docs/`: abre la carpeta del repo como bóveda en Obsidian y empieza por `docs/grafo/hubs/DSTAR.md`
- Notas de contexto escritas a mano en `docs/contexto/` (flujo de compra, seguridad, despliegue, pendientes)
- Las notas de `docs/grafo/` se generan con `node docs/generar-grafo.js`; vuelve a correrlo después de agregar o mover archivos de código
- Antes de planear o implementar un cambio, usa el agente `grafo-contexto` para obtener los archivos, conexiones y reglas relevantes en vez de leer el código completo
- Después de cambiar código (y antes del commit), usa el agente `grafo-actualizador` para regenerar el grafo, corregir las notas de `docs/contexto/` y marcar pendientes resueltos
