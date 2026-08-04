import {
  randomUUID,
} from "node:crypto";

import {
  Router,
  type Response,
} from "express";
import bcrypt from "bcryptjs";
import type {
  PoolClient,
} from "pg";
import { z } from "zod";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { ApiError } from "../lib/api-error.js";
import {
  normalizeUsername,
} from "../lib/auth-crypto.js";
import {
  cloudinary,
  CUSTOMER_AVATAR_PREFIX,
} from "../lib/cloudinary.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.js";
import {
  adminCustomerRateLimit,
} from "../middleware/admin-customer-rate-limit.js";

const router = Router();

router.use(
  requireAuth,
  requireRole("admin"),
);

const allowedPlanMonths = [
  1,
  2,
  3,
  6,
  12,
] as const;

const membershipPlanSchema =
  z
    .number()
    .int()
    .refine(
      (
        value,
      ): value is
        (typeof allowedPlanMonths)[number] =>
        allowedPlanMonths.includes(
          value as
            (typeof allowedPlanMonths)[number],
        ),
      {
        message:
          "Select a valid membership plan.",
      },
    );

const customerStatusSchema =
  z.enum([
    "all",
    "active",
    "expiring",
    "expired",
    "scheduled",
    "paused",
    "cancelled",
    "inactive",
    "disabled",
  ]);

const storedMembershipStatusSchema =
  z.enum([
    "active",
    "paused",
    "cancelled",
  ]);

const customerPasswordSchema =
  z
    .string()
    .min(8)
    .max(128)
    .refine(
      (password) =>
        /[a-z]/.test(password),
      "Include a lowercase letter.",
    )
    .refine(
      (password) =>
        /[A-Z]/.test(password),
      "Include an uppercase letter.",
    )
    .refine(
      (password) =>
        /\d/.test(password),
      "Include a number.",
    );

const avatarPublicIdSchema =
  z
    .string()
    .trim()
    .max(300)
    .optional()
    .default("");

const customerBaseSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(120),

    username: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
      ),

    email: z
      .string()
      .trim()
      .email()
      .max(254),

    profileImagePublicId:
      avatarPublicIdSchema,

    membershipStatus:
      storedMembershipStatusSchema
        .default("active"),
  });

const createCustomerSchema =
  customerBaseSchema.extend({
    password:
      customerPasswordSchema,

    membershipPlanMonths:
      membershipPlanSchema,
  });

const updateCustomerSchema =
  customerBaseSchema.extend({
    isActive:
      z.boolean(),

    newPassword:
      z
        .union([
          z.literal(""),
          customerPasswordSchema,
        ])
        .optional()
        .default(""),

    membershipPlanMonths:
      membershipPlanSchema
        .nullable()
        .optional()
        .default(null),
  });

const listCustomersQuerySchema =
  z.object({
    search: z
      .string()
      .trim()
      .max(120)
      .optional()
      .default(""),

    status:
      customerStatusSchema
        .optional()
        .default("all"),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .optional()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(5)
      .max(50)
      .optional()
      .default(12),
  });

const customerIdSchema =
  z.string().uuid();

type EffectiveCustomerStatus =
  | "active"
  | "expiring"
  | "expired"
  | "scheduled"
  | "paused"
  | "cancelled"
  | "inactive"
  | "disabled";

type CustomerRow = {
  id: string;
  username: string;
  name: string;
  email: string;

  profile_image_url:
    | string
    | null;

  is_active: boolean;
  created_at: Date;

  last_login_at:
    | Date
    | null;

  membership_id:
    | string
    | null;

  membership_starts_at:
    | string
    | null;

  membership_expires_at:
    | string
    | null;

  membership_record_status:
    | "active"
    | "paused"
    | "cancelled"
    | null;

  effective_status:
    EffectiveCustomerStatus;

  remaining_days:
    | number
    | null;

  total_count?: string;
};

type SummaryRow = {
  total_customers: string;
  active_memberships: string;
  expiring_memberships: string;
  disabled_accounts: string;
};

type CustomerIdRow = {
  id: string;
};

type ExistingCustomerRow = {
  id: string;

  profile_image_public_id:
    | string
    | null;
};

type CloudinaryImageResource = {
  public_id?: string;
  secure_url?: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
};

type VerifiedAvatar = {
  publicId: string;
  secureUrl: string;
};

const maximumAvatarSize =
  5 * 1024 * 1024;

const allowedAvatarFormats =
  new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
  ]);

const customerDataSql = `
  SELECT
    users.id,
    users.username,
    users.name,
    users.email,
    users.profile_image_url,
    users.is_active,
    users.created_at,
    users.last_login_at,

    membership.id
      AS membership_id,

    membership.starts_at
      AS membership_starts_at,

    membership.expires_at
      AS membership_expires_at,

    membership.status
      AS membership_record_status,

    CASE
      WHEN users.is_active = FALSE
        THEN 'disabled'

      WHEN membership.id IS NULL
        THEN 'inactive'

      WHEN membership.status =
        'cancelled'
        THEN 'cancelled'

      WHEN membership.status =
        'paused'
        THEN 'paused'

      WHEN CURRENT_DATE <
        membership.starts_at
        THEN 'scheduled'

      WHEN CURRENT_DATE >
        membership.expires_at
        THEN 'expired'

      WHEN membership.expires_at
        <= CURRENT_DATE + 7
        THEN 'expiring'

      ELSE 'active'
    END AS effective_status,

    CASE
      WHEN membership.id IS NULL
        THEN NULL

      ELSE GREATEST(
        membership.expires_at -
        CURRENT_DATE,
        0
      )
    END AS remaining_days

  FROM users

  LEFT JOIN LATERAL (
    SELECT
      id,
      starts_at,
      expires_at,
      status

    FROM customer_memberships

    WHERE user_id = users.id

    ORDER BY
      expires_at DESC,
      created_at DESC

    LIMIT 1
  ) AS membership
    ON TRUE

  WHERE users.role = 'customer'
`;

function isUniqueViolation(
  error: unknown,
) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return false;
  }

  return (
    (
      error as {
        code?: unknown;
      }
    ).code === "23505"
  );
}

function isCloudinaryNotFound(
  error: unknown,
) {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  const cloudinaryError =
    error as {
      http_code?: unknown;
      error?: {
        http_code?: unknown;
      };
    };

  return (
    cloudinaryError.http_code ===
      404 ||
    cloudinaryError.error
      ?.http_code === 404
  );
}

function sendUniqueConflict(
  response: Response,
) {
  return response.status(409).json({
    success: false,

    code:
      "CUSTOMER_USERNAME_OR_EMAIL_TAKEN",

    message: {
      en: "That username or email is already being used.",

      am: "ይህ የተጠቃሚ ስም ወይም ኢሜይል ቀድሞ ተይዟል።",
    },
  });
}

function serializeCustomer(
  row: CustomerRow,
) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,

    profileImageUrl:
      row.profile_image_url,

    isActive:
      row.is_active,

    createdAt:
      row.created_at,

    lastLoginAt:
      row.last_login_at,

    status:
      row.effective_status,

    membership:
      row.membership_id
        ? {
            id:
              row.membership_id,

            startsAt:
              row.membership_starts_at,

            expiresAt:
              row.membership_expires_at,

            recordStatus:
              row.membership_record_status,

            remainingDays:
              row.remaining_days,
          }
        : null,
  };
}

async function getCustomerById(
  client: PoolClient,
  customerId: string,
) {
  const result =
    await client.query<CustomerRow>(
      `
        WITH customer_data AS (
          ${customerDataSql}
        )

        SELECT *
        FROM customer_data

        WHERE id = $1

        LIMIT 1
      `,
      [customerId],
    );

  return result.rows[0];
}

async function verifyCustomerAvatar(
  publicId: string,
): Promise<
  VerifiedAvatar | null
> {
  if (!publicId) {
    return null;
  }

  if (
    !publicId.startsWith(
      CUSTOMER_AVATAR_PREFIX,
    )
  ) {
    throw new ApiError(
      400,
      "INVALID_CUSTOMER_AVATAR",
      {
        en: "The uploaded customer image is invalid.",

        am: "የተጫነው የደንበኛ ምስል ትክክል አይደለም።",
      },
    );
  }

  let resource:
    CloudinaryImageResource;

  try {
    resource =
      (
        await cloudinary.api.resource(
          publicId,
          {
            resource_type:
              "image",

            type: "upload",
          },
        )
      ) as CloudinaryImageResource;
  } catch (error: unknown) {
    if (
      isCloudinaryNotFound(
        error,
      )
    ) {
      throw new ApiError(
        400,
        "CUSTOMER_AVATAR_NOT_FOUND",
        {
          en: "The uploaded customer image could not be verified.",

          am: "የተጫነው የደንበኛ ምስል ሊረጋገጥ አልቻለም።",
        },
      );
    }

    throw error;
  }

  if (
    resource.public_id !==
      publicId ||
    resource.resource_type !==
      "image" ||
    !resource.secure_url
  ) {
    throw new ApiError(
      400,
      "INVALID_CUSTOMER_AVATAR",
      {
        en: "The uploaded customer image is invalid.",

        am: "የተጫነው የደንበኛ ምስል ትክክል አይደለም።",
      },
    );
  }

  if (
    resource.format &&
    !allowedAvatarFormats.has(
      resource.format.toLowerCase(),
    )
  ) {
    throw new ApiError(
      400,
      "INVALID_CUSTOMER_AVATAR_FORMAT",
      {
        en: "Choose a JPG, PNG, or WebP customer image.",

        am: "JPG፣ PNG ወይም WebP የደንበኛ ምስል ይምረጡ።",
      },
    );
  }

  if (
    typeof resource.bytes ===
      "number" &&
    resource.bytes >
      maximumAvatarSize
  ) {
    throw new ApiError(
      400,
      "CUSTOMER_AVATAR_TOO_LARGE",
      {
        en: "The customer image must be 5 MB or smaller.",

        am: "የደንበኛው ምስል 5 MB ወይም ከዚያ በታች መሆን አለበት።",
      },
    );
  }

  return {
    publicId,
    secureUrl:
      resource.secure_url,
  };
}

async function destroyAvatarSafely(
  publicId: string | null,
) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          "image",

        invalidate: true,
      },
    );
  } catch (error: unknown) {
    console.error(
      "Unable to remove old customer avatar:",
      error,
    );
  }
}

router.post(
  "/avatar-signature",
  adminCustomerRateLimit,
  (
    _request,
    response,
  ) => {
    const timestamp =
      Math.floor(
        Date.now() / 1000,
      );

    const publicId =
      `${CUSTOMER_AVATAR_PREFIX}${randomUUID()}`;

    const parameters = {
      timestamp,

      public_id: publicId,

      upload_preset:
        env.CLOUDINARY_CUSTOMER_AVATAR_PRESET,

      transformation:
        "c_fill,g_auto,h_512,w_512,q_auto:good",
    };

    const signature =
      cloudinary.utils
        .api_sign_request(
          parameters,

          env.CLOUDINARY_API_SECRET,
        );

    return response.status(200).json({
      success: true,

      publicId,

      apiKey:
        env.CLOUDINARY_API_KEY,

      uploadUrl:
        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,

      signature,
      parameters,
    });
  },
);

router.get(
  "/",
  async (
    request,
    response,
    next,
  ) => {
    try {
      const parsedQuery =
        listCustomersQuerySchema
          .safeParse(
            request.query,
          );

      if (!parsedQuery.success) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CUSTOMER_QUERY",

            message: {
              en: "The customer search options are invalid.",

              am: "የደንበኛ ፍለጋ አማራጮቹ ትክክል አይደሉም።",
            },
          });
      }

      const {
        search,
        status,
        page,
        limit,
      } = parsedQuery.data;

      const offset =
        (page - 1) * limit;

      const customerResult =
        await pool.query<CustomerRow>(
          `
            WITH customer_data AS (
              ${customerDataSql}
            )

            SELECT
              customer_data.*,

              COUNT(*) OVER()
                AS total_count

            FROM customer_data

            WHERE
              (
                $1::TEXT = ''

                OR name ILIKE
                  '%' || $1 || '%'

                OR username ILIKE
                  '%' || $1 || '%'

                OR email ILIKE
                  '%' || $1 || '%'
              )

              AND (
                $2::TEXT = 'all'

                OR effective_status =
                  $2::TEXT
              )

            ORDER BY
              created_at DESC

            LIMIT $3
            OFFSET $4
          `,
          [
            search,
            status,
            limit,
            offset,
          ],
        );

      const summaryResult =
        await pool.query<SummaryRow>(
          `
            WITH customer_data AS (
              ${customerDataSql}
            )

            SELECT
              COUNT(*)::BIGINT
                AS total_customers,

              COUNT(*) FILTER (
                WHERE
                  effective_status =
                    'active'
              )::BIGINT
                AS active_memberships,

              COUNT(*) FILTER (
                WHERE
                  effective_status =
                    'expiring'
              )::BIGINT
                AS expiring_memberships,

              COUNT(*) FILTER (
                WHERE
                  effective_status =
                    'disabled'
              )::BIGINT
                AS disabled_accounts

            FROM customer_data
          `,
        );

      const summary =
        summaryResult.rows[0];

      const total =
        Number(
          customerResult.rows[0]
            ?.total_count ?? 0,
        );

      return response
        .status(200)
        .json({
          success: true,

          customers:
            customerResult.rows.map(
              serializeCustomer,
            ),

          summary: {
            totalCustomers:
              Number(
                summary
                  ?.total_customers ??
                  0,
              ),

            activeMemberships:
              Number(
                summary
                  ?.active_memberships ??
                  0,
              ),

            expiringMemberships:
              Number(
                summary
                  ?.expiring_memberships ??
                  0,
              ),

            disabledAccounts:
              Number(
                summary
                  ?.disabled_accounts ??
                  0,
              ),
          },

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.max(
                1,

                Math.ceil(
                  total / limit,
                ),
              ),
          },
        });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/",
  adminCustomerRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    let uploadedAvatar:
      VerifiedAvatar | null = null;

    try {
      const parsedCustomer =
        createCustomerSchema
          .safeParse(
            request.body,
          );

      if (!parsedCustomer.success) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CUSTOMER_DATA",

            message: {
              en: "Check the customer information, password, and membership plan.",

              am: "የደንበኛውን መረጃ፣ የይለፍ ቃልና የአባልነት እቅድ ያረጋግጡ።",
            },

            errors:
              parsedCustomer.error
                .flatten()
                .fieldErrors,
          });
      }

      const data =
        parsedCustomer.data;

      uploadedAvatar =
        await verifyCustomerAvatar(
          data.profileImagePublicId,
        );

      const passwordHash =
        await bcrypt.hash(
          data.password,
          12,
        );

      const client =
        await pool.connect();

      try {
        await client.query(
          "BEGIN",
        );

        const userResult =
          await client
            .query<CustomerIdRow>(
              `
                INSERT INTO users (
                  username,
                  name,
                  email,
                  password_hash,
                  profile_image_url,
                  profile_image_public_id,
                  role,
                  is_active
                )

                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  'customer',
                  TRUE
                )

                RETURNING id
              `,
              [
                normalizeUsername(
                  data.username,
                ),

                data.name.trim(),

                data.email
                  .trim()
                  .toLowerCase(),

                passwordHash,

                uploadedAvatar
                  ?.secureUrl ??
                  null,

                uploadedAvatar
                  ?.publicId ??
                  null,
              ],
            );

        const customerId =
          userResult.rows[0]?.id;

        if (!customerId) {
          throw new Error(
            "Customer creation failed.",
          );
        }

        await client.query(
          `
            INSERT INTO
              customer_memberships (
                user_id,
                starts_at,
                expires_at,
                status
              )

            VALUES (
              $1,
              CURRENT_DATE,

              (
                CURRENT_DATE +
                make_interval(
                  months =>
                    $2::INTEGER
                )
              )::DATE,

              $3
            )
          `,
          [
            customerId,
            data.membershipPlanMonths,
            data.membershipStatus,
          ],
        );

        const customer =
          await getCustomerById(
            client,
            customerId,
          );

        if (!customer) {
          throw new Error(
            "Created customer could not be loaded.",
          );
        }

        await client.query(
          "COMMIT",
        );

        return response
          .status(201)
          .json({
            success: true,

            message: {
              en: "The customer account was created successfully.",

              am: "የደንበኛው መለያ በተሳካ ሁኔታ ተፈጥሯል።",
            },

            customer:
              serializeCustomer(
                customer,
              ),
          });
      } catch (error) {
        await client.query(
          "ROLLBACK",
        );

        await destroyAvatarSafely(
          uploadedAvatar
            ?.publicId ??
            null,
        );

        if (
          isUniqueViolation(
            error,
          )
        ) {
          return sendUniqueConflict(
            response,
          );
        }

        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      return next(error);
    }
  },
);

router.patch(
  "/:customerId",
  adminCustomerRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    let newAvatar:
      VerifiedAvatar | null = null;

    try {
      const parsedCustomerId =
        customerIdSchema.safeParse(
          request.params.customerId,
        );

      if (
        !parsedCustomerId.success
      ) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CUSTOMER_ID",

            message: {
              en: "The customer ID is invalid.",

              am: "የደንበኛው መለያ ቁጥር ትክክል አይደለም።",
            },
          });
      }

      const parsedCustomer =
        updateCustomerSchema
          .safeParse(
            request.body,
          );

      if (!parsedCustomer.success) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CUSTOMER_DATA",

            message: {
              en: "Check the customer information and membership plan.",

              am: "የደንበኛውን መረጃና የአባልነት እቅድ ያረጋግጡ።",
            },

            errors:
              parsedCustomer.error
                .flatten()
                .fieldErrors,
          });
      }

      const customerId =
        parsedCustomerId.data;

      const data =
        parsedCustomer.data;

      if (
        data.profileImagePublicId
      ) {
        newAvatar =
          await verifyCustomerAvatar(
            data.profileImagePublicId,
          );
      }

      const newPasswordHash =
        data.newPassword
          ? await bcrypt.hash(
              data.newPassword,
              12,
            )
          : null;

      const client =
        await pool.connect();

      let previousAvatarPublicId:
        string | null = null;

      try {
        await client.query(
          "BEGIN",
        );

        const existingResult =
          await client
            .query<ExistingCustomerRow>(
              `
                SELECT
                  id,
                  profile_image_public_id

                FROM users

                WHERE
                  id = $1
                  AND role =
                    'customer'

                LIMIT 1

                FOR UPDATE
              `,
              [customerId],
            );

        const existingCustomer =
          existingResult.rows[0];

        if (!existingCustomer) {
          await client.query(
            "ROLLBACK",
          );

          await destroyAvatarSafely(
            newAvatar?.publicId ??
              null,
          );

          return response
            .status(404)
            .json({
              success: false,

              code:
                "CUSTOMER_NOT_FOUND",

              message: {
                en: "The customer could not be found.",

                am: "ደንበኛው አልተገኘም።",
              },
            });
        }

        previousAvatarPublicId =
          existingCustomer
            .profile_image_public_id;

        await client.query(
          `
            UPDATE users

            SET
              name = $2,
              username = $3,
              email = $4,

              profile_image_url =
                CASE
                  WHEN
                    $5::TEXT IS NULL
                  THEN
                    profile_image_url

                  ELSE $5::TEXT
                END,

              profile_image_public_id =
                CASE
                  WHEN
                    $6::TEXT IS NULL
                  THEN
                    profile_image_public_id

                  ELSE $6::TEXT
                END,

              is_active = $7,

              password_hash =
                CASE
                  WHEN
                    $8::TEXT IS NULL
                  THEN password_hash

                  ELSE $8::TEXT
                END,

              failed_login_attempts = 0,
              locked_until = NULL

            WHERE
              id = $1
              AND role =
                'customer'
          `,
          [
            customerId,

            data.name.trim(),

            normalizeUsername(
              data.username,
            ),

            data.email
              .trim()
              .toLowerCase(),

            newAvatar
              ?.secureUrl ??
              null,

            newAvatar
              ?.publicId ??
              null,

            data.isActive,

            newPasswordHash,
          ],
        );

        const membershipResult =
          await client
            .query<CustomerIdRow>(
              `
                SELECT id

                FROM
                  customer_memberships

                WHERE user_id = $1

                ORDER BY
                  expires_at DESC,
                  created_at DESC

                LIMIT 1

                FOR UPDATE
              `,
              [customerId],
            );

        const membershipId =
          membershipResult.rows[0]
            ?.id;

        if (
          membershipId &&
          data.membershipPlanMonths !==
            null
        ) {
          await client.query(
            `
              UPDATE
                customer_memberships

              SET
                starts_at =
                  CURRENT_DATE,

                expires_at =
                  (
                    CURRENT_DATE +
                    make_interval(
                      months =>
                        $2::INTEGER
                    )
                  )::DATE,

                status = $3

              WHERE id = $1
            `,
            [
              membershipId,

              data.membershipPlanMonths,

              data.membershipStatus,
            ],
          );
        } else if (
          membershipId
        ) {
          await client.query(
            `
              UPDATE
                customer_memberships

              SET status = $2

              WHERE id = $1
            `,
            [
              membershipId,
              data.membershipStatus,
            ],
          );
        } else if (
          data.membershipPlanMonths !==
          null
        ) {
          await client.query(
            `
              INSERT INTO
                customer_memberships (
                  user_id,
                  starts_at,
                  expires_at,
                  status
                )

              VALUES (
                $1,
                CURRENT_DATE,

                (
                  CURRENT_DATE +
                  make_interval(
                    months =>
                      $2::INTEGER
                  )
                )::DATE,

                $3
              )
            `,
            [
              customerId,

              data.membershipPlanMonths,

              data.membershipStatus,
            ],
          );
        } else {
          await client.query(
            "ROLLBACK",
          );

          await destroyAvatarSafely(
            newAvatar?.publicId ??
              null,
          );

          return response
            .status(400)
            .json({
              success: false,

              code:
                "MEMBERSHIP_PLAN_REQUIRED",

              message: {
                en: "Select a membership plan for this customer.",

                am: "ለዚህ ደንበኛ የአባልነት እቅድ ይምረጡ።",
              },
            });
        }

        if (
          !data.isActive ||
          newPasswordHash
        ) {
          await client.query(
            `
              DELETE FROM
                auth_sessions

              WHERE user_id = $1
            `,
            [customerId],
          );
        }

        const customer =
          await getCustomerById(
            client,
            customerId,
          );

        if (!customer) {
          throw new Error(
            "Updated customer could not be loaded.",
          );
        }

        await client.query(
          "COMMIT",
        );

        if (
          newAvatar &&
          previousAvatarPublicId &&
          previousAvatarPublicId !==
            newAvatar.publicId
        ) {
          await destroyAvatarSafely(
            previousAvatarPublicId,
          );
        }

        return response
          .status(200)
          .json({
            success: true,

            message: {
              en: "The customer account was updated successfully.",

              am: "የደንበኛው መለያ በተሳካ ሁኔታ ተሻሽሏል።",
            },

            customer:
              serializeCustomer(
                customer,
              ),
          });
      } catch (error) {
        await client.query(
          "ROLLBACK",
        );

        await destroyAvatarSafely(
          newAvatar?.publicId ??
            null,
        );

        if (
          isUniqueViolation(
            error,
          )
        ) {
          return sendUniqueConflict(
            response,
          );
        }

        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      return next(error);
    }
  },
);
router.delete(
  "/:customerId",
  adminCustomerRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const parsedCustomerId =
        customerIdSchema.safeParse(
          request.params.customerId,
        );

      if (
        !parsedCustomerId.success
      ) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CUSTOMER_ID",

            message: {
              en: "The customer ID is invalid.",
              am: "የደንበኛው መለያ ቁጥር ትክክል አይደለም።",
            },
          });
      }

      const customerId =
        parsedCustomerId.data;

      const client =
        await pool.connect();

      let avatarPublicId:
        string | null = null;

      try {
        await client.query(
          "BEGIN",
        );

        const existingResult =
          await client.query<ExistingCustomerRow>(
            `
              SELECT
                id,
                profile_image_public_id

              FROM users

              WHERE
                id = $1
                AND role = 'customer'

              LIMIT 1

              FOR UPDATE
            `,
            [customerId],
          );

        const existingCustomer =
          existingResult.rows[0];

        if (!existingCustomer) {
          await client.query(
            "ROLLBACK",
          );

          return response
            .status(404)
            .json({
              success: false,

              code:
                "CUSTOMER_NOT_FOUND",

              message: {
                en: "The customer could not be found.",
                am: "ደንበኛው አልተገኘም።",
              },
            });
        }

        avatarPublicId =
          existingCustomer
            .profile_image_public_id;

        await client.query(
          `
            DELETE FROM
              auth_sessions

            WHERE user_id = $1
          `,
          [customerId],
        );

        await client.query(
          `
            DELETE FROM
              customer_memberships

            WHERE user_id = $1
          `,
          [customerId],
        );

        const deleteResult =
          await client.query<CustomerIdRow>(
            `
              DELETE FROM users

              WHERE
                id = $1
                AND role = 'customer'

              RETURNING id
            `,
            [customerId],
          );

        if (
          !deleteResult.rows[0]
        ) {
          throw new Error(
            "Customer deletion failed.",
          );
        }

        await client.query(
          "COMMIT",
        );
      } catch (error) {
        await client.query(
          "ROLLBACK",
        );

        throw error;
      } finally {
        client.release();
      }

      await destroyAvatarSafely(
        avatarPublicId,
      );

      return response
        .status(200)
        .json({
          success: true,

          message: {
            en: "The customer account was deleted successfully.",
            am: "የደንበኛው መለያ በተሳካ ሁኔታ ተሰርዟል።",
          },
        });
    } catch (error) {
      return next(error);
    }
  },
);
export default router;