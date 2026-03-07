CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    event_types TEXT[], -- ['charge.created', 'charge.failed']
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id),
    payload JSONB NOT NULL,
    response_code INTEGER,
    response_body TEXT,
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
