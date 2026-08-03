import {
  AuthApiError,
  type LocalizedMessage,
} from "@/lib/auth-api";

export type CustomerStatus =
  | "active"
  | "expiring"
  | "expired"
  | "scheduled"
  | "paused"
  | "cancelled"
  | "inactive"
  | "disabled";

export type CustomerStatusFilter =
  | "all"
  | CustomerStatus;

export type MembershipRecordStatus =
  | "active"
  | "paused"
  | "cancelled";

export type MembershipPlanMonths =
  | 1
  | 2
  | 3
  | 6
  | 12;

export type AdminCustomer = {
  id: string;
  username: string;
  name: string;
  email: string;

  profileImageUrl:
    | string
    | null;

  isActive: boolean;
  createdAt: string;

  lastLoginAt:
    | string
    | null;

  status: CustomerStatus;

  membership: {
    id: string;
    startsAt: string;
    expiresAt: string;

    recordStatus:
      MembershipRecordStatus;

    remainingDays: number;
  } | null;
};

export type CustomerSummary = {
  totalCustomers: number;
  activeMemberships: number;
  expiringMemberships: number;
  disabledAccounts: number;
};

export type CustomerPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateCustomerInput = {
  name: string;
  username: string;
  email: string;
  password: string;

  profileImagePublicId?:
    string;

  membershipPlanMonths:
    MembershipPlanMonths;

  membershipStatus:
    MembershipRecordStatus;
};

export type UpdateCustomerInput = {
  name: string;
  username: string;
  email: string;

  profileImagePublicId?:
    string;

  isActive: boolean;

  membershipPlanMonths:
    | MembershipPlanMonths
    | null;

  membershipStatus:
    MembershipRecordStatus;

  newPassword?: string;
};

export type AdminCustomersResponse = {
  success: true;

  customers:
    AdminCustomer[];

  summary:
    CustomerSummary;

  pagination:
    CustomerPagination;
};

type CustomerMutationResponse = {
  success: true;
  message: LocalizedMessage;
  customer: AdminCustomer;
};

type CustomerAvatarSignatureResponse = {
  success: true;
  publicId: string;
  apiKey: string;
  uploadUrl: string;
  signature: string;

  parameters: {
    timestamp: number;
    public_id: string;
    upload_preset: string;
    transformation: string;
  };
};

type ApiErrorResponse = {
  success?: false;
  code?: string;
  message?: LocalizedMessage;
  retryAfterSeconds?: number;
};

const defaultMessage:
  LocalizedMessage = {
    en: "Something went wrong. Please try again.",

    am: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
  };

const networkMessage:
  LocalizedMessage = {
    en: "Unable to connect to the server.",

    am: "ከሰርቨሩ ጋር መገናኘት አልተቻለም።",
  };

async function adminRequest<T>(
  path: string,
  options: {
    method?:
      | "GET"
      | "POST"
      | "PATCH";

    body?: unknown;
  } = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `/backend-api/api/admin/customers${path}`,
      {
        method:
          options.method ??
          "GET",

        headers:
          options.body ===
          undefined
            ? {
                Accept:
                  "application/json",
              }
            : {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

        body:
          options.body ===
          undefined
            ? undefined
            : JSON.stringify(
                options.body,
              ),

        credentials: "include",
        cache: "no-store",
      },
    );
  } catch {
    throw new AuthApiError({
      status: 0,
      code: "NETWORK_ERROR",

      localizedMessage:
        networkMessage,
    });
  }

  let payload: unknown;

  try {
    payload =
      await response.json();
  } catch {
    throw new AuthApiError({
      status:
        response.status,

      code:
        "INVALID_SERVER_RESPONSE",

      localizedMessage:
        defaultMessage,
    });
  }

  if (!response.ok) {
    const error =
      payload as ApiErrorResponse;

    throw new AuthApiError({
      status:
        response.status,

      code:
        error.code ??
        "CUSTOMER_REQUEST_FAILED",

      localizedMessage:
        error.message ??
        defaultMessage,

      retryAfterSeconds:
        error.retryAfterSeconds,
    });
  }

  return payload as T;
}

export function getAdminCustomers({
  search = "",
  status = "all",
  page = 1,
  limit = 12,
}: {
  search?: string;
  status?: CustomerStatusFilter;
  page?: number;
  limit?: number;
}) {
  const query =
    new URLSearchParams({
      search,
      status,
      page: String(page),
      limit: String(limit),
    });

  return adminRequest<AdminCustomersResponse>(
    `/?${query.toString()}`,
  );
}

export function createAdminCustomer(
  input: CreateCustomerInput,
) {
  return adminRequest<CustomerMutationResponse>(
    "/",
    {
      method: "POST",
      body: input,
    },
  );
}

export function updateAdminCustomer(
  customerId: string,
  input: UpdateCustomerInput,
) {
  return adminRequest<CustomerMutationResponse>(
    `/${customerId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

const allowedImageTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const maximumImageSize =
  5 * 1024 * 1024;

export async function uploadCustomerAvatar(
  file: File,
) {
  if (
    !allowedImageTypes.has(
      file.type,
    )
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "INVALID_CUSTOMER_IMAGE_TYPE",

      localizedMessage: {
        en: "Choose a JPG, PNG, or WebP image.",

        am: "JPG፣ PNG ወይም WebP ምስል ይምረጡ።",
      },
    });
  }

  if (
    file.size >
    maximumImageSize
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "CUSTOMER_IMAGE_TOO_LARGE",

      localizedMessage: {
        en: "The customer image must be 5 MB or smaller.",

        am: "የደንበኛው ምስል 5 MB ወይም ከዚያ በታች መሆን አለበት።",
      },
    });
  }

  const signatureData =
    await adminRequest<CustomerAvatarSignatureResponse>(
      "/avatar-signature",
      {
        method: "POST",
      },
    );

  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  formData.append(
    "api_key",
    signatureData.apiKey,
  );

  formData.append(
    "signature",
    signatureData.signature,
  );

  Object.entries(
    signatureData.parameters,
  ).forEach(
    ([key, value]) => {
      formData.append(
        key,
        String(value),
      );
    },
  );

  let response: Response;

  try {
    response = await fetch(
      signatureData.uploadUrl,
      {
        method: "POST",
        body: formData,
      },
    );
  } catch {
    throw new AuthApiError({
      status: 0,

      code:
        "CUSTOMER_IMAGE_NETWORK_ERROR",

      localizedMessage:
        networkMessage,
    });
  }

  let payload: unknown;

  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new AuthApiError({
      status:
        response.status,

      code:
        "CUSTOMER_IMAGE_UPLOAD_FAILED",

      localizedMessage: {
        en: "The customer image upload failed. Check the image and try again.",

        am: "የደንበኛው ምስል መጫን አልተሳካም። ምስሉን አረጋግጠው ይሞክሩ።",
      },
    });
  }

  const uploadResult =
    payload as {
      public_id?: string;
    };

  if (
    uploadResult.public_id !==
    signatureData.publicId
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "UNEXPECTED_CUSTOMER_IMAGE",

      localizedMessage: {
        en: "The uploaded customer image could not be verified.",

        am: "የተጫነው የደንበኛ ምስል ሊረጋገጥ አልቻለም።",
      },
    });
  }

  return {
    publicId:
      signatureData.publicId,
  };
}