CREATE TABLE order_orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           VARCHAR(255) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    total             NUMERIC(10,2) NOT NULL,
    shipping_name     VARCHAR(200),
    shipping_address  TEXT,
    shipping_email    VARCHAR(200),
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES order_orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL,
    product_name    VARCHAR(200) NOT NULL,
    product_image   VARCHAR(500),
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INT NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_orders_user ON order_orders(user_id);
CREATE INDEX idx_order_orders_status ON order_orders(status);
CREATE INDEX idx_order_orders_created ON order_orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
