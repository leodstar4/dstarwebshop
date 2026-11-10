const crypto = require('crypto');
const { open, update } = require('./storage');
const { send } = require('./mail');
const MAX_POR_ENVIO = 10;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sitio = () => (process.env.URL_SITIO || process.env.URL || '').replace(/\/$/, '');
const store = event => open('avisos', event);
function validar(raw, products) {
  const b = raw && typeof raw === 'object' ? raw : {};
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 254) : '';
  if (!/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(email)) return { error: 'Escribe un correo válido' };
  if (b.consent !== true) return { error: 'Acepta el aviso de privacidad para recibir avisos' };
  if (b.tipo === 'drop') return { aviso: { email, tipo: 'drop' } };
  if (b.tipo !== 'talla') return { error: 'Tipo de aviso inválido' };
  const product = products.find(p => p.id === b.productId && p.active !== false);
  if (!product || !product.sizes.includes(b.size)) return { error: 'Producto o talla inválidos' };
  return { aviso: { email, tipo: 'talla', productId: product.id, size: b.size } };
}
const clave = a => a.tipo + '-' + crypto.createHash('sha256').update([a.email, a.tipo, a.productId || '', a.size || ''].join('|')).digest('hex').slice(0, 32);
async function suscribir(event, aviso) {
  const id = clave(aviso);
  await update(store(event), id, old => old && !old.bajaAt && !old.notifiedAt ? undefined : { ...aviso, at: Date.now(), token: crypto.randomBytes(16).toString('hex') });
  return id;
}
async function baja(event, id, token) {
  if (!/^(drop|talla)-[a-f0-9]{32}$/.test(id || '') || !/^[a-f0-9]{32}$/.test(token || '')) return false;
  let ok = false;
  await update(store(event), id, old => {
    if (!old?.token || !crypto.timingSafeEqual(Buffer.from(old.token), Buffer.from(token))) return undefined;
    ok = true;
    return old.bajaAt ? undefined : { ...old, bajaAt: Date.now() };
  });
  return ok;
}
async function quitar(event, id) {
  if (!/^(drop|talla)-[a-f0-9]{32}$/.test(id || '')) throw Object.assign(new Error('Aviso inválido'), { statusCode: 400 });
  await update(store(event), id, old => old && !old.bajaAt ? { ...old, bajaAt: Date.now() } : undefined);
}
const activos = async event => (await store(event).list()).filter(a => !a.bajaAt);
const linkBaja = a => sitio() + '/api/avisame?baja=' + a.id + '&t=' + a.token;
async function notificarTalla(event, product, size) {
  const pendientes = (await activos(event)).filter(a => a.tipo === 'talla' && a.productId === product.id && a.size === size && !a.notifiedAt);
  const lote = pendientes.slice(0, MAX_POR_ENVIO);
  let enviados = 0;
  for (const a of lote) {
    const url = sitio() + '/producto.html?id=' + encodeURIComponent(product.id);
    try {
      await send({
        to: a.email,
        subject: 'Volvió tu talla: ' + product.name + ' ' + size + ' — DSTAR',
        html: '<p>Hay piezas de <b>' + esc(product.name) + '</b> en talla <b>' + esc(size) + '</b>. Son limitadas: apartarlas depende de completar el pago.</p><p><a href="' + esc(url) + '">Ver la pieza</a></p><p style="font-size:12px;color:#777">Recibiste este correo porque pediste un aviso en dstar4.party. <a href="' + esc(linkBaja(a)) + '">No quiero más avisos</a>.</p>',
        text: 'Hay piezas de ' + product.name + ' en talla ' + size + ': ' + url + '\n\nNo quiero más avisos: ' + linkBaja(a),
        key: 'aviso-' + a.id + '-' + a.at
      });
      await update(store(event), a.id, old => old && !old.notifiedAt ? { ...old, notifiedAt: Date.now() } : undefined);
      enviados++;
    } catch (e) { console.error('aviso:', e.message); }
  }
  return { enviados, quedan: pendientes.length - enviados };
}
module.exports = { validar, suscribir, baja, quitar, activos, notificarTalla, clave };
