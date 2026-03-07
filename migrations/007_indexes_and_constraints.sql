-- Performance and Data Integrity Constraints

-- Wallets table to track current balances (materialized or fast-cache)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Can be customer or merchant
    currency VARCHAR(3) NOT NULL,
    balance NUMERIC(19, 4) DEFAULT 0,
    reserved_balance NUMERIC(19, 4) DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- Compound index for historical balance point-in-time calculation
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_type_time 
ON ledger_entries(wallet_id, type, created_at);

-- Foreign key constraints for ledger
ALTER TABLE ledger_entries 
ADD CONSTRAINT fk_ledger_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id);
