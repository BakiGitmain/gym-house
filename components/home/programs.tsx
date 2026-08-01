import ScrollStack, {
  ScrollStackItem,
} from "@/components/ui/scroll-stack";

type ProgramIconName =
  | "cardio"
  | "strength"
  | "fat-loss"
  | "hiit";

type Program = {
  number: string;
  title: string;
  description: string;
  icon: ProgramIconName;
  duration: string;
  level: string;
};

const programs: Program[] = [
  {
    number: "01",
    title: "Cardio Training",
    description:
      "Boost endurance and heart health with high-energy cardio sessions designed to keep you moving, improve stamina, and make every workout feel stronger.",
    icon: "cardio",
    duration: "45–60 min",
    level: "All levels",
  },
  {
    number: "02",
    title: "Strength Build",
    description:
      "Develop power and resilience through expert-guided strength training tailored to your fitness level, goals, and personal progress.",
    icon: "strength",
    duration: "50–75 min",
    level: "Beginner to advanced",
  },
  {
    number: "03",
    title: "Fat Loss",
    description:
      "Shed unwanted fat with dynamic workout routines and effective fat-burning strategies designed to deliver lasting, sustainable results.",
    icon: "fat-loss",
    duration: "40–60 min",
    level: "All levels",
  },
  {
    number: "04",
    title: "HIIT Workouts",
    description:
      "Maximize calorie burn and improve fitness with short, intense high-intensity interval training sessions that challenge your entire body.",
    icon: "hiit",
    duration: "20–40 min",
    level: "Intermediate",
  },
];

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
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgramIcon({
  name,
}: {
  name: ProgramIconName;
}) {
  const iconClassName =
    "h-7 w-7 sm:h-8 sm:w-8";

  if (name === "cardio") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M4.5 16H9L12.2 9.5L17 23L21 14H27.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M16 27C14.8 26.1 7 20.3 7 13.5C7 9.9 9.5 7.5 12.8 7.5C14.4 7.5 15.4 8.2 16 9C16.6 8.2 17.6 7.5 19.2 7.5C22.5 7.5 25 9.9 25 13.5C25 20.3 17.2 26.1 16 27Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "strength") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M9.5 14.5C10.5 12.2 11.4 9.6 11.6 7L15.2 9.6L18.4 9.2L20 13.5"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8 15.5L11.2 18.2L12.5 24.8C13.9 25.6 15.5 26 17.2 26C22.6 26 26 22.2 26 17.7C26 15.9 24.7 14.6 23 14.6C21.8 14.6 20.8 15.2 20.2 16.1L17.2 17.8L13.5 15.6L11.2 13.5"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8 12.5L5.5 15L8.5 18"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "fat-loss") {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-hidden="true"
      >
        <path
          d="M18.3 4.5C19 9.4 14.1 11.1 14.1 15.2C14.1 17.1 15.2 18.4 16.4 19.2C16.1 16.6 18.4 15.2 20.1 12.6C22.8 15.1 25 18.1 25 21.4C25 26 21.2 28.5 16 28.5C10.8 28.5 7 25.5 7 20.8C7 15.5 11.2 12.5 13.1 8.2C14.1 11.1 15.2 12 15.2 12C15.2 8.8 17.1 6.8 18.3 4.5Z"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={iconClassName}
      aria-hidden="true"
    >
      <path
        d="M18.2 3.8C18.3 8 14.8 10.4 14.8 13.8C14.8 15.7 15.9 17 17.2 17.8C16.9 14.8 19.5 13.4 21.1 10.7C24.5 13.7 27 17.1 27 21C27 26 22.3 29 16 29C9.7 29 5 25.4 5 20.2C5 15.6 8.3 12.6 10.8 9.1C11.1 12.7 12.7 14 12.7 14C12.2 9.2 15.8 6.7 18.2 3.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ProgramCard({
  program,
}: {
  program: Program;
}) {
  return (
    <article className="group relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/10 bg-[#11130f] px-6 py-7 shadow-[0_18px_45px_rgba(0,0,0,0.42)] sm:min-h-[430px] sm:rounded-[34px] sm:px-9 sm:py-9 lg:min-h-[460px] lg:px-12 lg:py-11">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 15%, rgba(183,239,0,0.11), transparent 32%), linear-gradient(125deg, rgba(255,255,255,0.035), transparent 42%)",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full border border-[#b7ef00]/10" />

      <div className="pointer-events-none absolute -bottom-16 -right-6 h-40 w-40 rounded-full border border-[#b7ef00]/10" />

      <div className="relative z-10 flex min-h-[334px] flex-col sm:min-h-[358px] lg:min-h-[370px]">
        <div className="flex items-start justify-between gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#b7ef00]/25 bg-[#080908] text-[#b7ef00] sm:h-16 sm:w-16">
            <ProgramIcon name={program.icon} />
          </span>

          <span className="text-[12px] font-black tracking-[0.24em] text-white/25 sm:text-sm">
            {program.number}
          </span>
        </div>

        <div className="mt-9 max-w-[780px] sm:mt-11">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b7ef00] sm:text-xs">
            Training program
          </p>

          <h3 className="text-[clamp(2rem,6vw,4.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-[#f3f4e9]">
            {program.title}
          </h3>

          <p className="mt-5 max-w-[620px] text-[13px] leading-6 text-white/55 sm:text-[15px] sm:leading-7">
            {program.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 sm:text-[10px]">
                Duration
              </p>

              <p className="mt-1 text-sm font-bold text-white/85">
                {program.duration}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 sm:text-[10px]">
                Level
              </p>

              <p className="mt-1 text-sm font-bold text-white/85">
                {program.level}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between rounded-full bg-[#b7ef00] px-5 text-xs font-black uppercase tracking-[0.04em] text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:min-w-[160px]"
          >
            <span>See plan</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[#b7ef00]">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProgramsSection() {
  return (
    <section
      id="programs"
      className="relative border-b border-white/5 bg-[#080908] px-4 pb-16 pt-20 sm:px-7 sm:pb-24 sm:pt-24 lg:px-10 lg:pb-32 lg:pt-32 xl:px-16"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] max-w-full -translate-x-1/2 opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(183,239,0,0.12) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1180px]">
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#b7ef00] sm:text-xs">
            Built for your goals
          </p>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-[800px] text-[clamp(2.5rem,7vw,6rem)] font-black leading-[0.88] tracking-[-0.06em] text-[#f3f4e9]">
              Training That
              <span className="block text-[#efff9a]">
                Moves With You
              </span>
            </h2>

            <p className="max-w-[420px] text-[13px] leading-6 text-white/50 sm:text-[15px] sm:leading-7">
              Choose a program built around your
              strength, endurance and transformation
              goals.
            </p>
          </div>
        </div>

       <ScrollStack
  itemDistance={150}
  itemStackDistance={16}
  stackPosition="clamp(88px, 12vh, 118px)"
  endDistance="55vh"
>
  {programs.map((program) => (
    <ScrollStackItem
      key={program.title}
      itemClassName="mx-auto max-w-[1080px]"
    >
      <ProgramCard program={program} />
    </ScrollStackItem>
  ))}
</ScrollStack>
      </div>
    </section>
  );
}