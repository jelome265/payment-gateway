import { Counter, Gauge, collectDefaultMetrics, register } from 'prom-client';

// Enable default metrics (CPU, RAM, etc.)
collectDefaultMetrics();

export const webhooks_received_total = new Counter({
    name: 'webhooks_received_total',
    help: 'Total number of webhooks received by provider',
    labelNames: ['provider'] as const,
});

export const webhooks_verified_total = new Counter({
    name: 'webhooks_verified_total',
    help: 'Total number of successfully verified webhooks',
    labelNames: ['provider'] as const,
});

export const webhooks_rejected_total = new Counter({
    name: 'webhooks_rejected_total',
    help: 'Total number of rejected webhooks (auth or validation fail)',
    labelNames: ['provider', 'reason'] as const,
});

export const webhook_queue_depth_gauge = new Gauge({
    name: 'webhook_queue_depth',
    help: 'Current number of webhooks waiting in the processing queue',
});

export { register };
