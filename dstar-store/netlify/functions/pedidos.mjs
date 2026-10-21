import mod from '../handlers/pedidos.js';
import adapt from '../lib/v2.js';

export default adapt(mod.handler);
