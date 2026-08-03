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
  updateAdminAccount,
  uploadAdminAvatar,
  type AccountUser,
} from "@/lib/auth-api";

type PageLanguage =
  | "en"
  | "am";

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

const copy = {
  en: {
    backHome: "Back to website",
    dashboard: "Dashboard",
    eyebrow: "Administrator only",
    title: "Account settings",
    description:
      "Manage the private administrator account used to control Gym House.",

    photoTitle: "Profile picture",
    photoDescription:
      "Upload a JPG, PNG, or WebP image. Maximum size: 5 MB.",
    choosePhoto: "Choose image",
    uploadPhoto: "Upload image",
    uploading: "Uploading...",

    accountTitle:
      "Account information",
    name: "Display name",
    username: "Username",
    email: "Email",
    currentPassword:
      "Current password",
    newPassword:
      "New password",
    confirmPassword:
      "Confirm new password",

    currentPlaceholder:
      "Required to save account changes",

    newPasswordHint:
      "Leave blank to keep the current password. A new password needs at least 12 characters, uppercase, lowercase, number, and symbol.",

    save: "Save changes",
    saving: "Saving...",

    mismatch:
      "The new passwords do not match.",

    currentRequired:
      "Enter your current password.",

    securityTitle:
      "Security protection",

    securityDescription:
      "Changing the password ends every other login session and creates a new secure session for this browser.",

    adminRole: "Administrator",
    redirecting: "Redirecting...",
  },

  am: {
    backHome: "ወደ ድረ ገጹ",
    dashboard: "ዳሽቦርድ",
    eyebrow: "ለአስተዳዳሪ ብቻ",
    title: "የመለያ ቅንብሮች",
    description:
      "የጂም ሃውስ አስተዳዳሪ መለያዎን ያስተዳድሩ።",

    photoTitle: "የመገለጫ ምስል",
    photoDescription:
      "JPG፣ PNG ወይም WebP ምስል ይምረጡ። ከፍተኛው 5 MB።",
    choosePhoto: "ምስል ምረጥ",
    uploadPhoto: "ምስል ጫን",
    uploading: "በመጫን ላይ...",

    accountTitle: "የመለያ መረጃ",
    name: "ስም",
    username: "የተጠቃሚ ስም",
    email: "ኢሜይል",
    currentPassword:
      "አሁን ያለው የይለፍ ቃል",
    newPassword:
      "አዲስ የይለፍ ቃል",
    confirmPassword:
      "አዲሱን የይለፍ ቃል ያረጋግጡ",

    currentPlaceholder:
      "ለውጦቹን ለማስቀመጥ ያስፈልጋል",

    newPasswordHint:
      "የይለፍ ቃሉን ላለመቀየር ባዶ ይተዉት። አዲሱ ቢያንስ 12 ቁምፊ፣ ትልቅና ትንሽ ፊደል፣ ቁጥርና ምልክት ይኑረው።",

    save: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",

    mismatch:
      "አዲሶቹ የይለፍ ቃሎች አይመሳሰሉም።",

    currentRequired:
      "አሁን ያለውን የይለፍ ቃል ያስገቡ።",

    securityTitle:
      "የደህንነት ጥበቃ",

    securityDescription:
      "የይለፍ ቃሉ ሲቀየር ሌሎች የገቡ መሣሪያዎች ይወጣሉ።",

    adminRole: "አስተዳዳሪ",
    redirecting: "በመመለስ ላይ...",
  },
} as const;

function RouteRedirect({
  destination,
  label,
}: {
  destination: string;
  label: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(destination);
  }, [
    destination,
    router,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050605] text-white">
      <p className="text-sm text-white/45">
        {label}
      </p>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#050605] px-5 py-24 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-5 w-32 rounded-full bg-white/10" />

        <div className="mt-8 h-16 max-w-xl rounded-2xl bg-white/[0.07]" />

        <div className="mt-12 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="h-[390px] rounded-[28px] bg-white/[0.05]" />

          <div className="h-[590px] rounded-[28px] bg-white/[0.05]" />
        </div>
      </div>
    </main>
  );
}

function AdminSettingsForm({
  user,
  language,
  refreshAuth,
}: {
  user: AccountUser;
  language: PageLanguage;
  refreshAuth:
    () => Promise<
      AccountUser | null
    >;
}) {
  const text = copy[language];

  const [name, setName] =
    useState(user.name);

  const [username, setUsername] =
    useState(user.username);

  const [email, setEmail] =
    useState(user.email);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    selectedAvatar,
    setSelectedAvatar,
  ] = useState<File | null>(
    null,
  );

  const [
    avatarPreview,
    setAvatarPreview,
  ] = useState<
    string | null
  >(null);

  const [
    accountStatus,
    setAccountStatus,
  ] = useState<StatusMessage>(
    null,
  );

  const [
    avatarStatus,
    setAvatarStatus,
  ] = useState<StatusMessage>(
    null,
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview,
        );
      }
    };
  }, [avatarPreview]);

  function getErrorMessage(
    error: unknown,
  ) {
    if (
      error instanceof
      AuthApiError
    ) {
      return error.getMessage(
        language,
      );
    }

    return language === "am"
      ? "ችግር ተፈጥሯል። እንደገና ይሞክሩ።"
      : "Something went wrong. Please try again.";
  }

  function handleAvatarSelection(
    file: File | undefined,
  ) {
    setAvatarStatus(null);

    if (!file) {
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(
        avatarPreview,
      );
    }

    setSelectedAvatar(file);

    setAvatarPreview(
      URL.createObjectURL(file),
    );
  }

  async function handleAvatarUpload() {
    if (
      !selectedAvatar ||
      isUploading
    ) {
      return;
    }

    setIsUploading(true);
    setAvatarStatus(null);

    try {
      const result =
        await uploadAdminAvatar(
          selectedAvatar,
        );

      await refreshAuth();

      setSelectedAvatar(null);

      if (avatarPreview) {
        URL.revokeObjectURL(
          avatarPreview,
        );
      }

      setAvatarPreview(null);

      setAvatarStatus({
        type: "success",
        text:
          result.message[
            language
          ],
      });
    } catch (error: unknown) {
      setAvatarStatus({
        type: "error",
        text:
          getErrorMessage(error),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAccountSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setAccountStatus(null);

    if (!currentPassword) {
      setAccountStatus({
        type: "error",
        text:
          text.currentRequired,
      });

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setAccountStatus({
        type: "error",
        text: text.mismatch,
      });

      return;
    }

    setIsSaving(true);

    try {
      const result =
        await updateAdminAccount({
          name: name.trim(),
          username:
            username.trim(),
          email: email.trim(),
          currentPassword,

          newPassword:
            newPassword ||
            undefined,
        });

      await refreshAuth();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setAccountStatus({
        type: "success",
        text:
          result.message[
            language
          ],
      });
    } catch (error: unknown) {
      setAccountStatus({
        type: "error",
        text:
          getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  const displayedAvatar =
    avatarPreview ||
    user.profileImageUrl;

  const inputClassName = `
    h-14
    w-full
    rounded-[17px]
    border
    border-white/[0.09]
    bg-white/[0.035]
    px-4
    text-[13px]
    text-white
    outline-none
    transition
    placeholder:text-white/20
    focus:border-[#b7ef00]/55
    focus:bg-white/[0.055]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050605] px-5 pb-20 pt-7 text-white sm:px-8 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",
          backgroundSize:
            "72px 72px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[460px] w-[460px] rounded-full bg-[#b7ef00]/10 blur-[160px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/50 transition hover:text-[#b7ef00]"
          >
            <span>←</span>
            <span>
              {text.backHome}
            </span>
          </Link>

          <Link
            href="/admin/dashboard"
            className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/65 transition hover:border-[#b7ef00]/35 hover:text-[#b7ef00]"
          >
            {text.dashboard}
          </Link>
        </header>

        <section className="mt-14">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b7ef00]">
            {text.eyebrow}
          </p>

          <h1 className="mt-4 max-w-4xl text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.07em]">
            {text.title}
          </h1>

          <p className="mt-6 max-w-2xl text-[13px] leading-7 text-white/40 sm:text-[15px]">
            {text.description}
          </p>
        </section>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[30px] border border-white/[0.08] bg-[#0b0d0a]/90 p-6 shadow-[0_28px_80px_rgba(0,0,0,.42)] backdrop-blur-xl">
            <h2 className="text-xl font-black tracking-[-0.03em]">
              {text.photoTitle}
            </h2>

            <p className="mt-3 text-[12px] leading-6 text-white/35">
              {text.photoDescription}
            </p>

            <div className="mt-7 flex justify-center">
              <div
                aria-label={
                  user.name
                }
                className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-[#b7ef00]/30 bg-[#b7ef00] bg-cover bg-center text-5xl font-black text-black shadow-[0_20px_60px_rgba(183,239,0,.12)]"
                style={
                  displayedAvatar
                    ? {
                        backgroundImage:
                          `url("${displayedAvatar}")`,
                      }
                    : undefined
                }
              >
                {!displayedAvatar &&
                  user.name
                    .charAt(0)
                    .toUpperCase()}
              </div>
            </div>

            <div className="mt-7">
              <label className="flex h-12 cursor-pointer items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.15em] text-white/65 transition hover:border-[#b7ef00]/40 hover:text-[#b7ef00]">
                {text.choosePhoto}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={
                    isUploading
                  }
                  onChange={(
                    event,
                  ) => {
                    handleAvatarSelection(
                      event.target
                        .files?.[0],
                    );

                    event.currentTarget.value =
                      "";
                  }}
                />
              </label>

              <button
                type="button"
                disabled={
                  !selectedAvatar ||
                  isUploading
                }
                onClick={() => {
                  void handleAvatarUpload();
                }}
                className="mt-3 flex h-12 w-full items-center justify-center rounded-[15px] bg-[#b7ef00] text-[10px] font-black uppercase tracking-[0.15em] text-black transition hover:bg-[#ccff32] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isUploading
                  ? text.uploading
                  : text.uploadPhoto}
              </button>
            </div>

            {avatarStatus && (
              <p
                role={
                  avatarStatus.type ===
                  "error"
                    ? "alert"
                    : "status"
                }
                className={`mt-4 rounded-[14px] border px-4 py-3 text-[11px] leading-5 ${
                  avatarStatus.type ===
                  "success"
                    ? "border-[#b7ef00]/20 bg-[#b7ef00]/[0.06] text-[#dfff61]"
                    : "border-red-400/25 bg-red-400/[0.07] text-red-200"
                }`}
              >
                {avatarStatus.text}
              </p>
            )}

            <div className="mt-7 border-t border-white/[0.07] pt-5">
              <p className="truncate text-[14px] font-bold">
                {user.name}
              </p>

              <p className="mt-1 truncate text-[11px] text-white/35">
                {user.email}
              </p>

              <span className="mt-4 inline-flex rounded-full bg-[#b7ef00]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#dfff61]">
                {text.adminRole}
              </span>
            </div>
          </section>

          <form
            onSubmit={
              handleAccountSubmit
            }
            className="rounded-[30px] border border-white/[0.08] bg-[#0b0d0a]/90 p-6 shadow-[0_28px_80px_rgba(0,0,0,.42)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              {text.accountTitle}
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  {text.name}
                </span>

                <input
                  type="text"
                  value={name}
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event,
                  ) => {
                    setName(
                      event.target.value,
                    );
                    setAccountStatus(
                      null,
                    );
                  }}
                  className={
                    inputClassName
                  }
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  {text.username}
                </span>

                <input
                  type="text"
                  value={username}
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event,
                  ) => {
                    setUsername(
                      event.target.value,
                    );
                    setAccountStatus(
                      null,
                    );
                  }}
                  className={
                    inputClassName
                  }
                  required
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                {text.email}
              </span>

              <input
                type="email"
                value={email}
                autoComplete="email"
                disabled={
                  isSaving
                }
                onChange={(
                  event,
                ) => {
                  setEmail(
                    event.target.value,
                  );
                  setAccountStatus(
                    null,
                  );
                }}
                className={
                  inputClassName
                }
                required
              />
            </label>

            <div className="my-8 h-px bg-white/[0.07]" />

            <label className="block">
              <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                {text.currentPassword}
              </span>

              <input
                type="password"
                value={
                  currentPassword
                }
                autoComplete="current-password"
                placeholder={
                  text.currentPlaceholder
                }
                disabled={
                  isSaving
                }
                onChange={(
                  event,
                ) => {
                  setCurrentPassword(
                    event.target.value,
                  );
                  setAccountStatus(
                    null,
                  );
                }}
                className={
                  inputClassName
                }
                required
              />
            </label>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  {text.newPassword}
                </span>

                <input
                  type="password"
                  value={newPassword}
                  autoComplete="new-password"
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event,
                  ) => {
                    setNewPassword(
                      event.target.value,
                    );
                    setAccountStatus(
                      null,
                    );
                  }}
                  className={
                    inputClassName
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2.5 block text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                  {text.confirmPassword}
                </span>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  autoComplete="new-password"
                  disabled={
                    isSaving
                  }
                  onChange={(
                    event,
                  ) => {
                    setConfirmPassword(
                      event.target.value,
                    );
                    setAccountStatus(
                      null,
                    );
                  }}
                  className={
                    inputClassName
                  }
                />
              </label>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-white/30">
              {text.newPasswordHint}
            </p>

            <div className="mt-7 rounded-[18px] border border-[#b7ef00]/15 bg-[#b7ef00]/[0.045] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#dfff61]">
                {text.securityTitle}
              </p>

              <p className="mt-2 text-[11px] leading-6 text-white/40">
                {text.securityDescription}
              </p>
            </div>

            {accountStatus && (
              <p
                role={
                  accountStatus.type ===
                  "error"
                    ? "alert"
                    : "status"
                }
                className={`mt-5 rounded-[15px] border px-4 py-3 text-[11px] leading-5 ${
                  accountStatus.type ===
                  "success"
                    ? "border-[#b7ef00]/20 bg-[#b7ef00]/[0.06] text-[#dfff61]"
                    : "border-red-400/25 bg-red-400/[0.07] text-red-200"
                }`}
              >
                {accountStatus.text}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSaving
              }
              className="mt-7 flex h-14 w-full items-center justify-center rounded-[18px] bg-[#b7ef00] text-[10px] font-black uppercase tracking-[0.17em] text-black transition hover:-translate-y-0.5 hover:bg-[#ccff32] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSaving
                ? text.saving
                : text.save}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function AdminSettingsPage() {
  const {
    user,
    isLoading,
    refreshAuth,
  } = useAuth();

  const { language } =
    useLanguage();

  const currentLanguage:
    PageLanguage =
    language === "am"
      ? "am"
      : "en";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <RouteRedirect
        destination="/login"
        label={
          copy[currentLanguage]
            .redirecting
        }
      />
    );
  }

  if (
    user.role !== "admin"
  ) {
    return (
      <RouteRedirect
        destination="/account"
        label={
          copy[currentLanguage]
            .redirecting
        }
      />
    );
  }

  return (
    <AdminSettingsForm
      key={[
        user.id,
        user.username,
        user.email,
        user.profileImageUrl,
      ].join(":")}
      user={user}
      language={
        currentLanguage
      }
      refreshAuth={
        refreshAuth
      }
    />
  );
}