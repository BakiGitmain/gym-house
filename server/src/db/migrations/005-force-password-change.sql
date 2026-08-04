BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS
  must_change_password BOOLEAN;

UPDATE users
SET must_change_password = FALSE
WHERE must_change_password IS NULL;

ALTER TABLE users
ALTER COLUMN must_change_password
SET DEFAULT FALSE;

ALTER TABLE users
ALTER COLUMN must_change_password
SET NOT NULL;

/*
 * Every newly created customer starts
 * with a temporary password.
 *
 * Administrators and existing accounts
 * are not forced through this flow.
 */
CREATE OR REPLACE FUNCTION
  set_new_customer_password_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'customer' THEN
    NEW.must_change_password := TRUE;
  ELSE
    NEW.must_change_password := FALSE;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
  users_set_new_customer_password_change
ON users;

CREATE TRIGGER
  users_set_new_customer_password_change
BEFORE INSERT
ON users
FOR EACH ROW
EXECUTE FUNCTION
  set_new_customer_password_change();

CREATE INDEX IF NOT EXISTS
  users_must_change_password_index
ON users (
  must_change_password
)
WHERE must_change_password = TRUE;

COMMIT;