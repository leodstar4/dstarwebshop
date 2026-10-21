import mod from '../handlers/reconcile-payments.js';
import adapt from '../lib/v2.js';

export default adapt(mod.handler);
