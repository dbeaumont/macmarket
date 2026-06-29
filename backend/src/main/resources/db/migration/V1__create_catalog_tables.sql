CREATE TABLE catalog_products (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(200) NOT NULL,
    slug              VARCHAR(200) NOT NULL UNIQUE,
    description       TEXT,
    short_desc        VARCHAR(500),
    price             NUMERIC(10,2) NOT NULL,
    category          VARCHAR(50) NOT NULL,
    image_url         VARCHAR(500),
    stock_quantity    INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    active            BOOLEAN NOT NULL DEFAULT true,
    created_at        TIMESTAMP NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE catalog_product_specs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    spec_key    VARCHAR(100) NOT NULL,
    spec_value  VARCHAR(500) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    UNIQUE(product_id, spec_key)
);

CREATE INDEX idx_catalog_products_category ON catalog_products(category);
CREATE INDEX idx_catalog_products_active ON catalog_products(active);
CREATE INDEX idx_catalog_products_slug ON catalog_products(slug);
CREATE INDEX idx_catalog_product_specs_product ON catalog_product_specs(product_id);
