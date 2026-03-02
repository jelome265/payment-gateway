# Production Readiness Checklist — Payment Gateway

## Infrastructure & Build
- [x] **Bazel containerization**: Reproducible Docker images generated via `bazel build //...:image`.
- [x] **GitOps**: ArgoCD application templates created for automated delivery.
- [x] **Runbooks**: Documented SRE runbooks for core incident types (drift, loss, stutck batches, chargebacks).
- [ ] **Secrets**: Vault production cluster initialized with rotation policies applied.
- [ ] **Monitoring**: Prometheus/Grafana dashboards for ledger throughput and error rates.

## Application & Logic
- [x] **Ledger**: Append-only, serializable isolation for all financial transactions.
- [x] **Idempotency**: Webhooks and external calls deduplicated by `x-idempotency-key`.
- [x] **KYC/AML**: Automated decision engine and SAR generation for suspicious activity.
- [x] **Matching Engine**: Deterministic orderbook in Rust with price-time priority.
- [x] **Connectors**: mTLS/HMAC authenticated adapters with exponential backoff and poison queues.
- [x] **Reconciliation**: Automated batch worker consuming provider daily statements.

## Security & Compliance
- [x] **PCI Scope**: Minimized via tokenization (no PAN/CVV storage).
- [x] **HSM**: Secure key operations wrapped in C/FFI boundary.
- [x] **WAF**: Rate limiting and body size filtering at the edge.
- [x] **Audit**: Daily signed hash chain for tamper-evident event logging.

## Final Approval Gates
- [ ] Central Bank (RBM) license confirmation received.
- [ ] BIN sponsor production credentials verified.
- [ ] Quarterly mTLS certificate rotation confirmed.
- [ ] Load testing passed (5000+ RPS sustained).
