-- 09_payments.sql
CREATE TABLE payments (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                    UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  -- Gateway identification
  method                      payment_method NOT NULL,
  status                      payment_status NOT NULL DEFAULT 'pending',

  -- Amount
  amount                      INTEGER NOT NULL CHECK (amount > 0),
  currency                    currency_code NOT NULL,

  -- M-Pesa fields (NULL for Stripe payments)
  mpesa_checkout_request_id   TEXT UNIQUE,   -- From STK Push initiation
  mpesa_receipt_number        TEXT UNIQUE,   -- From M-Pesa callback
  mpesa_phone                 TEXT,          -- E.164: +254712345678
  mpesa_result_code           INTEGER,       -- 0 = success
  mpesa_result_desc           TEXT,

  -- Stripe fields (NULL for M-Pesa payments)
  stripe_payment_intent_id    TEXT UNIQUE,   -- pi_xxx
  stripe_charge_id            TEXT UNIQUE,   -- ch_xxx
  stripe_client_secret        TEXT,          -- For frontend confirmation

  -- Full webhook payload for audit trail
  provider_payload            JSONB,

  -- Timing
  paid_at                     TIMESTAMPTZ,
  failed_at                   TIMESTAMPTZ,
  refunded_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order          ON payments(order_id);
CREATE INDEX idx_payments_user           ON payments(user_id);
CREATE INDEX idx_payments_status         ON payments(status);
CREATE INDEX idx_payments_method         ON payments(method);
CREATE INDEX idx_payments_mpesa_checkout ON payments(mpesa_checkout_request_id);
CREATE INDEX idx_payments_stripe_intent  ON payments(stripe_payment_intent_id);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
