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
  let dias = 14;
  let tienda = null;

  const mxn = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(Number(n) || 0);
  const fecha = (ms) => (ms ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(ms) : '');
  const seguro = (url) => (typeof url === 'string' && url.startsWith('https://') ? url : '');

  function leerClave() {
    try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
  }
  function guardarClave(v) {
    try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch {}
  }

  const labels = {approved:'aprobado',pending:'pendiente',in_process:'en proceso',rejected:'rechazado',cancelled:'cancelado',refunded:'revertido por el proveedor',charged_back:'contracargo',in_mediation:'en revisión',expired:'vencido',ready:'guía lista',packed:'preparado',shipped:'enviado',delivered:'entregado'};
  const estadoTexto = value => labels[value] || value || 'pendiente';
  function estado(p) {
    if (['cancelled','refunded','charged_back','rejected','expired'].includes(p.paymentStatus)) return { texto: estadoTexto(p.paymentStatus).toUpperCase(), clase:'bad' };
    if (p.revisar) return { texto: 'REVISAR', clase: 'bad' };
    if (p.status === 'failed') return { texto: 'GUÍA FALLÓ', clase: 'bad' };
    if (p.status === 'processing') return { texto: 'PROCESANDO', clase: 'warn' };
    if (p.tracking) return { texto: 'GUÍA LISTA', clase: 'ok' };
    return { texto: p.paymentStatus ? estadoTexto(p.paymentStatus).toUpperCase() : 'SIN CONFIRMAR', clase: 'muted' };
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
        el('div', null, el('p', { class: 'order__id' }, `PEDIDO #${p.id}`), el('p', { class: 'order__date' }, fecha(p.at))),
        el('span', { class: `order__badge order__badge--${e.clase}` }, e.texto)),
      el('div', { class: 'order__grid' }, cliente, articulos, envio),
      el('p', null, 'Pago: ' + estadoTexto(p.paymentStatus || 'sin sincronizar') + ' · Preparación: ' + estadoTexto(p.fulfillment) + (p.refundedAmount ? ' · Reembolsado: ' + mxn(p.refundedAmount) : '')),
      p.issue ? el('p', { class:'panel__error' }, 'Incidencia: ' + p.issue) : null,
      orderActions(p),
      el('details', null, el('summary', null, 'HISTORIAL'), ...(p.history || []).slice().reverse().map(h=>el('p',null,fecha(h.at)+' · '+h.type+' · '+(h.note || '')))));
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
    $('statVentas').textContent = mxn(pedidos.filter((p) => p.paymentStatus === 'approved').reduce((s, p) => s + Math.max(0, (Number(p.pedido && p.pedido.total) || 0) - (p.refundedAmount || 0)), 0));
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
    await loadManagement(clave);
    await Promise.all([loadAnalytics(clave), loadAvisos(clave)]);
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
    $('panelManagement').replaceChildren();
    $('panelAnalytics').replaceChildren();
    $('panelAvisos').replaceChildren();
    tienda = null;
    $('actionForm').replaceChildren();
    $('orderDialog').close();
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


  function button(text, action) { const b=el('button',{type:'button',class:'panel__btn'},text);b.addEventListener('click',action);return b; }
  async function api(path,payload,clave=leerClave()) {
    const r=await fetch('/api/'+path,{method:payload?'POST':'GET',headers:{Authorization:'Bearer '+clave,...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined,cache:'no-store'});
    const body=await r.json();if(!r.ok)throw new Error(body.error || 'No se pudo completar la operación');return body;
  }
  function field(name,label,type='text',value='',required=true,options) { return {name,label,type,value,required,options}; }
  function dialog(title,fields,submit,warning='') {
    const d=$('orderDialog'),f=$('actionForm');$('dialogTitle').textContent=title;$('actionError').textContent='';f.replaceChildren();
    if(warning)f.append(el('p',null,warning));
    for(const spec of fields){
      const control=el(spec.type==='textarea'?'textarea':spec.options?'select':'input',{name:spec.name,class:'panel__input',...(spec.options||spec.type==='textarea'?{}:{type:spec.type})});
      if(spec.options)for(const opt of spec.options) control.append(el('option',{value:typeof opt==='string'?opt:opt.value},typeof opt==='string'?opt:opt.label));
      control.value=String(spec.value ?? '');control.required=spec.required;
      if(spec.type==='number'){control.step='any';}
      if(spec.type==='checkbox')control.checked=spec.value===true;
      f.append(el('label',null,spec.label,control));
    }
    const save=el('button',{type:'submit',class:'panel__btn panel__btn--solid'},'CONFIRMAR');f.append(save);
    // Keep this ID while the dialog stays open, including failed network retries.
    const operationId=crypto.randomUUID();
    f.onsubmit=async e=>{
      e.preventDefault();save.disabled=true;$('actionError').textContent='';
      const values=Object.fromEntries(new FormData(f));
      for(const spec of fields) {if(spec.type==='number')values[spec.name]=Number(values[spec.name]);if(spec.type==='checkbox')values[spec.name]=f.elements[spec.name].checked;}
      try{await submit(values,operationId);d.close();const r=await cargar(leerClave());if(r.error)status.textContent=r.error;}
      catch(err){$('actionError').textContent=err.message;}
      finally{save.disabled=false;}
    };
    d.showModal();
  }
  $('dialogClose').addEventListener('click',()=>$('orderDialog').close());
  function orderActions(p) {
    const box=el('div',{class:'order__actions'});
    const act=(title,action,fields=[],warning='',extra={})=>box.append(button(title,()=>dialog(title,fields,(v,operationId)=>api('pedidos',{id:p.id,action,...extra,...v,operationId}),warning)));
    act('SINCRONIZAR','sync',[],'Consulta el estado actual en Mercado Pago y reintenta tareas pendientes.');
    act('NOTA','note',[field('note','Nota interna','textarea')]);
    if(p.paymentStatus==='approved'){
      const next={pending:'packed',ready:'packed',packed:'shipped',shipped:'delivered'}[p.fulfillment||'pending'];
      if(next)act('CAMBIAR PREPARACIÓN','fulfillment',[field('value','Nuevo estado','text',next,true,[{value:next,label:{packed:'Preparado',shipped:'Enviado',delivered:'Entregado'}[next]}])]);
      act('REENVIAR CORREO','retry_mail',[field('force','Enviar otra copia aunque ya se haya enviado','checkbox',false,false)]);
    } else if(['pending','in_process','authorized'].includes(p.paymentStatus)) act('CANCELAR','cancel',[field('note','Motivo','textarea')],'Si no hay pago identificable, se registra la solicitud y se conserva la reserva hasta vencer el checkout.');
    if(p.shippingState==='failed') act('REINTENTAR GUÍA','retry_shipping',[field('acceptShippingPrice','Costo autorizado de la nueva guía (MXN)','number',p.shipping?.actualPrice ?? p.shipping?.envio?.price ?? 0)],'Se cotiza de nuevo antes de comprar. Si el costo cambió se pedirá confirmarlo.');
    if(p.stock && p.paymentStatus==='approved') act('REGISTRAR GUÍA EXISTENTE','attach_shipping',[field('tracking','Número de rastreo'),field('carrier','Paquetería'),field('tracking_url','URL HTTPS de rastreo','url','',false),field('label_url','URL HTTPS de etiqueta','url','',false),field('note','Motivo / comprobación en Skydropx','textarea')],'Verifica primero si Skydropx creó una guía. Esta acción registra una guía existente; no compra otra.');
    if(p.pedido && !p.guia && !p.tracking)box.append(button('CORREGIR DIRECCIÓN',()=>dialog('CORREGIR DIRECCIÓN',[
      ...['nombre','email','telefono','calle','colonia','cp','ciudad','estado','referencia'].map(k=>field(k,k.toUpperCase(),'text',p.pedido.cliente[k]||'',k!=='referencia')),
      field('acceptShippingPrice','Nuevo costo autorizado (MXN)','number',p.shipping?.envio?.price||0),field('note','Motivo','textarea')
    ],v=>{const {acceptShippingPrice,note,...cliente}=v;return api('pedidos',{id:p.id,action:'address',cliente,acceptShippingPrice,note});},'Solo antes de crear la guía. La diferencia de envío la absorbe la tienda.')));
    return box;
  }
  async function loadManagement(clave) {
    const target=$('panelManagement');
    try {
      const state=await api('admin-store',null,clave);
      tienda=state;
      $('panelHealth').textContent=Object.entries(state.health).filter(([k])=>k!=='reconciliation').map(([k,v])=>({payment:'Pagos',webhook:'Firma del webhook',shipping:'Envíos',mail:'Correo'}[k]||k)+': '+(v?'CONFIGURADO':'FALTA CONFIGURAR')).join(' · ')+' · Última conciliación: '+fecha(state.health.reconciliation?.at);
      target.replaceChildren();
      const inventory=el('details',null,el('summary',null,'INVENTARIO Y MOVIMIENTOS'));
      for(const p of state.products)for(const size of p.sizes)inventory.append(el('p',null,p.name+' / '+size+' · disponible '+(state.stock[p.id]?.[size]||0)+' ',button('AJUSTAR',()=>dialog('AJUSTE DE INVENTARIO',[field('delta','Unidades a sumar (+) o restar (−)','number',0),field('note','Motivo del ajuste','textarea')],(v,operationId)=>api('admin-store',{action:'stock',item:{id:p.id,size,delta:v.delta},operationId,note:v.note}),'No edites el stock base para restar ventas. Cada ajuste queda en el historial.'))));
      inventory.append(el('details',null,el('summary',null,'ÚLTIMOS MOVIMIENTOS'),...(state.inventory.movements||[]).slice(-50).reverse().map(m=>el('p',null,fecha(m.at)+' · '+m.type+' · '+(m.note||m.id||'')))));
      target.append(inventory);
      const products=el('details',null,el('summary',null,'CATÁLOGO'));
      const editProduct=p=>dialog('PRODUCTO',[
        field('id','Identificador estable','text',p.id||''),field('name','Nombre','text',p.name||''),field('drop','Drop','text',p.drop||''),field('price','Precio MXN','number',p.price||0),
        field('description','Descripción','textarea',p.description||''),field('image','Imagen HTTPS Cloudinary','url',p.image||''),field('gallery','Galería: una URL por línea','textarea',(p.gallery||[]).join('\n'),false),
        field('badge','Etiqueta','text',p.badge||'',false,['','LIMITED','NEW','SOLDOUT']),
        field('sizes','Tallas separadas por coma','text',(p.sizes||[]).join(', ')),field('material','Material','textarea',p.material||'',false),field('care','Cuidados','textarea',p.care||'',false),field('fit','Corte','text',p.fit||'',false),field('measurements','Guía de medidas (cm, por talla)','textarea',p.measurements||'',false),
        field('weight','Peso medido por pieza (kg)','number',p.weight||0.4),field('length','Largo plegado (cm)','number',p.length||30),field('width','Ancho plegado (cm)','number',p.width||25),field('height','Alto plegado (cm)','number',p.height||3),field('active','Visible en tienda','checkbox',p.active!==false,false)
      ],v=>api('admin-store',{action:'product',product:{...p,...v,sizes:v.sizes.split(',').map(x=>x.trim()).filter(Boolean),gallery:v.gallery.split('\n').map(x=>x.trim()).filter(Boolean)}}),'Mide las prendas plegadas. Los valores iniciales son estimaciones; el servidor suma piezas y embalaje. Un producto nuevo inicia sin existencias.');
      products.append(button('NUEVO PRODUCTO',()=>editProduct({})),...state.products.map(p=>el('p',null,p.name+' ',button('EDITAR',()=>editProduct(p)))));target.append(products);
      const legal=el('details',null,el('summary',null,'DATOS DEL PROVEEDOR Y PRIVACIDAD'));
      legal.append(el('p',null,'Completa los datos reales antes de vender. Se publicarán en las páginas legales.'),button('EDITAR DATOS PÚBLICOS',()=>dialog('DATOS PÚBLICOS',[
        field('legalName','Nombre completo / razón social','text',state.settings.legalName||''),field('address','Domicilio del responsable y proveedor','textarea',state.settings.address||''),field('phone','Teléfono de contacto','tel',state.settings.phone||''),field('privacyEmail','Correo para privacidad / derechos ARCO','email',state.settings.privacyEmail||''),field('contactEmail','Correo de atención','email',state.settings.contactEmail||'')
      ],settings=>api('admin-store',{action:'settings',settings}))));target.append(legal);
    }catch(e){$('panelHealth').textContent='Administración: '+e.message;}
  }

  const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 + '%' : '—');
  const nombre = id => (tienda?.products || []).find(p => p.id === id)?.name || id;
  function tabla(headers, rows) {
    return el('div', { class: 'panel__table-wrap' }, el('table', { class: 'panel__table' },
      el('thead', null, el('tr', null, ...headers.map(h => el('th', { scope: 'col' }, h)))),
      el('tbody', null, ...rows.map(r => el('tr', null, ...r.map(c => el('td', null, c)))))));
  }
  function barra(n, max) {
    const b = el('span', { class: 'panel__bar', 'aria-hidden': 'true' });
    b.style.setProperty('--w', (max ? Math.round((n / max) * 100) : 0) + '%');
    return b;
  }

  async function loadAnalytics(clave) {
    const box = $('panelAnalytics');
    try {
      const a = await api('analitica?dias=' + dias, null, clave);
      const t = a.totales || {};
      const desde = Date.now() - dias * 86400000;
      const compras = pedidos.filter(p => p.paymentStatus === 'approved' && (p.createdAt || p.at || 0) >= desde).length;
      const pasos = [['Visitas', t.visit || 0], ['Vieron un producto', t.product || 0], ['Agregaron al carrito', t.add || 0], ['Abrieron el checkout', t.checkout || 0], ['Fueron a pagar', t.pay || 0], ['Compras aprobadas', compras]];
      const max = Math.max(...pasos.map(p => p[1]));
      box.replaceChildren(
        el('h3', { class: 'panel__subtitle' }, 'EMBUDO'),
        tabla(['PASO', 'TOTAL', 'VS. PASO ANTERIOR'], pasos.map(([k, n], i) => [k, el('span', null, String(n), barra(n, max)), i ? pct(n, pasos[i - 1][1]) : '—'])),
        el('p', { class: 'panel__note' }, 'Páginas vistas: ' + (t.view || 0) + ' · Avisos pedidos: ' + (t.alert || 0) + ' · Conversión total: ' + pct(compras, t.visit || 0)),
        el('h3', { class: 'panel__subtitle' }, 'PRODUCTOS'),
        a.productos.length ? tabla(['PIEZA', 'VISTAS', 'AL CARRITO', 'CONVERSIÓN'], a.productos.map(p => [nombre(p.id), String(p.product), String(p.add), pct(p.add, p.product)])) : el('p', { class: 'panel__note' }, 'Sin datos todavía.'),
        el('h3', { class: 'panel__subtitle' }, 'DE DÓNDE LLEGAN'),
        a.fuentes.length ? tabla(['FUENTE', 'VISITAS'], a.fuentes.map(([k, n]) => [k, String(n)])) : el('p', { class: 'panel__note' }, 'Sin datos todavía.'),
        a.dispositivos.length ? tabla(['DISPOSITIVO', 'VISITAS'], a.dispositivos.map(([k, n]) => [k, String(n)])) : '',
        el('details', null, el('summary', null, 'POR DÍA'),
          tabla(['DÍA', 'VISITAS', 'PÁGINAS', 'PRODUCTO', 'CARRITO', 'CHECKOUT', 'PAGO'], a.dias.slice().reverse().map(d => [d.dia, ...['visit', 'view', 'product', 'add', 'checkout', 'pay'].map(k => String(d[k] || 0))]))),
        el('details', null, el('summary', null, 'PÁGINAS MÁS VISTAS'),
          tabla(['PÁGINA', 'VISTAS'], a.paginas.map(([k, n]) => [k, String(n)]))));
    } catch (e) { box.replaceChildren(el('p', { class: 'panel__error' }, 'Analítica: ' + e.message)); }
  }

  $('analyticsRange').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dias]');
    if (!btn) return;
    dias = Number(btn.dataset.dias);
    document.querySelectorAll('[data-dias]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    loadAnalytics(leerClave());
  });

  function csv(rows) {
    const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const blob = new Blob(['﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'dstar-lista-drops-' + new Date().toISOString().slice(0, 10) + '.csv' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function loadAvisos(clave) {
    const box = $('panelAvisos');
    try {
      const { avisos } = await api('avisos', null, clave);
      const drop = avisos.filter(a => a.tipo === 'drop');
      const grupos = new Map();
      for (const a of avisos.filter(x => x.tipo === 'talla')) {
        const k = a.productId + '|' + a.size;
        const g = grupos.get(k) || { productId: a.productId, size: a.size, pendientes: 0, avisados: 0 };
        if (a.notifiedAt) g.avisados++; else g.pendientes++;
        grupos.set(k, g);
      }
      const avisar = g => button('AVISAR (' + Math.min(10, g.pendientes) + ')', async (e) => {
        e.target.disabled = true;
        try {
          const r = await api('avisos', { action: 'notify', productId: g.productId, size: g.size });
          $('avisosStatus').textContent = 'Enviados ' + r.enviados + '; quedan ' + r.quedan + '.';
          await loadAvisos(leerClave());
        } catch (err) { $('avisosStatus').textContent = err.message; e.target.disabled = false; }
      });
      const filas = [...grupos.values()].sort((a, b) => b.pendientes - a.pendientes).map(g => {
        const stock = tienda?.stock?.[g.productId]?.[g.size] || 0;
        const accion = g.pendientes && stock > 0 ? avisar(g) : (g.pendientes ? 'Sin stock' : '—');
        return [nombre(g.productId) + ' / ' + g.size, String(g.pendientes), String(g.avisados), String(stock), accion];
      });
      const quitar = a => button('QUITAR', () => dialog('QUITAR AVISO', [], () => api('avisos', { action: 'remove', id: a.id }), a.email + ' dejará de recibir este aviso. Úsalo si la persona pide su baja.'));
      const detalle = a => fecha(a.at) + ' · ' + a.email + ' · ' + (a.tipo === 'drop' ? 'Próximo drop' : nombre(a.productId) + ' / ' + a.size + (a.notifiedAt ? ' · avisado' : '')) + ' ';
      box.replaceChildren(
        el('h3', { class: 'panel__subtitle' }, 'LISTA DEL PRÓXIMO DROP · ' + drop.length),
        el('p', { class: 'panel__note' }, 'Exporta la lista para anunciar el drop desde tu herramienta de correo. Incluye en cada envío una forma de darse de baja.'),
        drop.length ? button('EXPORTAR CSV', () => csv([['correo', 'fecha'], ...drop.map(a => [a.email, fecha(a.at)])])) : '',
        el('h3', { class: 'panel__subtitle' }, 'TALLAS AGOTADAS QUE PIDEN'),
        filas.length ? tabla(['PIEZA / TALLA', 'ESPERANDO', 'YA AVISADOS', 'STOCK', ''], filas) : el('p', { class: 'panel__note' }, 'Nadie ha pedido aviso todavía.'),
        el('p', { class: 'panel__note' }, 'El aviso se envía en lotes de 10 por el límite diario del correo. Ajusta primero el inventario de esa talla.'),
        avisos.length ? el('details', null, el('summary', null, 'TODOS LOS CORREOS (' + avisos.length + ')'), ...avisos.map(a => el('p', null, detalle(a), quitar(a)))) : '');
    } catch (e) { box.replaceChildren(el('p', { class: 'panel__error' }, 'Avisos: ' + e.message)); }
  }

  $('panelTitle').setAttribute('tabindex', '-1');
  const guardada = leerClave();
  if (guardada) {
    cargar(guardada).then((r) => {
      if (r.error) { guardarClave(''); mostrar(false); $('panelError').textContent = r.error; }
      else mostrar(true);
    });
  }
})();
