BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS
  profile_image_public_id TEXT;

COMMIT;