"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
  type SVGProps,
} from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  AuthApiError,
  loginAccount,
} from "@/lib/auth-api";

type IconProps = SVGProps<SVGSVGElement>;

type LoginErrors = {
  username?: string;
  password?: string;
};

const pageCopy = {
  en: {
    homeLabel: "Gym House home",
    slogan: "Stronger every day",

    englishLabel: "English",
    amharicLabel: "Amharic",

    backLabel: "Go back to the website",
    backText: "Back to website",

    securityBadge: "Secure member access",

    heroTitleFirst: "Built for consistency.",
    heroTitleSecond: "Designed for progress.",

    heroDescription:
      "Your member account keeps the important parts of your Gym House journey organized in one secure place.",

    facts: [
      {
        value: "2400 Birr",
        label: "Monthly membership",
      },
      {
        value: "7 days",
        label: "Open every day",
      },
      {
        value: "Included",
        label: "Training support",
      },
    ],

    benefits: [
      "Check your membership status",
      "Keep your training information together",
      "Manage your Gym House account",
    ],

    memberLogin: "Member login",
    welcome: "Welcome back.",

    loginDescription:
      "Enter your account details to continue to your member space.",

    usernameLabel: "Username",
    usernamePlaceholder: "Enter your username",

    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",

    help: "Need help?",

    showPassword: "Show password",
    hidePassword: "Hide password",

    show: "Show",
    hide: "Hide",

    signIn: "Sign in",
    signingIn: "Signing in...",

    notMember: "Not a member yet?",
    viewMembership: "View membership",

    usernameRequired: "Enter your username.",
    passwordRequired: "Enter your password.",

    passwordLength:
      "Password must contain at least 8 characters.",

    unknownError:
      "Something went wrong. Please try again.",
  },

  am: {
    homeLabel: "ወደ ጂም ሃውስ መነሻ",
    slogan: "በየቀኑ ጠንካራ",

    englishLabel: "እንግሊዝኛ",
    amharicLabel: "አማርኛ",

    backLabel: "ወደ ድረ ገጹ ተመለስ",
    backText: "ወደ ድረ ገጹ",

    securityBadge: "ደህንነቱ የተጠበቀ መግቢያ",

    heroTitleFirst: "ለቀጣይነት የተሰራ።",
    heroTitleSecond: "ለእድገት የተዘጋጀ።",

    heroDescription:
      "የጂም ሃውስ መለያዎ የአባልነት መረጃዎን በአንድ ደህንነቱ በተጠበቀ ቦታ ያስቀምጣል።",

    facts: [
      {
        value: "2400 ብር",
        label: "ወርሃዊ አባልነት",
      },
      {
        value: "7 ቀናት",
        label: "በየቀኑ ክፍት",
      },
      {
        value: "ተካትቷል",
        label: "የስልጠና ድጋፍ",
      },
    ],

    benefits: [
      "የአባልነትዎን ሁኔታ ይመልከቱ",
      "የስልጠና መረጃዎን ያስተዳድሩ",
      "የጂም ሃውስ መለያዎን ያስተዳድሩ",
    ],

    memberLogin: "የአባል መግቢያ",
    welcome: "እንኳን ደህና መጡ።",

    loginDescription:
      "ወደ መለያዎ ለመግባት የተጠቃሚ ስምዎንና የይለፍ ቃልዎን ያስገቡ።",

    usernameLabel: "የተጠቃሚ ስም",
    usernamePlaceholder: "የተጠቃሚ ስምዎን ያስገቡ",

    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",

    help: "እገዛ ይፈልጋሉ?",

    showPassword: "የይለፍ ቃሉን አሳይ",
    hidePassword: "የይለፍ ቃሉን ደብቅ",

    show: "አሳይ",
    hide: "ደብቅ",

    signIn: "ግባ",
    signingIn: "በመግባት ላይ...",

    notMember: "አባል አይደሉም?",
    viewMembership: "አባልነትን ይመልከቱ",

    usernameRequired: "የተጠቃሚ ስምዎን ያስገቡ።",
    passwordRequired: "የይለፍ ቃልዎን ያስገቡ።",

    passwordLength:
      "የይለፍ ቃሉ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል።",

    unknownError:
      "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
  },
} as const;

function LogoMark({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M11.4 13.7C14.1 9.8 18.2 7.5 22.9 7.5C28.2 7.5 33 10.5 35.3 15.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M30.8 28.9C28.2 32.3 24.5 34.4 20.2 34.4C14.5 34.4 9.4 31 7.3 25.9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M9.2 22.3L16.2 17.1L20.1 22L27.9 15.9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M27.7 15.8L33.1 19.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M10 25.4L15.2 29"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 17L17 7M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginScreen() {
    const router = useRouter();
  const { refreshAuth } = useAuth();

  const { language, setLanguage } =
    useLanguage();

  const currentLanguage =
    language === "am" ? "am" : "en";

  const copy = pageCopy[currentLanguage];

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] =
    useState<LoginErrors>({});

  const [formMessage, setFormMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors: LoginErrors = {};

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    if (!normalizedUsername) {
      nextErrors.username =
        copy.usernameRequired;
    }

    if (!password) {
      nextErrors.password =
        copy.passwordRequired;
    } else if (password.length < 8) {
      nextErrors.password =
        copy.passwordLength;
    }

    setErrors(nextErrors);
    setFormMessage("");

    if (
      Object.keys(nextErrors).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
const result = await loginAccount({
  username: normalizedUsername,
  password,
});

/*
 * Update the global authentication state
 * before opening the protected page.
 */
await refreshAuth();

        router.replace(result.redirectTo);
        router.refresh();
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFormMessage(
          error.getMessage(currentLanguage),
        );

        return;
      }

      setFormMessage(copy.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#050605] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-0
          h-[440px]
          w-[440px]
          rounded-full
          bg-[#b7ef00]/10
          blur-[150px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-44
          -right-32
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#b7ef00]/[0.065]
          blur-[180px]
        "
      />

      <header
        className="
          relative
          z-20
          flex
          items-center
          justify-between
          px-5
          py-5

          sm:px-8
          sm:py-7

          lg:px-12

          xl:px-16
        "
      >
        <Link
          href="/"
          aria-label={copy.homeLabel}
          className="group inline-flex items-center gap-3"
        >
          <span
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-[#b7ef00]/25
              bg-[#b7ef00]/[0.07]
              text-[#b7ef00]
              transition
              duration-300

              group-hover:rotate-6
              group-hover:border-[#b7ef00]/60
              group-hover:bg-[#b7ef00]/10
            "
          >
            <LogoMark className="h-7 w-7" />
          </span>

          <span className="hidden sm:block">
            <span
              className="
                block
                text-[20px]
                font-black
                uppercase
                leading-none
                tracking-[-0.055em]
              "
            >
              Gym
              <span className="text-[#b7ef00]">
                House
              </span>
            </span>

            <span
              className="
                mt-1
                block
                text-[7px]
                font-black
                uppercase
                tracking-[0.35em]
                text-white/30
              "
            >
              {copy.slogan}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            data-no-translate="true"
            className="
              flex
              h-10
              items-center
              rounded-full
              border
              border-white/10
              bg-white/[0.035]
              p-1
            "
          >
            <button
              type="button"
              aria-label={copy.englishLabel}
              aria-pressed={
                currentLanguage === "en"
              }
              disabled={isSubmitting}
              onClick={() => setLanguage("en")}
              className={`
                h-8
                rounded-full
                px-3
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                transition

                disabled:cursor-not-allowed
                disabled:opacity-60

                sm:px-4

                ${
                  currentLanguage === "en"
                    ? "bg-[#b7ef00] text-black"
                    : "text-white/45 hover:text-white"
                }
              `}
            >
              EN
            </button>

            <button
              type="button"
              aria-label={copy.amharicLabel}
              aria-pressed={
                currentLanguage === "am"
              }
              disabled={isSubmitting}
              onClick={() => setLanguage("am")}
              className={`
                h-8
                rounded-full
                px-3
                text-[10px]
                font-black
                tracking-[0.08em]
                transition

                disabled:cursor-not-allowed
                disabled:opacity-60

                sm:px-4

                ${
                  currentLanguage === "am"
                    ? "bg-[#b7ef00] text-black"
                    : "text-white/45 hover:text-white"
                }
              `}
            >
              አማ
            </button>
          </div>

          <Link
            href="/"
            aria-label={copy.backLabel}
            className="
              group
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/[0.035]
              text-white/65
              transition
              duration-300

              hover:border-[#b7ef00]/45
              hover:bg-[#b7ef00]
              hover:text-black

              sm:w-auto
              sm:gap-2
              sm:px-4
            "
          >
            <BackIcon
              className="
                h-4
                w-4
                transition-transform
                duration-300

                group-hover:-translate-x-0.5
              "
            />

            <span
              className="
                hidden
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]

                sm:inline
              "
            >
              {copy.backText}
            </span>
          </Link>
        </div>
      </header>

      <section
        className="
          relative
          z-10
          mx-auto
          grid
          min-h-[calc(100svh-90px)]
          w-full
          max-w-[1560px]
          items-center
          gap-10
          px-5
          pb-10
          pt-5

          sm:px-8
          sm:pb-14

          lg:grid-cols-[1.08fr_0.92fr]
          lg:gap-16
          lg:px-12
          lg:pb-16
          lg:pt-4

          xl:gap-24
          xl:px-16
        "
      >
        <div className="order-2 lg:order-1">
          <div className="max-w-[720px]">
            <div
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                border
                border-[#b7ef00]/20
                bg-[#b7ef00]/[0.055]
                px-4
                py-2
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#b7ef00]
                  shadow-[0_0_14px_rgba(183,239,0,0.8)]
                "
              />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.28em]
                  text-[#dfff61]

                  sm:text-[10px]
                "
              >
                {copy.securityBadge}
              </span>
            </div>

            <h1
              className="
                mt-7
                max-w-[720px]
                text-[clamp(3rem,10vw,7.1rem)]
                font-black
                leading-[0.87]
                tracking-[-0.075em]
                text-[#f5f6f0]

                lg:mt-9
              "
            >
              <span className="block">
                {copy.heroTitleFirst}
              </span>

              <span className="block text-[#b7ef00]">
                {copy.heroTitleSecond}
              </span>
            </h1>

            <p
              className="
                mt-7
                max-w-[590px]
                text-[13px]
                leading-[1.85]
                text-white/45

                sm:text-[15px]

                lg:mt-9
              "
            >
              {copy.heroDescription}
            </p>

            <div
              className="
                mt-8
                grid
                gap-3

                sm:grid-cols-3

                lg:mt-10
              "
            >
              {copy.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="
                    rounded-[22px]
                    border
                    border-white/[0.075]
                    bg-white/[0.025]
                    p-5
                    backdrop-blur-sm
                  "
                >
                  <p
                    className="
                      text-[18px]
                      font-black
                      tracking-[-0.04em]
                      text-white
                    "
                  >
                    {fact.value}
                  </p>

                  <p
                    className="
                      mt-1.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-white/30
                    "
                  >
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="
                mt-8
                grid
                gap-3

                sm:grid-cols-2

                lg:mt-10
              "
            >
              {copy.benefits.map(
                (benefit) => (
                  <div
                    key={benefit}
                    className="
                      flex
                      items-center
                      gap-3
                      text-[11px]
                      font-semibold
                      text-white/55

                      sm:text-[12px]
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#b7ef00]/25
                        bg-[#b7ef00]/[0.07]
                        text-[12px]
                        font-black
                        text-[#b7ef00]
                      "
                    >
                      ✓
                    </span>

                    <span>{benefit}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div
            className="
              relative
              mx-auto
              w-full
              max-w-[560px]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -inset-px
                rounded-[33px]
                bg-gradient-to-b
                from-white/20
                via-white/[0.045]
                to-[#b7ef00]/20
              "
            />

            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                bg-[#0b0d0a]/95
                p-5
                shadow-[0_35px_100px_rgba(0,0,0,0.55)]
                backdrop-blur-2xl

                sm:p-8

                lg:p-10
              "
            >
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-28
                  -top-32
                  h-[300px]
                  w-[300px]
                  rounded-full
                  bg-[#b7ef00]/10
                  blur-[100px]
                "
              />

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-8
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white/45
                  to-transparent
                "
              />

              <div className="relative">
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.3em]
                    text-[#b7ef00]

                    sm:text-[10px]
                  "
                >
                  {copy.memberLogin}
                </p>

                <h2
                  className="
                    mt-4
                    text-[clamp(2.1rem,8vw,3.8rem)]
                    font-black
                    leading-[0.92]
                    tracking-[-0.065em]
                    text-white
                  "
                >
                  {copy.welcome}
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[410px]
                    text-[12px]
                    leading-[1.75]
                    text-white/40

                    sm:text-[13px]
                  "
                >
                  {copy.loginDescription}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="
                  relative
                  mt-8
                  space-y-5

                  sm:mt-10
                "
              >
                <div>
                  <label
                    htmlFor="username"
                    className="
                      mb-2.5
                      block
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.19em]
                      text-white/45
                    "
                  >
                    {copy.usernameLabel}
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    inputMode="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={username}
                    disabled={isSubmitting}
                    placeholder={
                      copy.usernamePlaceholder
                    }
                    aria-invalid={Boolean(
                      errors.username,
                    )}
                    aria-describedby={
                      errors.username
                        ? "username-error"
                        : undefined
                    }
                    onChange={(event) => {
                      setUsername(
                        event.target.value,
                      );

                      setFormMessage("");

                      if (errors.username) {
                        setErrors(
                          (current) => ({
                            ...current,
                            username: undefined,
                          }),
                        );
                      }
                    }}
                    className={`
                      h-14
                      w-full
                      rounded-[18px]
                      border
                      bg-white/[0.035]
                      px-4
                      text-[13px]
                      text-white
                      outline-none
                      transition
                      duration-300
                      placeholder:text-white/20

                      focus:bg-white/[0.055]

                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      ${
                        errors.username
                          ? "border-red-400/60 focus:border-red-400/80"
                          : "border-white/[0.09] focus:border-[#b7ef00]/55"
                      }
                    `}
                  />

                  {errors.username && (
                    <p
                      id="username-error"
                      role="alert"
                      className="
                        mt-2
                        text-[11px]
                        text-red-300
                      "
                    >
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className="
                      mb-2.5
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <label
                      htmlFor="password"
                      className="
                        block
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.19em]
                        text-white/45
                      "
                    >
                      {copy.passwordLabel}
                    </label>

                    <a
                      href="mailto:gymhouse@gmail.com?subject=Gym%20House%20login%20help"
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.11em]
                        text-white/30
                        transition

                        hover:text-[#b7ef00]
                      "
                    >
                      {copy.help}
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      disabled={isSubmitting}
                      placeholder={
                        copy.passwordPlaceholder
                      }
                      aria-invalid={Boolean(
                        errors.password,
                      )}
                      aria-describedby={
                        errors.password
                          ? "password-error"
                          : undefined
                      }
                      onChange={(event) => {
                        setPassword(
                          event.target.value,
                        );

                        setFormMessage("");

                        if (errors.password) {
                          setErrors(
                            (current) => ({
                              ...current,
                              password: undefined,
                            }),
                          );
                        }
                      }}
                      className={`
                        h-14
                        w-full
                        rounded-[18px]
                        border
                        bg-white/[0.035]
                        px-4
                        pr-20
                        text-[13px]
                        text-white
                        outline-none
                        transition
                        duration-300
                        placeholder:text-white/20

                        focus:bg-white/[0.055]

                        disabled:cursor-not-allowed
                        disabled:opacity-60

                        ${
                          errors.password
                            ? "border-red-400/60 focus:border-red-400/80"
                            : "border-white/[0.09] focus:border-[#b7ef00]/55"
                        }
                      `}
                    />

                    <button
                      type="button"
                      disabled={isSubmitting}
                      aria-label={
                        showPassword
                          ? copy.hidePassword
                          : copy.showPassword
                      }
                      aria-pressed={showPassword}
                      onClick={() => {
                        setShowPassword(
                          (current) => !current,
                        );
                      }}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        rounded-full
                        px-3
                        py-2
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-white/30
                        transition

                        hover:bg-white/[0.06]
                        hover:text-white

                        disabled:cursor-not-allowed
                        disabled:opacity-45
                      "
                    >
                      {showPassword
                        ? copy.hide
                        : copy.show}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="password-error"
                      role="alert"
                      className="
                        mt-2
                        text-[11px]
                        text-red-300
                      "
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {formMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="
                      rounded-[16px]
                      border
                      border-red-400/25
                      bg-red-400/[0.07]
                      px-4
                      py-3
                      text-[11px]
                      leading-relaxed
                      text-red-200
                    "
                  >
                    {formMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="
                    group
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-[18px]
                    bg-[#b7ef00]
                    px-6
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-black
                    transition
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#ccff32]
                    hover:shadow-[0_16px_45px_rgba(183,239,0,0.18)]

                    active:translate-y-0
                    active:scale-[0.99]

                    disabled:pointer-events-none
                    disabled:cursor-not-allowed
                    disabled:opacity-65
                  "
                >
                  {isSubmitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-black/25
                          border-t-black
                        "
                      />

                      <span>
                        {copy.signingIn}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{copy.signIn}</span>

                      <ArrowIcon
                        className="
                          h-5
                          w-5
                          transition-transform
                          duration-300

                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </>
                  )}
                </button>
              </form>

              <div
                className="
                  relative
                  mt-8
                  border-t
                  border-white/[0.075]
                  pt-6
                  text-center
                "
              >
                <p className="text-[11px] text-white/35">
                  {copy.notMember}{" "}

                  <Link
                    href="/#membership"
                    className="
                      font-bold
                      text-white
                      transition

                      hover:text-[#b7ef00]
                    "
                  >
                    {copy.viewMembership}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}