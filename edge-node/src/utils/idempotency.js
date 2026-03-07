const Redis = require('ioredis');
const config = require('../config');

const redis = new Redis(config.redis);

/**
 * Idempotency utility for edge-node.
 * Stores keys to prevent duplicate processing of the same request.
 */
const checkIdempotency = async (key) => {
  if (!key) return false;
  
  // Set NX (Not eXists) with an expiry (e.g., 24 hours)
  const result = await redis.set(`idempotency:${key}`, 'locked', 'EX', 86400, 'NX');
  return result === 'OK';
};

const releaseIdempotency = async (key) => {
  if (!key) return;
  await redis.del(`idempotency:${key}`);
};

module.exports = {
  checkIdempotency,
  releaseIdempotency,
};
