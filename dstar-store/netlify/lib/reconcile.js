const { openStore } = require('./orders-store');
const { syncPayment, locked, fulfill, isLegacy } = require('./payment-service');
const { liberar } = require('./stock-store');
const { open, update } = require('./storage');
const { mp } = require('./http');
const paid = ['approved', 'in_mediation', 'refunded', 'charged_back'];
const DAY = 86400000;
function active(p) {
  if (!p?.pedido || isLegacy(p) || /^\d+$/.test(p.id) && !p.paymentStatus) return false;
  if (p.status === 'expired' || p.fulfillment === 'delivered') return false;
  if (['refunded', 'charged_back', 'cancelled'].includes(p.paymentStatus)) return false;
  return !(p.paymentStatus === 'approved' && p.shippingState === 'ready' && Date.now() - (p.createdAt || p.at || 0) > 30 * DAY);
}
async function reconcileOrder(event, id, manual = false) {
  const store = openStore(event), p = await store.get(id);
  if (!p?.pedido || !manual && !active({ ...p, id })) return;
  if (p.paymentId || /^\d+$/.test(id)) await syncPayment(event, p.paymentId || id);
  // Checkout Pro may create another payment after a rejected attempt. Search
  // the whole checkout even when one payment ID is already known, so a lost
  // webhook for the later successful attempt is recovered by reconciliation.
  if (!/^\d+$/.test(id)) {
    let offset = 0, total = Infinity, found = false;
    while (offset < total) {
      const page = await mp('/v1/payments/search?external_reference=' + encodeURIComponent(id) + '&limit=50&offset=' + offset);
      if (!Array.isArray(page.results)) throw new Error('Consulta de pagos incompleta');
      total = Number(page.paging?.total || page.results.length);
      for (const pay of page.results) if (pay.external_reference === id) {
        found = true;
        if (String(pay.id) !== String(p.paymentId)) await syncPayment(event, String(pay.id));
      }
      offset += 50;
      if (offset > 1000) throw new Error('Demasiados pagos para el pedido; revisar');
    }
    const unpaid = v => !v.stock && !paid.includes(v.paymentStatus) && v.reservedUntil && v.reservedUntil < Date.now();
    if (unpaid(await store.get(id))) {
      await locked(event, id, async s => {
        if (!unpaid(await s.get(id))) return;
        await liberar(event, id);
        await s.update(id, v => ({ ...v, status: 'expired', paymentStatus: v.paymentStatus === 'rejected' ? 'rejected' : 'expired' }));
      });
    }
  }
  const current = await store.get(id);
  if (current.paymentStatus === 'approved' && current.stock) await locked(event, id, s => fulfill(event, id, s));
}
async function reconcile(event) {
  const all = (await openStore(event).list()).filter(active);
  all.sort((a, b) => a.id.localeCompare(b.id));
  const state = open('operacion', event), cursor = (await state.read('reconcile'))?.data?.cursor || '';
  const queue = [...all.filter(p => p.id > cursor), ...all.filter(p => p.id <= cursor)].slice(0, 20);
  const errors = [];
  const deadline = Date.now() + 5 * 60000;
  let checked = 0;
  for (const p of queue) {
    if (Date.now() > deadline) break;
    checked++;
    try { await reconcileOrder(event, p.id); } catch (e) { errors.push(p.id); console.error('Reconciliación:', p.id, e.message); }
    await update(state, 'reconcile', () => ({ cursor: p.id, at: Date.now(), errors }));
  }
  return { checked, errors };
}
module.exports = { reconcile, reconcileOrder };
