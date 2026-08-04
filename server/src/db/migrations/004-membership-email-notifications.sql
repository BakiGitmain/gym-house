BEGIN;

CREATE TABLE IF NOT EXISTS
  membership_email_notifications (
    id UUID PRIMARY KEY
      DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
      REFERENCES users(id)
      ON DELETE CASCADE,

    membership_id UUID
      REFERENCES customer_memberships(id)
      ON DELETE SET NULL,

    notification_type VARCHAR(50)
      NOT NULL
      CHECK (
        notification_type IN (
          'welcome',
          'membership_renewed',
          'expiry_warning_3_days',
          'membership_expired'
        )
      ),

    /*
     * A unique key prevents duplicate emails.
     *
     * Examples:
     * welcome:<membership-id>
     * renewal:<membership-id>:<expiration-date>
     * warning-3:<membership-id>:<expiration-date>
     * expired:<membership-id>:<expiration-date>
     */
    notification_key TEXT
      NOT NULL
      UNIQUE,

    recipient_email CITEXT
      NOT NULL,

    status VARCHAR(20)
      NOT NULL
      DEFAULT 'pending'
      CHECK (
        status IN (
          'pending',
          'sending',
          'sent',
          'failed'
        )
      ),

    attempt_count INTEGER
      NOT NULL
      DEFAULT 0
      CHECK (attempt_count >= 0),

    provider_message_id TEXT,

    last_error TEXT,

    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
      NOT NULL
      DEFAULT NOW(),

    updated_at TIMESTAMPTZ
      NOT NULL
      DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS
  membership_email_notifications_user_index
ON membership_email_notifications (
  user_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  membership_email_notifications_membership_index
ON membership_email_notifications (
  membership_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  membership_email_notifications_status_index
ON membership_email_notifications (
  status,
  created_at
);

DROP TRIGGER IF EXISTS
  membership_email_notifications_set_updated_at
ON membership_email_notifications;

CREATE TRIGGER
  membership_email_notifications_set_updated_at
BEFORE UPDATE
ON membership_email_notifications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;