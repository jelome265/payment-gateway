const service = require('./service');

exports.createCustomer = async (req, res) => {
  try {
    const customer = await service.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await service.getCustomer(req.params.id);
    if (!customer) return res.status(404).json({ error: 'not_found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
