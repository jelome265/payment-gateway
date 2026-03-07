const { z } = require('zod');

const customerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  name: z.string().optional(),
});

const chargeSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('MWK'),
  source: z.string(),
});

const refundSchema = z.object({
  chargeId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().optional(),
});

module.exports = {
  customerSchema,
  chargeSchema,
  refundSchema,
};
