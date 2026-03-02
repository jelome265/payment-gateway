# SRE Runbooks - Payment Gateway

## Incident Type: Reconciliation Drift > 0.1%
**Severity:** Critical
**Description:** Daily reconciliation shows mismatched funds between ledger and Airtel/TNM statements.
**Steps:**
1.  Check `reconciliation_events` table for mismatch reasons.
2.  Inspect `connectors-go` logs for signature or network errors on the drift date.
3.  Manually fetch provider status for the failed `correlation_id`.
4.  If confirmed valid by provider, manually create a `RECON_ADJUSTMENT` ledger entry.

## Incident Type: Webhook Loss > 5 Minutes
**Severity:** High
**Description:** No incoming webhooks received in the last 5 minutes from a provider.
**Steps:**
1.  Check `edge-node` health and BullMQ queue depth.
2.  Inspect WAF logs in `edge-node`: are we blocking the provider's IP range?
3.  Verify provider API status page (Airtel/TNM).
4.  Check Kafka `ledger-events` topic throughput.

## Incident Type: Stuck Settlement Batch
**Severity:** High
**Description:** A daily settlement batch has not completed within its window.
**Steps:**
1.  Check `connectors-go` settlement worker logs.
2.  Verify mTLS certificate validity: has it expired?
3.  Check connectivity to the `platform-java` reconciliation consumer.
4.  Manually trigger settlement run via `POST /admin/settlement/run`.

## Incident Type: Card Chargeback Rate > 0.5%
**Severity:** Critical
**Description:** High volume of card chargebacks detected in a 24-hour period.
**Steps:**
1.  Identify the common `bin_profile` or merchant causing alerts.
2.  Enable stricter KYC triggers in `KycService`.
3.  Temporarily freeze suspected `Card` tokens.
4.  Report to Head of Ops and Risk.
