CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL,
    tx_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(id)
);

-- Index for fast wallet balance summation
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet 
ON ledger_entries(wallet_id, created_at);
