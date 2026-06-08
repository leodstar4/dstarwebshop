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
- Usa `100dvh` en vez de `100vh` para altura completa
- Siempre incluye `aria-*` attributes en elementos interactivos

## Optimizaciones obligatorias
- Mobile-first CSS (base = mobile, media queries para desktop)
- Imágenes: siempre `loading="lazy"` y `decoding="async"`
- backdrop-filter solo en desktop (desactivar en mobile para rendimiento)
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
