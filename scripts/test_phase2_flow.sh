#!/usr/bin/env bash

set -euxo pipefail

echo "========================================="
echo " Phase 2 Integration Test Execution"
echo "========================================="

echo "1. Spin up Kafka, Zookeeper, Redis, and Postgres via Docker"
docker-compose up -d

echo "2. Compile and start the platform-java ledger service (in a separate terminal)"
echo "   Command: bazelisk run //platform-java:app"

echo "3. Start the Node.js webhook receiver (in a separate terminal)"
echo "   Command: cd edge-node && npm run dev"

echo "4. Send a mock deposit webhook to edge-node"
echo "   You must sign it with HMAC (WEBHOOK_SECRET=test_secret_key)"
echo "   curl -X POST http://localhost:3000/webhooks/deposit \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'x-idempotency-key: 123e4567-e89b-12d3-a456-426614174000' \\"
echo "     -H 'x-webhook-signature: <compute_sha256_hmac_here>' \\"
echo "     -d '{\"provider_tx_id\":\"123e4567-e89b-12d3-a456-426614174000\",\"wallet_id\":\"987e6543-e21b-12d3-a456-426614174111\",\"amount\":50000.00,\"currency\":\"MWK\"}'"

echo "5. Verify that platform-java processed the Kafka message and wrote to the ledger_entries table in Postgres"
