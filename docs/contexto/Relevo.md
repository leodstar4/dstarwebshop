# Relevo — plan en curso (2026-11-11)

Nota para quien continúe el trabajo (persona u otra IA). Lee primero [[DSTAR]], `CLAUDE.md` y [[Reglas de estilo]]. Aquí está lo que pidió el usuario, el plan y en qué punto se quedó. Mantén al día la sección **Estado**.

## Lo que pidió el usuario (2026-11-11)

1. Gato 3D del museo: la cabeza no debe ser plana; la quiere redonda, con volumen.
2. Probador del museo: no le gusta cómo le queda la ropa al gato; que se vea mejor, usando otras técnicas si hace falta.
3. Animaciones más inmersivas.
4. Liquid glass más logrado en los menús.
5. Auditoría de seguridad, bugs y fallos, con todos los arreglos.
6. Este plan con contexto, por si se acaba el límite y otra IA continúa.
7. Sugerencias de mejoras.

## Reglas que no se deducen del código

- **No publicar cambios visuales sin que el usuario los vea antes.** Rechazó dos rediseños de botones hechos sin mostrar propuesta. Todo lo visual se hace en local, se le enseñan capturas y solo se sube con su visto bueno. Los arreglos de seguridad y bugs sí pueden subirse si pasan las pruebas.
- No cambiar la estética de botones, tarjetas ni formas de la tienda. El liquid glass va solo en menús: header, menú móvil, carrito, toast y barra de compra fija (`backdrop-filter` solo ahí, regla de `CLAUDE.md`).
- La banda tipográfica `.kinetic` del inicio se quitó el 2026-11-11 a petición del usuario ("está horrible"). No volver a poner texto gigante en movimiento.
- El museo es una página aparte: no carga `style.css` ni `app.js`; Three.js solo se descarga ahí (`js/vendor/three.module.min.js`).
- El deploy es por `git push origin main` (Netlify despliega solo). La carpeta `.kiro/` no se sube.
- Antes de cada commit: `node scripts/csp-hashes.js --check`, `npm run test:backend`, `npx playwright test --workers=2` (dentro de `dstar-store/`) y `node docs/generar-grafo.js`. Las pruebas del museo a veces fallan en Desktop cuando corren junto con todas; repetirlas solas con `--workers=1`.
- Capturas del museo: Chromium con `--use-angle=swiftshader`, bloquear `/api/`, esperar ~8 s a que el gato llegue a la obra. Script: `dstar-store/tests/perf/captura-museo.js`.

## Plan

### Fase 1 — Gato y probador ([[museo.js]], [[museo-ropa.js]])
- Cabeza: sustituir la silueta extruida (`ExtrudeGeometry`, 0.2 de fondo) de `createCat()` por un volumen redondeado, conservando la silueta de frente (orejas, mejillas en pico) y la cara pintada (`catFaceTexture`), ahora proyectada sobre la superficie curva.
- Ropa: `buildGarment()` arma dos medias cáscaras de revolución (`halfShell`) y medios tubos (`halfTube`) con la foto plana pegada. Mejoras previstas: sección ovalada en vez de circular, hombros que caen hacia la manga, dobladillo y cuello con grosor, pliegues y sombreado en la tela, mangas que acompañan el brazo y un leve movimiento al caminar.
- Verificar con capturas (frente, perfil, espalda; con cada prenda) y `tests/e2e/museo.spec.js`.

### Fase 2 — Liquid glass en menús ([[style.css]])
- Solo header, menú móvil, carrito, toast y barra de compra fija. Propuesta en capturas antes de publicar.

### Fase 3 — Animaciones inmersivas ([[style.css]], [[gsap-animations.js]], [[app.js]])
- Con `animation-timeline` o WAAPI, sin JS por cuadro, respetando `prefers-reduced-motion`. Medir con `node tests/perf/diagnostico.js`.

### Fase 4 — Auditoría de seguridad y bugs
- Funciones Netlify (`netlify/functions`, `netlify/handlers`, `netlify/lib`), edge functions, CSP y cabeceras de `netlify.toml`, frontend (XSS, `localStorage`, validaciones), service worker.
- Arreglar lo que salga con su prueba; anotar lo que quede en [[Pendientes]].

### Fase 5 — Sugerencias
- Lista de mejoras para el usuario al final.

## Estado de la primera revisión

Todo lo de abajo está **en local, sin commit ni push** (2026-11-11). Producción sigue en el commit `96ab210`.

- [x] Fase 1 — hecha en local. Falta el visto bueno del usuario.
  - Cabeza: esfera achatada (`HEAD` en [[museo.js]]) con orejas y mechones hechos de conos aplanados (`HEAD.spikes`: base x, base y, punta x, punta y, radio, aplanado). La cara va pintada en un casquete de esfera (`HEAD.face`).
  - Ropa: `MOLDES` ahora usa `anillos` ([y, radio x, radio z]; el primero es el doblez interior del dobladillo), `pliegue` y `manga` ([y, radio] en coordenadas del brazo o la pierna). `halfShell` arma medio cuerpo ovalado con pliegues y normales calculadas; `halfSleeve` es media manga de revolución que nace dentro del hombro. La tela usa `MeshStandardMaterial` con un poco de luz propia para que las prendas negras se lean.
  - `fabricColor` toma el tono dominante del recorte (antes promediaba los bordes y metía el fondo gris de la foto).
  - Recortes del jort corregidos en [[museo-ropa.js]].
  - Versiones: `museo.js?v=6`, `museo-ropa.js?v=2`.
- [x] Fase 2 — hecha en local. Falta el visto bueno. Solo cambiaron los tokens `--glass-*` de `:root` (más transparencia, brillo especular, resplandor interior, `brightness` en el `backdrop-filter`) y el velo del menú móvil (`--glass-veil`). No cambió ninguna forma ni botón.
- [x] Fase 3 — hecha en local. Falta el visto bueno. En el bloque INMERSIÓN: los títulos de sección suben al entrar (`driftIn`) y las fotos del lookbook tienen paralaje (`lookDrift`). Las tarjetas no se tocaron: su `translate` ya lo usa la inclinación.
- [x] Fase 4 — arreglos hechos en local, con pruebas:
  - `producto-meta.js`: los `replace` usaban texto de reemplazo, así que un precio que empieza en 1 (`$1200`) o un `$&` en el nombre rompían los metadatos. Ahora usan funciones. Prueba en `seguridad-y-seo.spec.js`.
  - [[app.js]]: las tallas de la ficha se escapan con `escapeHtml`.
  - `nodemailer` actualizado a 10.5.0 (aviso moderado de `addressparser`). `npm audit --omit=dev` queda en 0.
  - Revisado sin hallazgos: firma del webhook, panel (`admin()`), límites por IP, validación de pedido y cotización, seguimiento, avisos, analítica, service worker, escapes del frontend.
  - Anotado, sin arreglar: las dependencias de desarrollo (`netlify-cli`) arrastran avisos de `npm audit`; no llegan a producción. Los 404 de `/*.js` y `/*.css` se guardan 24 h en la CDN (`Cache-Control` de `netlify.toml`): no pedir un archivo nuevo antes de que termine el deploy.
- [x] Fase 5 — sugerencias entregadas al usuario en el chat.
- Versiones en esa revisión local: `style.css?v=45`, `app.js?v=43`, `sw.js` `dstar-v21`.
- Pruebas: 285 E2E pasan, 36 omitidas; 39 de backend; CSP al día.

## Siguiente paso

1. El usuario aprobó la revisión final y pidió subirla a GitHub. Regenerar el grafo, comprobar las pruebas y publicar por `git push origin main`.
2. Si pide ajustes del gato: revisar [[museo-gato.js]] y [[museo.js]], y comprobar con `DIAG_GPU=1 node tests/perf/captura-museo.js <carpeta> -1,0,1` (`-1` es el gato sin ropa; los demás son el índice de la obra).
3. Capturas de menús: `node tests/perf/captura-menus.js <carpeta>`.

## Bitácora

- 2026-11-11: plan creado y fases 1 a 4 hechas en local.
- 2026-11-11: recibido el dibujo original del gato. En local se trasladó su silueta a una cabeza con volumen y se pintaron los ojos de estrella sobre la curva. El probador acerca la cámara, anima la colocación de la prenda y mueve la tela al caminar. Los drops aparecen en cascada, también al llegar piezas nuevas del catálogo remoto. El paso al checkout desvanece el carrito y muestra el formulario con un fundido breve. Vista previa en `http://127.0.0.1:8888/` y `http://127.0.0.1:8888/museo.html`.
- 2026-11-11: el punto 4 del plan de continuación (formulario «PRÓXIMO DROP», compra real e iPhone físico) se excluyó por petición del usuario. El usuario indicó que los datos legales públicos queden vacíos. Los campos ya están vacíos en producción. El remitente de dominio propio sigue pendiente de acceso a Resend y Cloudflare. Los pasos están en [[OPERACION]].
- 2026-11-11: 285 E2E pasaron (36 omitidas) y 39 pruebas de backend pasaron. Se repitieron las pruebas de museo, flujo de compra y operación, y se comprobó el fundido final y la entrada de piezas del catálogo remoto con y sin movimiento reducido. CSP al día.
- 2026-11-11: revisión del personaje en local. `museo-gato.js` conserva el contorno del dibujo y modela las cuencas, los ojos y las pupilas en 3D. El cuello, el torso, los codos, las rodillas, las manos y las patas tienen articulación propia. El probador usa el mismo esqueleto para la piel y las prendas, con las uniones de hombro y cadera sujetas al torso y a la pelvis. El gesto de vestirse permanece y la tela se mantiene en su sitio durante la marcha.
- 2026-11-11: ajustadas las proporciones del gato con cuello corto, torso compacto y garras más discretas, conservando el modelo y el acabado de la cara. La marcha apoya el talón, flexiona la parte delantera de la pata e incorpora movimiento en hombros, antebrazos y muñecas. Aumentó la velocidad de avance manual y entre obras. Se adaptaron los moldes al cuerpo y se revisaron los recortes contra las fotos originales para suavizar los bordes y conservar el color de cada tela.
- 2026-11-11: las referencias de figuras de vinilo orientaron una silueta con cabeza grande, piernas cortas, manos redondeadas y tenis de suela gruesa. Se reajustaron los moldes y la marcha. El gato empieza con un atuendo negro que se sustituye por las prendas del catálogo según la zona y vuelve al quitar cada prenda.
- 2026-11-11: se quitó la cola y los tenis quedaron negros, incluidos suela, cordones y talón. La muñeca guía la flexión de hombro y codo, y un hueso adicional distribuye el giro del antebrazo en la piel y la manga durante la marcha, el saludo y el gesto de vestirse.
- 2026-11-11: los tenis se redujeron un 11 % de ancho y largo, conservando el apoyo de la suela. WASD controla al gato. Las flechas y el arrastre orbitan la cámara centrada en el personaje. La rueda, las teclas más y menos y los botones en pantalla ajustan el zoom.
