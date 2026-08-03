"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/components/providers/auth-provider";
import {
  useLanguage,
} from "@/components/providers/language-provider";
import type {
  CustomerMembership,
} from "@/lib/auth-api";

type PageLanguage =
  | "en"
  | "am";

type MembershipStatus =
  CustomerMembership["status"];

const copy = {
  en: {
    backHome: "Back to website",
    eyebrow: "Personal member space",
    title: "My account",

    description:
      "Your membership, account information, and Gym House access in one secure place.",

    logout: "Log out",
    loggingOut: "Logging out...",

    profileTitle: "Member profile",
    customerRole: "Gym House member",
    username: "Username",
    email: "Email",
    memberSince: "Member since",

    membershipTitle:
      "Membership overview",

    membershipStatus:
      "Membership status",

    startDate: "Start date",

    expirationDate:
      "Expiration date",

    remainingTime:
      "Remaining time",

    daysRemaining:
      "days remaining",

    dayRemaining:
      "day remaining",

    noDaysRemaining:
      "No remaining days",

    membershipProgress:
      "Membership progress",

    noMembershipTitle:
      "No membership is assigned",

    noMembershipDescription:
      "Contact Gym House administration to activate a membership for this account.",

    supportTitle: "Need help?",

    supportDescription:
      "Contact Gym House if your membership information does not look correct.",

    contactSupport:
      "Contact support",

    securityTitle:
      "Your account is protected",

    securityDescription:
      "This page uses your secure login session. Other customers cannot access your personal account information.",

    redirecting:
      "Redirecting...",

    loading:
      "Loading your account...",

    status: {
      active: "Active",
      inactive: "Inactive",
      scheduled: "Scheduled",
      paused: "Paused",
      cancelled: "Cancelled",
      expired: "Expired",
    },

    statusDescription: {
      active:
        "Your Gym House membership is currently active.",

      inactive:
        "There is no active membership attached to this account.",

      scheduled:
        "Your membership has been created and will begin on its scheduled start date.",

      paused:
        "Your membership has temporarily been paused by Gym House.",

      cancelled:
        "This membership has been cancelled.",

      expired:
        "Your membership period has ended.",
    },
  },

  am: {
    backHome: "ወደ ድረ ገጹ",
    eyebrow: "የግል አባል መለያ",
    title: "የእኔ መለያ",

    description:
      "የአባልነትዎን፣ የመለያዎንና የጂም ሃውስ መረጃዎን በአንድ ደህንነቱ በተጠበቀ ቦታ ይመልከቱ።",

    logout: "ውጣ",
    loggingOut: "በመውጣት ላይ...",

    profileTitle: "የአባል መገለጫ",
    customerRole: "የጂም ሃውስ አባል",
    username: "የተጠቃሚ ስም",
    email: "ኢሜይል",
    memberSince: "የተመዘገበበት ቀን",

    membershipTitle:
      "የአባልነት መረጃ",

    membershipStatus:
      "የአባልነት ሁኔታ",

    startDate: "መጀመሪያ ቀን",

    expirationDate:
      "ማብቂያ ቀን",

    remainingTime:
      "የቀረው ጊዜ",

    daysRemaining:
      "ቀናት ቀርተዋል",

    dayRemaining:
      "ቀን ቀርቷል",

    noDaysRemaining:
      "የቀረ ቀን የለም",

    membershipProgress:
      "የአባልነት እድገት",

    noMembershipTitle:
      "አባልነት አልተመደበም",

    noMembershipDescription:
      "ለዚህ መለያ አባልነት እንዲነቃ የጂም ሃውስ አስተዳዳሪን ያነጋግሩ።",

    supportTitle: "እገዛ ይፈልጋሉ?",

    supportDescription:
      "የአባልነት መረጃዎ ትክክል ካልመሰለዎት ጂም ሃውስን ያነጋግሩ።",

    contactSupport:
      "እገዛን ያነጋግሩ",

    securityTitle:
      "መለያዎ የተጠበቀ ነው",

    securityDescription:
      "ይህ ገጽ የእርስዎን ደህንነቱ የተጠበቀ የመግቢያ ክፍለ ጊዜ ይጠቀማል። ሌሎች ደንበኞች የግል መረጃዎን ማየት አይችሉም።",

    redirecting:
      "በመመለስ ላይ...",

    loading:
      "መለያዎን በመጫን ላይ...",

    status: {
      active: "ንቁ",
      inactive: "አልነቃም",
      scheduled: "የታቀደ",
      paused: "ቆሟል",
      cancelled: "ተሰርዟል",
      expired: "ጊዜው አልቋል",
    },

    statusDescription: {
      active:
        "የጂም ሃውስ አባልነትዎ በአሁኑ ጊዜ ንቁ ነው።",

      inactive:
        "ከዚህ መለያ ጋር የተገናኘ ንቁ አባልነት የለም።",

      scheduled:
        "አባልነትዎ ተፈጥሯል፤ በተያዘለት ቀን ይጀምራል።",

      paused:
        "አባልነትዎ ለጊዜው በጂም ሃውስ ቆሟል።",

      cancelled:
        "ይህ አባልነት ተሰርዟል።",

      expired:
        "የአባልነትዎ ጊዜ አልቋል።",
    },
  },
} as const;

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 12A4 4 0 1 0 12 4A4 4 0 1 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4.5 20C5.25 16.85 8.1 15 12 15C15.9 15 18.75 16.85 19.5 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="5.5"
        width="16"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 3.5V7.5M16 3.5V7.5M4 10H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 3L19 6V11.4C19 15.8 16.2 19.2 12 21C7.8 19.2 5 15.8 5 11.4V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9 12L11.1 14L15.2 9.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="M10 5H6.8C5.81 5 5 5.81 5 6.8V17.2C5 18.19 5.81 19 6.8 19H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M14 8L18 12L14 16M18 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <div className="text-center">
        <span
          aria-hidden="true"
          className="
            mx-auto
            block
            h-7
            w-7
            animate-spin
            rounded-full
            border-2
            border-white/10
            border-t-[#b7ef00]
          "
        />

        <p className="mt-4 text-[12px] text-white/40">
          {label}
        </p>
      </div>
    </main>
  );
}

function LoadingScreen({
  label,
}: {
  label: string;
}) {
  return (
    <main className="min-h-screen bg-[#050605] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-10 w-36 rounded-full bg-white/[0.06]" />

          <div className="h-10 w-28 rounded-full bg-white/[0.06]" />
        </div>

        <div className="mt-20">
          <div className="h-3 w-40 rounded-full bg-[#b7ef00]/10" />

          <div className="mt-5 h-20 max-w-xl rounded-[22px] bg-white/[0.06]" />

          <div className="mt-6 h-10 max-w-2xl rounded-[16px] bg-white/[0.04]" />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="h-[490px] rounded-[30px] bg-white/[0.045]" />

          <div className="h-[490px] rounded-[30px] bg-white/[0.045]" />
        </div>

        <p className="mt-8 text-center text-[11px] text-white/25">
          {label}
        </p>
      </div>
    </main>
  );
}

function formatDate(
  value: string | null,
  language: PageLanguage,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value.includes("T")
        ? value
        : `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "am"
      ? "am-ET"
      : "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function getMembershipProgress(
  startsAt: string | null,
  expiresAt: string | null,
) {
  if (
    !startsAt ||
    !expiresAt
  ) {
    return 0;
  }

  const start =
    new Date(
      `${startsAt.slice(0, 10)}T00:00:00`,
    ).getTime();

  const end =
    new Date(
      `${expiresAt.slice(0, 10)}T23:59:59`,
    ).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end <= start
  ) {
    return 0;
  }

  const progress =
    ((Date.now() - start) /
      (end - start)) *
    100;

  return Math.min(
    100,
    Math.max(0, progress),
  );
}

function getStatusClassName(
  status: MembershipStatus,
) {
  switch (status) {
    case "active":
      return "border-[#b7ef00]/25 bg-[#b7ef00]/[0.08] text-[#dfff61]";

    case "scheduled":
      return "border-sky-300/25 bg-sky-300/[0.08] text-sky-200";

    case "paused":
      return "border-amber-300/25 bg-amber-300/[0.08] text-amber-200";

    case "cancelled":
    case "expired":
      return "border-red-400/25 bg-red-400/[0.08] text-red-200";

    default:
      return "border-white/10 bg-white/[0.04] text-white/45";
  }
}

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    membership,
    isLoading,
    logout,
  } = useAuth();

  const { language } =
    useLanguage();

  const currentLanguage:
    PageLanguage =
    language === "am"
      ? "am"
      : "en";

  const text =
    copy[currentLanguage];

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    profileImageFailed,
    setProfileImageFailed,
  ] = useState(false);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [
    user?.profileImageUrl,
  ]);

  if (isLoading) {
    return (
      <LoadingScreen
        label={text.loading}
      />
    );
  }

  if (!user) {
    return (
      <RouteRedirect
        destination="/login"
        label={text.redirecting}
      />
    );
  }

  if (user.role === "admin") {
    return (
      <RouteRedirect
        destination="/admin/dashboard"
        label={text.redirecting}
      />
    );
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();

      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const status:
    MembershipStatus =
    membership?.status ??
    "inactive";

  const progress =
    membership
      ? getMembershipProgress(
          membership.startsAt,
          membership.expiresAt,
        )
      : 0;

  const remainingDays =
    membership?.remainingDays ??
    0;

  const remainingText =
    remainingDays <= 0
      ? text.noDaysRemaining
      : remainingDays === 1
        ? `1 ${text.dayRemaining}`
        : `${remainingDays} ${text.daysRemaining}`;

  const profileInitial =
    user.name
      .trim()
      .charAt(0)
      .toUpperCase() || "M";

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050605]
        px-4
        pb-20
        pt-5
        text-white

        sm:px-8
        sm:pt-7

        lg:px-12
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.03]
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)",

          backgroundSize:
            "72px 72px",
        }}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-48
          top-20
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#b7ef00]/10
          blur-[180px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-44
          -right-36
          h-[520px]
          w-[520px]
          rounded-full
          bg-[#b7ef00]/[0.055]
          blur-[180px]
        "
      />

      <div className="relative mx-auto max-w-6xl">
        <header
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <Link
            href="/"
            className="
              inline-flex
              h-11
              items-center
              gap-3
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-5
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              text-white/45
              transition

              hover:border-[#b7ef00]/30
              hover:text-[#b7ef00]
            "
          >
            <span aria-hidden="true">
              ←
            </span>

            <span>
              {text.backHome}
            </span>
          </Link>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => {
              void handleLogout();
            }}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2.5
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.025]
              px-5
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-white/45
              transition

              hover:border-red-400/25
              hover:bg-red-400/[0.06]
              hover:text-red-300

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isLoggingOut ? (
              <span
                aria-hidden="true"
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/15
                  border-t-white
                "
              />
            ) : (
              <LogoutIcon />
            )}

            <span>
              {isLoggingOut
                ? text.loggingOut
                : text.logout}
            </span>
          </button>
        </header>

        <section className="mt-16 lg:mt-24">
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
            {text.eyebrow}
          </p>

          <h1
            className="
              mt-4
              max-w-4xl
              text-[clamp(3.4rem,10vw,7.2rem)]
              font-black
              leading-[0.84]
              tracking-[-0.075em]
              text-[#f5f6f0]
            "
          >
            {text.title}
          </h1>

          <p
            className="
              mt-6
              max-w-2xl
              text-[13px]
              leading-7
              text-white/38

              sm:text-[15px]
            "
          >
            {text.description}
          </p>
        </section>

        <div
          className="
            mt-12
            grid
            items-start
            gap-6

            lg:grid-cols-[360px_1fr]
          "
        >
          <section
            className="
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.08]
              bg-[#0a0c09]/90
              shadow-[0_28px_90px_rgba(0,0,0,.42)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                relative
                flex
                flex-col
                items-center
                border-b
                border-white/[0.07]
                px-6
                pb-7
                pt-8
                text-center
              "
            >
              <div
                aria-hidden="true"
                className="
                  absolute
                  left-1/2
                  top-0
                  h-40
                  w-40
                  -translate-x-1/2
                  rounded-full
                  bg-[#b7ef00]/10
                  blur-[60px]
                "
              />

              <div
                aria-label={`${user.name} profile picture`}
                className="
                  relative
                  flex
                  h-[150px]
                  w-[150px]
                  min-w-[150px]
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-[#b7ef00]/30
                  bg-[#b7ef00]
                  text-4xl
                  font-black
                  text-black
                  shadow-[0_20px_60px_rgba(183,239,0,.12)]
                "
              >
                {user.profileImageUrl &&
                !profileImageFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      user.profileImageUrl
                    }
                    alt={`${user.name} profile`}
                    className="
                      absolute
                      inset-0
                      block
                      h-full
                      w-full
                      max-w-none
                      object-cover
                    "
                    style={{
                      objectPosition:
                        "center 25%",

                      transform:
                        "scale(1.85)",
                    }}
                    onError={() => {
                      setProfileImageFailed(
                        true,
                      );
                    }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="relative z-10"
                  >
                    {profileInitial}
                  </span>
                )}
              </div>

              <h2
                className="
                  mt-5
                  max-w-full
                  truncate
                  text-2xl
                  font-black
                  tracking-[-0.045em]
                "
              >
                {user.name}
              </h2>

              <p
                className="
                  mt-2
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.17em]
                  text-[#b7ef00]
                "
              >
                {text.customerRole}
              </p>
            </div>

            <div className="space-y-1 p-4">
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[16px]
                  px-3
                  py-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    text-white/35
                  "
                >
                  <UserIcon />
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-white/25
                    "
                  >
                    {text.username}
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      truncate
                      text-[12px]
                      font-bold
                      text-white/70
                    "
                  >
                    @{user.username}
                  </span>
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[16px]
                  px-3
                  py-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    text-white/35
                  "
                >
                  <span className="text-sm font-black">
                    @
                  </span>
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-white/25
                    "
                  >
                    {text.email}
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      truncate
                      text-[12px]
                      font-bold
                      text-white/70
                    "
                  >
                    {user.email}
                  </span>
                </span>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-[16px]
                  px-3
                  py-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    text-white/35
                  "
                >
                  <CalendarIcon />
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-white/25
                    "
                  >
                    {text.memberSince}
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-[12px]
                      font-bold
                      text-white/70
                    "
                  >
                    {formatDate(
                      user.registrationDate,
                      currentLanguage,
                    )}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section
            className="
              rounded-[30px]
              border
              border-white/[0.08]
              bg-[#0a0c09]/90
              p-5
              shadow-[0_28px_90px_rgba(0,0,0,.42)]
              backdrop-blur-xl

              sm:p-7

              lg:p-9
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5

                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.22em]
                    text-white/25
                  "
                >
                  Gym House
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-[-0.05em]

                    sm:text-4xl
                  "
                >
                  {text.membershipTitle}
                </h2>
              </div>

              <span
                className={`
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.14em]

                  ${getStatusClassName(
                    status,
                  )}
                `}
              >
                <span
                  aria-hidden="true"
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-current
                  "
                />

                {
                  text.status[
                    status
                  ]
                }
              </span>
            </div>

            <div
              className="
                mt-7
                rounded-[22px]
                border
                border-white/[0.07]
                bg-white/[0.022]
                p-5

                sm:p-6
              "
            >
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.17em]
                  text-white/25
                "
              >
                {text.membershipStatus}
              </p>

              <p
                className="
                  mt-3
                  max-w-2xl
                  text-[13px]
                  leading-6
                  text-white/55
                "
              >
                {
                  text.statusDescription[
                    status
                  ]
                }
              </p>
            </div>

            {membership ? (
              <>
                <div
                  className="
                    mt-5
                    grid
                    gap-3

                    sm:grid-cols-3
                  "
                >
                  <article
                    className="
                      rounded-[20px]
                      border
                      border-white/[0.07]
                      bg-white/[0.022]
                      p-5
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-white/25
                      "
                    >
                      {text.startDate}
                    </p>

                    <p
                      className="
                        mt-3
                        text-[13px]
                        font-bold
                        leading-5
                        text-white/75
                      "
                    >
                      {formatDate(
                        membership.startsAt,
                        currentLanguage,
                      )}
                    </p>
                  </article>

                  <article
                    className="
                      rounded-[20px]
                      border
                      border-white/[0.07]
                      bg-white/[0.022]
                      p-5
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-white/25
                      "
                    >
                      {text.expirationDate}
                    </p>

                    <p
                      className="
                        mt-3
                        text-[13px]
                        font-bold
                        leading-5
                        text-white/75
                      "
                    >
                      {formatDate(
                        membership.expiresAt,
                        currentLanguage,
                      )}
                    </p>
                  </article>

                  <article
                    className="
                      rounded-[20px]
                      border
                      border-[#b7ef00]/15
                      bg-[#b7ef00]/[0.04]
                      p-5
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-[#dfff61]/60
                      "
                    >
                      {text.remainingTime}
                    </p>

                    <p
                      className="
                        mt-3
                        text-[13px]
                        font-bold
                        leading-5
                        text-[#dfff61]
                      "
                    >
                      {remainingText}
                    </p>
                  </article>
                </div>

                <div
                  className="
                    mt-5
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-white/[0.022]
                    p-5

                    sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.15em]
                        text-white/30
                      "
                    >
                      {text.membershipProgress}
                    </p>

                    <p
                      className="
                        text-[11px]
                        font-black
                        text-[#dfff61]
                      "
                    >
                      {Math.round(progress)}%
                    </p>
                  </div>

                  <div
                    className="
                      mt-4
                      h-2
                      overflow-hidden
                      rounded-full
                      bg-white/[0.06]
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-[#b7ef00]
                        shadow-[0_0_20px_rgba(183,239,0,.35)]
                        transition-[width]
                        duration-700
                      "
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div
                className="
                  mt-5
                  flex
                  min-h-[260px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[24px]
                  border
                  border-dashed
                  border-white/[0.1]
                  bg-white/[0.015]
                  px-6
                  text-center
                "
              >
                <span
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    text-white/30
                  "
                >
                  <CalendarIcon />
                </span>

                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                    tracking-[-0.035em]
                  "
                >
                  {text.noMembershipTitle}
                </h3>

                <p
                  className="
                    mt-3
                    max-w-md
                    text-[12px]
                    leading-6
                    text-white/35
                  "
                >
                  {text.noMembershipDescription}
                </p>
              </div>
            )}

            <div
              className="
                mt-5
                grid
                gap-3

                sm:grid-cols-2
              "
            >
              <article
                className="
                  rounded-[22px]
                  border
                  border-[#b7ef00]/15
                  bg-[#b7ef00]/[0.035]
                  p-5
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#b7ef00]/20
                    bg-[#b7ef00]/[0.07]
                    text-[#dfff61]
                  "
                >
                  <ShieldIcon />
                </span>

                <h3
                  className="
                    mt-4
                    text-[14px]
                    font-black
                    tracking-[-0.025em]
                  "
                >
                  {text.securityTitle}
                </h3>

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-white/35
                  "
                >
                  {text.securityDescription}
                </p>
              </article>

              <article
                className="
                  rounded-[22px]
                  border
                  border-white/[0.07]
                  bg-white/[0.022]
                  p-5
                "
              >
                <h3
                  className="
                    text-[14px]
                    font-black
                    tracking-[-0.025em]
                  "
                >
                  {text.supportTitle}
                </h3>

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-white/35
                  "
                >
                  {text.supportDescription}
                </p>

                <a
                  href="mailto:gymhouse@gmail.com?subject=Gym%20House%20membership%20support"
                  className="
                    mt-4
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/[0.09]
                    bg-white/[0.03]
                    px-4
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-white/50
                    transition

                    hover:border-[#b7ef00]/30
                    hover:text-[#b7ef00]
                  "
                >
                  {text.contactSupport}
                </a>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}