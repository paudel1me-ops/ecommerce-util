-- ============================================================
-- Migration 002: Marketplace Schema
-- Origin Market — country-of-manufacture gated marketplace
-- ============================================================

-- ── Part A: Extensions ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Part B: Countries ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countries (
  code        CHAR(2)      PRIMARY KEY,  -- ISO 3166-1 alpha-2
  name        TEXT         NOT NULL,
  region      TEXT,
  flag_emoji  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed 195 countries (representative sample — extend as needed)
INSERT INTO countries (code, name, region, flag_emoji) VALUES
  ('AF','Afghanistan','Asia','🇦🇫'),('AL','Albania','Europe','🇦🇱'),
  ('DZ','Algeria','Africa','🇩🇿'),('AD','Andorra','Europe','🇦🇩'),
  ('AO','Angola','Africa','🇦🇴'),('AG','Antigua and Barbuda','Americas','🇦🇬'),
  ('AR','Argentina','Americas','🇦🇷'),('AM','Armenia','Asia','🇦🇲'),
  ('AU','Australia','Oceania','🇦🇺'),('AT','Austria','Europe','🇦🇹'),
  ('AZ','Azerbaijan','Asia','🇦🇿'),('BS','Bahamas','Americas','🇧🇸'),
  ('BH','Bahrain','Asia','🇧🇭'),('BD','Bangladesh','Asia','🇧🇩'),
  ('BB','Barbados','Americas','🇧🇧'),('BY','Belarus','Europe','🇧🇾'),
  ('BE','Belgium','Europe','🇧🇪'),('BZ','Belize','Americas','🇧🇿'),
  ('BJ','Benin','Africa','🇧🇯'),('BT','Bhutan','Asia','🇧🇹'),
  ('BO','Bolivia','Americas','🇧🇴'),('BA','Bosnia and Herzegovina','Europe','🇧🇦'),
  ('BW','Botswana','Africa','🇧🇼'),('BR','Brazil','Americas','🇧🇷'),
  ('BN','Brunei','Asia','🇧🇳'),('BG','Bulgaria','Europe','🇧🇬'),
  ('BF','Burkina Faso','Africa','🇧🇫'),('BI','Burundi','Africa','🇧🇮'),
  ('CV','Cabo Verde','Africa','🇨🇻'),('KH','Cambodia','Asia','🇰🇭'),
  ('CM','Cameroon','Africa','🇨🇲'),('CA','Canada','Americas','🇨🇦'),
  ('CF','Central African Republic','Africa','🇨🇫'),('TD','Chad','Africa','🇹🇩'),
  ('CL','Chile','Americas','🇨🇱'),('CN','China','Asia','🇨🇳'),
  ('CO','Colombia','Americas','🇨🇴'),('KM','Comoros','Africa','🇰🇲'),
  ('CD','Congo (DRC)','Africa','🇨🇩'),('CG','Congo (Republic)','Africa','🇨🇬'),
  ('CR','Costa Rica','Americas','🇨🇷'),('CI','Côte d''Ivoire','Africa','🇨🇮'),
  ('HR','Croatia','Europe','🇭🇷'),('CU','Cuba','Americas','🇨🇺'),
  ('CY','Cyprus','Europe','🇨🇾'),('CZ','Czechia','Europe','🇨🇿'),
  ('DK','Denmark','Europe','🇩🇰'),('DJ','Djibouti','Africa','🇩🇯'),
  ('DM','Dominica','Americas','🇩🇲'),('DO','Dominican Republic','Americas','🇩🇴'),
  ('EC','Ecuador','Americas','🇪🇨'),('EG','Egypt','Africa','🇪🇬'),
  ('SV','El Salvador','Americas','🇸🇻'),('GQ','Equatorial Guinea','Africa','🇬🇶'),
  ('ER','Eritrea','Africa','🇪🇷'),('EE','Estonia','Europe','🇪🇪'),
  ('SZ','Eswatini','Africa','🇸🇿'),('ET','Ethiopia','Africa','🇪🇹'),
  ('FJ','Fiji','Oceania','🇫🇯'),('FI','Finland','Europe','🇫🇮'),
  ('FR','France','Europe','🇫🇷'),('GA','Gabon','Africa','🇬🇦'),
  ('GM','Gambia','Africa','🇬🇲'),('GE','Georgia','Asia','🇬🇪'),
  ('DE','Germany','Europe','🇩🇪'),('GH','Ghana','Africa','🇬🇭'),
  ('GR','Greece','Europe','🇬🇷'),('GD','Grenada','Americas','🇬🇩'),
  ('GT','Guatemala','Americas','🇬🇹'),('GN','Guinea','Africa','🇬🇳'),
  ('GW','Guinea-Bissau','Africa','🇬🇼'),('GY','Guyana','Americas','🇬🇾'),
  ('HT','Haiti','Americas','🇭🇹'),('HN','Honduras','Americas','🇭🇳'),
  ('HU','Hungary','Europe','🇭🇺'),('IS','Iceland','Europe','🇮🇸'),
  ('IN','India','Asia','🇮🇳'),('ID','Indonesia','Asia','🇮🇩'),
  ('IR','Iran','Asia','🇮🇷'),('IQ','Iraq','Asia','🇮🇶'),
  ('IE','Ireland','Europe','🇮🇪'),('IL','Israel','Asia','🇮🇱'),
  ('IT','Italy','Europe','🇮🇹'),('JM','Jamaica','Americas','🇯🇲'),
  ('JP','Japan','Asia','🇯🇵'),('JO','Jordan','Asia','🇯🇴'),
  ('KZ','Kazakhstan','Asia','🇰🇿'),('KE','Kenya','Africa','🇰🇪'),
  ('KI','Kiribati','Oceania','🇰🇮'),('KW','Kuwait','Asia','🇰🇼'),
  ('KG','Kyrgyzstan','Asia','🇰🇬'),('LA','Laos','Asia','🇱🇦'),
  ('LV','Latvia','Europe','🇱🇻'),('LB','Lebanon','Asia','🇱🇧'),
  ('LS','Lesotho','Africa','🇱🇸'),('LR','Liberia','Africa','🇱🇷'),
  ('LY','Libya','Africa','🇱🇾'),('LI','Liechtenstein','Europe','🇱🇮'),
  ('LT','Lithuania','Europe','🇱🇹'),('LU','Luxembourg','Europe','🇱🇺'),
  ('MG','Madagascar','Africa','🇲🇬'),('MW','Malawi','Africa','🇲🇼'),
  ('MY','Malaysia','Asia','🇲🇾'),('MV','Maldives','Asia','🇲🇻'),
  ('ML','Mali','Africa','🇲🇱'),('MT','Malta','Europe','🇲🇹'),
  ('MH','Marshall Islands','Oceania','🇲🇭'),('MR','Mauritania','Africa','🇲🇷'),
  ('MU','Mauritius','Africa','🇲🇺'),('MX','Mexico','Americas','🇲🇽'),
  ('FM','Micronesia','Oceania','🇫🇲'),('MD','Moldova','Europe','🇲🇩'),
  ('MC','Monaco','Europe','🇲🇨'),('MN','Mongolia','Asia','🇲🇳'),
  ('ME','Montenegro','Europe','🇲🇪'),('MA','Morocco','Africa','🇲🇦'),
  ('MZ','Mozambique','Africa','🇲🇿'),('MM','Myanmar','Asia','🇲🇲'),
  ('NA','Namibia','Africa','🇳🇦'),('NR','Nauru','Oceania','🇳🇷'),
  ('NP','Nepal','Asia','🇳🇵'),('NL','Netherlands','Europe','🇳🇱'),
  ('NZ','New Zealand','Oceania','🇳🇿'),('NI','Nicaragua','Americas','🇳🇮'),
  ('NE','Niger','Africa','🇳🇪'),('NG','Nigeria','Africa','🇳🇬'),
  ('KP','North Korea','Asia','🇰🇵'),('MK','North Macedonia','Europe','🇲🇰'),
  ('NO','Norway','Europe','🇳🇴'),('OM','Oman','Asia','🇴🇲'),
  ('PK','Pakistan','Asia','🇵🇰'),('PW','Palau','Oceania','🇵🇼'),
  ('PA','Panama','Americas','🇵🇦'),('PG','Papua New Guinea','Oceania','🇵🇬'),
  ('PY','Paraguay','Americas','🇵🇾'),('PE','Peru','Americas','🇵🇪'),
  ('PH','Philippines','Asia','🇵🇭'),('PL','Poland','Europe','🇵🇱'),
  ('PT','Portugal','Europe','🇵🇹'),('QA','Qatar','Asia','🇶🇦'),
  ('RO','Romania','Europe','🇷🇴'),('RU','Russia','Europe','🇷🇺'),
  ('RW','Rwanda','Africa','🇷🇼'),('KN','Saint Kitts and Nevis','Americas','🇰🇳'),
  ('LC','Saint Lucia','Americas','🇱🇨'),('VC','Saint Vincent and the Grenadines','Americas','🇻🇨'),
  ('WS','Samoa','Oceania','🇼🇸'),('SM','San Marino','Europe','🇸🇲'),
  ('ST','Sao Tome and Principe','Africa','🇸🇹'),('SA','Saudi Arabia','Asia','🇸🇦'),
  ('SN','Senegal','Africa','🇸🇳'),('RS','Serbia','Europe','🇷🇸'),
  ('SC','Seychelles','Africa','🇸🇨'),('SL','Sierra Leone','Africa','🇸🇱'),
  ('SG','Singapore','Asia','🇸🇬'),('SK','Slovakia','Europe','🇸🇰'),
  ('SI','Slovenia','Europe','🇸🇮'),('SB','Solomon Islands','Oceania','🇸🇧'),
  ('SO','Somalia','Africa','🇸🇴'),('ZA','South Africa','Africa','🇿🇦'),
  ('KR','South Korea','Asia','🇰🇷'),('SS','South Sudan','Africa','🇸🇸'),
  ('ES','Spain','Europe','🇪🇸'),('LK','Sri Lanka','Asia','🇱🇰'),
  ('SD','Sudan','Africa','🇸🇩'),('SR','Suriname','Americas','🇸🇷'),
  ('SE','Sweden','Europe','🇸🇪'),('CH','Switzerland','Europe','🇨🇭'),
  ('SY','Syria','Asia','🇸🇾'),('TW','Taiwan','Asia','🇹🇼'),
  ('TJ','Tajikistan','Asia','🇹🇯'),('TZ','Tanzania','Africa','🇹🇿'),
  ('TH','Thailand','Asia','🇹🇭'),('TL','Timor-Leste','Asia','🇹🇱'),
  ('TG','Togo','Africa','🇹🇬'),('TO','Tonga','Oceania','🇹🇴'),
  ('TT','Trinidad and Tobago','Americas','🇹🇹'),('TN','Tunisia','Africa','🇹🇳'),
  ('TR','Turkey','Asia','🇹🇷'),('TM','Turkmenistan','Asia','🇹🇲'),
  ('TV','Tuvalu','Oceania','🇹🇻'),('UG','Uganda','Africa','🇺🇬'),
  ('UA','Ukraine','Europe','🇺🇦'),('AE','United Arab Emirates','Asia','🇦🇪'),
  ('GB','United Kingdom','Europe','🇬🇧'),('US','United States','Americas','🇺🇸'),
  ('UY','Uruguay','Americas','🇺🇾'),('UZ','Uzbekistan','Asia','🇺🇿'),
  ('VU','Vanuatu','Oceania','🇻🇺'),('VE','Venezuela','Americas','🇻🇪'),
  ('VN','Vietnam','Asia','🇻🇳'),('YE','Yemen','Asia','🇾🇪'),
  ('ZM','Zambia','Africa','🇿🇲'),('ZW','Zimbabwe','Africa','🇿🇼')
ON CONFLICT (code) DO NOTHING;

-- ── Part C: Categories ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT         NOT NULL UNIQUE,
  name        TEXT         NOT NULL,
  parent_id   UUID         REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO categories (slug, name) VALUES
  ('textiles','Textiles'),('ceramics','Ceramics'),('jewelry','Jewelry'),
  ('leather','Leather Goods'),('woodwork','Woodwork'),('metalwork','Metalwork'),
  ('art','Art & Prints'),('food','Food & Drink'),('beauty','Beauty & Wellness'),
  ('fashion','Fashion'),('home-decor','Home Decor'),('toys','Toys & Games')
ON CONFLICT (slug) DO NOTHING;

-- ── Part D: Sellers ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sellers (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name        TEXT         NOT NULL,
  registered_country   CHAR(2)      NOT NULL REFERENCES countries(code),
  verified             BOOLEAN      NOT NULL DEFAULT FALSE,
  verification_status  TEXT         NOT NULL DEFAULT 'pending'
                         CHECK (verification_status IN ('pending','verified','rejected','suspended')),
  bio                  TEXT,
  website_url          TEXT,
  logo_url             TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS seller_verifications (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID         NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  document_type TEXT       NOT NULL,
  document_url  TEXT       NOT NULL,
  status      TEXT         NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected')),
  reviewer_id UUID         REFERENCES auth.users(id),
  notes       TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ
);

-- ── Part E: Products (replaces images table) ─────────────────
-- Rename existing images table if it exists, else create fresh
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'images' AND table_schema = 'public') THEN
    ALTER TABLE images RENAME TO products;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id           UUID         REFERENCES sellers(id) ON DELETE SET NULL,
  title               TEXT         NOT NULL,
  description         TEXT,
  category_id         UUID         REFERENCES categories(id) ON DELETE SET NULL,
  origin_country      CHAR(2)      REFERENCES countries(code),
  price               NUMERIC(12,2),
  currency            CHAR(3)      NOT NULL DEFAULT 'USD',
  status              TEXT         NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','active','inactive','deleted')),
  -- ML / origin fields
  origin_confidence   FLOAT,
  origin_verdict      TEXT         CHECK (origin_verdict IN ('verified','flagged','rejected','pending')),
  cultural_context    JSONB,
  embedding           vector(1536),
  -- legacy classification fields (kept for compat)
  url                 TEXT,
  label               TEXT,
  metadata            JSONB,
  user_id             UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Backward-compat view so old queries using "images" still work
CREATE OR REPLACE VIEW images AS
  SELECT id, url, label, metadata, user_id, created_at, updated_at
  FROM products;

-- ── Part F: SKUs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skus (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku_code       TEXT         NOT NULL,
  attributes     JSONB        NOT NULL DEFAULT '{}',
  price_override NUMERIC(12,2),
  stock_qty      INT          NOT NULL DEFAULT 0,
  UNIQUE (product_id, sku_code)
);

-- ── Part G: Collections ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID         REFERENCES sellers(id) ON DELETE SET NULL,
  title           TEXT         NOT NULL,
  slug            TEXT         NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  is_public       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_products (
  collection_id  UUID  NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id     UUID  NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position       INT   NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- ── Part H: Reviews ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id           UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating            SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  body              TEXT,
  verified_purchase BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

-- ── Part I: Carts & Orders ───────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID         NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku_id      UUID         REFERENCES skus(id) ON DELETE SET NULL,
  quantity    INT          NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT         NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','refunded')),
  total_amount     NUMERIC(12,2) NOT NULL,
  currency         CHAR(3)      NOT NULL DEFAULT 'USD',
  shipping_address JSONB,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     UUID         NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku_id         UUID         REFERENCES skus(id) ON DELETE SET NULL,
  quantity       INT          NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(12,2) NOT NULL,
  origin_country CHAR(2)      REFERENCES countries(code)
);

-- ── Part J: Media Assets ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT         NOT NULL,
  type        TEXT         NOT NULL DEFAULT 'image' CHECK (type IN ('image','video')),
  position    INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Part K: Indexes ──────────────────────────────────────────
-- Vector (HNSW) for semantic search
CREATE INDEX IF NOT EXISTS products_embedding_hnsw
  ON products USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Btree indexes for common filters
CREATE INDEX IF NOT EXISTS products_seller_id_idx      ON products (seller_id);
CREATE INDEX IF NOT EXISTS products_origin_country_idx ON products (origin_country);
CREATE INDEX IF NOT EXISTS products_status_idx         ON products (status);
CREATE INDEX IF NOT EXISTS products_category_id_idx    ON products (category_id);
CREATE INDEX IF NOT EXISTS products_price_idx          ON products (price);
CREATE INDEX IF NOT EXISTS products_origin_verdict_idx ON products (origin_verdict);
CREATE INDEX IF NOT EXISTS sellers_user_id_idx         ON sellers (user_id);
CREATE INDEX IF NOT EXISTS sellers_country_idx         ON sellers (registered_country);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx      ON reviews (product_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx          ON orders (user_id);

-- Trigram index for full-text partial match on product title
CREATE INDEX IF NOT EXISTS products_title_trgm_idx
  ON products USING gin (title gin_trgm_ops);

-- ── Part L: Full-text search vector & trigger ────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.label, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

CREATE INDEX IF NOT EXISTS products_search_vector_idx
  ON products USING gin (search_vector);

-- ── Part M: Row Level Security ───────────────────────────────
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;

-- Products: public can read active, owners can CRUD their own
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (status = 'active');
CREATE POLICY "products_seller_write" ON products FOR ALL
  USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Sellers: anyone can read, only owner can write
CREATE POLICY "sellers_public_read"   ON sellers FOR SELECT USING (TRUE);
CREATE POLICY "sellers_owner_write"   ON sellers FOR ALL USING (user_id = auth.uid());

-- Reviews: public read, authenticated write own
CREATE POLICY "reviews_public_read"   ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_owner_write"   ON reviews FOR ALL USING (user_id = auth.uid());

-- Carts & orders: private per user
CREATE POLICY "carts_owner"       ON carts       FOR ALL USING (user_id = auth.uid());
CREATE POLICY "cart_items_owner"  ON cart_items  FOR ALL
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));
CREATE POLICY "orders_owner"      ON orders      FOR ALL USING (user_id = auth.uid());
CREATE POLICY "order_items_owner" ON order_items FOR ALL
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
