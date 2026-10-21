# Operación de DSTAR — cambios locales del 19/10/2026

## Alcance

No se incluyen emisión de reembolsos, gestión de devoluciones ni facturación.
Las acciones `refund` y `return` se rechazan en el servidor; no existen botones
para ellas ni una operación de reposición asociada a devoluciones.
Se siguen leyendo los estados de Mercado Pago para frenar el despacho cuando
un pago haya sido revertido, esté en disputa o tenga un contracargo.
Las políticas y derechos legales del comprador no se eliminan.

## Antes de publicar

1. Configurar en Netlify (ámbito Functions) `PANEL_PASSWORD` aleatoria de al
   menos 16 caracteres y `MP_WEBHOOK_SECRET` copiada desde la integración de
   Mercado Pago. No compartir secretos en chats ni incluirlos en Git.
2. Confirmar `MP_ACCESS_TOKEN`, credenciales de Skydropx, domicilio de origen,
   correo y `URL_SITIO` HTTPS. Las variables de ejemplo no son credenciales reales.
3. En Mercado Pago, registrar el webhook de pagos en
   `https://TU-SITIO/.netlify/functions/mp-webhook` y habilitar eventos de pagos.
4. Completar en el panel los datos públicos del proveedor y responsable:
   nombre/razón social, domicilio, teléfono, correo de atención y de privacidad.
   El aviso preparado no puede considerarse final sin estos datos y revisión
   de las prácticas reales de conservación, encargados y atención de derechos.
5. Medir peso y dimensiones plegadas de cada prenda en Catálogo. Los valores
   iniciales (0.4 kg, 30 × 25 × 3 cm por pieza) son estimaciones, no mediciones.
   El cálculo suma piezas, 0.1 kg de embalaje y 2 cm de alto; confirmar que
   representa el paquete real. Pedidos grandes requieren atención manual.
6. Antes de migrar inventario, exportar/copiar el blob `stock/vendidas` y los
   pedidos desde Netlify. La migración conserva el registro anterior dentro
   del movimiento inicial. No volver al código anterior después de migrar
   sin restaurar el esquema compatible: no entiende el formato nuevo.
7. Publicar, verificar encabezados `no-store` del panel y seguimiento y
   comprobar Functions y Background Functions. Ejecutar una compra de prueba
   autorizada y verificar pago, stock, guía y correo. Las pruebas automáticas
   usan proveedores simulados: no compran etiquetas ni mueven dinero real.

## Comportamiento

- OXXO, tickets, cajeros y transferencias diferidas excluidos; modo binario.
  Checkout vence a los 15 minutos; reserva de stock durante 25 minutos
  (incluye margen de confirmación). Un pago extremadamente tardío puede
  necesitar revisión manual si la pieza ya se reasignó.
- Precio, stock, peso y paquete se calculan en servidor. La cotización queda
  ligada a CP, estado, ciudad, colonia y artículos; vence a los 15 minutos.
- Inventario persistente con escrituras condicionales. Cambiar el número base
  en products-data.js no borra ventas. Usar ajustes con motivo y delta en el
  panel. Un producto nuevo inicia con cero; luego registrar sus existencias.
- Los reintentos de checkout y ajustes conservan identificadores. No se vuelve
  a comprar una guía tras una respuesta ambigua: verificar en Skydropx y
  registrar la guía existente. Solo un fallo definitivo permite recotizar
  y reintentar; el operador confirma el nuevo precio.
- Una tarjeta rechazada no libera el apartado: el comprador puede intentar con
  otra tarjeta en la misma preferencia. El apartado vence solo y la
  conciliación marca el pedido como vencido. Los rechazos no envían alerta.
- Si falla la creación de la preferencia en Mercado Pago, el mismo checkout se
  puede reintentar. Una preferencia vencida pide volver a dar clic en PAGAR con
  un checkout nuevo. Quien pierde la última pieza no deja un pedido en el panel.
- Pedidos anteriores a esta versión (clave numérica, sin `paymentStatus`) se
  marcan como `legacy`: nunca compran guía, no descuentan stock ni envían
  correos. Solo registran reembolsos, contracargos o disputas posteriores.
  La conciliación los ignora, junto con pedidos vencidos, entregados,
  reembolsados, cancelados y los enviados con más de 30 días. "Sincronizar"
  desde el panel sí los consulta.
- Si Skydropx falla antes de enviar la guía (credenciales, token, tarifa
  faltante), la guía queda como fallida y se puede reintentar desde el panel.
- Un correo fallido se reintenta hasta 3 veces por fase; después, solo desde
  el panel.
- El inventario poda apartados vencidos hace más de un día, ventas con más de
  200 días y conserva los últimos 2000 movimientos más el de migración.
- Cancelar desde el panel solo aplica a pagos pendientes. Una solicitud sin
  pago identificable no invalida por sí sola el enlace de Mercado Pago.
  Si llega un pago después de solicitar cancelación, se detiene para revisión.
- Estados de preparación: pendiente/guía lista, preparado, enviado, entregado.
  La guía no significa que el transportista ya recibió el paquete.
- La conciliación programada cada 10 minutos despacha un trabajo firmado en
  segundo plano. Revisa hasta 20 pedidos por lote, rotando el cursor; en una
  tienda grande la revisión de todos los pedidos tarda más de 10 minutos.
  Busca también otros intentos del mismo checkout, aunque ya conozca un pago
  rechazado, para recuperar aprobaciones cuyo webhook no haya llegado.
- Correos: Resend opcional o SMTP/Gmail. Se registra confirmación y guía por
  separado. SMTP no garantiza entrega exactamente una vez después de un fallo;
  un Message-ID estable no equivale a deduplicación por el proveedor.
- Seguimiento por enlace privado con token, sin dirección ni etiqueta pública.
  El carrito solo se actualiza después de confirmación del servidor.
- El catálogo remoto alimenta la web y el pago. El archivo JS inicial queda
  como respaldo visual; si falla la lectura persistente, el pago falla cerrado.
- El límite de solicitudes usa actualización condicional; si el almacén falla,
  se rechaza temporalmente la solicitud.

## Operación y límites

Los ajustes de stock, notas, cancelaciones y cambios de preparación son acciones
del operador autenticado. Conservar la contraseña en un gestor, cerrar sesión
en equipos compartidos y no compartir enlaces de seguimiento.
El panel muestra configuración presente, no garantiza que las credenciales sean
válidas o que el proveedor esté disponible.
No se añadió compra de dominio, cuentas en proveedores ni un sistema de analítica.
La prueba de iPhone físico y la verificación de producción siguen siendo manuales.
Para un volumen alto, paginar pedidos y mover el libro de inventario a una base
transaccional; actualmente se conserva en un documento de Netlify Blobs.

## Verificación local

Resultado del 19/10/2026:

- Backend: 23 pruebas aprobadas, 0 fallos.
- Playwright completo: 246 aprobadas, 0 fallos, 33 omitidas (279 casos).
  Las omisiones corresponden a pruebas de servidor que solo se ejecutan en
  Desktop y al escenario condicionado a que el navegador restaure bfcache.
- Checkout en Tablet: 3 repeticiones adicionales aprobadas.
- CSP al día; auditoría de dependencias de producción sin vulnerabilidades.
- Revisión visual del panel móvil realizada. No sustituye la prueba física
  ni la integración real con Mercado Pago, Netlify y Skydropx.

```powershell
cd dstar-store
npm run test:backend
npm test -- --workers=2 --reporter=line
npm audit --omit=dev
cd ..
node scripts/csp-hashes.js --check
```

No configurar memoria de pruebas como fallback de producción.
No usar el panel contra producción para probar reembolsos: esa funcionalidad
está expresamente excluida.

## Referencias

- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Límites de funciones](https://docs.netlify.com/build/functions/configuration/)
- [Funciones programadas](https://docs.netlify.com/build/functions/scheduled-functions/)
- [Preferencias de Mercado Pago](https://www.mercadopago.com.mx/developers/es/reference/online-payments/checkout-pro-preferences/create-preference/post)
- [LFPDPPP vigente](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf)
- [LFPC vigente](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf)
