# DSTAR — Manual Testing Checklist

Run this checklist before every deploy. Use `npm run dev` en `dstar-store/` y abre `http://localhost:8888`.

---

## 1. Carga inicial

- [ ] Loader aparece y desaparece en ≤4s
- [ ] Logo se carga sin parpadeo (preload funciona)
- [ ] Background imagen visible en desktop y mobile
- [ ] Scroll progress bar aparece al hacer scroll
- [ ] No hay errores en consola (F12)

---

## 2. Header y navegación

- [ ] Header visible y sticky al hacer scroll
- [ ] Links de nav llevan a sus secciones (#drops, #lookbook, #about, #blog, #contacto)
- [ ] **Mobile (≤768px):** botón hamburguesa visible, nav desktop oculta
- [ ] Menú móvil abre y cierra correctamente
- [ ] Cart badge se actualiza al agregar productos
- [ ] Logo lleva a la página principal

---

## 3. Hero

- [ ] Título animado entra correctamente (SplitText char-by-char)
- [ ] Botón CTA visible y funcional
- [ ] **Desktop:** parallax sutil al hacer scroll
- [ ] **Mobile/Tablet:** sin parallax (fade solamente)
- [ ] Scroll indicator desaparece al iniciar scroll

---

## 4. Drops / Grid de productos

- [ ] Productos se renderizan desde PRODUCTS array
- [ ] Imágenes cargan (Cloudinary CDN)
- [ ] Badge "LIMITADO" / "AGOTADO" visible en los correctos
- [ ] Contador de stock ("QUEDAN X PIEZAS") visible
- [ ] **Producto disponible:** click abre página de detalle con transición
- [ ] **Producto agotado:** click abre modal con mensaje de agotado
- [ ] **Desktop:** cursor personalizado visible sobre el grid
- [ ] Animaciones fade-in al hacer scroll

---

## 5. Modal de producto (desde grid)

- [ ] Modal abre con imagen y datos correctos
- [ ] Selector de talla funciona (botones seleccionables)
- [ ] Botón "Agregar al carrito" funciona con talla seleccionada
- [ ] Sin talla: botón deshabilitado / toast de aviso
- [ ] Modal se cierra con ✕ y con click en overlay
- [ ] Modal se cierra con ESC

---

## 6. Carrito

- [ ] Drawer abre al hacer click en ícono de carrito
- [ ] Productos en carrito se muestran con imagen, nombre, talla, precio
- [ ] Cambiar cantidad (+/-) actualiza total
- [ ] Eliminar producto del carrito funciona
- [ ] Envío gratis visible cuando total ≥ $999 MXN
- [ ] Botón "PAGAR CON MERCADO PAGO" activa el checkout
- [ ] Carrito persiste al recargar página (localStorage)

---

## 7. Página de producto (`producto.html`)

- [ ] Producto carga correctamente (nombre, precio, tallas, imágenes)
- [ ] **Desktop:** galería vertical con hover zoom
- [ ] **Mobile:** carrusel swipeable
- [ ] Selector de talla funciona
- [ ] Botón "Agregar al carrito" habilitado solo con talla seleccionada
- [ ] Sticky CTA visible al hacer scroll en mobile
- [ ] Acordeón de FAQs abre y cierra
- [ ] Lightbox se abre al hacer click en imagen (desktop)
- [ ] Scroll progress bar funciona
- [ ] Botón "← VOLVER" regresa al inicio

---

## 8. Lookbook

- [ ] **Desktop:** scroll horizontal funciona (CSS snap)
- [ ] **Tablet (769-1024px):** flechas ← → y dots de navegación
- [ ] **Mobile:** grid con lightbox al hacer tap
- [ ] Imágenes cargan correctamente

---

## 9. Blog

- [ ] Cards de blog se muestran en la sección #blog
- [ ] Click en card navega al artículo con transición de fade
- [ ] **Artículo:** título, fecha, imagen destacada y cuerpo visibles
- [ ] Botón "← BLOG" regresa a la sección de blog
- [ ] Carrito funcional en páginas de blog

---

## 10. Checkout y páginas de estado

- [ ] `agradecimientos.html`: animación de entrada, mensaje correcto
- [ ] `gracias.html`: muestra `payment_id` de la URL si existe
- [ ] `error-pago.html`: mensaje de error visible, botón de reintentar
- [ ] `pago-pendiente.html`: mensaje de pendiente visible

---

## 11. Responsive

Probar en: **375px (Mobile)**, **768px (Tablet)**, **1440px (Desktop)**

- [ ] No hay overflow horizontal en ninguna página
- [ ] Todos los textos son legibles
- [ ] Tap targets (botones, links) son ≥44×44px en mobile
- [ ] No se rompe el layout al rotar el dispositivo

---

## 12. Performance (Lighthouse — solo antes de release importante)

```bash
# Levantar servidor de preview primero:
cd dstar-store && npm run build && npm run preview
# Luego correr Lighthouse en http://localhost:4173
```

Objetivos mínimos:
- Performance: ≥80
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥80

---

## Automated tests

```bash
# Correr tests de Playwright (requiere `npm run dev` activo en otra terminal):
cd dstar-store
npm test
```
