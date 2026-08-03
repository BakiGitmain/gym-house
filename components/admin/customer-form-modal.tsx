"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AuthApiError,
} from "@/lib/auth-api";
import {
  createAdminCustomer,
  updateAdminCustomer,
  uploadCustomerAvatar,
  type AdminCustomer,
  type MembershipPlanMonths,
  type MembershipRecordStatus,
} from "@/lib/admin-customers-api";

type DashboardLanguage =
  | "en"
  | "am";

type PlanSelection =
  | "keep"
  | "1"
  | "2"
  | "3"
  | "6"
  | "12";

type CustomerFormModalProps = {
  language:
    DashboardLanguage;

  customer:
    | AdminCustomer
    | null;

  onClose: () => void;

  onSaved: (
    message: string,
  ) => Promise<void> | void;
};

const planValues: {
  value: MembershipPlanMonths;
  en: string;
  am: string;
}[] = [
  {
    value: 1,
    en: "1 month",
    am: "1 ወር",
  },
  {
    value: 2,
    en: "2 months",
    am: "2 ወራት",
  },
  {
    value: 3,
    en: "3 months",
    am: "3 ወራት",
  },
  {
    value: 6,
    en: "6 months",
    am: "6 ወራት",
  },
  {
    value: 12,
    en: "1 year",
    am: "1 ዓመት",
  },
];

const copy = {
  en: {
    createTitle:
      "Add new customer",

    editTitle:
      "Manage customer",

    createDescription:
      "Create secure login details and select a Gym House membership plan.",

    editDescription:
      "Update the account, replace the profile image, or renew the membership.",

    close: "Close",

    personal:
      "Customer information",

    membership:
      "Membership plan",

    security:
      "Login and security",

    name: "Full name",
    username: "Username",
    email: "Email",

    photo:
      "Profile picture",

    photoDescription:
      "Upload a JPG, PNG, or WebP image. Maximum size: 5 MB.",

    choosePhoto:
      "Choose image",

    replacePhoto:
      "Replace image",

    selected:
      "Image selected",

    membershipPlan:
      "Choose plan",

    keepCurrent:
      "Keep current membership",

    renewNotice:
      "Choosing a new plan renews the membership starting today.",

    registrationDate:
      "Registration date",

    currentExpiration:
      "Current expiration",

    startsToday:
      "Membership starts today",

    calculatedExpiration:
      "Calculated expiration",

    membershipStatus:
      "Membership status",

    active: "Active",
    paused: "Paused",
    cancelled: "Cancelled",

    accountAccess:
      "Account access",

    enabled: "Enabled",
    disabled: "Disabled",

    password:
      "Temporary password",

    newPassword:
      "New password",

    confirmPassword:
      "Confirm password",

    passwordOptional:
      "Leave blank to keep the existing password.",

    generate: "Generate",
    copyPassword: "Copy",

    copied:
      "Password copied.",

    show: "Show",
    hide: "Hide",

    cancel: "Cancel",

    create:
      "Create customer",

    update:
      "Save changes",

    saving:
      "Uploading and saving...",

    passwordMismatch:
      "The passwords do not match.",

    planRequired:
      "Select a membership plan.",

    unknownError:
      "Something went wrong. Please try again.",
  },

  am: {
    createTitle:
      "አዲስ ደንበኛ ጨምር",

    editTitle:
      "ደንበኛን አስተዳድር",

    createDescription:
      "የመግቢያ መረጃ ይፍጠሩና የጂም ሃውስ አባልነት እቅድ ይምረጡ።",

    editDescription:
      "መለያውን፣ የመገለጫ ምስሉንና አባልነቱን ያስተዳድሩ።",

    close: "ዝጋ",

    personal:
      "የደንበኛ መረጃ",

    membership:
      "የአባልነት እቅድ",

    security:
      "መግቢያና ደህንነት",

    name: "ሙሉ ስም",
    username:
      "የተጠቃሚ ስም",

    email: "ኢሜይል",

    photo:
      "የመገለጫ ምስል",

    photoDescription:
      "JPG፣ PNG ወይም WebP ምስል ይጫኑ። ከፍተኛው 5 MB።",

    choosePhoto:
      "ምስል ምረጥ",

    replacePhoto:
      "ምስል ቀይር",

    selected:
      "ምስል ተመርጧል",

    membershipPlan:
      "እቅድ ምረጥ",

    keepCurrent:
      "አሁን ያለውን አባልነት አቆይ",

    renewNotice:
      "አዲስ እቅድ ሲመረጥ አባልነቱ ከዛሬ ጀምሮ ይታደሳል።",

    registrationDate:
      "የምዝገባ ቀን",

    currentExpiration:
      "አሁን ያለው ማብቂያ",

    startsToday:
      "አባልነቱ ዛሬ ይጀምራል",

    calculatedExpiration:
      "የተሰላ ማብቂያ",

    membershipStatus:
      "የአባልነት ሁኔታ",

    active: "ንቁ",
    paused: "ቆሟል",
    cancelled: "ተሰርዟል",

    accountAccess:
      "የመለያ መዳረሻ",

    enabled: "ተፈቅዷል",
    disabled: "ተዘግቷል",

    password:
      "ጊዜያዊ የይለፍ ቃል",

    newPassword:
      "አዲስ የይለፍ ቃል",

    confirmPassword:
      "የይለፍ ቃሉን ያረጋግጡ",

    passwordOptional:
      "የይለፍ ቃሉን ላለመቀየር ባዶ ይተዉት።",

    generate: "ፍጠር",
    copyPassword: "ቅዳ",

    copied:
      "የይለፍ ቃሉ ተቀድቷል።",

    show: "አሳይ",
    hide: "ደብቅ",

    cancel: "ሰርዝ",

    create:
      "ደንበኛ ፍጠር",

    update:
      "ለውጦችን አስቀምጥ",

    saving:
      "በመጫንና በማስቀመጥ ላይ...",

    passwordMismatch:
      "የይለፍ ቃሎቹ አይመሳሰሉም።",

    planRequired:
      "የአባልነት እቅድ ይምረጡ።",

    unknownError:
      "ችግር ተፈጥሯል። እንደገና ይሞክሩ።",
  },
} as const;

function randomCharacter(
  characters: string,
) {
  const values =
    new Uint32Array(1);

  crypto.getRandomValues(
    values,
  );

  return characters[
    values[0] %
      characters.length
  ];
}

function generatePassword() {
  const lowercase =
    "abcdefghijkmnopqrstuvwxyz";

  const uppercase =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const numbers =
    "23456789";

  const symbols =
    "!@#$%&*_-";

  const all =
    lowercase +
    uppercase +
    numbers +
    symbols;

  const password = [
    randomCharacter(lowercase),
    randomCharacter(uppercase),
    randomCharacter(numbers),
    randomCharacter(symbols),
  ];

  while (
    password.length < 14
  ) {
    password.push(
      randomCharacter(all),
    );
  }

  for (
    let index =
      password.length - 1;
    index > 0;
    index -= 1
  ) {
    const values =
      new Uint32Array(1);

    crypto.getRandomValues(
      values,
    );

    const randomIndex =
      values[0] %
      (index + 1);

    [
      password[index],
      password[randomIndex],
    ] = [
      password[randomIndex],
      password[index],
    ];
  }

  return password.join("");
}

function addMonths(
  date: Date,
  months: number,
) {
  const result =
    new Date(date);

  result.setMonth(
    result.getMonth() +
      months,
  );

  return result;
}

function formatDate(
  value: Date | string,
  language: DashboardLanguage,
) {
  const date =
    value instanceof Date
      ? value
      : new Date(
          value.includes("T")
            ? value
            : `${value}T00:00:00`,
        );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    language === "am"
      ? "am-ET"
      : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

export default function CustomerFormModal({
  language,
  customer,
  onClose,
  onSaved,
}: CustomerFormModalProps) {
  const text =
    copy[language];

  const isEditing =
    customer !== null;

  const [name, setName] =
    useState(
      customer?.name ?? "",
    );

  const [username, setUsername] =
    useState(
      customer?.username ?? "",
    );

  const [email, setEmail] =
    useState(
      customer?.email ?? "",
    );

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(
    null,
  );

  const [
    imagePreview,
    setImagePreview,
  ] = useState<
    string | null
  >(null);

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState<PlanSelection>(
    isEditing
      ? "keep"
      : "1",
  );

  const [
    membershipStatus,
    setMembershipStatus,
  ] =
    useState<MembershipRecordStatus>(
      customer?.membership
        ?.recordStatus ??
        "active",
    );

  const [
    isActive,
    setIsActive,
  ] = useState(
    customer?.isActive ??
      true,
  );

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !isSaving
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style
        .overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    isSaving,
    onClose,
  ]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  const selectedPlanMonths =
    selectedPlan === "keep"
      ? null
      : Number(
          selectedPlan,
        ) as MembershipPlanMonths;

  const calculatedExpiration =
    useMemo(() => {
      if (
        selectedPlanMonths ===
        null
      ) {
        return null;
      }

      return addMonths(
        new Date(),
        selectedPlanMonths,
      );
    }, [selectedPlanMonths]);

  const displayedImage =
    imagePreview ||
    customer?.profileImageUrl ||
    null;

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "C";

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

    return text.unknownError;
  }

  function handleImageSelection(
    file: File | undefined,
  ) {
    setMessage("");

    if (!file) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setSelectedImage(file);

    setImagePreview(
      URL.createObjectURL(file),
    );
  }

  async function copyPassword() {
    if (!password) {
      return;
    }

    try {
      await navigator.clipboard
        .writeText(password);

      setMessage(
        text.copied,
      );
    } catch {
      setMessage(
        text.unknownError,
      );
    }
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setMessage("");

    if (
      !isEditing &&
      selectedPlan === "keep"
    ) {
      setMessage(
        text.planRequired,
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setMessage(
        text.passwordMismatch,
      );

      return;
    }

    setIsSaving(true);

    try {
      let profileImagePublicId:
        string | undefined;

      if (selectedImage) {
        const uploadedImage =
          await uploadCustomerAvatar(
            selectedImage,
          );

        profileImagePublicId =
          uploadedImage.publicId;
      }

      const result =
        isEditing
          ? await updateAdminCustomer(
              customer.id,
              {
                name:
                  name.trim(),

                username:
                  username.trim(),

                email:
                  email.trim(),

                profileImagePublicId,

                isActive,

                membershipPlanMonths:
                  selectedPlanMonths,

                membershipStatus,

                newPassword:
                  password ||
                  undefined,
              },
            )
          : await createAdminCustomer(
              {
                name:
                  name.trim(),

                username:
                  username.trim(),

                email:
                  email.trim(),

                password,

                profileImagePublicId,

                membershipPlanMonths:
                  selectedPlanMonths!,

                membershipStatus,
              },
            );

      await onSaved(
        result.message[
          language
        ],
      );
    } catch (error: unknown) {
      setMessage(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  const inputClassName = `
    h-12
    w-full
    rounded-[15px]
    border
    border-white/[0.09]
    bg-white/[0.035]
    px-4
    text-[12px]
    text-white
    outline-none
    transition
    placeholder:text-white/20
    focus:border-[#b7ef00]/50
    focus:bg-white/[0.055]
    disabled:cursor-not-allowed
    disabled:opacity-55
  `;

  const labelClassName = `
    mb-2
    block
    text-[9px]
    font-black
    uppercase
    tracking-[0.17em]
    text-white/35
  `;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-form-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }
      }}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        justify-center
        bg-black/75
        p-0
        backdrop-blur-md

        sm:items-center
        sm:p-5
      "
    >
      <div
        className="
          relative
          max-h-[94svh]
          w-full
          overflow-y-auto
          rounded-t-[30px]
          border
          border-white/[0.09]
          bg-[#0a0c09]
          shadow-[0_30px_100px_rgba(0,0,0,.7)]

          sm:max-w-[820px]
          sm:rounded-[30px]
        "
      >
        <header
          className="
            sticky
            top-0
            z-10
            flex
            items-start
            justify-between
            gap-5
            border-b
            border-white/[0.07]
            bg-[#0a0c09]/95
            px-5
            py-5
            backdrop-blur-xl

            sm:px-8
            sm:py-6
          "
        >
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b7ef00]">
              Gym House
            </p>

            <h2
              id="customer-form-title"
              className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl"
            >
              {isEditing
                ? text.editTitle
                : text.createTitle}
            </h2>

            <p className="mt-2 max-w-xl text-[11px] leading-5 text-white/35">
              {isEditing
                ? text.editDescription
                : text.createDescription}
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            aria-label={text.close}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-xl text-white/45 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            ×
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-8"
        >
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              {text.personal}
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClassName}>
                  {text.name}
                </span>

                <input
                  type="text"
                  value={name}
                  required
                  minLength={2}
                  maxLength={120}
                  disabled={isSaving}
                  onChange={(event) => {
                    setName(
                      event.target.value,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                />
              </label>

              <label>
                <span className={labelClassName}>
                  {text.username}
                </span>

                <input
                  type="text"
                  value={username}
                  required
                  minLength={3}
                  maxLength={32}
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isSaving}
                  onChange={(event) => {
                    setUsername(
                      event.target.value,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                />
              </label>

              <label className="sm:col-span-2">
                <span className={labelClassName}>
                  {text.email}
                </span>

                <input
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  disabled={isSaving}
                  onChange={(event) => {
                    setEmail(
                      event.target.value,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/[0.08] bg-white/[0.022] p-4 sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  aria-label={name}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#b7ef00]/25 bg-[#b7ef00] bg-cover bg-center text-3xl font-black text-black"
                  style={
                    displayedImage
                      ? {
                          backgroundImage:
                            `url("${displayedImage}")`,
                        }
                      : undefined
                  }
                >
                  {!displayedImage &&
                    initial}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-white">
                    {text.photo}
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-white/30">
                    {text.photoDescription}
                  </p>

                  <label className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center rounded-[14px] border border-[#b7ef00]/25 bg-[#b7ef00]/[0.06] px-5 text-[9px] font-black uppercase tracking-[0.13em] text-[#dfff61] transition hover:bg-[#b7ef00]/10">
                    {displayedImage
                      ? text.replacePhoto
                      : text.choosePhoto}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isSaving}
                      className="sr-only"
                      onChange={(event) => {
                        handleImageSelection(
                          event.target
                            .files?.[0],
                        );

                        event.currentTarget.value =
                          "";
                      }}
                    />
                  </label>

                  {selectedImage && (
                    <p className="mt-3 truncate text-[9px] text-[#dfff61]">
                      {text.selected}:{" "}
                      {selectedImage.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="my-8 h-px bg-white/[0.07]" />

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              {text.membership}
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClassName}>
                  {text.membershipPlan}
                </span>

                <select
                  value={selectedPlan}
                  disabled={isSaving}
                  onChange={(event) => {
                    setSelectedPlan(
                      event.target
                        .value as PlanSelection,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                >
                  {isEditing && (
                    <option
                      value="keep"
                      className="bg-[#11130f]"
                    >
                      {text.keepCurrent}
                    </option>
                  )}

                  {planValues.map(
                    (plan) => (
                      <option
                        key={plan.value}
                        value={String(
                          plan.value,
                        )}
                        className="bg-[#11130f]"
                      >
                        {language === "am"
                          ? plan.am
                          : plan.en}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span className={labelClassName}>
                  {text.membershipStatus}
                </span>

                <select
                  value={membershipStatus}
                  disabled={isSaving}
                  onChange={(event) => {
                    setMembershipStatus(
                      event.target
                        .value as MembershipRecordStatus,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                >
                  <option
                    value="active"
                    className="bg-[#11130f]"
                  >
                    {text.active}
                  </option>

                  <option
                    value="paused"
                    className="bg-[#11130f]"
                  >
                    {text.paused}
                  </option>

                  <option
                    value="cancelled"
                    className="bg-[#11130f]"
                  >
                    {text.cancelled}
                  </option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.023] p-4">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25">
                  {isEditing
                    ? text.registrationDate
                    : text.startsToday}
                </p>

                <p className="mt-2 text-[12px] font-bold text-white/70">
                  {isEditing
                    ? formatDate(
                        customer.createdAt,
                        language,
                      )
                    : formatDate(
                        new Date(),
                        language,
                      )}
                </p>
              </div>

              <div className="rounded-[16px] border border-[#b7ef00]/15 bg-[#b7ef00]/[0.035] p-4">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#dfff61]/65">
                  {calculatedExpiration
                    ? text.calculatedExpiration
                    : text.currentExpiration}
                </p>

                <p className="mt-2 text-[12px] font-bold text-[#dfff61]">
                  {calculatedExpiration
                    ? formatDate(
                        calculatedExpiration,
                        language,
                      )
                    : customer?.membership
                        ?.expiresAt
                      ? formatDate(
                          customer.membership
                            .expiresAt,
                          language,
                        )
                      : "—"}
                </p>
              </div>
            </div>

            {isEditing &&
              selectedPlan !==
                "keep" && (
                <p className="mt-3 text-[10px] leading-5 text-white/30">
                  {text.renewNotice}
                </p>
              )}

            {isEditing && (
              <div className="mt-4 flex items-center justify-between gap-4 rounded-[17px] border border-white/[0.08] bg-white/[0.025] p-4">
                <div>
                  <p className="text-[11px] font-bold text-white/75">
                    {text.accountAccess}
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    {isActive
                      ? text.enabled
                      : text.disabled}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  disabled={isSaving}
                  onClick={() => {
                    setIsActive(
                      (current) =>
                        !current,
                    );

                    setMessage("");
                  }}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isActive
                      ? "bg-[#b7ef00]"
                      : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-black transition-transform ${
                      isActive
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </section>

          <div className="my-8 h-px bg-white/[0.07]" />

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
              {text.security}
            </h3>

            {isEditing && (
              <p className="mt-2 text-[10px] text-white/30">
                {text.passwordOptional}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClassName}>
                  {isEditing
                    ? text.newPassword
                    : text.password}
                </span>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    required={!isEditing}
                    minLength={
                      password
                        ? 8
                        : undefined
                    }
                    autoComplete="new-password"
                    disabled={isSaving}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      );

                      setMessage("");
                    }}
                    className={`${inputClassName} pr-20`}
                  />

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setShowPassword(
                        (current) =>
                          !current,
                      );
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-[9px] font-black uppercase text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {showPassword
                      ? text.hide
                      : text.show}
                  </button>
                </div>
              </label>

              <label>
                <span className={labelClassName}>
                  {text.confirmPassword}
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  required={!isEditing}
                  autoComplete="new-password"
                  disabled={isSaving}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value,
                    );

                    setMessage("");
                  }}
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  const generated =
                    generatePassword();

                  setPassword(
                    generated,
                  );

                  setConfirmPassword(
                    generated,
                  );

                  setShowPassword(
                    true,
                  );

                  setMessage("");
                }}
                className="rounded-full border border-[#b7ef00]/25 bg-[#b7ef00]/[0.06] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#dfff61] transition hover:bg-[#b7ef00]/10"
              >
                {text.generate}
              </button>

              {password && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    void copyPassword();
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:text-white"
                >
                  {text.copyPassword}
                </button>
              )}
            </div>
          </section>

          {message && (
            <p
              role="alert"
              className="mt-6 rounded-[15px] border border-red-400/25 bg-red-400/[0.07] px-4 py-3 text-[11px] leading-5 text-red-200"
            >
              {message}
            </p>
          )}

          <footer className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="h-12 rounded-[15px] border border-white/10 px-6 text-[10px] font-black uppercase tracking-[0.14em] text-white/45 transition hover:text-white disabled:opacity-45"
            >
              {text.cancel}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex h-12 min-w-[210px] items-center justify-center rounded-[15px] bg-[#b7ef00] px-6 text-[10px] font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#ccff32] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSaving
                ? text.saving
                : isEditing
                  ? text.update
                  : text.create}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}