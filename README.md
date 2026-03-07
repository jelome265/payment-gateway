# WarmHeart Payment Gateway

A high-performance, multi-language monorepo for a regulated payment gateway.

## Architecture

- **platform-java**: Core ledger, reconciliation, and reporting.
- **edge-node**: Webhook ingestion and public API gateway.
- **connectors-go**: Bank and mobile money rail adapters.
- **payments-core-rust**: Deterministic FX matching engine.
- **shared-contracts**: Protobuf and JSON schema definitions.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Bazel (for builds)
- Java 21, Go 1.22, Rust (latest stable), Node.js 20

### Setup

1. Start infrastructure:
   ```bash
   docker-compose up -d
   ```
2. Build all services:
   ```bash
   bazel build //...
   ```

## Compliance

Adheres to Reserve Bank of Malawi (RBM) Payment Systems Act.
- **PCI-DSS**: Scoped to tokenization layer.
- **AML/KYC**: Integrated with automated scoring.
