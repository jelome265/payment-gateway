# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository shape

This is a multi-service payment gateway monorepo organized by runtime:

- `platform-java/`: Spring Boot orchestration service (ledger writes, KYC/AML/card/FX/reconciliation services).
- `edge-node/`: Express ingress for webhooks/KYC endpoints, with BullMQ + Kafka publishing.
- `connectors-go/`: external rail adapters (Airtel/TNM), webhook handlers, settlement polling/retries.
- `payments-core-rust/`: deterministic matching engine logic (`matching_engine.rs` currently holds the main implementation + tests).
- `shared-contracts/`: protobuf contract package.
- `migrations/`: top-level SQL schema evolution for core domain tables.

The intended architecture is ledger-first + event-driven: webhook ingress -> queue/event bus -> ledger mutation -> reconciliation/audit.

## Commands used in this repo

Run commands from repository root (`payment-gateway/`) unless noted.

### Infrastructure dependencies (local)

- Start local dependencies:
  - `docker-compose up -d`
- Stop local dependencies:
  - `docker-compose down`

This project expects Postgres (`5432`), Redis (`6379`), and Kafka (`9092`) from `docker-compose.yml`.

### Bazel / CI parity

- CI wrapper used by GitHub Actions:
  - `./bazel_ci.sh`
- Equivalent direct commands:
  - `bazelisk build //...`
  - `bazelisk test //...`

Note: Bazel files are partially scaffolded; if `//...` fails, fix BUILD/MODULE/workspace definitions before relying on service-level targets.

### Edge service (`edge-node/`)

- Install deps:
  - `npm --prefix edge-node install`
- Dev server:
  - `npm --prefix edge-node run dev`
- Compile TypeScript:
  - `npm --prefix edge-node run build`
- Start compiled app:
  - `npm --prefix edge-node run start`

There is currently no dedicated lint/test script in `edge-node/package.json`.

### Go connectors (`connectors-go/`)

- Run connector service:
  - `go run ./connectors-go/cmd/server`
- Run tests:
  - `go test ./connectors-go/...`
- Run a single test:
  - `go test ./connectors-go/<package> -run <TestName>`

### Rust matching engine (`payments-core-rust/`)

- Run Rust tests via Bazel target:
  - `bazelisk test //payments-core-rust:matching-engine-test`
- Run a single Rust test:
  - `bazelisk test //payments-core-rust:matching-engine-test --test_filter=test_simple_match`

`payments-core-rust/Cargo.toml` is currently empty; prefer Bazel targets unless Cargo config is completed.

### Integration flow helper

- Scripted phase-2 flow reference:
  - `./scripts/test_phase2_flow.sh`

This script documents expected deposit-flow validation steps (edge webhook -> Kafka -> platform ledger write).

## Architecture that matters for edits

### 1) Ingestion path (deposits/webhooks)

- Webhooks arrive at `edge-node/src/routes/webhook.ts`.
- Signature verification/idempotency extraction is middleware-driven (see `edge-node/src/middleware/auth.ts` and queue usage in `edge-node/src/workers/queue.ts`).
- Jobs are deduplicated by BullMQ `jobId` (idempotency key), then published to Kafka in `edge-node/src/workers/kafkaProducer.ts`.

When changing webhook behavior, preserve fast ACK semantics and async processing.

### 2) Authoritative ledger behavior

- Ledger writes happen in `platform-java/src/main/java/com/company/payments/service/LedgerService.java`.
- Idempotency is enforced via `findByTxId(...)` before insert.
- Transaction isolation is `SERIALIZABLE` for critical writes.
- Ledger events are emitted to Kafka after write.

`migrations/005_create_ledger.sql` defines the append-only ledger table used as source of truth.

### 3) Reconciliation loop

- Connectors pull statements (`connectors-go/internal/settlement/settlement_worker.go`).
- Reconciliation consumption in Java is handled by `BatchReconciliationWorker` and `ReconciliationService`.
- Mismatch/event persistence paths are still partially scaffolded; expect TODOs in reconciliation event handling.

### 4) Cards, KYC/AML, FX are implemented in Java service layer

- KYC orchestration: `service/KycService.java`, ingress controller in `controller/KycController.java`.
- Card lifecycle (issue/auth/capture/chargeback): `service/CardService.java`, `controller/CardController.java`.
- FX escrow flow: `service/FxEscrowService.java`, `controller/FxController.java`.

These services rely on ledger writes for money movement side effects; avoid bypassing ledger service.

### 5) Current maturity caveats

- Several docs and scripts are placeholders (empty files exist in `README.md`, `Makefile`, various docs/scripts).
- Some Bazel targets are scaffold-level and may not align with actual runnable service entrypoints yet.
- `platform-java/` contains Bazel output directories (`bazel-*`); keep these out of source edits and avoid treating them as code.
