CREATE TABLE payment_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL UNIQUE,
    amount          NUMERIC(10,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(100),
    failure_reason  VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_payment_order ON payment_payments(order_id);
CREATE INDEX idx_payment_status ON payment_payments(status);
