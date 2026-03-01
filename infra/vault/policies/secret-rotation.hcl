# Vault Secret Rotation Policies

# ============================================================
# Token & Webhook Signing Keys
# ============================================================
# Rotate every 90 days. Auto-generate via Vault dynamic secrets.
path "secret/data/payments-core/webhook-signing-key" {
  capabilities = ["create", "read", "update"]
}

path "secret/data/payments-core/jwt-signing-key" {
  capabilities = ["create", "read", "update"]
}

# ============================================================
# Database Credentials (Dynamic)
# ============================================================
# Vault generates short-lived DB credentials (TTL: 1 hour, max TTL: 24 hours).
# Applications request new credentials on startup and refresh before expiry.
path "database/creds/payments-core-rw" {
  capabilities = ["read"]
}

path "database/creds/payments-core-ro" {
  capabilities = ["read"]
}

# ============================================================
# mTLS Certificates
# ============================================================
# Rotate quarterly. Vault PKI engine issues certificates.
path "pki/issue/connectors-mtls" {
  capabilities = ["create", "update"]
}

path "pki/issue/edge-node-mtls" {
  capabilities = ["create", "update"]
}

# ============================================================
# BIN Sponsor API Keys
# ============================================================
# Rotate on contract renewal or suspected compromise.
path "secret/data/card-issuing/marqeta-api-key" {
  capabilities = ["read"]
}

path "secret/data/card-issuing/marqeta-api-secret" {
  capabilities = ["read"]
}

# ============================================================
# Airtel / TNM API Credentials
# ============================================================
path "secret/data/connectors/airtel-api-key" {
  capabilities = ["read"]
}

path "secret/data/connectors/airtel-api-secret" {
  capabilities = ["read"]
}

path "secret/data/connectors/tnm-api-key" {
  capabilities = ["read"]
}

path "secret/data/connectors/tnm-api-secret" {
  capabilities = ["read"]
}

# ============================================================
# HSM Credentials
# ============================================================
# PCI Scope: access tightly restricted. Separate approval required.
path "secret/data/hsm/slot-pin" {
  capabilities = ["read"]
}

# ============================================================
# Rotation Schedule Summary
# ============================================================
# | Secret                      | Rotation Period | Method                    |
# |-----------------------------|-----------------|---------------------------|
# | Webhook signing key         | 90 days         | Vault KV auto-rotation    |
# | JWT signing key             | 90 days         | Vault KV auto-rotation    |
# | Database credentials        | 1 hour TTL      | Vault dynamic secrets     |
# | mTLS certificates           | 90 days         | Vault PKI engine          |
# | BIN sponsor API keys        | On renewal      | Manual rotation in Vault  |
# | Airtel/TNM API keys         | 180 days        | Manual rotation in Vault  |
# | HSM slot PINs               | On compromise   | Manual with PCI approval  |
