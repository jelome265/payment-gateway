import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test_secret_key';

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.headers['x-webhook-signature'];
    const idempotencyKey = req.headers['x-idempotency-key'];

    if (!signature || !idempotencyKey) {
        res.status(401).json({ error: 'Missing signature or idempotency key' });
        return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
        res.status(400).json({ error: 'Raw body required for signature verification' });
        return;
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const computedSignature = hmac.update(rawBody).digest('hex');

    if (computedSignature !== signature) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
    }

    // Pass idempotency key downstream
    (req as any).idempotencyKey = idempotencyKey;
    next();
};
