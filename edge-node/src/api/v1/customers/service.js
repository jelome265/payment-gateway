const { query } = require('../../../repositories/pgRepository');

exports.createCustomer = async (data) => {
  const { email, phone, name } = data;
  const result = await query(
    'INSERT INTO customers (email, phone, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
    [email, phone, name]
  );
  return result.rows[0];
};

exports.getCustomer = async (id) => {
  const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0];
};
