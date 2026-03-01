# infra/vault/policies/bootstrap.hcl

path "secret/data/payments-core/*" {
  capabilities = ["read", "list"]
}

path "sys/auth/approle/role/payments-core/role-id" {
  capabilities = ["read"]
}

path "sys/auth/approle/role/payments-core/secret-id" {
  capabilities = ["update"]
}
