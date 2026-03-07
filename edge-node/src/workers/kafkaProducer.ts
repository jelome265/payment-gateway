import { Worker } from 'bullmq';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
};

const redis = new Redis(redisConnection);
redis.ping().catch(err => console.error('[edge-node] Redis ping failed', err));

const kafka = new Kafka({
    clientId: 'edge-node-producer',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer = kafka.producer();

async function initKafka() {
    await producer.connect();
    console.log('[edge-node] Connected to Kafka brokers');
}

initKafka().catch(console.error);

// The BullMQ worker drains the local Redis queue and publishes to Kafka
export const webhookWorker = new Worker('incoming-webhooks', async job => {
    const { data, id: idempotencyKey } = job;

    try {
        await producer.send({
            topic: 'incoming-webhooks',
            messages: [
                {
                    key: idempotencyKey, // Partition by idempotency key
                    value: JSON.stringify(data.payload || data),
                    headers: {
                        'x-idempotency-key': idempotencyKey || ''
                    }
                },
            ],
        });
        console.log(`[edge-node] Published webhook to Kafka, id: ${idempotencyKey}`);
        // Mark idempotency key as processed (optional read-side assurance)
        if (idempotencyKey) {
            await redis.set(`webhook:processed:${idempotencyKey}`, '1', 'EX', 86400);
        }
    } catch (err) {
        console.error(`[edge-node] Failed to publish webhook to Kafka, id: ${idempotencyKey}`, err);
        throw err; // Trigger BullMQ retry
    }
}, { 
    connection: redisConnection,
    removeOnComplete: true,
    removeOnFail: false
});

webhookWorker.on('completed', job => {
    console.log(`[edge-node] Job completed: ${job.id}`);
});

const dlqTopic = process.env.DLQ_TOPIC || 'edge-webhooks-poison';

webhookWorker.on('failed', async (job, err) => {
    console.error(`[edge-node] Job failed: ${job?.id} with error ${err.message}`);
    try {
        if (!job) return;
        await producer.send({
            topic: dlqTopic,
            messages: [
                {
                    key: `dlq-${job.id}`,
                    value: JSON.stringify({ id: job.id, data: job.data, error: err.message }),
                    headers: {
                        'x-dlq-source': 'edge-node',
                        'x-dlq-time': Date.now().toString(),
                    }
                },
            ],
        });
        console.log(`[edge-node] Pushed job ${job.id} to DLQ topic ${dlqTopic}`);
    } catch (dlqErr) {
        console.error(`[edge-node] Failed to push job ${job?.id} to DLQ`, dlqErr);
    }
});
