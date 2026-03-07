const crypto = require('crypto');
const config = require('../../../../config');

/**
 * Timing-safe HMAC verification for incoming provider webhooks.
 * e.g., Airtel, TNM, or other payment gateways.
 */
const verify = (payload, signature, secret = config.auth.webhookSecret) => {
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const computed = hmac.update(payload).digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (e) {
    return false;
  }
};

module.exports = { verify };
