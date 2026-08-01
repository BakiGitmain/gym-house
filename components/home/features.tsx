import Image from "next/image";

type FeatureIconName =
  | "nutrition"
  | "trainer"
  | "progress"
  | "premium"
  | "community"
  | "spaces";

type Feature = {
  title: string;
  icon: FeatureIconName;
};

const features: Feature[] = [
  {
    title: "Nutrition Guidance",
    icon: "nutrition",
  },
  {
    title: "Expert Trainers",
    icon: "trainer",
  },
  {
    title: "Progress Tracking",
    icon: "progress",
  },
  {
    title: "Premium Membership",
    icon: "premium",
  },
  {
    title: "Community Support",
    icon: "community",
  },
  {
    title: "Next-Level Fitness Spaces",
    icon: "spaces",
  },
];

function FeatureIcon({
  name,
}: {
  name: FeatureIconName;
}) {
  const iconClassName =
    "h-[14px] w-[14px] sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]";

  if (name === "nutrition") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M12 20V10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <path
          d="M12 13.5C8.3 13.5 5.5 10.7 5.5 7C9.2 7 12 9.8 12 13.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        <path
          d="M12 10.5C12 6.8 14.8 4 18.5 4C18.5 7.7 15.7 10.5 12 10.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "trainer") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="5"
          r="2.1"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M9 9.2C10 8.5 11 8.2 12 8.2C13 8.2 14 8.5 15 9.2V14H9V9.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <path
          d="M8.7 20V15.2L6.2 17.1M15.3 20V15.2L17.8 17.1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8.5 10.2L5 12.2M15.5 10.2L19 12.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M3.5 10.4V14M20.5 10.4V14M2.2 11.5V12.9M21.8 11.5V12.9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M5 19V12M10 19V8M15 19V14M20 19V5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M4.5 8.5L9.5 4.5L14.5 9L20 3.5M17.4 3.5H20V6.1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "premium") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M4 7L8.2 10.3L12 5L15.8 10.3L20 7L18.5 17H5.5L4 7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M6 20H18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "community") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="8"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <circle
          cx="6"
          cy="10.5"
          r="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <circle
          cx="18"
          cy="10.5"
          r="2"
          stroke="currentColor"
          strokeWidth="1.7"
        />

        <path
          d="M7.7 19C7.7 16.3 9.6 14.5 12 14.5C14.4 14.5 16.3 16.3 16.3 19"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M2.8 18C2.8 15.9 4.2 14.5 6 14.5C6.7 14.5 7.3 14.7 7.8 15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M21.2 18C21.2 15.9 19.8 14.5 18 14.5C17.3 14.5 16.7 14.7 16.2 15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
      aria-hidden="true"
    >
      <path
        d="M7 9L9 7L17 15L15 17L7 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M4.5 6.5L7.5 9.5M3 8L6 5M16.5 14.5L19.5 17.5M18 19L21 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M7.5 16.5L9.5 14.5M14.5 9.5L16.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-white/5 bg-[#080908] px-4 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32 xl:px-16"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(190,255,0,0.13) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1360px]">
        <div className="mx-auto max-w-[1040px] text-center">
          <h2 className="text-[clamp(2.25rem,6.4vw,5rem)] font-black leading-[0.98] tracking-[-0.055em]">
            <span className="block text-[#f3f4e9]">
              Inspired to
            </span>

            <span className="mt-1 block text-[#efff9a] sm:mt-2">
              Inspire Your Best Self
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-[680px] px-2 text-[13px] leading-6 text-white/60 sm:text-[15px]">
            We&apos;re your partner in achieving a healthier, stronger, and
            more confident you.
          </p>
        </div>

        <div className="relative mt-12 h-[350px] overflow-hidden rounded-[26px] border border-white/10 bg-[#10130e] sm:mt-16 sm:h-[350px] sm:rounded-[30px] lg:mt-20 lg:h-[390px] lg:rounded-[34px] xl:h-[410px]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 85% 20%, rgba(185,255,0,0.06), transparent 38%), linear-gradient(115deg, rgba(255,255,255,0.025), transparent 45%)",
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="absolute inset-y-0 right-[-6%] z-10 w-[56%] sm:w-[42%] lg:w-[43%] xl:w-[42%]">
            <Image
              src="/images/trainer.png"
              alt="Muscular fitness trainer"
              fill
              priority
              data-page-loader="true"
              sizes="(max-width: 639px) 56vw, (max-width: 1023px) 42vw, 560px"
              className="select-none object-contain object-bottom"
              style={{
                objectPosition: "100% 100%",
                transform:
                  "scale(1.08) translateX(2%)",
                transformOrigin:
                  "right bottom",
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-[30%] z-20 w-[24%] bg-gradient-to-r from-[#10130e] via-[#10130e]/85 to-transparent sm:right-[29%] sm:w-[20%] lg:right-[30%]" />

          <div className="pointer-events-none absolute bottom-[-16px] right-[-3%] z-20 h-[70px] w-[47%] rounded-full bg-black/60 blur-2xl" />

          <ul className="relative z-30 grid h-full w-[63%] grid-cols-1 content-center gap-y-3.5 px-4 py-5 sm:w-[70%] sm:grid-cols-2 sm:gap-x-7 sm:gap-y-7 sm:px-7 lg:w-[69%] lg:gap-x-12 lg:gap-y-9 lg:px-12 xl:w-[70%] xl:gap-x-16 xl:px-16">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="flex min-w-0 items-center gap-2.5 sm:gap-3 lg:gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b7ef00]/65 bg-[#b7ef00]/5 text-[#b7ef00] sm:h-9 sm:w-9 lg:h-11 lg:w-11">
                  <FeatureIcon name={feature.icon} />
                </span>

                <span className="max-w-[150px] text-[10px] font-bold leading-[1.15] tracking-[-0.025em] text-[#f5f6ef] sm:max-w-[180px] sm:text-[12px] lg:max-w-none lg:text-[16px] xl:text-[17px]">
                  {feature.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}