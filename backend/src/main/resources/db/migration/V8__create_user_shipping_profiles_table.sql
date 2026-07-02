CREATE TABLE user_shipping_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR(255) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    address     TEXT NOT NULL,
    email       VARCHAR(200) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uk_user_shipping_profiles_user UNIQUE (user_id)
);

CREATE INDEX idx_user_shipping_profiles_user ON user_shipping_profiles(user_id);
