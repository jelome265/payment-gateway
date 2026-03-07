const { query } = require('../../../repositories/pgRepository');
const { sendEvent } = require('../../../events/producer');

exports.createRefund = async (data) => {
  const { chargeId, amount, reason } = data;
  
  const result = await query(
    'INSERT INTO refunds (charge_id, amount, reason, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [chargeId, amount, reason, 'pending']
  );
  
  const refund = result.rows[0];

  await sendEvent('refund-initiated', {
    refund_id: refund.id,
    charge_id: chargeId,
    amount,
    reason
  });

  return refund;
};
