CREATE TABLE IF NOT EXISTS payment_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    expiry_month INTEGER,
    expiry_year INTEGER,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, REVOKED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_tokens_customer ON payment_tokens(customer_id);
