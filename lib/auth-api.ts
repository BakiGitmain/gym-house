import {
  compressProfileImage,
  MAX_ORIGINAL_IMAGE_BYTES,
} from "@/lib/image-compression";

export type AuthRole =
  | "admin"
  | "customer";

export type LocalizedMessage = {
  en: string;
  am: string;
};

export type AuthUser = {
  id: string;
  username: string;
  name: string;

  profileImageUrl:
    | string
    | null;

  role: AuthRole;
};

export type AccountUser =
  AuthUser & {
    email: string;
    registrationDate: string;
  };

export type CustomerMembership = {
  id: string | null;
  startsAt: string | null;
  expiresAt: string | null;

  status:
    | "active"
    | "inactive"
    | "scheduled"
    | "paused"
    | "cancelled"
    | "expired";

  remainingDays: number | null;
};

export type LoginResponse = {
  success: true;
  message: LocalizedMessage;
  user: AuthUser;

  redirectTo:
    | "/admin/dashboard"
    | "/account";
};

export type CurrentAccountResponse = {
  success: true;
  user: AccountUser;

  membership:
    | CustomerMembership
    | null;

  redirectTo:
    | "/admin/dashboard"
    | "/account";
};

export type LogoutResponse = {
  success: true;
  message: LocalizedMessage;
};

export type UpdateAdminAccountInput = {
  name: string;
  username: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
};

export type UpdateAdminAccountResponse = {
  success: true;
  message: LocalizedMessage;
  user: AccountUser;
  passwordChanged: boolean;
};

export type AdminAvatarResponse = {
  success: true;
  message: LocalizedMessage;
  user: AccountUser;
};

type AdminAvatarSignatureResponse = {
  success: true;
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  signature: string;

  parameters: {
    timestamp: number;
    public_id: string;
    upload_preset: string;
    overwrite: string;
    invalidate: string;
    transformation: string;
  };
};

type ApiErrorResponse = {
  success?: false;
  code?: string;
  message?: LocalizedMessage;
  retryAfterSeconds?: number;
};

type RequestOptions = {
  method?:
    | "GET"
    | "POST"
    | "PATCH"
    | "PUT"
    | "DELETE";

  body?: unknown;
};

const defaultErrorMessage:
  LocalizedMessage = {
    en: "Something went wrong. Please try again.",

    am: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
  };

const networkErrorMessage:
  LocalizedMessage = {
    en: "Unable to connect to the server. Check your connection and try again.",

    am: "ከሰርቨሩ ጋር መገናኘት አልተቻለም። ግንኙነትዎን ያረጋግጡ።",
  };

export class AuthApiError
  extends Error {
  readonly status: number;
  readonly code: string;

  readonly localizedMessage:
    LocalizedMessage;

  readonly retryAfterSeconds?:
    number;

  constructor({
    status,
    code,
    localizedMessage,
    retryAfterSeconds,
  }: {
    status: number;
    code: string;

    localizedMessage:
      LocalizedMessage;

    retryAfterSeconds?: number;
  }) {
    super(localizedMessage.en);

    this.name = "AuthApiError";
    this.status = status;
    this.code = code;

    this.localizedMessage =
      localizedMessage;

    this.retryAfterSeconds =
      retryAfterSeconds;

    Object.setPrototypeOf(
      this,
      AuthApiError.prototype,
    );
  }

  getMessage(
    language: "en" | "am",
  ) {
    return this.localizedMessage[
      language
    ];
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `/backend-api/api${path}`,
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
        networkErrorMessage,
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
        defaultErrorMessage,
    });
  }

  if (!response.ok) {
    const errorPayload =
      payload as ApiErrorResponse;

    throw new AuthApiError({
      status:
        response.status,

      code:
        errorPayload.code ??
        "API_REQUEST_FAILED",

      localizedMessage:
        errorPayload.message ??
        defaultErrorMessage,

      retryAfterSeconds:
        errorPayload
          .retryAfterSeconds,
    });
  }

  return payload as T;
}

export function loginAccount(
  input: {
    username: string;
    password: string;
  },
) {
  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: input,
    },
  );
}

export function getCurrentAccount() {
  return apiRequest<CurrentAccountResponse>(
    "/auth/me",
  );
}

export function logoutAccount() {
  return apiRequest<LogoutResponse>(
    "/auth/logout",
    {
      method: "POST",
    },
  );
}

export function updateAdminAccount(
  input: UpdateAdminAccountInput,
) {
  return apiRequest<UpdateAdminAccountResponse>(
    "/admin/settings/account",
    {
      method: "PATCH",
      body: input,
    },
  );
}

function getAdminAvatarSignature() {
  return apiRequest<AdminAvatarSignatureResponse>(
    "/admin/settings/avatar-signature",
    {
      method: "POST",
    },
  );
}

function confirmAdminAvatar() {
  return apiRequest<AdminAvatarResponse>(
    "/admin/settings/avatar",
    {
      method: "PATCH",
    },
  );
}

const allowedAvatarTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

export async function uploadAdminAvatar(
  file: File,
) {
  if (
    !allowedAvatarTypes.has(
      file.type,
    )
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "INVALID_AVATAR_FILE_TYPE",

      localizedMessage: {
        en: "Choose a JPG, PNG, or WebP image.",

        am: "JPG፣ PNG ወይም WebP ምስል ይምረጡ።",
      },
    });
  }

  if (
    file.size >
    MAX_ORIGINAL_IMAGE_BYTES
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "AVATAR_FILE_TOO_LARGE",

      localizedMessage: {
        en: "The original profile image must be 20 MB or smaller.",

        am: "የመገለጫው የመጀመሪያ ምስል 20 MB ወይም ከዚያ በታች መሆን አለበት።",
      },
    });
  }

  let uploadFile: File;

  try {
    uploadFile =
      await compressProfileImage(
        file,
      );
  } catch {
    throw new AuthApiError({
      status: 400,

      code:
        "AVATAR_COMPRESSION_FAILED",

      localizedMessage: {
        en: "The profile image could not be compressed. Choose another image and try again.",

        am: "የመገለጫውን ምስል መጨመቅ አልተቻለም። ሌላ ምስል ይምረጡና እንደገና ይሞክሩ።",
      },
    });
  }

  const signatureData =
    await getAdminAvatarSignature();

  const formData =
    new FormData();

  formData.append(
    "file",
    uploadFile,
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

  let cloudinaryResponse:
    Response;

  try {
    cloudinaryResponse =
      await fetch(
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
        "CLOUDINARY_NETWORK_ERROR",

      localizedMessage:
        networkErrorMessage,
    });
  }

  let cloudinaryPayload:
    unknown;

  try {
    cloudinaryPayload =
      await cloudinaryResponse.json();
  } catch {
    cloudinaryPayload =
      null;
  }

  if (
    !cloudinaryResponse.ok
  ) {
    throw new AuthApiError({
      status:
        cloudinaryResponse.status,

      code:
        "AVATAR_UPLOAD_FAILED",

      localizedMessage: {
        en: "The profile image upload failed. Check the file and try again.",

        am: "የመገለጫ ምስሉ መጫን አልተሳካም። ምስሉን አረጋግጠው ይሞክሩ።",
      },
    });
  }

  const uploadResult =
    cloudinaryPayload as {
      public_id?: string;
    };

  if (
    uploadResult.public_id !==
    signatureData.parameters
      .public_id
  ) {
    throw new AuthApiError({
      status: 400,

      code:
        "UNEXPECTED_AVATAR_UPLOAD",

      localizedMessage: {
        en: "The uploaded profile image could not be verified.",

        am: "የተጫነው የመገለጫ ምስል ሊረጋገጥ አልቻለም።",
      },
    });
  }

  return confirmAdminAvatar();
}