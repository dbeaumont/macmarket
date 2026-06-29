CREATE TABLE cart_carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id         UUID NOT NULL REFERENCES cart_carts(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL,
    product_name    VARCHAR(200) NOT NULL,
    product_image   VARCHAR(500),
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    added_at        TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_carts_user ON cart_carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
