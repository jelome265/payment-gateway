const { query } = require('../../../repositories/pgRepository');
const { sendEvent } = require('../../../events/producer');

exports.createCharge = async (data) => {
  const { customerId, amount, currency, source } = data;
  
  // 1. Initial Insert (Status: Pending)
  const result = await query(
    'INSERT INTO charges (customer_id, amount, currency, source, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
    [customerId, amount, currency, source, 'pending']
  );
  
  const charge = result.rows[0];

  // 2. Emit to Kafka for ledger processing
  await sendEvent('charge-created', {
    tx_id: charge.id,
    user_id: customerId,
    amount,
    currency,
    type: 'debit'
  });

  return charge;
};
