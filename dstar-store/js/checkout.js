// ============================================
// ESTADO GLOBAL DEL CHECKOUT
// ============================================
let cart = window.DSTAR_CART ? window.DSTAR_CART.load() : [];

let tarifaSeleccionada = null;
let quotationId = null;
let cotizacionSeq = 0;
let ultimaClaveCotizada = '';

// Subtotal calculado del carrito
let subtotal = 0;

// Respeta la preferencia del usuario de reducir movimiento
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// UTILIDADES
// ============================================
// Peso estimado del paquete según unidades en el carrito (streetwear ~0.4kg/u)
function calcularPeso() {
  const unidades = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  return Math.max(0.5, Math.round(unidades * 0.4 * 10) / 10);
}
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function thumbUrl(url, w, format) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/image/upload/', `/image/upload/${format},q_auto,dpr_auto,w_${w},c_limit/`);
}
function thumbSrcset(url, format) {
  return [160, 320].map((w) => `${thumbUrl(url, w, format)} ${w}w`).join(', ');
}

// Formatear precio en MXN — igual que en app.js
function formatPrice(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0
  }).format(n);
}

// Mostrar un mensaje toast temporal
function showToast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (isError ? ' toast--error' : '');
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3500);
}

// ============================================
// VERIFICAR CARRITO — redirigir si está vacío
// ============================================
// Si el usuario llega al checkout sin productos, lo devolvemos a la tienda
if (!cart || cart.length === 0) {
  document.addEventListener('DOMContentLoaded', () => {
    // Reemplazamos el contenido con un mensaje amigable en vez de redirigir
    // bruscamente, para que el usuario entienda qué pasó
    const container = document.getElementById('checkoutContainer');
    container.innerHTML = `
      <div class="cart-empty-msg" style="grid-column:1/-1">
        <h2>CARRITO VACÍO</h2>
        <p>Agrega productos antes de continuar al checkout.</p>
        <a href="index.html" class="btn-volver">← EXPLORAR DROPS</a>
      </div>
    `;
  });
}

// ============================================
// RENDER DEL RESUMEN DEL PEDIDO
// ============================================
const THUMB_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 80%22%3E%3Crect fill=%22%23141414%22 width=%2264%22 height=%2280%22/%3E%3C/svg%3E';

document.addEventListener('error', (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-fallback')) return;
  img.removeAttribute('data-fallback');
  if (img.parentElement && img.parentElement.tagName === 'PICTURE') img.parentElement.querySelectorAll('source').forEach((src) => src.remove());
  img.removeAttribute('srcset');
  img.src = THUMB_PLACEHOLDER;
}, true);

function renderOrderSummary() {
  const container = document.getElementById('orderItems');
  if (!container || cart.length === 0) return;

  // Calcular subtotal total del carrito
  subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Renderizar cada item del carrito
  container.innerHTML = cart.map(item => `
    <div class="order-item">
      <picture>
        <source type="image/avif" srcset="${escapeHtml(thumbSrcset(item.image, 'f_avif'))}" sizes="64px">
        <img
          class="order-item__image"
          src="${escapeHtml(thumbUrl(item.image, 160, 'f_auto'))}"
          srcset="${escapeHtml(thumbSrcset(item.image, 'f_auto'))}" sizes="64px"
          alt="${escapeHtml(item.name)}" width="64" height="80"
          loading="lazy" decoding="async"
          data-fallback
        >
      </picture>
      <div class="order-item__info">
        <div class="order-item__name">${escapeHtml(item.name)}</div>
        <div class="order-item__meta">TALLA: ${escapeHtml(item.size)} &nbsp;·&nbsp; QTY: ${item.qty}</div>
      </div>
      <div class="order-item__price">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  // Actualizar el display del subtotal
  document.getElementById('subtotalDisplay').textContent = formatPrice(subtotal);
  document.getElementById('totalDisplay').textContent    = formatPrice(subtotal);
}

// ============================================
// ACTUALIZAR DISPLAY DEL TOTAL
// ============================================
function actualizarTotal() {
  const costoEnvio = tarifaSeleccionada ? tarifaSeleccionada.precio : 0;
  const total = subtotal + costoEnvio;

  // Mostrar costo de envío seleccionado
  const envioEl = document.getElementById('envioDisplay');
  if (tarifaSeleccionada) {
    envioEl.textContent = formatPrice(costoEnvio);
    envioEl.style.color = 'var(--white)';
  } else {
    envioEl.textContent = '--';
    envioEl.style.color = 'var(--concrete)';
  }

  // Actualizar total
  document.getElementById('totalDisplay').textContent = formatPrice(
    tarifaSeleccionada ? total : subtotal
  );
}

// ============================================
// COTIZAR ENVÍO — llamada a la Netlify Function
// ============================================
async function cotizarEnvio() {
  const contenedor = document.getElementById('tarifas-envio');

  // Skydropx Pro exige CP + estado + ciudad + colonia. Si falta algo,
  // no cotizamos todavía (se reintenta al completar los campos).
  const cp      = document.getElementById('cp').value.trim();
  const estado  = document.getElementById('estado').value.trim();
  const ciudad  = document.getElementById('ciudad').value.trim();
  const colonia = document.getElementById('colonia').value.trim();
  const clave = [cp, estado, ciudad, colonia].join('|').toLowerCase();
  if (!/^\d{5}$/.test(cp) || !estado || !ciudad || !colonia) {
    if (ultimaClaveCotizada) {
      ultimaClaveCotizada = '';
      cotizacionSeq++;
      tarifaSeleccionada = null;
      quotationId = null;
      actualizarTotal();
      contenedor.setAttribute('aria-busy', 'false');
      contenedor.innerHTML = '<p class="tarifas-status">Completa tu dirección con un CP válido de 5 dígitos para ver las opciones de envío.</p>';
    }
    return;
  }
  if (clave === ultimaClaveCotizada) return;
  ultimaClaveCotizada = clave;
  const seq = ++cotizacionSeq;
  tarifaSeleccionada = null;
  quotationId = null;
  actualizarTotal();

  contenedor.style.minHeight = contenedor.offsetHeight + 'px';
  contenedor.setAttribute('aria-busy', 'true');
  contenedor.innerHTML = `<p class="tarifas-status">⟳ CALCULANDO ENVÍO...</p>`;

  try {
    const response = await fetch('/.netlify/functions/cotizar-envio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cp_destino: cp,
        estado, ciudad, colonia,
        // Dimensiones default del paquete DSTAR; el peso escala con las unidades
        peso:  calcularPeso(),
        alto:  15,
        ancho: 20,
        largo: 5
      })
    });

    const data = await response.json();
    if (seq !== cotizacionSeq) return;

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tarifas');
    }

    quotationId = data.quotation_id || null;
    const rates = data.rates || [];

    // Si Skydropx no devuelve tarifas para ese CP
    if (rates.length === 0) {
      contenedor.setAttribute('aria-busy', 'false');
      contenedor.innerHTML = `
        <p class="tarifas-error">
          No hay opciones de envío disponibles para ese código postal.<br>
          Verifica que sea un CP válido de México.
        </p>
      `;
      return;
    }

    // Renderizar cada tarifa como radio button seleccionable
    renderTarifas(rates);

  } catch (err) {
    if (seq !== cotizacionSeq) return;
    ultimaClaveCotizada = '';
    contenedor.setAttribute('aria-busy', 'false');
    contenedor.innerHTML = `
      <p class="tarifas-error">
        No se pudieron obtener las tarifas. Verifica tu CP e intenta de nuevo.
      </p>
    `;
  }
}

// ============================================
// RENDER DE TARIFAS DE ENVÍO
// ============================================
function renderTarifas(rates) {
  const contenedor = document.getElementById('tarifas-envio');

  // Limpiar tarifa seleccionada anterior
  tarifaSeleccionada = null;
  actualizarTotal();

  // Construir lista de opciones
  const lista = rates.map((rate, i) => {
    // Estructura normalizada que devuelve cotizar-envio (Skydropx Pro)
    const rateId       = escapeHtml(rate.rate_id || `rate_${i}`);
    const carrierName  = escapeHtml(rate.carrier || 'Paquetería');
    const serviceName  = escapeHtml(rate.service || '');
    const precio       = Number(parseFloat(rate.price || 0)) || 0;
    const dias         = Number(rate.days);
    const diasTexto    = Number.isFinite(dias) && dias > 0 ? ` &nbsp;·&nbsp; ${dias} ${dias === 1 ? 'DÍA HÁBIL' : 'DÍAS HÁBILES'}` : '';

    return `
      <label class="tarifa-opcion" data-rate-id="${rateId}" data-precio="${precio}">
        <input
          type="radio"
          name="tarifa"
          value="${rateId}"
          data-precio="${precio}"
          data-nombre="${carrierName} — ${serviceName}"
          aria-label="${carrierName} ${serviceName}, ${formatPrice(precio)}"
        >
        <div class="tarifa-info">
          <div class="tarifa-nombre">${carrierName}</div>
          <div class="tarifa-detalle">
            ${serviceName}${diasTexto}
          </div>
        </div>
        <div class="tarifa-precio">${formatPrice(precio)}</div>
      </label>
    `;
  }).join('');

  contenedor.style.minHeight = '';
  contenedor.setAttribute('aria-busy', 'false');
  contenedor.innerHTML = `<div class="tarifas-lista" role="radiogroup" aria-label="Opciones de envío disponibles">${lista}</div>`;

  // Escuchar selección de tarifa
  contenedor.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const label = e.target.closest('.tarifa-opcion');
      // Quitar clase "selected" de todas
      contenedor.querySelectorAll('.tarifa-opcion').forEach(l => l.classList.remove('selected'));
      // Marcar la seleccionada
      label.classList.add('selected');

      // Guardar tarifa seleccionada en estado
      tarifaSeleccionada = {
        rate_id: e.target.value,
        precio:  parseFloat(e.target.dataset.precio),
        nombre:  e.target.dataset.nombre
      };

      // Recalcular y mostrar el total
      actualizarTotal();

      // Feedback inmediato: el total late al sumar el envío
      const totalEl = document.getElementById('totalDisplay');
      if (totalEl && !prefersReducedMotion) {
        totalEl.classList.remove('price-value--pulse');
        void totalEl.offsetWidth; // reinicia la animación
        totalEl.classList.add('price-value--pulse');
        totalEl.addEventListener('animationend',
          () => totalEl.classList.remove('price-value--pulse'), { once: true });
      }
    });
  });

  // Animar entrada de las opciones con GSAP (salvo reduced-motion)
  if (window.gsap && !prefersReducedMotion) {
    gsap.fromTo('.tarifa-opcion',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out' }
    );
  }
}

// ============================================
// EVENTO BLUR DEL CÓDIGO POSTAL
// ============================================
// Cuando el usuario sale del campo CP con 5 dígitos,
// se dispara automáticamente la cotización de envío.
document.addEventListener('DOMContentLoaded', () => {
  // La cotización Pro necesita CP + estado + ciudad + colonia.
  // Reintentamos al salir de cualquiera de esos campos; cotizarEnvio()
  // se auto-cancela si todavía falta alguno.
  ['cp', 'estado', 'ciudad', 'colonia'].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => cotizarEnvio());
  });

  // Enter dentro del CP también dispara el blur
  const cpInput = document.getElementById('cp');
  if (cpInput) {
    cpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); cpInput.blur(); }
    });
  }
});

// ============================================
// VALIDACIÓN DEL FORMULARIO
// ============================================
function validarFormulario() {
  const campos = ['nombre', 'email', 'telefono', 'calle', 'colonia', 'cp', 'ciudad', 'estado'];
  let valido = true;

  // Marca un campo como inválido (visual + accesible)
  const marcarError = (input) => {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    valido = false;
  };

  // Limpiar errores anteriores
  campos.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
  });

  // Validar cada campo requerido
  campos.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    if (!input.value.trim()) marcarError(input);
  });

  // Validar formato de email
  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
    marcarError(emailInput);
  }

  // Validar teléfono — 10 dígitos
  const telInput = document.getElementById('telefono');
  if (telInput && telInput.value && !/^\d{10}$/.test(telInput.value.replace(/\D/g, ''))) {
    marcarError(telInput);
  }

  // Validar CP — exactamente 5 dígitos
  const cpInput = document.getElementById('cp');
  if (cpInput && !/^\d{5}$/.test(cpInput.value.trim())) {
    marcarError(cpInput);
  }

  return valido;
}

// ============================================
// BOTÓN PAGAR — lógica principal
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const btnPagar = document.getElementById('btnPagar');
  if (!btnPagar) return;

  btnPagar.addEventListener('click', async () => {
    // 1. Validar que el carrito no esté vacío
    if (!cart || cart.length === 0) {
      showToast('TU CARRITO ESTÁ VACÍO', true);
      return;
    }

    // 2. Validar todos los campos del formulario
    if (!validarFormulario()) {
      showToast('COMPLETA TODOS LOS CAMPOS REQUERIDOS', true);

      // Hacer scroll al primer campo con error
      const firstError = document.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // 3. Validar que haya una opción de envío seleccionada
    if (!tarifaSeleccionada) {
      showToast('SELECCIONA UNA OPCIÓN DE ENVÍO', true);
      document.getElementById('cardTarifas')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 4. Construir el objeto cliente con los datos del formulario
    const cliente = {
      nombre:   document.getElementById('nombre').value.trim(),
      email:    document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      calle:    document.getElementById('calle').value.trim(),
      colonia:  document.getElementById('colonia').value.trim(),
      cp:       document.getElementById('cp').value.trim(),
      ciudad:   document.getElementById('ciudad').value.trim(),
      estado:   document.getElementById('estado').value.trim()
    };

    // 5. Mostrar estado de carga en el botón
    btnPagar.disabled = true;
    btnPagar.classList.add('loading');
    btnPagar.querySelector('.btn-pagar__text').textContent = 'PROCESANDO...';

    try {
      // 6. Mapear los items del carrito al formato esperado por mp-preference
      const items = cart.map(item => ({ id: item.id, size: item.size, qty: item.qty }));

      // 7. Crear la preferencia de MercadoPago via Netlify Function
      const response = await fetch('/.netlify/functions/mp-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          cliente,
          quotation_id: quotationId,
          rate_id: tarifaSeleccionada.rate_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Error al crear el pago');
        error.visible = (response.status === 400 || response.status === 429) && data.error;
        throw error;
      }

      // 8. Redirigir al checkout de MercadoPago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió el link de pago');
      }

    } catch (err) {
      showToast(err.visible ? String(err.visible).toUpperCase() : 'ERROR AL PROCESAR EL PAGO — INTENTA DE NUEVO', true);
      if (err.visible && /tarifa|envío/i.test(err.visible)) {
        ultimaClaveCotizada = '';
        cotizarEnvio();
      }

      // Restaurar el botón
      btnPagar.disabled = false;
      btnPagar.classList.remove('loading');
      btnPagar.querySelector('.btn-pagar__text').textContent = 'PAGAR';
    }
  });
});

window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  const btn = document.getElementById('btnPagar');
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('loading');
    const text = btn.querySelector('.btn-pagar__text');
    if (text) text.textContent = 'PAGAR';
  }
  cart = window.DSTAR_CART ? window.DSTAR_CART.load() : [];
  renderOrderSummary();
  actualizarTotal();
});

// ============================================
// INIT — renderizar resumen + animaciones GSAP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Solo continuar si hay carrito
  if (!cart || cart.length === 0) return;

  // Renderizar resumen del pedido
  renderOrderSummary();

  if (window.DSTAR_CART && window.DSTAR_CART.syncStock) {
    window.addEventListener('dstar:stock', () => {
      const antes = JSON.stringify(cart);
      cart = window.DSTAR_CART.load();
      if (JSON.stringify(cart) === antes) return;
      window.DSTAR_CART.save(cart);
      if (cart.length === 0) { location.reload(); return; }
      renderOrderSummary();
      actualizarTotal();
      showToast('Una pieza de tu carrito se agotó; ajustamos tu pedido', true);
    });
    window.DSTAR_CART.syncStock();
  }

  // Animación de entrada con GSAP para las secciones (salvo reduced-motion)
  if (window.gsap && !prefersReducedMotion) {
    // Las tarjetas entran desde abajo escalonadas
    gsap.fromTo(
      '.checkout-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
    );
  }

  // Header scroll hide/show — igual que en el sitio principal
  let lastScroll = 0;
  const header = document.getElementById('header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || !header) return;
    ticking = true;
    requestAnimationFrame(() => {
      const current = window.scrollY;
      header.classList.toggle('header--scrolled', current > 80);
      header.classList.toggle('header--hidden', current > 80 && current > lastScroll);
      lastScroll = current;
      ticking = false;
    });
  }, { passive: true });
});
