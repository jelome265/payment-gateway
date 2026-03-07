import { z } from 'zod';

export const DepositWebhookSchema = z.object({
    provider_id: z.string().min(1, 'Provider ID is required'),
    wallet_id: z.string().uuid('Wallet ID must be a valid UUID'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.enum(['MWK', 'USD'], {
        errorMap: () => ({ message: 'Currency must be MWK or USD' })
    }),
    timestamp: z.string().datetime({ message: 'Timestamp must be a valid ISO 8601 string' }).optional(),
    metadata: z.record(z.unknown()).optional()
}).strict(); // Reject unknown fields to prevent prototype pollution / injection

export type DepositWebhookPayload = z.infer<typeof DepositWebhookSchema>;
