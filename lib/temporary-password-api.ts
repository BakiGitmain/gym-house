import {
  AuthApiError,
  type LocalizedMessage,
} from "@/lib/auth-api";

export type ChangeTemporaryPasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangeTemporaryPasswordResponse = {
  success: true;

  message:
    LocalizedMessage;

  redirectTo:
    "/account";
};

type ErrorResponse = {
  success?: false;
  code?: string;

  message?:
    LocalizedMessage;
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

export async function changeTemporaryPassword(
  input:
    ChangeTemporaryPasswordInput,
) {
  let response:
    Response;

  try {
    response =
      await fetch(
        "/backend-api/api/auth/change-temporary-password",
        {
          method:
            "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              input,
            ),

          credentials:
            "include",

          cache:
            "no-store",
        },
      );
  } catch {
    throw new AuthApiError({
      status:
        0,

      code:
        "NETWORK_ERROR",

      localizedMessage:
        networkErrorMessage,
    });
  }

  let payload:
    unknown;

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
      payload as
        ErrorResponse;

    throw new AuthApiError({
      status:
        response.status,

      code:
        errorPayload
          .code ??
        "PASSWORD_CHANGE_FAILED",

      localizedMessage:
        errorPayload
          .message ??
        defaultErrorMessage,
    });
  }

  return payload as
    ChangeTemporaryPasswordResponse;
}