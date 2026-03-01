-- Phase 5: FX Offers table for P2P marketplace

CREATE TABLE IF NOT EXISTS fx_offers (
    id UUID PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES users(id),
    seller_wallet_id UUID NOT NULL REFERENCES wallets(id),
    buyer_id UUID REFERENCES users(id),
    buyer_wallet_id UUID REFERENCES wallets(id),
    sell_currency VARCHAR(3) NOT NULL,
    buy_currency VARCHAR(3) NOT NULL,
    sell_amount NUMERIC(19,4) NOT NULL,
    buy_amount NUMERIC(19,4) NOT NULL,
    exchange_rate NUMERIC(12,6) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fx_offers_status ON fx_offers(status);
CREATE INDEX IF NOT EXISTS idx_fx_offers_pair ON fx_offers(sell_currency, buy_currency, status);
CREATE INDEX IF NOT EXISTS idx_fx_offers_seller ON fx_offers(seller_id);
