import mod from '../handlers/payment-jobs-background.js';
import adapt from '../lib/v2.js';

export default adapt(mod.handler);
