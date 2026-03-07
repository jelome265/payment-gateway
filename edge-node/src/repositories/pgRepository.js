const { Pool } = require('pg');
const config = require('../config');

/**
 * Shared Postgres pool for repository access.
 * Primarily used by edge-node for logging incoming requests or 
 * simple metadata storage before offloading to Kafka.
 */
const pool = new Pool({
  connectionString: config.db.connectionString,
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

module.exports = {
  query,
  pool,
};
