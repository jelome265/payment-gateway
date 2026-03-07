# DLQ Handling - Edge Node & Connectors-Go

## Topics
- Edge Node BullMQ failures -> Kafka DLQ: `edge-webhooks-poison` (configurable via `DLQ_TOPIC`).
- Connectors-Go poison queue -> Kafka topic per connector: `airtel-poison-queue`, `tnm-poison-queue` (brokers from `KAFKA_BROKERS`).
- Platform-Java Kafka consumer DLT: `${WEBHOOK_DLT_TOPIC:incoming-webhooks.DLT}`; replay to `${WEBHOOK_TOPIC:incoming-webhooks}`.

## Signals / Metrics
- Edge Node: monitor BullMQ failed count and Kafka publish failures; count DLQ publishes per minute.
- Connectors-Go: monitor retry exhaustions (`[POISON QUEUE]` logs) and Kafka producer delivery errors.

## Alerting
- Page if DLQ publish rate exceeds threshold (e.g., > 5/min sustained 5m) or if Kafka delivery errors occur.
- Page if BullMQ failure rate > 1% of processed jobs.

## Remediation
1. Inspect DLQ payloads for repeated idempotency keys or signature failures.
2. Replay: after fix, produce DLQ payload back to `incoming-webhooks` (edge) or appropriate topic.
3. If poisoned by provider errors, coordinate with provider and increase backoff or block bad senders.
4. For platform-java DLT, use the replay helper/service to send messages back to the primary topic once code fixes deployed.

## Runbook Checks
- Verify Redis availability for idempotency (`REDIS_HOST/PORT` in edge, `REDIS_ADDR` in connectors-go).
- Verify Kafka brokers reachable from services.
