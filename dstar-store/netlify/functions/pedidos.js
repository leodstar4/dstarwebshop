const { openStore } = require('../lib/orders-store');
const { locked, fulfill, notify, syncPayment, history } = require('../lib/payment-service');
const { validarCliente, str } = require('../lib/validate');
const { cotizar } = require('../lib/skydropx');
const { admin, reply, body, failure, mp } = require('../lib/http');
const { limitar, demasiadas } = require('../lib/rate-limit');
exports.handler = async event => {
  if (!['GET', 'POST'].includes(event.httpMethod)) return reply(405, { error: 'Método no permitido' });
  const limit = await limitar(event, 'panel', 120, 600);
  if (limit) return demasiadas(limit);
  try {
    admin(event);
    if (event.httpMethod === 'GET') {
      const pedidos = (await openStore(event).list()).filter(p => p.pedido).map(({ lock, trackingToken, fingerprint, ...p }) => p);
      pedidos.sort((a, b) => (b.createdAt || b.at || 0) - (a.createdAt || a.at || 0));
      return reply(200, { pedidos });
    }
    const b = body(event);
    if (!/^(?:\d{1,20}|dstar_[a-f0-9-]{36})$/.test(b.id || '')) return reply(400, { error: 'Pedido inválido' });
    const note = str(b.note, 1000);
    if (b.action === 'sync') {
      const p = await openStore(event).get(b.id);
      if (p?.paymentId || /^\d+$/.test(b.id)) await syncPayment(event, p?.paymentId || b.id);
      else await require('../lib/reconcile').reconcileOrder(event, b.id, true);
      return reply(200, { ok: true });
    }
    let syncId;
    await locked(event, b.id, async store => {
      const p = await store.get(b.id);
      if (!p?.pedido) throw Object.assign(new Error('Pedido no encontrado'), { statusCode: 404 });
      if (b.action === 'note') {
        if (!note) throw Object.assign(new Error('Escribe una nota'), { statusCode: 400 });
        await store.update(b.id, v => ({ ...v, history: history(v, 'note', note) }));
      } else if (b.action === 'fulfillment') {
        const flow = { pending: ['packed'], ready: ['packed'], packed: ['shipped'], shipped: ['delivered'], delivered: [] };
        if (!(flow[p.fulfillment || 'pending'] || []).includes(b.value) || p.paymentStatus !== 'approved' || p.refundedAmount > 0 || p.revisar)
          throw Object.assign(new Error('Transición no permitida; revisa pago e incidencias'), { statusCode: 409 });
        if (b.value === 'shipped' && !p.tracking) throw Object.assign(new Error('Registra la guía antes de despachar'), { statusCode: 409 });
        await store.update(b.id, v => ({ ...v, fulfillment: b.value, history: history(v, 'fulfillment', b.value) }));
      } else if (b.action === 'cancel') {
        if (!note || p.paymentStatus === 'approved') throw Object.assign(new Error('Solo se pueden cancelar pagos pendientes desde el panel; indica el motivo.'), { statusCode: 400 });
        if (p.paymentId) {
          const current = await mp('/v1/payments/' + p.paymentId);
          if (!['pending', 'in_process', 'authorized'].includes(current.status)) throw Object.assign(new Error('Sincroniza el pago antes de cancelar'), { statusCode: 409 });
          await mp('/v1/payments/' + p.paymentId, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
          syncId = p.paymentId;
        }
        // A created Checkout Pro URL is not assumed invalidated locally.
        // Keep its reservation until the provider expiration + grace period.
        await store.update(b.id, v => ({ ...v, cancelRequested: true, revisar: true, issue: 'cancel_requested', history: history(v, 'cancel_requested', note) }));
      } else if (b.action === 'address') {
        if (p.guia || p.tracking || ['creating', 'uncertain'].includes(p.shippingState)) throw Object.assign(new Error('La guía ya existe o debe verificarse en Skydropx'), { statusCode: 409 });
        const result = validarCliente(b.cliente);
        if (result.errores.length) throw Object.assign(new Error('Dirección incompleta'), { statusCode: 400 });
        const q = await cotizar(result.cliente, p.shipping.parcel);
        const rate = q.rates.find(r => r.carrier === p.shipping.envio?.carrier && r.service === p.shipping.envio?.service);
        if (!rate) throw Object.assign(new Error('No hay tarifa del servicio elegido para esta dirección'), { statusCode: 409 });
        if (Number(b.acceptShippingPrice) !== rate.price) throw Object.assign(new Error('Confirma el nuevo costo de envío: ' + rate.price + ' MXN; la diferencia la absorbe DSTAR.'), { statusCode: 409 });
        await store.update(b.id, v => ({ ...v, pedido: { ...v.pedido, cliente: result.cliente }, shipping: { ...v.shipping, rate_id: rate.rate_id, quotation_id: q.quotation_id, actualPrice: rate.price }, shippingState: 'failed', issue: 'shipping_failed', history: history(v, 'address', note || 'Dirección corregida') }));
      } else if (b.action === 'retry_shipping') {
        if (p.paymentStatus !== 'approved' || !p.stock || p.refundedAmount > 0 || p.cancelRequested) throw Object.assign(new Error('El pedido no está autorizado para envío'), { statusCode: 409 });
        if (p.shippingState !== 'failed') throw Object.assign(new Error('Primero verifica o registra la guía existente'), { statusCode: 409 });
        // Requote only after a definitive failure; never after an ambiguous POST.
        const q = await cotizar(p.pedido.cliente, p.shipping.parcel);
        const rate = q.rates.find(r => r.carrier === p.shipping.envio?.carrier && r.service === p.shipping.envio?.service);
        if (!rate) throw Object.assign(new Error('No hay tarifa disponible para ese servicio'), { statusCode: 409 });
        if (Number(b.acceptShippingPrice) !== rate.price) throw Object.assign(new Error('Confirma el costo de la nueva guía: ' + rate.price + ' MXN.'), { statusCode: 409 });
        await store.update(b.id, v => ({ ...v, shipping: { ...v.shipping, rate_id: rate.rate_id, actualPrice: rate.price }, history: history(v, 'retry_shipping', rate.price + ' MXN') }));
        await fulfill(event, b.id, store, true);
      } else if (b.action === 'attach_shipping') {
        if (p.paymentStatus !== 'approved' || !p.stock || p.refundedAmount > 0 || p.issue && !p.issue.startsWith('shipping_')) throw Object.assign(new Error('Resuelve primero la incidencia del pago o inventario'), { statusCode: 409 });
        if (!note || !str(b.tracking, 100)) throw Object.assign(new Error('Indica rastreo y motivo'), { statusCode: 400 });
        const safe = u => { if (!u) return ''; const url = new URL(u); if (url.protocol !== 'https:') throw new Error('La URL debe ser HTTPS'); return url.href; };
        await store.update(b.id, v => ({ ...v, guia: { carrier: str(b.carrier, 80), tracking_url: safe(b.tracking_url), label_url: safe(b.label_url) }, tracking: str(b.tracking, 100), shippingState: 'ready', fulfillment: ['packed', 'shipped', 'delivered'].includes(v.fulfillment) ? v.fulfillment : 'ready', status: 'done', revisar: false, issue: '', history: history(v, 'attach_shipping', note) }));
      } else if (b.action === 'retry_mail') {
        if (p.paymentStatus !== 'approved') throw Object.assign(new Error('El pedido no está aprobado'), { statusCode: 409 });
        await notify(event, b.id, store, b.force === true);
      } else throw Object.assign(new Error('Acción no permitida'), { statusCode: 400 });
    });
    if (syncId) await syncPayment(event, syncId);
    return reply(200, { ok: true });
  } catch (e) {
    if (e.statusCode === 503 && e.message.startsWith('Panel no configurado')) return reply(503, { error: e.message });
    return failure(e);
  }
};
