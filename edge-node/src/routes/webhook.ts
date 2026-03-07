import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../middleware/auth';
import { enqueueWebhook } from '../workers/queue';
import { DepositWebhookSchema } from '../validation/webhookSchemas';
import { webhooks_received_total, webhooks_verified_total, webhooks_rejected_total } from '../utils/metrics';

const router = Router();

// Endpoint for Airtel / Bank / Marqeta Webhooks
router.post('/deposit', verifyWebhookSignature, async (req: Request, res: Response): Promise<void> => {
    const provider = (req.body.provider || 'unknown') as string;
    webhooks_received_total.inc({ provider });

    try {
        const idempotencyKey = (req as any).idempotencyKey;

        // Input Validation (Zod)
        const parsedBody = DepositWebhookSchema.safeParse(req.body);
        if (!parsedBody.success) {
            console.error('[edge-node] Invalid webhook payload discarded', parsedBody.error.format());
            webhooks_rejected_total.inc({ provider, reason: 'validation_fail' });
            res.status(400).json({ error: 'Invalid payload structure', details: parsedBody.error.format() });
            return;
        }

        const payload = parsedBody.data;

        // Enqueue job with idempotency key
        await enqueueWebhook(payload, idempotencyKey);

        webhooks_verified_total.inc({ provider });
        // Rule: Must ack 200 within 200ms 
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Failed to enqueue webhook:', error);
        webhooks_rejected_total.inc({ provider, reason: 'enqueue_error' });
        res.status(500).json({ error: 'Internal server error', detail: (error as Error).message });
    }
});

export default router;
