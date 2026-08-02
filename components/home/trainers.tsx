"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";

type Trainer = {
  name: string;
  image: string;
  alt: string;
  clipPath: string;
  imageStyle: CSSProperties;
};

const trainers: Trainer[] = [
  {
    name: "Blake Hunter",
    image: "/images/trainers/blake-hunter.png",
    alt: "Fitness trainer Blake Hunter holding a dumbbell",
    clipPath:
      "polygon(0 0, 79% 0, 100% 20%, 100% 100%, 19% 100%, 0 81%)",
    imageStyle: {
      objectPosition: "center bottom",
      transform: "scale(1.07) translateY(1%)",
    },
  },
  {
    name: "Liam CrossFit",
    image: "/images/trainers/liam-crossfit.png",
    alt: "Fitness trainer Liam CrossFit",
    clipPath:
      "polygon(18% 0, 82% 0, 100% 18%, 100% 100%, 16% 100%, 0 84%, 0 18%)",
    imageStyle: {
      objectPosition: "center bottom",
      transform: "scale(1.06) translateY(1%)",
    },
  },
  {
    name: "Logan Torque",
    image: "/images/trainers/logan-torque.png",
    alt: "Fitness trainer Logan Torque holding a dumbbell",
    clipPath:
      "polygon(19% 0, 100% 0, 100% 100%, 0 100%, 0 20%)",
    imageStyle: {
      objectPosition: "center bottom",
      transform: "scale(1.09) translateY(2%)",
    },
  },
];

function TrainerCard({
  trainer,
  index,
}: {
  trainer: Trainer;
  index: number;
}) {
  return (
    <article
      className="
        w-[84vw]
        max-w-[390px]
        shrink-0
        snap-center

        sm:w-[68vw]
        sm:max-w-[440px]

        lg:w-auto
        lg:max-w-none
      "
    >
      <div
        className="
          group
          relative
          aspect-[0.82]
          w-full
          overflow-hidden
        "
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: trainer.clipPath,
            background:
              "linear-gradient(138deg, #050605 0%, #090d05 31%, #101b02 68%, #1d2d02 100%)",
          }}
        >
          <div
            className="
              absolute
              -right-[25%]
              top-[2%]
              h-[76%]
              w-[80%]
              rotate-[-18deg]
              bg-[#b7ef00]/[0.055]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[46%]
              bg-gradient-to-t
              from-black
              via-black/30
              to-transparent
            "
          />
        </div>

        <div
          aria-hidden="true"
          className="
            absolute
            bottom-[2%]
            left-1/2
            h-[22%]
            w-[70%]
            -translate-x-1/2
            rounded-full
            bg-black/90
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-[-5%]
            bottom-0
            top-[1%]
          "
        >
          <Image
            src={trainer.image}
            alt={trainer.alt}
            fill
            priority
            data-page-loader="true"
            sizes="
              (max-width: 640px) 84vw,
              (max-width: 1023px) 68vw,
              31vw
            "
            className="
              select-none
              object-contain
              object-bottom
              grayscale
              contrast-[1.18]
              brightness-[0.94]
            "
            style={{
              ...trainer.imageStyle,
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 87%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.46) 97%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 87%, rgba(0,0,0,0.94) 92%, rgba(0,0,0,0.46) 97%, transparent 100%)",
            }}
          />
        </div>

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-20
            h-[12%]
            bg-gradient-to-t
            from-black
            to-transparent
          "
        />

        <span className="sr-only">
          Trainer number {index + 1}
        </span>
      </div>

      <h3
        className="
          mt-6
          text-center
          text-[19px]
          font-black
          leading-none
          tracking-[-0.035em]
          text-[#dfff56]

          sm:text-[21px]

          lg:mt-7
          lg:text-[22px]

          xl:text-[24px]
        "
      >
        {trainer.name}
      </h3>
    </article>
  );
}

export default function TrainersSection() {
  const trackRef = useRef<HTMLDivElement | null>(
    null,
  );

  const [activeTrainer, setActiveTrainer] =
    useState(0);

  function scrollToTrainer(index: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const card = track.children[
      index
    ] as HTMLElement | undefined;

    if (!card) {
      return;
    }

    const centeredPosition =
      card.offsetLeft -
      (track.clientWidth - card.offsetWidth) / 2;

    track.scrollTo({
      left: centeredPosition,
      behavior: "smooth",
    });

    setActiveTrainer(index);
  }

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia(
      "(max-width: 1023px)",
    );

    if (!mobileMediaQuery.matches) {
      return;
    }

    const autoSwipeTimer = window.setTimeout(() => {
      const nextTrainer =
        (activeTrainer + 1) % trainers.length;

      scrollToTrainer(nextTrainer);
    }, 3000);

    return () => {
      window.clearTimeout(autoSwipeTimer);
    };
  }, [activeTrainer]);

  function handleScroll(
    event: UIEvent<HTMLDivElement>,
  ) {
    const track = event.currentTarget;

    if (window.innerWidth >= 1024) {
      return;
    }

    const cards = Array.from(
      track.children,
    ) as HTMLElement[];

    const trackCenter =
      track.scrollLeft + track.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance =
      Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(
        cardCenter - trackCenter,
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveTrainer((currentTrainer) => {
      if (currentTrainer === closestIndex) {
        return currentTrainer;
      }

      return closestIndex;
    });
  }

  return (
    <section
      id="trainers"
      className="
        relative
        scroll-mt-24
        overflow-hidden
        border-b
        border-white/5
        bg-black
        px-5
        py-24
        text-white

        sm:px-8
        sm:py-32

        lg:px-12
        lg:py-40

        xl:px-16
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[38%]
          h-[420px]
          w-[80%]
          -translate-x-1/2
          bg-[radial-gradient(circle,rgba(183,239,0,0.035),transparent_66%)]
          blur-3xl
        "
      />

      <div className="relative mx-auto w-full max-w-[1450px]">
        <header className="mx-auto max-w-[950px] text-center">
          <h2
            className="
              text-[clamp(2.6rem,9.5vw,4rem)]
              font-black
              leading-[0.91]
              tracking-[-0.06em]

              sm:text-[clamp(4rem,7vw,6.5rem)]

              lg:leading-[0.88]
            "
          >
            <span className="block text-[#f4f5ef]">
              Your Fitness
            </span>

            <span
              className="
                mt-2
                block
                text-[#e7ff7a]

                sm:mt-3
              "
            >
              Goals, Their Expertise
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[720px]
              text-[11px]
              font-medium
              leading-5
              text-white/60

              sm:mt-7
              sm:text-[13px]
              sm:leading-6

              lg:text-[14px]
            "
          >
            Our team of certified trainers brings
            unparalleled expertise to help you
            achieve your fitness goals.
          </p>
        </header>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="
            -mx-5
            mt-16
            flex
            snap-x
            snap-mandatory
            gap-5
            overflow-x-auto
            px-5
            pb-2
            scroll-smooth
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:-mx-8
            sm:mt-20
            sm:gap-7
            sm:px-8

            lg:mx-auto
            lg:mt-24
            lg:grid
            lg:max-w-[1320px]
            lg:grid-cols-3
            lg:items-end
            lg:gap-8
            lg:overflow-visible
            lg:px-0
            lg:pb-0

            xl:gap-12
          "
        >
          {trainers.map((trainer, index) => (
            <TrainerCard
              key={trainer.name}
              trainer={trainer}
              index={index}
            />
          ))}
        </div>

        <div
          className="
            mt-9
            flex
            items-center
            justify-center
            gap-[7px]

            lg:hidden
          "
        >
          {trainers.map((trainer, index) => {
            const isActive =
              activeTrainer === index;

            return (
              <button
                key={trainer.name}
                type="button"
                onClick={() =>
                  scrollToTrainer(index)
                }
                aria-label={`Show ${trainer.name}`}
                aria-current={
                  isActive ? "true" : undefined
                }
                className={`
                  h-[9px]
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    isActive
                      ? "w-[28px] -skew-x-[25deg] bg-[#b7ef00]"
                      : "w-[9px] -skew-x-[25deg] bg-white/30 hover:bg-white/50"
                  }
                `}
              />
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="
            mt-10
            hidden
            items-center
            justify-center
            gap-[7px]

            lg:flex
          "
        >
          <span
            className="
              h-[10px]
              w-[29px]
              -skew-x-[25deg]
              rounded-full
              bg-[#b7ef00]
            "
          />

          <span
            className="
              h-[10px]
              w-[10px]
              -skew-x-[25deg]
              rounded-full
              bg-white/35
            "
          />

          <span
            className="
              h-[10px]
              w-[10px]
              -skew-x-[25deg]
              rounded-full
              bg-white/35
            "
          />
        </div>
      </div>
    </section>
  );
}