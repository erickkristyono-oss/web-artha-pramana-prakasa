-- =============================================================
--  PT Artha Pramana Prakasa — PostgreSQL schema
-- =============================================================

DROP TABLE IF EXISTS order_items      CASCADE;
DROP TABLE IF EXISTS orders           CASCADE;
DROP TABLE IF EXISTS cart_items       CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;
DROP TABLE IF EXISTS services         CASCADE;
DROP TABLE IF EXISTS sessions         CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS users            CASCADE;
DROP TYPE  IF EXISTS order_status;

-- ---------- Users & sessions ----------
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    full_name      VARCHAR(120) NOT NULL,
    email          VARCHAR(160) NOT NULL UNIQUE,
    phone          VARCHAR(30),
    company        VARCHAR(160),
    password_hash  TEXT         NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
    token       CHAR(64)    PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ---------- Catalog ----------
CREATE TABLE services (
    id           SERIAL PRIMARY KEY,
    slug         VARCHAR(80)  NOT NULL UNIQUE,
    code         VARCHAR(4)   NOT NULL,
    name         VARCHAR(160) NOT NULL,
    tagline      VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL,
    sort_order   SMALLINT     NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE service_packages (
    id          SERIAL PRIMARY KEY,
    service_id  INTEGER      NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name        VARCHAR(80)  NOT NULL,
    price       BIGINT       NOT NULL CHECK (price BETWEEN 10000000 AND 50000000),
    duration    VARCHAR(80)  NOT NULL,
    features    TEXT[]       NOT NULL DEFAULT '{}',
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_packages_service ON service_packages(service_id);

-- ---------- Cart ----------
CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id  INTEGER     NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
    quantity    SMALLINT    NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 10),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, package_id)
);

-- ---------- Orders & payment ----------
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'failed', 'cancelled');

CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    order_number    VARCHAR(32)  NOT NULL UNIQUE,
    user_id         INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subtotal        BIGINT       NOT NULL,
    tax_amount      BIGINT       NOT NULL,
    total_amount    BIGINT       NOT NULL,
    status          order_status NOT NULL DEFAULT 'pending',
    payment_provider VARCHAR(40),
    payment_method  VARCHAR(40),
    payment_ref     VARCHAR(80),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ
);
CREATE INDEX idx_orders_user ON orders(user_id);

-- Snapshot nama & harga saat checkout, supaya riwayat tidak berubah bila katalog diubah
CREATE TABLE order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    package_id    INTEGER      REFERENCES service_packages(id) ON DELETE SET NULL,
    service_name  VARCHAR(160) NOT NULL,
    package_name  VARCHAR(80)  NOT NULL,
    unit_price    BIGINT       NOT NULL,
    quantity      SMALLINT     NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ---------- Contact form ----------
CREATE TABLE contact_messages (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(160) NOT NULL,
    phone       VARCHAR(30),
    subject     VARCHAR(200),
    message     TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
