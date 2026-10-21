const crypto = require('crypto');
const { openStore } = require('../lib/orders-store');
const { reply, body, failure } = require('../lib/http');
const { limitar, demasiadas } = require('../lib/rate-limit');
exports.handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Método no permitido' });
  const limit = await limitar(event, 'tracking', 60, 600);
  if (limit) return demasiadas(limit);
  try {
    const b = body(event);
    if (!/^dstar_[a-f0-9-]{36}$/.test(b.id || '') || !/^[a-f0-9]{64}$/.test(b.token || '')) return reply(404, { error: 'Enlace no válido' });
    const p = await openStore(event).get(b.id);
    if (!p?.trackingToken || !crypto.timingSafeEqual(Buffer.from(p.trackingToken), Buffer.from(b.token))) return reply(404, { error: 'Enlace no válido' });
    return reply(200, { id: b.id, paymentStatus: p.paymentStatus, fulfillment: p.fulfillment, total: p.pedido.total, refundedAmount: p.refundedAmount || 0, tracking: p.tracking || '', carrier: p.guia?.carrier || '', tracking_url: p.guia?.tracking_url || '', items: p.pedido.items, review: Boolean(p.revisar), updatedAt: p.at });
  } catch (e) { return failure(e); }
};
