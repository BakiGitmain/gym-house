BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username CITEXT NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  email CITEXT NOT NULL UNIQUE,

  password_hash TEXT NOT NULL,
  profile_image_url TEXT,

  role VARCHAR(20) NOT NULL
    CHECK (role IN ('admin', 'customer')),

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  failed_login_attempts INTEGER NOT NULL DEFAULT 0
    CHECK (failed_login_attempts >= 0),

  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_username_format_check
    CHECK (
      username::TEXT ~ '^[a-zA-Z0-9._-]{3,32}$'
    ),

  CONSTRAINT users_name_not_empty_check
    CHECK (LENGTH(TRIM(name)) >= 2)
);

CREATE INDEX IF NOT EXISTS users_role_index
  ON users (role);

CREATE INDEX IF NOT EXISTS users_active_role_index
  ON users (is_active, role);

CREATE TABLE IF NOT EXISTS customer_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  starts_at DATE NOT NULL,
  expires_at DATE NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (
      status IN (
        'active',
        'paused',
        'cancelled'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT membership_date_order_check
    CHECK (expires_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS memberships_user_index
  ON customer_memberships (user_id);

CREATE INDEX IF NOT EXISTS memberships_user_expiration_index
  ON customer_memberships (
    user_id,
    expires_at DESC
  );

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  token_hash CHAR(64) NOT NULL UNIQUE,

  ip_hash CHAR(64),
  user_agent_hash CHAR(64),

  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_index
  ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS auth_sessions_expiration_index
  ON auth_sessions (expires_at);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  rate_key CHAR(64) PRIMARY KEY,

  request_count INTEGER NOT NULL DEFAULT 1
    CHECK (request_count >= 0),

  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_window_index
  ON auth_rate_limits (window_started_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at
  ON users;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS memberships_set_updated_at
  ON customer_memberships;

CREATE TRIGGER memberships_set_updated_at
BEFORE UPDATE ON customer_memberships
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;