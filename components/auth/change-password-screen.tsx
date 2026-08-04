"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useAuth,
} from "@/components/providers/auth-provider";
import {
  useLanguage,
} from "@/components/providers/language-provider";
import {
  AuthApiError,
  getCurrentAccount,
} from "@/lib/auth-api";
import {
  changeTemporaryPassword,
} from "@/lib/temporary-password-api";

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const copy = {
  en: {
    backHome:
      "Back to website",

    eyebrow:
      "First login security",

    title:
      "Create your private password",

    description:
      "Your administrator gave you a temporary password. Replace it with a private password before opening your membership account.",

    currentLabel:
      "Temporary password",

    currentPlaceholder:
      "Enter the password from your email",

    newLabel:
      "New private password",

    newPlaceholder:
      "Create a new password",

    confirmLabel:
      "Confirm new password",

    confirmPlaceholder:
      "Enter the new password again",

    save:
      "Save password and continue",

    saving:
      "Saving your password...",

    logout:
      "Log out",

    checking:
      "Checking your account...",

    currentRequired:
      "Enter the temporary password from your email.",

    newRequired:
      "Enter a new password.",

    passwordLength:
      "Use at least 8 characters.",

    lowercase:
      "Include at least one lowercase letter.",

    uppercase:
      "Include at least one uppercase letter.",

    number:
      "Include at least one number.",

    samePassword:
      "The new password must be different from the temporary password.",

    confirmRequired:
      "Enter the new password again.",

    mismatch:
      "The new passwords do not match.",

    show:
      "Show",

    hide:
      "Hide",

    unknownError:
      "Something went wrong. Please try again.",

    requirements:
      "Use at least 8 characters with an uppercase letter, lowercase letter, and number.",

    temporaryNotice:
      "After this change, the temporary password from your email will stop working.",
  },

  am: {
    backHome:
      "ወደ ድረ ገጹ",

    eyebrow:
      "የመጀመሪያ መግቢያ ደህንነት",

    title:
      "የግል የይለፍ ቃል ይፍጠሩ",

    description:
      "በአስተዳዳሪው የተሰጠዎትን ጊዜያዊ የይለፍ ቃል ወደ ግል የይለፍ ቃል ይቀይሩ።",

    currentLabel:
      "ጊዜያዊ የይለፍ ቃል",

    currentPlaceholder:
      "በኢሜይል የተላከውን ያስገቡ",

    newLabel:
      "አዲስ የግል የይለፍ ቃል",

    newPlaceholder:
      "አዲስ የይለፍ ቃል ይፍጠሩ",

    confirmLabel:
      "አዲሱን የይለፍ ቃል ያረጋግጡ",

    confirmPlaceholder:
      "አዲሱን ደግመው ያስገቡ",

    save:
      "የይለፍ ቃሉን አስቀምጥና ቀጥል",

    saving:
      "የይለፍ ቃሉን በማስቀመጥ ላይ...",

    logout:
      "ውጣ",

    checking:
      "መለያዎን በማረጋገጥ ላይ...",

    currentRequired:
      "በኢሜይል የተላከውን ጊዜያዊ የይለፍ ቃል ያስገቡ።",

    newRequired:
      "አዲስ የይለፍ ቃል ያስገቡ።",

    passwordLength:
      "ቢያንስ 8 ቁምፊዎችን ይጠቀሙ።",

    lowercase:
      "ቢያንስ አንድ ትንሽ ፊደል ያካትቱ።",

    uppercase:
      "ቢያንስ አንድ ትልቅ ፊደል ያካትቱ።",

    number:
      "ቢያንስ አንድ ቁጥር ያካትቱ።",

    samePassword:
      "አዲሱ ከጊዜያዊው የተለየ መሆን አለበት።",

    confirmRequired:
      "አዲሱን የይለፍ ቃል ደግመው ያስገቡ።",

    mismatch:
      "ሁለቱ የይለፍ ቃሎች አይመሳሰሉም።",

    show:
      "አሳይ",

    hide:
      "ደብቅ",

    unknownError:
      "ችግር ተፈጥሯል። እንደገና ይሞክሩ።",

    requirements:
      "ቢያንስ 8 ቁምፊዎች፣ ትልቅ ፊደል፣ ትንሽ ፊደልና ቁጥር ይጠቀሙ።",

    temporaryNotice:
      "ከዚህ ለውጥ በኋላ በኢሜይል የተላከው ጊዜያዊ የይለፍ ቃል አይሰራም።",
  },
} as const;

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  visible: boolean;
  disabled: boolean;
  showLabel: string;
  hideLabel: string;

  onChange:
    (
      value: string,
    ) => void;

  onToggle:
    () => void;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  error,
  visible,
  disabled,
  showLabel,
  hideLabel,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-white/45"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={
            id ===
            "current-password"
              ? "current-password"
              : "new-password"
          }
          aria-invalid={
            Boolean(error)
          }
          aria-describedby={
            error
              ? `${id}-error`
              : undefined
          }
          onChange={(
            event,
          ) => {
            onChange(
              event.target.value,
            );
          }}
          className={`
            h-14
            w-full
            rounded-[18px]
            border
            bg-white/[0.035]
            px-4
            pr-24
            text-[13px]
            text-white
            outline-none
            transition
            placeholder:text-white/20
            disabled:cursor-not-allowed
            disabled:opacity-60

            ${
              error
                ? "border-red-400/60 focus:border-red-400"
                : "border-white/[0.09] focus:border-[#b7ef00]/60 focus:bg-white/[0.055]"
            }
          `}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
        >
          {visible
            ? hideLabel
            : showLabel}
        </button>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-[11px] text-red-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ChangePasswordScreen() {
  const router =
    useRouter();

  const {
    refreshAuth,
    logout,
  } =
    useAuth();

  const {
    language,
    setLanguage,
  } =
    useLanguage();

  const currentLanguage =
    language === "am"
      ? "am"
      : "en";

  const text =
    copy[currentLanguage];

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showCurrent,
    setShowCurrent,
  ] =
    useState(false);

  const [
    showNew,
    setShowNew,
  ] =
    useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] =
    useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    formMessage,
    setFormMessage,
  ] =
    useState("");

  const [
    isChecking,
    setIsChecking,
  ] =
    useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    getCurrentAccount()
      .then(
        (
          account,
        ) => {
          if (cancelled) {
            return;
          }

          if (
            account.user.role ===
            "admin"
          ) {
            router.replace(
              "/admin/dashboard",
            );

            return;
          }

          if (
            !account
              .mustChangePassword
          ) {
            router.replace(
              "/account",
            );

            return;
          }

          setIsChecking(
            false,
          );
        },
      )
      .catch(
        (
          error:
            unknown,
        ) => {
          if (cancelled) {
            return;
          }

          if (
            error instanceof
              AuthApiError &&
            error.status === 401
          ) {
            router.replace(
              "/login",
            );

            return;
          }

          setFormMessage(
            text.unknownError,
          );

          setIsChecking(
            false,
          );
        },
      );

    return () => {
      cancelled =
        true;
    };
  }, [
    router,
    text.unknownError,
  ]);

  function validate() {
    const nextErrors:
      FormErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword =
        text.currentRequired;
    }

    if (!newPassword) {
      nextErrors.newPassword =
        text.newRequired;
    } else if (
      newPassword.length < 8
    ) {
      nextErrors.newPassword =
        text.passwordLength;
    } else if (
      !/[a-z]/.test(
        newPassword,
      )
    ) {
      nextErrors.newPassword =
        text.lowercase;
    } else if (
      !/[A-Z]/.test(
        newPassword,
      )
    ) {
      nextErrors.newPassword =
        text.uppercase;
    } else if (
      !/\d/.test(
        newPassword,
      )
    ) {
      nextErrors.newPassword =
        text.number;
    } else if (
      newPassword ===
      currentPassword
    ) {
      nextErrors.newPassword =
        text.samePassword;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        text.confirmRequired;
    } else if (
      newPassword !==
      confirmPassword
    ) {
      nextErrors.confirmPassword =
        text.mismatch;
    }

    setErrors(
      nextErrors,
    );

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting ||
      isChecking
    ) {
      return;
    }

    setFormMessage("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(
      true,
    );

    try {
      const result =
        await changeTemporaryPassword(
          {
            currentPassword,
            newPassword,
            confirmPassword,
          },
        );

      await refreshAuth();

      router.replace(
        result.redirectTo,
      );

      router.refresh();
    } catch (
      error: unknown
    ) {
      if (
        error instanceof
          AuthApiError
      ) {
        if (
          error.status === 401 &&
          error.code ===
            "AUTH_REQUIRED"
        ) {
          router.replace(
            "/login",
          );

          return;
        }

        if (
          error.code ===
          "PASSWORD_CHANGE_NOT_REQUIRED"
        ) {
          await refreshAuth();

          router.replace(
            "/account",
          );

          return;
        }

        setFormMessage(
          error.getMessage(
            currentLanguage,
          ),
        );

        return;
      }

      setFormMessage(
        text.unknownError,
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  async function handleLogout() {
    await logout();

    router.replace(
      "/login",
    );

    router.refresh();
  }

  if (isChecking) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#050605] text-white">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-[#b7ef00]" />

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
            {text.checking}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#050605] px-5 py-6 text-white sm:px-8 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",

          backgroundSize:
            "72px 72px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#b7ef00]/10 blur-[170px]"
      />

      <header className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/50 transition hover:border-[#b7ef00]/30 hover:text-[#b7ef00]"
        >
          ← {text.backHome}
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-white/[0.035] p-1">
            <button
              type="button"
              onClick={() => {
                setLanguage(
                  "en",
                );
              }}
              className={`rounded-full px-3 py-2 text-[9px] font-black ${
                currentLanguage === "en"
                  ? "bg-[#b7ef00] text-black"
                  : "text-white/40"
              }`}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage(
                  "am",
                );
              }}
              className={`rounded-full px-3 py-2 text-[9px] font-black ${
                currentLanguage === "am"
                  ? "bg-[#b7ef00] text-black"
                  : "text-white/40"
              }`}
            >
              አማ
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:text-white"
          >
            {text.logout}
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-100px)] max-w-[1100px] items-center py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b7ef00]">
              {text.eyebrow}
            </p>

            <h1 className="mt-5 text-[clamp(3rem,7vw,6.5rem)] font-black leading-[0.88] tracking-[-0.07em]">
              Secure your
              <span className="block text-[#b7ef00]">
                progress.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[13px] leading-7 text-white/40">
              {text.temporaryNotice}
            </p>
          </div>

          <div className="rounded-[30px] border border-white/[0.09] bg-[#0a0c09]/95 p-5 shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b7ef00]">
              GYM House
            </p>

            <h2 className="mt-4 text-[clamp(2rem,6vw,3.4rem)] font-black leading-[0.95] tracking-[-0.06em]">
              {text.title}
            </h2>

            <p className="mt-4 text-[12px] leading-6 text-white/40">
              {text.description}
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-5"
            >
              <PasswordField
                id="current-password"
                label={
                  text.currentLabel
                }
                placeholder={
                  text.currentPlaceholder
                }
                value={
                  currentPassword
                }
                error={
                  errors.currentPassword
                }
                visible={
                  showCurrent
                }
                disabled={
                  isSubmitting
                }
                showLabel={
                  text.show
                }
                hideLabel={
                  text.hide
                }
                onChange={(
                  value,
                ) => {
                  setCurrentPassword(
                    value,
                  );

                  setErrors(
                    (
                      current,
                    ) => ({
                      ...current,

                      currentPassword:
                        undefined,
                    }),
                  );

                  setFormMessage(
                    "",
                  );
                }}
                onToggle={() => {
                  setShowCurrent(
                    (
                      current,
                    ) => !current,
                  );
                }}
              />

              <PasswordField
                id="new-password"
                label={
                  text.newLabel
                }
                placeholder={
                  text.newPlaceholder
                }
                value={
                  newPassword
                }
                error={
                  errors.newPassword
                }
                visible={
                  showNew
                }
                disabled={
                  isSubmitting
                }
                showLabel={
                  text.show
                }
                hideLabel={
                  text.hide
                }
                onChange={(
                  value,
                ) => {
                  setNewPassword(
                    value,
                  );

                  setErrors(
                    (
                      current,
                    ) => ({
                      ...current,

                      newPassword:
                        undefined,
                    }),
                  );

                  setFormMessage(
                    "",
                  );
                }}
                onToggle={() => {
                  setShowNew(
                    (
                      current,
                    ) => !current,
                  );
                }}
              />

              <PasswordField
                id="confirm-password"
                label={
                  text.confirmLabel
                }
                placeholder={
                  text.confirmPlaceholder
                }
                value={
                  confirmPassword
                }
                error={
                  errors.confirmPassword
                }
                visible={
                  showConfirm
                }
                disabled={
                  isSubmitting
                }
                showLabel={
                  text.show
                }
                hideLabel={
                  text.hide
                }
                onChange={(
                  value,
                ) => {
                  setConfirmPassword(
                    value,
                  );

                  setErrors(
                    (
                      current,
                    ) => ({
                      ...current,

                      confirmPassword:
                        undefined,
                    }),
                  );

                  setFormMessage(
                    "",
                  );
                }}
                onToggle={() => {
                  setShowConfirm(
                    (
                      current,
                    ) => !current,
                  );
                }}
              />

              <div className="rounded-[17px] border border-[#b7ef00]/15 bg-[#b7ef00]/[0.055] px-4 py-3 text-[11px] leading-5 text-white/45">
                {text.requirements}
              </div>

              {formMessage ? (
                <div
                  role="alert"
                  className="rounded-[17px] border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-[11px] leading-5 text-red-200"
                >
                  {formMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="flex h-14 w-full items-center justify-center rounded-[18px] bg-[#b7ef00] px-5 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:bg-[#ccff32] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? text.saving
                  : text.save}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}