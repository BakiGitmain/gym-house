import {
  v2 as cloudinary,
} from "cloudinary";

import { env } from "../config/env.js";

cloudinary.config({
  cloud_name:
    env.CLOUDINARY_CLOUD_NAME,

  api_key:
    env.CLOUDINARY_API_KEY,

  api_secret:
    env.CLOUDINARY_API_SECRET,

  secure: true,
});

/*
 * The administrator always uses one stable
 * public ID. Uploading a new picture with
 * overwrite enabled replaces the old image.
 */
export function getAdminAvatarPublicId(
  userId: string,
) {
  return (
    "gym-house/admin-profiles/" +
    `admin-${userId}`
  );
}

/*
 * Each customer upload receives a generated
 * UUID after this prefix.
 *
 * Example:
 * gym-house/customer-profiles/customer-uuid
 */
export const CUSTOMER_AVATAR_PREFIX =
  "gym-house/customer-profiles/customer-";

export { cloudinary };