"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "@/components/providers/auth-provider";
import {
  useLanguage,
} from "@/components/providers/language-provider";

type NavbarAccountActionProps = {
  variant:
    | "desktop"
    | "mobile";

  tabIndex?: number;
  onNavigate?: () => void;
};

function ChevronIcon({
  isOpen,
}: {
  isOpen: boolean;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      <path
        d="M5.5 7.5L10 12L14.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="simple-arrow-icon"
    >
      <path
        d="M7 17L17 7M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="M12 8.4A3.6 3.6 0 1 0 12 15.6A3.6 3.6 0 1 0 12 8.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M19.2 13.1V10.9L17.1 10.2C16.95 9.75 16.75 9.32 16.5 8.93L17.45 6.95L15.9 5.4L13.92 6.35C13.53 6.1 13.1 5.9 12.65 5.75L11.95 3.65H9.75L9.05 5.75C8.6 5.9 8.17 6.1 7.78 6.35L5.8 5.4L4.25 6.95L5.2 8.93C4.95 9.32 4.75 9.75 4.6 10.2L2.5 10.9V13.1L4.6 13.8C4.75 14.25 4.95 14.68 5.2 15.07L4.25 17.05L5.8 18.6L7.78 17.65C8.17 17.9 8.6 18.1 9.05 18.25L9.75 20.35H11.95L12.65 18.25C13.1 18.1 13.53 17.9 13.92 17.65L15.9 18.6L17.45 17.05L16.5 15.07C16.75 14.68 16.95 14.25 17.1 13.8L19.2 13.1Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.7"
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

function AccountAvatar({
  name,
  imageUrl,
  large = false,
}: {
  name: string;
  imageUrl: string | null;
  large?: boolean;
}) {
  const initial =
    name.trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#b7ef00] bg-cover bg-center font-black text-black ${
        large
          ? "h-12 w-12 text-sm"
          : "h-10 w-10 text-xs"
      }`}
      style={
        imageUrl
          ? {
              backgroundImage:
                `url("${imageUrl}")`,
            }
          : undefined
      }
    >
      {!imageUrl && initial}
    </span>
  );
}

export default function NavbarAccountAction({
  variant,
  tabIndex,
  onNavigate,
}: NavbarAccountActionProps) {
  const router = useRouter();

  const {
    user,
    isLoading,
    logout,
  } = useAuth();

  const { language } =
    useLanguage();

  const currentLanguage =
    language === "am"
      ? "am"
      : "en";

  const [isOpen, setIsOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const text =
    currentLanguage === "am"
      ? {
          login: "ግባ",
          checking: "በመፈተሽ ላይ...",
          signedIn:
            "የገቡበት መለያ",
          administrator:
            "አስተዳዳሪ",
          customer: "ደንበኛ",
          dashboard: "ዳሽቦርድ",
          account: "የእኔ መለያ",
          settings: "ቅንብሮች",
          logout: "ውጣ",
          openMenu:
            "የመለያ ምናሌን ክፈት",
        }
      : {
          login: "Login",
          checking: "Checking...",
          signedIn:
            "Signed in account",
          administrator:
            "Administrator",
          customer: "Customer",
          dashboard:
            "Dashboard",
          account: "My account",
          settings:
            "Admin settings",
          logout: "Log out",
          openMenu:
            "Open account menu",
        };

  useEffect(() => {
    function closeOnOutsideClick(
      event: PointerEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      closeOnOutsideClick,
    );

    document.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOnOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);

  async function handleLogout() {
    setIsOpen(false);

    await logout();

    onNavigate?.();

    router.replace("/");
    router.refresh();
  }

  if (isLoading) {
    return variant === "desktop" ? (
      <div className="hidden h-14 w-[230px] animate-pulse items-center gap-3 rounded-2xl bg-white/[0.035] px-3 lg:flex">
        <span className="h-10 w-10 rounded-full bg-white/10" />

        <span className="flex-1">
          <span className="block h-2.5 w-24 rounded bg-white/10" />
          <span className="mt-2 block h-2 w-32 rounded bg-white/[0.06]" />
        </span>
      </div>
    ) : (
      <div className="mt-4 rounded-2xl border border-white/[0.07] p-4 text-xs text-white/35">
        {text.checking}
      </div>
    );
  }

  if (!user) {
    return variant === "desktop" ? (
      <Link
        href="/login"
        className="simple-navbar-cta"
      >
        <span>{text.login}</span>
        <ArrowIcon />
      </Link>
    ) : (
      <Link
        href="/login"
        tabIndex={tabIndex}
        onClick={onNavigate}
        className="simple-mobile-cta"
      >
        <span>{text.login}</span>

        <span className="simple-mobile-cta-icon">
          <ArrowIcon />
        </span>
      </Link>
    );
  }

  const primaryHref =
    user.role === "admin"
      ? "/admin/dashboard"
      : "/account";

  const primaryLabel =
    user.role === "admin"
      ? text.dashboard
      : text.account;

  const roleLabel =
    user.role === "admin"
      ? text.administrator
      : text.customer;

  const actionClassName =
    "flex h-11 items-center gap-3 rounded-[14px] px-3 text-[11px] font-bold text-white/50 transition hover:bg-white/[0.055] hover:text-white";

  if (variant === "mobile") {
    return (
      <div className="mt-4 rounded-[22px] border border-white/[0.08] bg-white/[0.028] p-3">
        <div className="flex min-w-0 items-center gap-3">
          <AccountAvatar
            name={user.name}
            imageUrl={
              user.profileImageUrl
            }
            large
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {user.name}
            </p>

            <p className="mt-1 truncate text-[10px] text-white/35">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-3 border-t border-white/[0.07] pt-2">
          <Link
            href={primaryHref}
            tabIndex={tabIndex}
            onClick={onNavigate}
            className={actionClassName}
          >
            <DashboardIcon />
            <span>
              {primaryLabel}
            </span>
          </Link>

          {user.role ===
            "admin" && (
            <Link
              href="/admin/settings"
              tabIndex={tabIndex}
              onClick={
                onNavigate
              }
              className={
                actionClassName
              }
            >
              <SettingsIcon />
              <span>
                {text.settings}
              </span>
            </Link>
          )}

          <button
            type="button"
            tabIndex={tabIndex}
            onClick={() => {
              void handleLogout();
            }}
            className={`${actionClassName} w-full hover:bg-red-400/[0.08] hover:text-red-300`}
          >
            <LogoutIcon />
            <span>{text.logout}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="relative hidden justify-self-end lg:block"
    >
      <button
        type="button"
        aria-label={
          text.openMenu
        }
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(
            (current) =>
              !current,
          );
        }}
        className="group flex h-14 w-[250px] min-w-0 items-center gap-3 rounded-[17px] px-2.5 text-left transition hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7ef00]/45"
      >
        <AccountAvatar
          name={user.name}
          imageUrl={
            user.profileImageUrl
          }
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold text-white">
            {user.name}
          </span>

          <span className="mt-1 block truncate text-[9px] text-white/35">
            {user.email}
          </span>
        </span>

        <span className="mr-1 text-white/25 transition group-hover:text-white/60">
          <ChevronIcon
            isOpen={isOpen}
          />
        </span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={`absolute right-0 top-[calc(100%+12px)] w-[270px] origin-top-right rounded-[22px] border border-white/[0.09] bg-[#0b0c0a]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,.58)] backdrop-blur-2xl transition duration-200 ${
          isOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="rounded-[17px] border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
            {text.signedIn}
          </p>

          <p className="mt-2 truncate text-[12px] font-bold text-white">
            {user.name}
          </p>

          <p className="mt-1 truncate text-[10px] text-white/35">
            {user.email}
          </p>

          <span className="mt-3 inline-flex rounded-full bg-[#b7ef00]/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.13em] text-[#dfff61]">
            {roleLabel}
          </span>
        </div>

        <div className="mt-2">
          <Link
            href={primaryHref}
            onClick={() => {
              setIsOpen(false);
            }}
            className={actionClassName}
          >
            <DashboardIcon />
            <span>
              {primaryLabel}
            </span>
          </Link>

          {user.role ===
            "admin" && (
            <Link
              href="/admin/settings"
              onClick={() => {
                setIsOpen(
                  false,
                );
              }}
              className={
                actionClassName
              }
            >
              <SettingsIcon />

              <span>
                {text.settings}
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className={`${actionClassName} w-full hover:bg-red-400/[0.08] hover:text-red-300`}
          >
            <LogoutIcon />
            <span>{text.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}