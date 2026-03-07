const service = require('./service');

exports.createRefund = async (req, res) => {
  try {
    const refund = await service.createRefund(req.body);
    res.status(202).json(refund);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
