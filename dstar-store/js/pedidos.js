(function () {
  const KEY = 'dstar_panel';
  const $ = (id) => document.getElementById(id);
  const login = $('panelLogin');
  const data = $('panelData');
  const tools = $('panelTools');
  const list = $('panelList');
  const status = $('panelStatus');
  let pedidos = [];
  let filtro = 'todos';

  const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(Number(n) || 0);
  const fecha = (ms) => (ms ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(ms) : '');
  const seguro = (url) => (typeof url === 'string' && url.startsWith('https://') ? url : '');

  function leerClave() {
    try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
  }
  function guardarClave(v) {
    try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch {}
  }

  function estado(p) {
    if (p.revisar) return { texto: 'REVISAR', clase: 'bad' };
    if (p.status === 'failed') return { texto: 'GUÍA FALLÓ', clase: 'bad' };
    if (p.status === 'processing') return { texto: 'PROCESANDO', clase: 'warn' };
    if (p.tracking) return { texto: 'GUÍA LISTA', clase: 'ok' };
    return { texto: 'PAGADO', clase: 'muted' };
  }

  function el(tag, attrs, ...hijos) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === '' || v == null) continue;
      if (k === 'class') node.className = v;
      else node.setAttribute(k, v);
    }
    for (const h of hijos) if (h != null && h !== '') node.append(h);
    return node;
  }

  function bloque(titulo, ...contenido) {
    return el('div', { class: 'order__block' }, el('h3', null, titulo), ...contenido);
  }

  function tarjeta(p) {
    const e = estado(p);
    const info = p.pedido || {};
    const c = info.cliente || {};
    const items = Array.isArray(info.items) ? info.items : [];
    const guia = p.guia || {};
    const direccion = [c.calle, c.colonia, c.ciudad, c.estado, c.cp && `C.P. ${c.cp}`].filter(Boolean).join(', ');

    const cliente = c.nombre
      ? bloque('CLIENTE',
          el('p', null, c.nombre),
          c.email ? el('p', null, el('a', { href: `mailto:${c.email}` }, c.email)) : null,
          c.telefono ? el('p', null, el('a', { href: `https://wa.me/52${c.telefono}`, target: '_blank', rel: 'noopener noreferrer' }, `${c.telefono} · WhatsApp`)) : null,
          direccion ? el('p', null, direccion) : null,
          c.referencia ? el('p', null, `Ref: ${c.referencia}`) : null)
      : bloque('CLIENTE', el('p', null, 'Sin datos guardados. Búscalo en Mercado Pago.'));

    const articulos = bloque('ARTÍCULOS',
      items.length
        ? el('ul', { class: 'order__items' }, ...items.map((i) => el('li', null, `${i.title} × ${i.quantity} — ${mxn((Number(i.unit_price) || 0) * (Number(i.quantity) || 1))}`)))
        : el('p', null, '—'));

    const label = seguro(guia.label_url);
    const rastreo = seguro(guia.tracking_url);
    const envio = bloque('TOTAL Y ENVÍO',
      el('p', { class: 'order__total' }, info.total != null ? mxn(info.total) : '—'),
      el('p', null, p.tracking ? `${guia.carrier || 'Guía'}: ${p.tracking}` : 'Sin guía todavía'),
      label || rastreo
        ? el('div', { class: 'order__actions' },
            label ? el('a', { class: 'panel__btn', href: label, target: '_blank', rel: 'noopener noreferrer' }, 'ETIQUETA') : null,
            rastreo ? el('a', { class: 'panel__btn', href: rastreo, target: '_blank', rel: 'noopener noreferrer' }, 'RASTREAR') : null)
        : null);

    return el('li', { class: 'order' },
      el('div', { class: 'order__head' },
        el('div', null, el('p', { class: 'order__id' }, `PAGO #${p.id}`), el('p', { class: 'order__date' }, fecha(p.at))),
        el('span', { class: `order__badge order__badge--${e.clase}` }, e.texto)),
      el('div', { class: 'order__grid' }, cliente, articulos, envio));
  }

  function pintar() {
    const visibles = pedidos.filter((p) => {
      if (filtro === 'revisar') return p.revisar || p.status === 'failed';
      if (filtro === 'enviados') return Boolean(p.tracking);
      return true;
    });
    list.replaceChildren(...(visibles.length ? visibles.map(tarjeta) : [el('li', { class: 'panel__empty' }, 'No hay pedidos aquí.')]));
    $('statPedidos').textContent = String(pedidos.length);
    $('statRevisar').textContent = String(pedidos.filter((p) => p.revisar || p.status === 'failed').length);
    $('statVentas').textContent = mxn(pedidos.filter((p) => !p.revisar).reduce((s, p) => s + (Number(p.pedido && p.pedido.total) || 0), 0));
  }

  function mostrar(conectado) {
    login.hidden = conectado;
    data.hidden = !conectado;
    tools.hidden = !conectado;
  }

  async function cargar(clave) {
    status.textContent = 'Cargando…';
    let res;
    try {
      res = await fetch('/.netlify/functions/pedidos', { headers: { Authorization: `Bearer ${clave}` }, cache: 'no-store' });
    } catch {
      status.textContent = '';
      return { error: 'Sin conexión. Intenta de nuevo.' };
    }
    const body = await res.json().catch(() => ({}));
    status.textContent = '';
    if (!res.ok) return { error: body.error || 'No se pudieron cargar los pedidos' };
    pedidos = Array.isArray(body.pedidos) ? body.pedidos : [];
    status.textContent = `Actualizado ${fecha(Date.now())}`;
    pintar();
    return {};
  }

  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('panelPassword');
    const clave = input.value;
    if (!clave) { $('panelError').textContent = 'Escribe la contraseña.'; input.focus(); return; }
    $('panelError').textContent = '';
    const r = await cargar(clave);
    if (r.error) { $('panelError').textContent = r.error; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    input.value = '';
    input.removeAttribute('aria-invalid');
    guardarClave(clave);
    mostrar(true);
    $('panelTitle').focus({ preventScroll: true });
  });

  $('panelRefresh').addEventListener('click', async () => {
    const r = await cargar(leerClave());
    if (r.error) status.textContent = r.error;
  });

  $('panelLogout').addEventListener('click', () => {
    guardarClave('');
    pedidos = [];
    list.replaceChildren();
    mostrar(false);
    $('panelPassword').focus();
  });

  document.querySelector('.panel__filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filtro]');
    if (!btn) return;
    filtro = btn.dataset.filtro;
    document.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    pintar();
  });

  $('panelTitle').setAttribute('tabindex', '-1');
  const guardada = leerClave();
  if (guardada) {
    cargar(guardada).then((r) => {
      if (r.error) { guardarClave(''); mostrar(false); $('panelError').textContent = r.error; }
      else mostrar(true);
    });
  }
})();
