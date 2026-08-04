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
 * Every customer created after this migration
 * receives an administrator-issued temporary
 * password and must replace it after first login.
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

/*
 * Customers who have never logged in still use
 * their administrator-issued temporary password.
 */
UPDATE users
SET must_change_password = TRUE
WHERE
  role = 'customer'
  AND last_login_at IS NULL;

COMMIT;