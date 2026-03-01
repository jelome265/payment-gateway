import { Queue } from 'bullmq';

// Connect locally to Redis managed by docker-compose
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
};

export const webhookQueue = new Queue('incoming-webhooks', { connection });

export async function enqueueWebhook(payload: any, idempotencyKey: string): Promise<void> {
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
