import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Connect locally to Redis managed by docker-compose
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
};

export const webhookQueue = new Queue('incoming-webhooks', { connection });

// Redis client for idempotency (TTL-based)
const redis = new Redis(connection);
redis.ping().catch(err => console.error('[edge-node] Redis ping failed', err));
const IDEMPOTENCY_TTL_SECONDS = parseInt(process.env.IDEMPOTENCY_TTL_SECONDS || '86400'); // 24h

export async function enqueueWebhook(payload: any, idempotencyKey: string): Promise<void> {
    if (!idempotencyKey) {
        throw new Error('Idempotency key is required');
    }

    // Check and set idempotency key atomically to avoid duplicate enqueueing
    const key = `webhook:idempotency:${idempotencyKey}`;
    const setResult = await redis.set(key, '1', 'NX', 'EX', IDEMPOTENCY_TTL_SECONDS);
    if (setResult !== 'OK') {
        // Duplicate detected; skip enqueue
        return;
    }

    // Use idempotencyKey as the job ID to prevent duplicate processing by BullMQ
    await webhookQueue.add('process-webhook', payload, {
        jobId: idempotencyKey,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        }
    });
}
