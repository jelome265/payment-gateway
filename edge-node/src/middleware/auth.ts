import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const SIGNATURE_HEADER = process.env.WEBHOOK_SIGNATURE_HEADER || 'x-webhook-signature';
const IDEMPOTENCY_HEADER = process.env.WEBHOOK_IDEMPOTENCY_HEADER || 'x-idempotency-key';
const TIMESTAMP_HEADER = process.env.WEBHOOK_TIMESTAMP_HEADER || 'x-webhook-timestamp';
const MAX_SKEW_MS = parseInt(process.env.WEBHOOK_MAX_SKEW_MS || '300000'); // 5 minutes

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
    if (!WEBHOOK_SECRET) {
        res.status(500).json({ error: 'Webhook secret not configured' });
        return;
    }

    const signature = req.headers[SIGNATURE_HEADER] as string | undefined;
    const idempotencyKey = req.headers[IDEMPOTENCY_HEADER] as string | undefined;
    const timestamp = req.headers[TIMESTAMP_HEADER] as string | undefined;

    if (!signature || !idempotencyKey || !timestamp) {
        res.status(401).json({ error: 'Missing signature, idempotency key, or timestamp' });
        return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
        res.status(400).json({ error: 'Raw body required for signature verification' });
        return;
    }

    // Timestamp skew check
    const ts = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
        res.status(401).json({ error: 'Stale or invalid webhook timestamp' });
        return;
    }

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(timestamp);
    hmac.update('.');
    hmac.update(rawBody);
    const computedSignature = hmac.digest('hex');

    if (computedSignature !== signature) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
    }

    // Pass idempotency key downstream
    (req as any).idempotencyKey = idempotencyKey;
    next();
};
