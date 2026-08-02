"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { useLanguage } from "@/components/providers/language-provider";
import type { Language } from "@/lib/translations";

type LanguageGateProps = {
  children: ReactNode;
};

type LanguageOptionProps = {
  language: Language;
  shortName: string;
  name: string;
  nativeName: string;
  description: string;
  onSelect: (language: Language) => void;
};

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3.5 12H20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 3C14.3 5.45 15.6 8.6 15.6 12C15.6 15.4 14.3 18.55 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 3C9.7 5.45 8.4 8.6 8.4 12C8.4 15.4 9.7 18.55 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LanguageOption({
  language,
  shortName,
  name,
  nativeName,
  description,
  onSelect,
}: LanguageOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(language)}
      className="group relative min-h-[190px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 text-left transition duration-500 hover:-translate-y-1 hover:border-[#b7ef00]/55 hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7ef00] sm:min-h-[215px] sm:p-7"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#b7ef00]/0 blur-3xl transition duration-500 group-hover:bg-[#b7ef00]/10" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span className="flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 px-3 text-xs font-black tracking-[0.12em] text-[#b7ef00]">
            {shortName}
          </span>

          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition duration-500 group-hover:rotate-45 group-hover:border-[#b7ef00]/40 group-hover:bg-[#b7ef00] group-hover:text-black">
            <ArrowIcon />
          </span>
        </div>

        <div className="mt-auto pt-8">
          <p className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
            {name}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#b7ef00]">
            {nativeName}
          </p>

          <p className="mt-4 max-w-[290px] text-sm leading-6 text-white/45">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function LanguageSelectionScreen() {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };
  }, []);

  return (
    <main className="fixed inset-0 z-[100000] overflow-y-auto bg-[#080908] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "74px 74px",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "rgba(183, 239, 0, 0.11)",
        }}
      />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1100px] flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto w-full max-w-[850px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b7ef00] text-black">
                <GlobeIcon />
              </span>

              <span className="text-sm font-black uppercase tracking-[-0.03em]">
                GYM{" "}
                <span className="text-[#b7ef00]">
                  House
                </span>
              </span>
            </div>

            <span className="hidden text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 sm:block">
              English / አማርኛ
            </span>
          </div>

          <div className="mt-14 text-center sm:mt-20">
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b7ef00] sm:text-xs">
              Welcome · እንኳን ደህና መጡ
            </p>

            <h1 className="mx-auto mt-5 max-w-[760px] text-[clamp(2.4rem,8vw,5.6rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#efffc8]">
              Choose your
              <span className="block text-white/25">
                language
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[520px] text-sm leading-7 text-white/45 sm:text-base">
              Select how you would like to
              experience GYM House.
              <span className="mt-1 block">
                GYM Houseን በየትኛው ቋንቋ
                መጠቀም ይፈልጋሉ?
              </span>
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
            <LanguageOption
              language="en"
              shortName="EN"
              name="English"
              nativeName="English"
              description="Continue to the GYM House website in English."
              onSelect={setLanguage}
            />

            <LanguageOption
              language="am"
              shortName="አማ"
              name="አማርኛ"
              nativeName="Amharic"
              description="ወደ GYM House ድረ ገጽ በአማርኛ ይቀጥሉ።"
              onSelect={setLanguage}
            />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25 sm:text-xs">
            <span className="h-px w-8 bg-white/10" />

            <span>
              Your choice will be remembered
            </span>

            <span className="h-px w-8 bg-white/10" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LanguageGate({
  children,
}: LanguageGateProps) {
  const { language, isLanguageReady } =
    useLanguage();

  if (!isLanguageReady) {
    return (
      <div className="fixed inset-0 z-[100000] bg-[#080908]">
        <span className="sr-only">
          Preparing language settings
        </span>
      </div>
    );
  }

  if (!language) {
    return <LanguageSelectionScreen />;
  }

  return children;
}