BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS
  profile_image_public_id TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS
  password_changed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS
  admin_account_audit_logs (
    id UUID PRIMARY KEY
      DEFAULT gen_random_uuid(),

    actor_user_id UUID
      REFERENCES users(id)
      ON DELETE SET NULL,

    action VARCHAR(80) NOT NULL,

    ip_hash CHAR(64),
    user_agent_hash CHAR(64),

    metadata JSONB NOT NULL
      DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ
      NOT NULL
      DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS
  admin_account_audit_user_index
ON admin_account_audit_logs (
  actor_user_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  admin_account_audit_action_index
ON admin_account_audit_logs (
  action,
  created_at DESC
);

COMMIT;