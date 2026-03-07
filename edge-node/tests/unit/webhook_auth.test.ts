import crypto from 'crypto';
import { verifyWebhookSignature } from '../../src/middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Simple mocks
const makeReq = (body: any, secret: string, timestamp: number, key: string) => {
    const raw = Buffer.from(JSON.stringify(body));
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(timestamp.toString());
    hmac.update('.');
    hmac.update(raw);
    const sig = hmac.digest('hex');
    return {
        headers: {
            'x-webhook-signature': sig,
            'x-idempotency-key': key,
            'x-webhook-timestamp': timestamp.toString(),
        },
        rawBody: raw,
        body,
    } as unknown as Request;
};

const makeRes = () => {
    const res: any = {};
    res.status = (code: number) => { res.statusCode = code; return res; };
    res.json = (obj: any) => { res.body = obj; return res; };
    return res as Response;
};

describe('verifyWebhookSignature', () => {
    const next: NextFunction = jest.fn();
    const secret = 'test_secret_key';
    const timestamp = Date.now();

    beforeAll(() => {
        process.env.WEBHOOK_SECRET = secret;
    });

    it('accepts valid signature', () => {
        const req = makeReq({ hello: 'world' }, secret, timestamp, 'idemp-1');
        const res = makeRes();
        verifyWebhookSignature(req, res, next);
        expect((req as any).idempotencyKey).toBe('idemp-1');
        expect((next as any)).toHaveBeenCalled();
    });

    it('rejects invalid signature', () => {
        const req = makeReq({ hello: 'world' }, 'wrong', timestamp, 'idemp-2');
        const res = makeRes();
        verifyWebhookSignature(req, res, next);
        expect(res.statusCode).toBe(401);
    });

    it('rejects missing fields', () => {
        const req = { headers: {}, rawBody: Buffer.from('{}') } as unknown as Request;
        const res = makeRes();
        verifyWebhookSignature(req, res, next);
        expect(res.statusCode).toBe(401);
    });
});
