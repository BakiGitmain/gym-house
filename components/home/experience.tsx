import Image from "next/image";
import Link from "next/link";

type ExperienceCard = {
  title: string;
  description: string;
  athleteImage: string;
  athleteAlt: string;
  statImage: string;
  statAlt: string;
  layout: "left-athlete" | "right-athlete";
};

const experienceCards: ExperienceCard[] = [
  {
    title: "Endurance Evolution",
    description:
      "Boost your stamina and resilience with tailored cardio and endurance workouts designed to keep you moving stronger for longer.",
    athleteImage:
      "/images/experience/endurance-athlete.png",
    athleteAlt:
      "Muscular athlete holding a dumbbell",
    statImage:
      "/images/experience/bpm-card.png",
    statAlt:
      "Heart rate fitness card showing 95 BPM",
    layout: "left-athlete",
  },
  {
    title: "Speed Surge",
    description:
      "Boost your agility and explosiveness with high-intensity sprint and movement drills. Speed Surge is designed to take your performance to the next level.",
    athleteImage:
      "/images/experience/speed-athlete.png",
    athleteAlt:
      "Muscular athlete holding a dumbbell",
    statImage:
      "/images/experience/steps-card.png",
    statAlt:
      "Fitness activity card showing 1024 steps",
    layout: "right-athlete",
  },
];

function ReadMoreButton() {
  return (
    <Link
      href="#programs"
      className="inline-flex h-9 min-w-[104px] items-center justify-center rounded-full bg-[#b7ef00] px-5 text-[10px] font-black uppercase tracking-[-0.01em] text-black transition-transform duration-200 hover:scale-[1.035] active:scale-[0.97] sm:h-10 sm:min-w-[116px] sm:text-[11px] lg:h-8 lg:min-w-[94px] lg:px-4 lg:text-[9px]"
    >
      Read More
    </Link>
  );
}

function AthleteImage({
  card,
}: {
  card: ExperienceCard;
}) {
  const athleteOnLeft =
    card.layout === "left-athlete";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[-2%] z-10 h-[80%] w-[64%] sm:h-[88%] sm:w-[61%] lg:bottom-[-3%] lg:h-[108%] lg:w-[63%] ${
        athleteOnLeft
          ? "left-[-9%] sm:left-[-6%] lg:left-[-8%]"
          : "right-[-9%] sm:right-[-6%] lg:right-[-8%]"
      }`}
    >
      <Image
        src={card.athleteImage}
        alt={card.athleteAlt}
        fill
        loading="eager"
        data-page-loader="true"
        sizes="(max-width: 639px) 65vw, (max-width: 1023px) 58vw, 340px"
        className={`select-none object-contain object-bottom grayscale ${
          athleteOnLeft
            ? "origin-bottom-left"
            : "origin-bottom-right"
        } scale-[1.06] lg:scale-[1.1]`}
      />
    </div>
  );
}

function StatImage({
  card,
}: {
  card: ExperienceCard;
}) {
  const athleteOnLeft =
    card.layout === "left-athlete";

  return (
    <div
      className={`pointer-events-none absolute bottom-[-7%] z-20 w-[43%] max-w-[220px] sm:bottom-[-8%] sm:w-[40%] lg:bottom-[-9%] lg:w-[43%] ${
        athleteOnLeft
          ? "right-[-4%] rotate-[-14deg] sm:right-[-2%] lg:right-[-5%]"
          : "left-[-4%] rotate-[18deg] sm:left-[-2%] lg:left-[-5%]"
      }`}
    >
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={card.statImage}
          alt={card.statAlt}
          fill
          loading="eager"
          data-page-loader="true"
          sizes="(max-width: 639px) 44vw, (max-width: 1023px) 38vw, 220px"
          className="select-none object-contain"
        />
      </div>
    </div>
  );
}

function CardContent({
  card,
}: {
  card: ExperienceCard;
}) {
  const athleteOnLeft =
    card.layout === "left-athlete";

  return (
    <div
      className={`absolute top-[7%] z-30 w-[58%] sm:top-[8%] sm:w-[56%] lg:top-[8%] lg:w-[53%] ${
        athleteOnLeft
          ? "right-[6%] text-right sm:right-[7%]"
          : "left-[7%] text-left"
      }`}
    >
      <h3 className="text-[clamp(1.45rem,6vw,2.25rem)] font-black leading-[0.92] tracking-[-0.055em] text-[#b7ef00] lg:text-[clamp(1.35rem,2vw,1.75rem)]">
        {card.title}
      </h3>

      <p className="mt-6 text-[12px] leading-[1.6] text-white/60 sm:mt-7 sm:text-[13px] sm:leading-[1.65] lg:mt-7 lg:text-[11px] lg:leading-[1.55]">
        {card.description}
      </p>

      <div className="mt-7 sm:mt-8 lg:mt-7">
        <ReadMoreButton />
      </div>
    </div>
  );
}

function ExperienceCard({
  card,
}: {
  card: ExperienceCard;
}) {
  const athleteOnLeft =
    card.layout === "left-athlete";

  return (
    <article
      className={`relative isolate h-[530px] overflow-hidden rounded-[28px] border border-white/[0.07] sm:h-[600px] sm:rounded-[32px] lg:h-[430px] lg:rounded-[30px] xl:h-[450px] ${
        athleteOnLeft
          ? ""
          : "lg:mt-[70px]"
      }`}
      style={{
        background:
          "linear-gradient(115deg, #1a1d17 0%, #171a14 48%, #10120e 100%)",
      }}
    >
      <AthleteImage card={card} />

      <StatImage card={card} />

      <CardContent card={card} />
    </article>
  );
}

export default function ExperienceSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 overflow-hidden border-b border-white/5 bg-black px-4 py-24 text-white sm:px-7 sm:py-32 lg:px-10 lg:py-36 xl:px-16"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mx-auto max-w-[1000px] text-center">
          <h2 className="text-[clamp(2.55rem,7vw,5.8rem)] font-black leading-[0.88] tracking-[-0.065em]">
            <span className="block text-[#f4f5ed]">
              Experience
            </span>

            <span className="mt-2 block text-[#eaff8e]">
              Fitness Like Never Before
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-[720px] text-[12px] leading-6 text-white/55 sm:mt-7 sm:text-[14px] sm:leading-7">
            Transform the way you train with
            innovative workouts, expert guidance,
            and state-of-the-art facilities.
          </p>
        </header>

        <div className="mx-auto mt-16 grid max-w-[1080px] grid-cols-1 gap-7 sm:mt-20 sm:gap-9 lg:mt-24 lg:grid-cols-2 lg:items-start lg:gap-[70px]">
          {experienceCards.map((card) => (
            <ExperienceCard
              key={card.title}
              card={card}
            />
          ))}
        </div>
      </div>
    </section>
  );
}