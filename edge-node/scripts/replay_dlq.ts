import { Kafka } from 'kafkajs';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const dlqTopic = process.env.DLQ_TOPIC || 'edge-webhooks-poison';
const targetTopic = process.env.REPLAY_TARGET_TOPIC || 'incoming-webhooks';
const groupId = process.env.DLQ_REPLAY_GROUP || 'edge-dlq-replayer';

async function main() {
    const kafka = new Kafka({ clientId: 'edge-dlq-replayer', brokers });
    const consumer = kafka.consumer({ groupId });
    const producer = kafka.producer();

    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: dlqTopic, fromBeginning: true });

    console.log(`[DLQ-REPLAY] Consuming ${dlqTopic} -> ${targetTopic}`);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const key = message.key?.toString();
                const value = message.value?.toString() || '';
                console.log(`[DLQ-REPLAY] Replaying key=${key} partition=${partition}`);

                await producer.send({
                    topic: targetTopic,
                    messages: [
                        {
                            key,
                            value,
                            headers: {
                                'x-replayed-from': dlqTopic,
                            },
                        },
                    ],
                });
            } catch (err) {
                console.error('[DLQ-REPLAY] Failed to replay message', err);
            }
        },
    });
}

main().catch(err => {
    console.error('[DLQ-REPLAY] Fatal error', err);
    process.exit(1);
});
