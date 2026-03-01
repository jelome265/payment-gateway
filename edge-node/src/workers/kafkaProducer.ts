import { Worker } from 'bullmq';
import { Kafka } from 'kafkajs';

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
};

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
    } catch (err) {
        console.error(`[edge-node] Failed to publish webhook to Kafka, id: ${idempotencyKey}`, err);
        throw err; // Trigger BullMQ retry
    }
}, { connection: redisConnection });

webhookWorker.on('completed', job => {
    console.log(`[edge-node] Job completed: ${job.id}`);
});

webhookWorker.on('failed', (job, err) => {
    console.error(`[edge-node] Job failed: ${job?.id} with error ${err.message}`);
});
