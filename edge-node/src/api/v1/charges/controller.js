const service = require('./service');

exports.createCharge = async (req, res) => {
  try {
    const charge = await service.createCharge(req.body);
    res.status(202).json(charge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
