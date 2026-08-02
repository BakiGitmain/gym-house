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
      className="
        inline-flex
        h-[30px]
        min-w-[94px]
        items-center
        justify-center
        rounded-full
        bg-[#b7ef00]
        px-4
        text-[9px]
        font-black
        capitalize
        text-black
        transition-transform
        duration-300
        hover:scale-[1.04]
        active:scale-[0.97]

        sm:h-[34px]
        sm:min-w-[106px]
        sm:px-5
        sm:text-[10px]

        xl:h-[36px]
        xl:min-w-[112px]
        xl:text-[10px]
      "
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
      className={`
        pointer-events-none
        absolute
        z-10

        ${
          athleteOnLeft
            ? `
              bottom-[-4%]
              left-[-9%]
              h-[108%]
              w-[66%]

              sm:left-[-7%]
              sm:h-[112%]
              sm:w-[64%]

              lg:bottom-[-5%]
              lg:left-[-8%]
              lg:h-[113%]
              lg:w-[64%]

              xl:left-[-7%]
              xl:h-[116%]
              xl:w-[64%]
            `
            : `
              bottom-[-5%]
              right-[-10%]
              h-[109%]
              w-[68%]

              sm:right-[-8%]
              sm:h-[113%]
              sm:w-[66%]

              lg:bottom-[-5%]
              lg:right-[-9%]
              lg:h-[114%]
              lg:w-[67%]

              xl:right-[-8%]
              xl:h-[117%]
              xl:w-[67%]
            `
        }
      `}
    >
      <Image
        src={card.athleteImage}
        alt={card.athleteAlt}
        fill
        priority
        data-page-loader="true"
        sizes="
          (max-width: 639px) 68vw,
          (max-width: 1023px) 62vw,
          620px
        "
        className={`
          select-none
          object-contain
          object-bottom
          grayscale

          ${
            athleteOnLeft
              ? "origin-bottom-left"
              : "origin-bottom-right"
          }
        `}
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.98) 82%, rgba(0,0,0,0.78) 89%, rgba(0,0,0,0.25) 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.98) 82%, rgba(0,0,0,0.78) 89%, rgba(0,0,0,0.25) 96%, transparent 100%)",
        }}
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
      aria-hidden="true"
      className={`
        pointer-events-none
        absolute
        z-20
        aspect-[4/5]

        ${
          athleteOnLeft
            ? `
              bottom-[-13%]
              right-[-7%]
              w-[48%]
              rotate-[-14deg]

              sm:bottom-[-14%]
              sm:right-[-5%]
              sm:w-[46%]

              lg:bottom-[-16%]
              lg:right-[-7%]
              lg:w-[48%]

              xl:bottom-[-17%]
              xl:right-[-6%]
              xl:w-[47%]
            `
            : `
              bottom-[-16%]
              left-[-10%]
              w-[51%]
              rotate-[17deg]

              sm:bottom-[-17%]
              sm:left-[-8%]
              sm:w-[49%]

              lg:bottom-[-18%]
              lg:left-[-10%]
              lg:w-[51%]

              xl:bottom-[-19%]
              xl:left-[-9%]
              xl:w-[50%]
            `
        }
      `}
    >
      <Image
        src={card.statImage}
        alt={card.statAlt}
        fill
        priority
        data-page-loader="true"
        sizes="
          (max-width: 639px) 52vw,
          (max-width: 1023px) 46vw,
          430px
        "
        className="
          select-none
          object-contain
        "
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.9) 82%, rgba(0,0,0,0.4) 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.9) 82%, rgba(0,0,0,0.4) 92%, transparent 100%)",
        }}
      />
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
      className={`
        absolute
        top-[8%]
        z-30
        w-[57%]

        sm:top-[8.5%]
        sm:w-[56%]

        lg:top-[8%]
        lg:w-[55%]

        ${
          athleteOnLeft
            ? `
              right-[6%]
              text-right

              sm:right-[7%]
              lg:right-[7%]
            `
            : `
              left-[7%]
              text-left

              sm:left-[8%]
              lg:left-[8%]
            `
        }
      `}
    >
      <h3
        className="
          whitespace-nowrap
          text-[clamp(1.05rem,4.7vw,1.35rem)]
          font-black
          leading-[0.95]
          tracking-[-0.045em]
          text-[#b7ef00]

          sm:text-[clamp(1.25rem,3.5vw,1.65rem)]

          lg:text-[clamp(1.45rem,2vw,1.8rem)]

          xl:text-[30px]
        "
      >
        {card.title}
      </h3>

      <p
        className={`
          mt-[clamp(18px,5vw,25px)]
          max-w-[175px]
          text-[clamp(9px,2.55vw,11px)]
          font-medium
          capitalize
          leading-[1.4]
          text-white/60

          sm:mt-7
          sm:max-w-[210px]
          sm:text-[12px]
          sm:leading-[1.5]

          lg:mt-8
          lg:max-w-[225px]
          lg:text-[12px]
          lg:leading-[1.45]

          xl:mt-9
          xl:max-w-[255px]
          xl:text-[13px]
          xl:leading-[1.45]

          ${
            athleteOnLeft
              ? "ml-auto"
              : "mr-auto"
          }
        `}
      >
        {card.description}
      </p>

      <div
        className="
          mt-6
          sm:mt-7
          lg:mt-8
          xl:mt-9
        "
      >
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
  return (
    <article
      className="
        relative
        isolate
        aspect-[1/1.06]
        w-full
        overflow-hidden
        rounded-[26px]
        border
        border-white/[0.07]

        sm:aspect-square
        sm:rounded-[30px]

        lg:aspect-square
        lg:rounded-[34px]

        xl:rounded-[38px]
      "
      style={{
        background:
          "radial-gradient(circle at 18% 7%, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 39%), linear-gradient(135deg, #20231c 0%, #181b15 48%, #10120e 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 80%, rgba(0,0,0,0.98) 85%, rgba(0,0,0,0.82) 90%, rgba(0,0,0,0.42) 96%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, black 0%, black 80%, rgba(0,0,0,0.98) 85%, rgba(0,0,0,0.82) 90%, rgba(0,0,0,0.42) 96%, transparent 100%)",
      }}
    >
      <AthleteImage card={card} />

      <StatImage card={card} />

      <CardContent card={card} />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-40
          h-[24%]
          bg-gradient-to-b
          from-transparent
          via-black/20
          to-black
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[5]
          bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.15),transparent_55%)]
        "
      />
    </article>
  );
}

export default function ExperienceSection() {
  return (
    <section
      id="about"
      className="
        scroll-mt-24
        overflow-hidden
        border-b
        border-white/5
        bg-black
        px-4
        py-24
        text-white

        sm:px-7
        sm:py-32

        lg:px-10
        lg:py-36

        xl:px-14
      "
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <header className="mx-auto max-w-[1000px] text-center">
          <h2
            className="
              text-[clamp(2.55rem,7vw,5.8rem)]
              font-black
              leading-[0.88]
              tracking-[-0.065em]
            "
          >
            <span className="block text-[#f4f5ed]">
              Experience
            </span>

            <span className="mt-2 block text-[#eaff8e]">
              Fitness Like Never Before
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[720px]
              text-[12px]
              leading-6
              text-white/55

              sm:mt-7
              sm:text-[14px]
              sm:leading-7
            "
          >
            Transform the way you train with
            innovative workouts, expert guidance,
            and state-of-the-art facilities.
          </p>
        </header>

        <div
          className="
            mx-auto
            mt-16
            grid
            w-full
            max-w-[430px]
            grid-cols-1
            items-start
            gap-8

            sm:mt-20
            sm:max-w-[560px]
            sm:gap-10

            lg:mt-24
            lg:max-w-[1320px]
            lg:grid-cols-2
            lg:gap-[64px]

            xl:gap-[76px]
          "
        >
{experienceCards.map((card, index) => (
  <div
    key={card.title}
    className={index === 1 ? "lg:mt-10 xl:mt-12" : ""}
  >
    <ExperienceCard card={card} />
  </div>
))}
        </div>
      </div>
    </section>
  );
}