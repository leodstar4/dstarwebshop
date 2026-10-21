const crypto = require('crypto');
const { openStore } = require('./orders-store');
const { descontar, liberar } = require('./stock-store');
const { mp, request } = require('./http');
const { send } = require('./mail');
const { SKYDROPX_BASE, getSkydropxToken } = require('./skydropx');
const terminal = ['refunded', 'cancelled', 'charged_back'];
const isLegacy = p => Boolean(p?.legacy || p?.status && !p.paymentStatus && !p.fingerprint);
const history = (p, type, note) => [...(p.history || []), { at: Date.now(), type, note }].slice(-500);

async function locked(event, id, fn) {
  const store = openStore(event), owner = crypto.randomUUID();
  if (!await store.claim(id, 180000, owner)) throw Object.assign(new Error('Pedido en proceso; vuelve a intentar'), { statusCode: 409 });
  try { return await fn(store); } finally { await store.release(id, owner); }
}

async function syncPayment(event, paymentId) {
  let payment = await mp('/v1/payments/' + encodeURIComponent(paymentId));
  const ref = payment.external_reference || payment.metadata?.order_id;
  const candidate = typeof ref === 'string' && /^dstar_[a-f0-9-]{36}$/.test(ref) ? ref : String(paymentId);
  return locked(event, candidate, async store => {
    // Fetch again under the lock so a delayed webhook cannot roll back newer state.
    payment = await mp('/v1/payments/' + encodeURIComponent(paymentId));
    let p = await store.get(candidate);
    const meta = payment.metadata || {};
    if (!p.pedido && !meta.cliente) return; // Unrelated payment in the same MP account.
    // Orders from the previous webhook were already handled by hand: only record later reversals.
    if (isLegacy(p)) {
      const status = payment.status, changed = p.paymentStatus !== status;
      const reversed = ['refunded', 'charged_back', 'in_mediation', 'cancelled'].includes(status);
      await store.update(candidate, v => ({ ...v, legacy: true, paymentId: String(paymentId), paymentStatus: status, refundedAmount: Number(payment.transaction_amount_refunded || 0), history: changed ? history(v, 'payment', status) : v.history || [], ...(reversed && changed ? { revisar: true, issue: status } : {}) }));
      if (reversed && changed) await alertStore(event, candidate, store);
      return;
    }
    if (p.paymentId && p.paymentId !== String(paymentId)) {
      const successful = ['approved', 'refunded', 'charged_back', 'in_mediation'];
      // A rejected attempt must not prevent a later successful payment.
      if (p.stock || successful.includes(p.paymentStatus)) {
        if (successful.includes(payment.status)) await store.update(candidate, v => ({ ...v, revisar: true, issue: 'duplicate_payment', history: history(v, 'duplicate_payment', String(paymentId)) }));
        return;
      }
      if (!successful.includes(payment.status)) return;
    }
    const paid = Number(payment.transaction_amount);
    const expected = Number(p.pedido?.total ?? meta.expected_total);
    const status = payment.status;
    await store.update(candidate, v => ({
      ...v, paymentId: String(paymentId), paymentStatus: status, refundedAmount: Number(payment.transaction_amount_refunded || 0),
      createdAt: v.createdAt || v.at || Date.now(), at: Date.now(),
      pedido: v.pedido || { cliente: meta.cliente, items: meta.order_items || [], total: paid },
      stockItems: v.stockItems || meta.stock_items || [],
      shipping: v.shipping || { rate_id: meta.rate_id, quotation_id: meta.quotation_id, parcel: meta.parcel, envio: meta.envio },
      fulfillment: v.fulfillment || (v.tracking ? 'ready' : 'pending'),
      history: v.paymentStatus === status ? v.history || [] : history(v, 'payment', status)
    }));
    p = await store.get(candidate);
    if (terminal.includes(status) || status === 'in_mediation' || p.refundedAmount > 0) {
      if (status !== 'in_mediation' && status !== 'approved') await liberar(event, candidate);
      await store.update(candidate, v => ({ ...v, status, revisar: status === 'charged_back' || status === 'in_mediation' || v.refundedAmount > 0, issue: status === 'approved' ? 'partial_refund' : status }));
      // State detection only: this app does not issue refunds or process returns.
      if (p.paymentStatus !== status || !p.alerts?.[status]) await alertStore(event, candidate, store);
      return;
    }
    if (status !== 'approved') return;
    if (payment.currency_id !== 'MXN' || !Number.isFinite(expected) || Math.abs(paid - expected) > 0.01) {
      await store.update(candidate, v => ({ ...v, revisar: true, issue: 'amount_mismatch', status: 'review' }));
      console.error('mp-webhook — ALERTA: El monto no coincide');
      await alertStore(event, candidate, store);
      return;
    }
    if (['in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back', 'partial_refund', 'amount_mismatch'].includes(p.issue)) {
      await store.update(candidate, v => ({ ...v, revisar: false, issue: '' }));
      p = await store.get(candidate);
    }
    if (!p.stock) {
      const shortage = await descontar(event, p.stockItems, String(paymentId), candidate);
      await store.update(candidate, v => ({ ...v, stock: !shortage.length, shortages: shortage, revisar: shortage.length > 0, issue: shortage.length ? 'oversold' : '', status: shortage.length ? 'review' : 'paid' }));
      if (shortage.length) { console.error('mp-webhook — ALERTA: Sobreventa'); await alertStore(event, candidate, store); return; }
    }
    p = await store.get(candidate);
    if (p.cancelRequested) { await store.update(candidate, v => ({ ...v, revisar: true, issue: 'cancel_requested' })); return; }
    if (p.issue === 'duplicate_payment' || p.revisar && p.issue && !['shipping_failed', 'shipping_incomplete'].includes(p.issue)) return;
    await fulfill(event, candidate, store);
  });
}

function parseShipment(data) {
  const attrs = (data.included || []).find(i => i?.attributes?.tracking_number || i?.attributes?.label_url)?.attributes || {};
  return { shipment_id: data.data?.id || '', tracking_number: attrs.tracking_number || data.data?.attributes?.master_tracking_number || '', label_url: attrs.label_url || '', tracking_url: attrs.tracking_url_provider || '', carrier: data.data?.attributes?.carrier_name || '' };
}
async function fulfill(event, id, store = openStore(event), retry = false) {
  let p = await store.get(id);
  if (isLegacy(p) || p.paymentStatus !== 'approved' || !p.stock || p.refundedAmount > 0 || p.revisar && p.issue && !['shipping_failed', 'shipping_incomplete'].includes(p.issue)) return;
  // A persisted shipment ID can be polled, never recreated.
  if (p.shippingState === 'incomplete' && p.guia?.shipment_id) {
    const token = await getSkydropxToken();
    const data = await request(SKYDROPX_BASE + '/shipments/' + encodeURIComponent(p.guia.shipment_id), { headers: { Authorization: 'Bearer ' + token } });
    const g = parseShipment(data);
    await store.update(id, v => ({ ...v, guia: { ...v.guia, ...g }, tracking: g.tracking_number, shippingState: g.label_url && g.tracking_number ? 'ready' : 'incomplete' }));
    p = await store.get(id);
  }
  if (!p.guia && !p.tracking && (!p.shippingState || retry && p.shippingState === 'failed')) {
    await store.update(id, v => ({ ...v, shippingState: 'creating', status: 'processing' }));
    try {
      const { crearGuiaSkydropx } = require('../handlers/mp-webhook');
      const g = await crearGuiaSkydropx({ cliente: p.pedido.cliente, rate_id: p.shipping.rate_id, parcel: p.shipping.parcel, total: p.pedido.total });
      const ready = Boolean(g.label_url && g.tracking_number);
      await store.update(id, v => ({ ...v, guia: g, tracking: g.tracking_number, shippingState: ready ? 'ready' : 'incomplete', revisar: !ready, issue: ready ? '' : 'shipping_incomplete', status: ready ? 'done' : 'review', fulfillment: ready ? 'ready' : 'pending' }));
    } catch (e) {
      const definite = e.notSent || [400, 401, 403, 404, 422].includes(e.upstreamStatus);
      await store.update(id, v => ({ ...v, shippingState: definite ? 'failed' : 'uncertain', status: 'failed', revisar: true, issue: definite ? 'shipping_failed' : 'shipping_uncertain' }));
      console.error('mp-webhook — ALERTA: No se pudo crear la guía');
      // Ambiguous failure must be reconciled in Skydropx before another POST.
    }
  }
  p = await store.get(id);
  if (p.shippingState === 'creating') await store.update(id, v => ({ ...v, shippingState: 'uncertain', revisar: true, issue: 'shipping_uncertain' }));
  if (p.shippingState === 'ready') await store.update(id, v => ({ ...v, revisar: false, issue: '', status: 'done', fulfillment: v.fulfillment === 'pending' ? 'ready' : v.fulfillment }));
  await notify(event, id, store);
}

async function notify(event, id, store = openStore(event), force = false) {
  const p = await store.get(id);
  if (isLegacy(p)) return;
  const { buildEmailHtml } = require('../handlers/mp-webhook');
  for (const recipient of ['customer', 'store']) {
    const last = p.mail?.[recipient], phase = p.shippingState === 'ready' ? 'guide' : 'confirmation';
    if (!force && last?.phase === phase && (last.status === 'sent' || last.tries >= 3)) continue;
    const to = recipient === 'customer' ? p.pedido?.cliente?.email : process.env.EMAIL_ORIGEN || process.env.GMAIL_USER;
    if (!to) continue;
    const attempt = (last?.attempt || 0) + (force ? 1 : 0);
    const tries = last?.phase === phase && last.status === 'failed' && !force ? (last.tries || 1) + 1 : 1;
    const key = 'order-' + id + '-' + recipient + '-' + phase + '-' + attempt;
    try {
      const html = buildEmailHtml({ cliente: p.pedido.cliente, guia: p.guia || {}, items: p.pedido.items, total: p.pedido.total, paymentId: p.paymentId || id, incluirEtiqueta: recipient === 'store' });
      const trackingLink = p.trackingToken ? (process.env.URL_SITIO || process.env.URL) + '/seguimiento.html#' + id + '/' + p.trackingToken : '';
      await send({ to, subject: recipient === 'store' ? 'Pedido DSTAR · ' + (p.issue || p.fulfillment || p.status) : 'Tu pedido DSTAR está confirmado', html: html + (trackingLink ? '<p><a href="' + trackingLink + '">Consultar estado del pedido</a></p>' : ''), key });
      await store.update(id, v => ({ ...v, mail: { ...v.mail, [recipient]: { status: 'sent', at: Date.now(), attempt, phase } } }));
    } catch (e) {
      await store.update(id, v => ({ ...v, mail: { ...v.mail, [recipient]: { status: 'failed', at: Date.now(), attempt, phase, tries } } }));
    }
  }
}
async function alertStore(event, id, store) {
  const p = await store.get(id);
  const issue = p.issue || p.paymentStatus;
  if (!issue || p.alerts?.[issue] === 'sent') return;
  const to = process.env.EMAIL_ORIGEN || process.env.GMAIL_USER;
  if (!to) return;
  try {
    await send({ to, subject: 'DSTAR — pedido requiere revisión', text: 'Pedido ' + id + '\nEstado: ' + issue + '\nRevisa el panel antes de preparar o despachar.', key: 'alert-' + id + '-' + issue });
    await store.update(id, v => ({ ...v, alerts: { ...v.alerts, [issue]: 'sent' } }));
  } catch {
    await store.update(id, v => ({ ...v, alerts: { ...v.alerts, [issue]: 'failed' } }));
  }
}
module.exports = { syncPayment, locked, fulfill, notify, history, isLegacy };
