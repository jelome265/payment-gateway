# PCI DSS Readiness Checklist — WarmHeart Payment Gateway

## Scope Reduction Strategy
- [x] **Tokenization via BIN Sponsor**: All card PANs are tokenized by the issuing partner (Marqeta). Our systems only store `card_token`, `last4`, and `expiry`. No PAN or CVV is ever stored, processed, or transmitted by our infrastructure.
- [x] **HSM isolation**: All cryptographic key operations are isolated in `crypto-engine-c` with restricted access controls.

## Network Security
- [ ] Firewall rules configured between all network segments
- [ ] DMZ implemented for edge-node (public-facing)
- [ ] Internal services (platform-java, connectors-go, payments-core-rust) not directly internet-accessible
- [x] mTLS enforced for all partner connections (Airtel, TNM, BIN sponsor)
- [x] TLS 1.2+ minimum for all connections

## Access Control
- [ ] MFA enforced for all administrative access
- [x] Vault-managed secrets with rotation policies
- [ ] Role-based access control (RBAC) implemented
- [x] HSM repository access restricted to authorized personnel only

## Data Protection
- [x] No PAN/CVV stored in any repository or database
- [x] Append-only ledger prevents unauthorized modification
- [x] Audit hash chain detects tampering of event logs
- [ ] Data at rest encryption for all databases (Postgres TDE or disk encryption)
- [ ] Data in transit encryption for all internal communications

## Vulnerability Management
- [ ] SAST (Static Application Security Testing) integrated in CI pipeline
- [ ] Dependency scanning for known CVEs in CI
- [ ] DAST (Dynamic Application Security Testing) on staging
- [ ] Penetration testing scheduled before production launch

## Monitoring & Logging
- [x] Immutable audit logs with actor_id, action, timestamp, reason
- [x] AML alerts for suspicious activity
- [ ] SIEM integration for real-time security event monitoring
- [ ] Log retention period documented per RBM requirements

## Incident Response
- [ ] Incident response plan documented
- [ ] Escalation matrix defined (engineer → SRE → Head Ops → Compliance)
- [ ] Chargeback rate monitoring (alert if > 0.5% daily)
- [ ] Webhook loss detection (alert if > 5 minutes gap)

## Compliance Documentation
- [ ] PCI scoping document completed and reviewed by QSA
- [ ] RBM reporting templates validated with legal counsel
- [ ] SAR workflow documented and tested
- [ ] Data retention policy documented

## Pre-Launch Gates
- [ ] QSA engagement scheduled (if required)
- [ ] BIN sponsor production credentials obtained
- [ ] RBM license or agent agreement verified (written)
- [ ] Fund reserves and FX liquidity partner onboarded
