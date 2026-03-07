-- Ledger outbox table for reliable Kafka publishing

CREATE TABLE IF NOT EXISTS ledger_outbox (
    id UUID PRIMARY KEY,
    ledger_entry_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_ledger_outbox_status ON ledger_outbox(status);
