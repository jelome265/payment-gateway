import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../middleware/auth';
import { enqueueWebhook } from '../workers/queue';

const router = Router();

// Endpoint for Airtel / Bank / Marqeta Webhooks
router.post('/deposit', verifyWebhookSignature, async (req: Request, res: Response) => {
    try {
        const idempotencyKey = (req as any).idempotencyKey;
        const payload = req.body;

        // Enqueue job with idempotency key
        await enqueueWebhook(payload, idempotencyKey);

        // Rule: Must ack 200 within 200ms 
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Failed to enqueue webhook:', error);
        res.status(500).json({ error: 'Internal server error', detail: (error as Error).message });
    }
});

export default router;
