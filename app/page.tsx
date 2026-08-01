import Image from "next/image";
import Link from "next/link";

import FeaturesSection from "@/components/home/features";
import ProgramsSection from "@/components/home/programs";
import Navbar from "@/components/layout/navbar";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MemberAvatars() {
  return (
    <div className="flex items-center">
      <div className="relative z-30 h-11 w-11 overflow-hidden rounded-full border-2 border-[#080908] bg-[#252525]">
        <Image
          src="/images/hero-athleteV3.png"
          alt=""
          fill
          sizes="44px"
          className="scale-[2.6] object-cover object-[49%_18%]"
        />
      </div>

      <div className="relative z-20 -ml-3 h-11 w-11 overflow-hidden rounded-full border-2 border-[#080908] bg-[#1a1a1a]">
        <Image
          src="/images/hero-athleteV3.png"
          alt=""
          fill
          sizes="44px"
          className="scale-[2.8] object-cover object-[53%_24%]"
        />

        <div className="absolute inset-0 bg-[#a7e500]/10" />
      </div>

      <div className="relative z-10 -ml-3 h-11 w-11 overflow-hidden rounded-full border-2 border-[#080908] bg-[#202020]">
        <Image
          src="/images/hero-athleteV3.png"
          alt=""
          fill
          sizes="44px"
          className="scale-[2.5] object-cover object-[46%_20%]"
        />

        <div className="absolute inset-0 bg-white/5" />
      </div>
    </div>
  );
}

function CommunityCount() {
  return (
    <div className="flex items-center gap-4">
      <MemberAvatars />

      <div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-black leading-none tracking-[-0.05em] text-white">
            12K
            <span className="text-[#b7ef00]">+</span>
          </p>

          <span className="mb-0.5 text-xs font-medium text-white/45">
            members
          </span>
        </div>

        <p className="mt-1 text-xs text-white/45">
          Stronger every day
        </p>
      </div>
    </div>
  );
}

function StartButton({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <Link
      href="#programs"
      className={`group min-h-14 items-center justify-between rounded-full bg-[#b7ef00] px-6 text-sm font-black uppercase tracking-[-0.01em] text-black transition duration-300 hover:scale-[1.03] active:scale-[0.98] ${
        mobile
          ? "flex w-full sm:w-auto sm:min-w-[195px]"
          : "hidden min-w-[195px] lg:flex"
      }`}
    >
      <span>Let&apos;s start</span>

      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#b7ef00] transition-transform duration-300 group-hover:rotate-45">
        <ArrowIcon />
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="overflow-x-clip bg-[#080908] text-white">
        <section
          id="home"
          className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden border-b border-[#b7ef00]/20 sm:min-h-[calc(100svh-84px)] lg:min-h-[calc(100svh-96px)]"
        >
          <div
            className="pointer-events-none absolute inset-0 -z-20"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.035) 23%, rgba(8,9,8,0) 53%)",
            }}
          />

          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-20 h-[70%] w-[70%] -translate-x-1/2 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(183,239,0,0.09) 0%, rgba(8,9,8,0) 67%)",
            }}
          />

          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "70px 70px",
              }}
            />
          </div>

          <div className="pointer-events-none absolute left-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 px-5 text-[11px] font-medium tracking-[0.55em] text-white/45 xl:flex">
            <span>P</span>
            <span>R</span>
            <span>E</span>
            <span>V</span>

            <div className="mt-3 h-12 w-px bg-gradient-to-b from-[#b7ef00] to-transparent" />
          </div>

          <div className="pointer-events-none absolute right-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 px-5 text-[11px] font-medium tracking-[0.55em] text-white/45 xl:flex">
            <div className="mb-3 h-12 w-px bg-gradient-to-t from-[#b7ef00] to-transparent" />

            <span>N</span>
            <span>E</span>
            <span>X</span>
            <span>T</span>
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-[1600px] flex-col px-5 pb-8 pt-10 sm:min-h-[calc(100svh-84px)] sm:px-8 sm:pt-10 lg:min-h-[calc(100svh-96px)] lg:px-12 lg:pb-10 lg:pt-8 xl:px-16">
            <div className="relative z-10 mx-auto w-full max-w-[1450px] text-center">
              <p className="mb-4 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.36em] text-[#b7ef00] sm:text-xs sm:tracking-[0.42em]">
                Build strength. Build confidence.
              </p>

              <h1 className="w-full text-[clamp(1.9rem,8.7vw,2.55rem)] font-black leading-[0.88] tracking-[-0.065em] sm:text-[clamp(3rem,7.2vw,7.6rem)] sm:leading-[0.86]">
                <span className="block whitespace-nowrap">
                  <span className="text-[#efffc8]">
                    Sculpt{" "}
                  </span>

                  <span className="text-[#efffc8]/25">
                    Your{" "}
                  </span>

                  <span className="text-[#efffc8]">
                    Body,
                  </span>
                </span>

                <span className="block whitespace-nowrap">
                  <span className="text-[#efffc8]">
                    Elevate{" "}
                  </span>

                  <span className="text-[#efffc8]/25">
                    Your{" "}
                  </span>

                  <span className="text-[#efffc8]">
                    Spirit
                  </span>
                </span>
              </h1>
            </div>

            <div className="relative z-20 mx-auto -mt-8 w-full max-w-[840px] sm:-mt-8 lg:-mt-20">
              <div className="pointer-events-none absolute bottom-[8%] left-1/2 -z-10 h-[20%] w-[72%] -translate-x-1/2 rounded-full bg-black/80 blur-3xl" />

              <Image
                src="/images/hero-athleteV3.png"
                alt="Muscular fitness athlete holding a dumbbell"
                width={1200}
                height={1200}
                priority
                data-page-loader="true"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 840px"
                className="h-auto w-full origin-top select-none object-contain"
              />
            </div>

            <div className="relative z-30 -mt-6 flex flex-col gap-5 sm:-mt-10 sm:flex-row sm:items-center sm:justify-between lg:hidden">
              <CommunityCount />

              <StartButton mobile />
            </div>

            <div className="pointer-events-none absolute bottom-12 left-12 z-30 hidden lg:block xl:left-16">
              <CommunityCount />
            </div>

            <div className="absolute bottom-12 right-12 z-30 xl:right-16">
              <StartButton />
            </div>

            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-white/25 lg:hidden">
              Scroll to explore
            </p>
          </div>
        </section>

        <FeaturesSection />

<ProgramsSection />
      </main>
    </>
  );
}