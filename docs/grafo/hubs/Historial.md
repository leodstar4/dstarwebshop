---
tags: [hub]
---
%% Generado por docs/generar-grafo.js. No lo edites a mano: vuelve a correr `node docs/generar-grafo.js`. %%

# Historial

Commits del repo, del más reciente al más antiguo. Cada archivo de código lista sus últimos cambios en su propia nota.

Parte de: [[DSTAR]]

## 2026-10-12

- `eef15b5` Fluidez en desktop: revelados en el compositor, logo 3D en pausa fuera de pantalla y menos trabajo por cuadro
- `d231e35` Desktop: logo del hero sin chocar con el header, navegación sin esperas y móviles sin desbordes
- `a5ec8ac` Grafo de Obsidian del proyecto y agentes que lo leen y lo mantienen
- `17c7774` Stock vivo, alertas de pedidos, términos y animaciones que nunca ocultan contenido

## 2026-10-11

- `89f5597` Logo 3D: video directo otra vez (la CSP bloqueaba blob: y forzaba el decodificador lento), loader espera al respaldo en modo de ahorro
- `9948892` Logo 3D en modo de ahorro: arranca en el loader, ritmo parejo a 30 fps, una sola descarga y un solo canvas activo
- `8d6aea5` Seguridad: firma obligatoria y guía única en webhook MP, origen permitido en checkout, SRI en GSAP, CSP más estricta; logo 3D igual en modo de ahorro (WebCodecs); planner

## 2026-10-10

- `461aa1d` Ícono de la PWA con fondo blanco y logo a color
- `453b5f9` Fluidez: sin ScrollTrigger (reveals con IntersectionObserver), scroll-driven CSS, galería con srcset y precarga, bfcache, archivos internos bloqueados, a11y
- `4a93fdf` Página de producto rápida y sin saltos, transición ligera con precarga, logo 3D gira en loader y sin pausas
- `d116893` Logo 3D: MP4 H.264 con alfa compuesto en WebGL (fluido y nítido en iPhone), reemplaza AVIF animada
- `a3628f5` Carga más rápida: viewport antes de precargas, loader inline, logo 3D a 60fps, lookbook responsive, sin salto de layout
- `8e69a51` Logo 3D girando (AVIF animada) en loader y hero, script de diagnóstico de fluidez
- `be7be88` Restaura fondo y cards flotantes, logo 3D nuevo y hero en svh para evitar tirones
- `8b73af2` Rediseño premium, seguridad de pagos, fluidez y PWA

## 2026-06-19

- `12b2567` Email: separar etiqueta de envío — cliente solo rastreo, tienda con etiqueta
- `fd99f34` Checkout: cobrar el envío junto con la prenda en el mismo pago
- `99c66de` BENDECIDO: precio 300 -> 350
- `e3d0817` Skydropx auth: sanitiza credenciales y loguea error_description completo
- `780fb72` Fix Netlify: base directory = dstar-store (arregla 404 en sitio y funciones)

## 2026-06-16

- `c1431e1` Checkout: a11y, validación, peso dinámico, tests E2E y micro-animaciones

## 2026-06-07

- `89b8f32` Checkout completo: envíos Skydropx Pro v2 + correo de confirmación

## 2026-05-11

- `0295dca` Perf: cursor lag, mobile scroll + 10 optimizaciones de velocidad

## 2026-05-09

- `2648299` Mobile: fix scroll bloqueado — eliminar touch direction lock

## 2026-04-27

- `527d513` Mobile UX: fix diagonal scroll, product card navigation, sticky CTA + agradecimientos updates

## 2026-04-25

- `70c9861` UX: scarcity pulse + scroll reveals + sound toggle + card scramble

## 2026-04-20

- `3a560f6` Mobile: lookbook grid + lightbox producto + sticky CTA + UX compra intuitiva
- `440790d` Cards DROPS: accent bar roja a blanca (badge LIMITADO sigue rojo)
- `7ed92c5` Producto: estáticos rojos a blancos (guión DROP + border desc)
- `11b8bb8` Fix bordes negros en imágenes + animaciones blancas (salvo badge LIMITADO)
- `0a927ba` Producto: panel glass semi-transparente + animaciones ambientales + fix tamaño imágenes mobile/desktop
- `aa5e688` Cards: quitar spotlight rojo en hover (brackets + shine + accent se mantienen)
- `0dc9c2d` Cards rediseñadas + fix producto: header, carrusel mobile, info panel premium

## 2026-04-19

- `9962929` Cards DROPS: cinta masking tape como etiqueta compacta debajo de la foto

## 2026-04-17

- `dcacbab` Fix mobile: imagenes visibles + carousel iOS + fade-in robusto
- `06dfe43` Producto: galería 3/4 contain, lightbox premium, animaciones glow en todos los botones

## 2026-04-13

- `c63f3bf` Fix mobile: product detail layout, bfcache nav, nav menu typography
- `87d336c` Fix bfcache, nav hash links, email, images, agradecimientos page

## 2026-04-12

- `f1d6712` Actualiza imágenes dosvistas, precios y fix bugs Netlify mobile
- `6035672` Mobile/tablet audit: 100dvh, touch targets, WCAG, animaciones GSAP y background system

## 2026-04-11

- `5dc2e96` Fix mobile: fondo negro al scroll + hero buggy + animaciones más fluidas
- `234442d` Prioridad máxima al preload del logo
- `2649f55` Mobile/tablet optimization + fix animaciones Netlify
- `f2c316b` Fix: logo sin compresión de calidad (q_100, w_600 para retina)
- `6acef6a` Optimización de performance: Cloudinary transforms + lazy loading
- `f6a6bd0` Clean start — imágenes migradas a Cloudinary CDN

