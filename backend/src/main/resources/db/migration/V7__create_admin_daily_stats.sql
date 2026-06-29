CREATE TABLE admin_daily_stats (
    stat_date    DATE          NOT NULL PRIMARY KEY,
    orders_count INT           NOT NULL DEFAULT 0,
    revenue      NUMERIC(12,2) NOT NULL DEFAULT 0,
    new_users_count INT        NOT NULL DEFAULT 0,
    updated_at   TIMESTAMP     NOT NULL DEFAULT now()
);
