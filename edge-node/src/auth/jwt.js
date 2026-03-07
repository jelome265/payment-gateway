const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Validates a JWT token.
 * Note: edge-node primarily uses HMAC for webhooks, 
 * but JWT is used for internal portal access or KYC endpoints.
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.auth.jwtSecret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

const generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn });
};

module.exports = {
  verifyToken,
  generateToken,
};
