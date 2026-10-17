// ============================================
// MOSTRAR REFERENCIA DEL PEDIDO
// MercadoPago agrega ?payment_id=... en la URL al redirigir.
// Lo mostramos de forma ornamental para que el cliente
// pueda referenciarlo en soporte.
// ============================================
const urlParams  = new URLSearchParams(window.location.search);
const estadoPago = urlParams.get('collection_status') || urlParams.get('status');
if (estadoPago === 'approved') {
  try { localStorage.removeItem('dstar_cart'); } catch {}
}
const paymentId  = urlParams.get('payment_id') || urlParams.get('collection_id');
const pedidoEl   = document.getElementById('pedidoId');
if (paymentId && pedidoEl) {
  pedidoEl.textContent = '#' + paymentId;
}

// ============================================
// ANIMACIÓN DE ENTRADA CON GSAP
// Secuencia: check → label → título → texto → divider → ref → botón
// Cada elemento entra desde abajo con fade-in escalonado.
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) {
    // Fallback sin GSAP: mostrar todo de golpe
    document.getElementById('confirmInner').style.opacity = '1';
    document.querySelectorAll('.confirm-check, .confirm-label, .confirm-title, .confirm-text, .confirm-divider, .confirm-ref, .btn-seguir')
      .forEach(el => el.style.opacity = '1');
    return;
  }

  // Timeline principal — entrada escalonada y elegante
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. El contenedor padre aparece
  tl.to('#confirmInner', { opacity: 1, duration: 0.01 })

  // 2. El ícono de check entra con un leve scale-up
    .fromTo('#confirmCheck',
      { opacity: 0, scale: 0.7, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)' },
      0.1
    )

  // 3. Label "Pago exitoso"
    .to('#confirmLabel',
      { opacity: 1, y: 0, duration: 0.4 },
      '-=0.2'
    )

  // 4. Título grande "ORDEN CONFIRMADA"
    .fromTo('#confirmTitle',
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.55 },
      '-=0.15'
    )

  // 5. Texto informativo
    .to('#confirmText',
      { opacity: 1, duration: 0.4 },
      '-=0.2'
    )

  // 6. Divisor
    .to('#confirmDivider',
      { opacity: 1, duration: 0.3 },
      '-=0.1'
    )

  // 7. Referencia del pedido
    .to('#confirmRef',
      { opacity: 1, duration: 0.3 },
      '-=0.1'
    )

  // 8. Botón CTA — entra con un pequeño bounce
    .fromTo('#btnSeguir',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' },
      '-=0.1'
    );
});
