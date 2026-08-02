"use client";

import Image from "next/image";
import {
  useState,
  useEffect,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "motion/react";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  image: string;
  alt: string;
  objectPosition: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "James T.",
    role: "Strength Member",
    location: "LA, USA",
    quote:
      "I love the variety of workouts at Gym House. Whether it is HIIT, yoga, or strength training, there is always something new to try. The progress tracking tools keep me motivated.",
    rating: 5,
    image: "/images/testimonials/james-t.png",
    alt: "Gym House member James holding a dumbbell",
    objectPosition: "center bottom",
  },
  {
    id: 2,
    name: "Ryan Blaze",
    role: "Performance Member",
    location: "Austin, USA",
    quote:
      "The coaches completely changed the way I train. Every session has a clear purpose, and I have become stronger, faster, and much more confident than before.",
    rating: 5,
    image: "/images/testimonials/ryan-blaze.png",
    alt: "Gym House member Ryan Blaze",
    objectPosition: "center bottom",
  },
  {
    id: 3,
    name: "Ethan Maxx",
    role: "Fitness Member",
    location: "Miami, USA",
    quote:
      "Gym House gave me the structure and accountability I was missing. The trainers understand my goals and keep challenging me without making the process feel overwhelming.",
    rating: 5,
    image: "/images/testimonials/ethan-maxx.png",
    alt: "Gym House member Ethan Maxx",
    objectPosition: "center bottom",
  },
];

const motionEase = [
  0.22,
  1,
  0.36,
  1,
] as const;

const athleteMaskStyle: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 79%, rgba(0,0,0,0.96) 86%, rgba(0,0,0,0.55) 94%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 79%, rgba(0,0,0,0.96) 86%, rgba(0,0,0,0.55) 94%, transparent 100%)",
};

const previewMaskStyle: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.88) 90%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 82%, rgba(0,0,0,0.88) 90%, transparent 100%)",
};

function ArrowIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`h-[18px] w-[18px] transition-transform duration-300 ${
        direction === "left"
          ? "rotate-[-135deg]"
          : "rotate-45"
      }`}
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({
  active,
}: {
  active: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-[14px] w-[14px] ${
        active
          ? "text-[#b7ef00]"
          : "text-white/15"
      }`}
    >
      <path
        fill="currentColor"
        d="M12 2.6L14.8 8.3L21.1 9.2L16.55 13.65L17.63 19.9L12 16.95L6.37 19.9L7.45 13.65L2.9 9.2L9.2 8.3L12 2.6Z"
      />
    </svg>
  );
}

function ArrowButton({
  direction,
  label,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="
        group
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-white/15
        bg-black/50
        text-white/70
        backdrop-blur-md
        transition
        duration-300

        hover:border-[#b7ef00]/60
        hover:bg-[#b7ef00]
        hover:text-black

        active:scale-90
      "
    >
      <span
        className={
          direction === "left"
            ? "transition-transform duration-300 group-hover:-translate-x-0.5"
            : "transition-transform duration-300 group-hover:translate-x-0.5"
        }
      >
        <ArrowIcon direction={direction} />
      </span>
    </button>
  );
}

function CarouselControls({
  activeIndex,
  total,
  onPrevious,
  onNext,
  showCount = true,
}: {
  activeIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  showCount?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <ArrowButton
        direction="left"
        label="Show previous customer story"
        onClick={onPrevious}
      />

      <ArrowButton
        direction="right"
        label="Show next customer story"
        onClick={onNext}
      />

      {showCount && (
        <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
          0{activeIndex + 1}
          <span className="mx-1 text-white/15">
            /
          </span>
          0{total}
        </span>
      )}
    </div>
  );
}

function ActiveAthlete({
  testimonial,
  direction,
  shouldReduceMotion,
  className,
  sizes,
}: {
  testimonial: Testimonial;
  direction: number;
  shouldReduceMotion: boolean | null;
  className: string;
  sizes: string;
}) {
  return (
    <div
      className={`pointer-events-none ${className}`}
    >
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <motion.div
          key={testimonial.id}
          initial={
            shouldReduceMotion
              ? {
                  opacity: 1,
                }
              : {
                  opacity: 0,
                  x:
                    direction > 0
                      ? 65
                      : -65,
                  scale: 0.965,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={
            shouldReduceMotion
              ? {
                  opacity: 0,
                }
              : {
                  opacity: 0,
                  x:
                    direction > 0
                      ? -55
                      : 55,
                  scale: 0.98,
                }
          }
          transition={
            shouldReduceMotion
              ? {
                  duration: 0,
                }
              : {
                  duration: 0.62,
                  ease: motionEase,
                }
          }
          className="absolute inset-0"
        >
          <Image
            src={testimonial.image}
            alt={testimonial.alt}
            fill
            draggable={false}
            loading="eager"
            data-page-loader="true"
            sizes={sizes}
            className="
              select-none
              object-contain
              object-bottom
              grayscale
              contrast-[1.13]
              brightness-[0.93]
            "
            style={{
              ...athleteMaskStyle,
              objectPosition:
                testimonial.objectPosition,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function QuotePanel({
  testimonial,
  direction,
  shouldReduceMotion,
  className,
  mobile = false,
}: {
  testimonial: Testimonial;
  direction: number;
  shouldReduceMotion: boolean | null;
  className: string;
  mobile?: boolean;
}) {
  return (
    <div className={className}>
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <motion.article
          key={testimonial.id}
          aria-live="polite"
          initial={
            shouldReduceMotion
              ? {
                  opacity: 1,
                }
              : {
                  opacity: 0,
                  y: 18,
                  x:
                    direction > 0
                      ? 20
                      : -20,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
          }}
          exit={
            shouldReduceMotion
              ? {
                  opacity: 0,
                }
              : {
                  opacity: 0,
                  y: -12,
                  x:
                    direction > 0
                      ? -18
                      : 18,
                }
          }
          transition={
            shouldReduceMotion
              ? {
                  duration: 0,
                }
              : {
                  duration: 0.48,
                  ease: motionEase,
                }
          }
          className="
            absolute
            inset-0
            overflow-hidden
            rounded-[26px]
            border
            border-white/15
            px-6
            py-6
            shadow-[0_28px_80px_rgba(0,0,0,0.45)]
            backdrop-blur-xl

            sm:rounded-[30px]
            sm:px-8
            sm:py-7
          "
          style={{
            background:
              "linear-gradient(135deg, rgba(78,82,66,0.94) 0%, rgba(47,51,41,0.97) 43%, rgba(23,25,21,0.99) 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/35
              to-transparent
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-12
              -top-16
              h-40
              w-40
              rounded-full
              bg-[#b7ef00]/10
              blur-3xl
            "
          />

          <div className="relative z-10 flex h-full flex-col">
            <span
              aria-hidden="true"
              className="
                absolute
                -left-1
                -top-5
                text-[74px]
                font-black
                leading-none
                text-white/[0.055]
              "
            >
              “
            </span>

            <p
              className={`relative z-10 font-medium text-white/90 ${
                mobile
                  ? "text-[13px] leading-[1.65] sm:text-[14px]"
                  : "max-w-[450px] text-[14px] leading-[1.55] xl:text-[15px]"
              }`}
            >
              &quot;{testimonial.quote}&quot;
            </p>

            <div className="mt-auto flex items-end justify-between gap-5 pt-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-6 bg-[#b7ef00]" />

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#dfff61]">
                    {testimonial.name}
                  </span>
                </div>

                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">
                  {testimonial.role}
                </p>

                <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-white/25">
                  {testimonial.location}
                </p>
              </div>

              <div
                className="flex items-center gap-0.5"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <StarIcon
                    key={index}
                    active={
                      index <
                      testimonial.rating
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

function PreviewCard({
  testimonial,
  index,
  onClick,
  desktop = false,
  className = "",
}: {
  testimonial: Testimonial;
  index: number;
  onClick: () => void;
  desktop?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`Show the story of ${testimonial.name}`}
      onClick={onClick}
      whileTap={{
        scale: 0.97,
      }}
      className={`
        group
        relative
        isolate
        overflow-hidden
        border
        border-white/[0.07]
        bg-[#0c0e0b]
        text-left
        transition
        duration-500

        hover:-translate-y-2
        hover:border-[#b7ef00]/35

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#b7ef00]/70

        ${
          desktop
            ? "h-[310px] flex-1 rounded-[24px] xl:h-[350px] xl:rounded-[28px]"
            : "h-[190px] rounded-[22px] sm:h-[230px] sm:rounded-[26px]"
        }

        ${className}
      `}
    >
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_18%,rgba(183,239,0,0.08),transparent_45%)]
        "
      />

      <Image
        src={testimonial.image}
        alt=""
        fill
        draggable={false}
        loading="eager"
        data-page-loader="true"
        sizes={
          desktop
            ? "(max-width: 1279px) 15vw, 180px"
            : "(max-width: 639px) 46vw, 230px"
        }
        className="
          pointer-events-none
          z-10
          object-contain
          object-bottom
          grayscale
          contrast-[1.12]
          brightness-[0.72]
          transition
          duration-700
          ease-out

          group-hover:scale-[1.045]
          group-hover:brightness-[0.92]
        "
        style={{
          ...previewMaskStyle,
          objectPosition:
            testimonial.objectPosition,
        }}
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
          bg-gradient-to-t
          from-black
          via-black/5
          to-black/20
        "
      />

      <span
        className="
          absolute
          left-4
          top-4
          z-30
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-black/35
          text-[8px]
          font-black
          text-white/40
          backdrop-blur-sm
        "
      >
        0{index + 1}
      </span>

      {desktop ? (
        <span
          className="
            absolute
            bottom-5
            right-3
            z-30
            text-[11px]
            font-black
            uppercase
            tracking-[0.08em]
            text-[#b7ef00]
          "
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          {testimonial.name}
        </span>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5">
          <p className="text-[12px] font-black tracking-[-0.025em] text-[#dfff61] sm:text-[14px]">
            {testimonial.name}
          </p>

          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.13em] text-white/35">
            View story
          </p>
        </div>
      )}
    </motion.button>
  );
}

export default function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [direction, setDirection] =
            useState(1);
        const [
        autoPlayResetKey,
        setAutoPlayResetKey,
        ] = useState(0);
  const activeTestimonial =
    testimonials[activeIndex];
   useEffect(() => {
  if (shouldReduceMotion) {
    return;
  }

  const autoPlayInterval =
    window.setInterval(() => {
      setDirection(1);

      setActiveIndex(
        (currentIndex) =>
          (currentIndex + 1) %
          testimonials.length,
      );
    }, 4000);

  return () => {
    window.clearInterval(
      autoPlayInterval,
    );
  };
}, [
  shouldReduceMotion,
  autoPlayResetKey,
]);
  const previewIndexes = [1, 2].map(
    (offset) =>
      (activeIndex + offset) %
      testimonials.length,
  );

function showNextTestimonial() {
  setDirection(1);

  setActiveIndex(
    (currentIndex) =>
      (currentIndex + 1) %
      testimonials.length,
  );

  setAutoPlayResetKey(
    (currentValue) =>
      currentValue + 1,
  );
}

function showPreviousTestimonial() {
  setDirection(-1);

  setActiveIndex(
    (currentIndex) =>
      (currentIndex -
        1 +
        testimonials.length) %
      testimonials.length,
  );

  setAutoPlayResetKey(
    (currentValue) =>
      currentValue + 1,
  );
}

  function selectTestimonial(
    selectedIndex: number,
  ) {
    if (selectedIndex === activeIndex) {
      return;
    }

    const forwardDistance =
      (selectedIndex -
        activeIndex +
        testimonials.length) %
      testimonials.length;

    const backwardDistance =
      (activeIndex -
        selectedIndex +
        testimonials.length) %
      testimonials.length;

    setDirection(
      forwardDistance <= backwardDistance
        ? 1
        : -1,
    );

    setActiveIndex(selectedIndex);
    setAutoPlayResetKey(
  (currentValue) =>
    currentValue + 1,
);
  }

  function handleMobileDragEnd(
    _event:
      | MouseEvent
      | TouchEvent
      | PointerEvent,
    information: PanInfo,
  ) {
    const movedLeft =
      information.offset.x < -55 ||
      information.velocity.x < -450;

    const movedRight =
      information.offset.x > 55 ||
      information.velocity.x > 450;

    if (movedLeft) {
      showNextTestimonial();
      return;
    }

    if (movedRight) {
      showPreviousTestimonial();
    }
  }

  return (
    <section
      id="testimonials"
      aria-label="Customer success stories"
      className="
        relative
        isolate
        scroll-mt-24
        overflow-hidden
        border-b
        border-white/5
        bg-[#050605]
        px-4
        py-24
        text-white

        sm:px-8
        sm:py-32

        lg:px-10
        lg:py-36

        xl:px-16
        xl:py-40
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[38%]
          -z-10
          h-[620px]
          w-[80%]
          -translate-x-1/2
          rounded-full
          bg-[#b7ef00]/[0.025]
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          opacity-[0.025]
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1450px]">
        <header className="mx-auto max-w-[1050px] text-center">
          <p
            className="
              mb-5
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-[#b7ef00]/80

              sm:text-[11px]
              sm:tracking-[0.4em]
            "
          >
            Real members. Real transformations.
          </p>

          <h2
            className="
              text-[clamp(2.7rem,12vw,4.1rem)]
              font-black
              leading-[0.88]
              tracking-[-0.065em]

              sm:text-[clamp(4.2rem,8vw,7rem)]

              lg:leading-[0.86]
            "
          >
            <span className="block text-[#f4f5ef]">
              Your Success
            </span>

            <span className="mt-2 block text-[#f4f5ef] sm:mt-3">
              Stories,{" "}
              <span className="text-[#dfff61]">
                Our Inspiration
              </span>
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
              text-white/55

              sm:mt-7
              sm:text-[13px]
              sm:leading-6

              lg:text-[14px]
            "
          >
            See how our members have achieved
            their goals and let their journeys
            inspire yours.
          </p>
        </header>

        {/* Mobile and tablet layout */}
        <div className="mt-14 lg:hidden">
          <motion.div
            drag={
              shouldReduceMotion
                ? false
                : "x"
            }
            dragConstraints={{
              left: 0,
              right: 0,
            }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={handleMobileDragEnd}
            className="
              relative
              mx-auto
              aspect-[0.88]
              w-full
              max-w-[620px]
              cursor-grab
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.07]
              bg-[#080a07]
              active:cursor-grabbing

              sm:aspect-[1.08]
              sm:rounded-[36px]
            "
          >
            <div
              aria-hidden="true"
              className="absolute inset-[5%]"
              style={{
                clipPath:
                  "polygon(0 0, 76% 0, 100% 22%, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(138deg, #070907 0%, #0b1007 42%, #152004 100%)",
              }}
            >
              <div
                className="
                  absolute
                  right-[-18%]
                  top-[-12%]
                  h-[80%]
                  w-[80%]
                  rounded-full
                  bg-[#b7ef00]/[0.075]
                  blur-3xl
                "
              />
            </div>

            <div className="absolute left-5 top-5 z-40 sm:left-7 sm:top-7">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                Member story
              </span>

              <p className="mt-1 text-[13px] font-black text-[#dfff61]">
                0{activeIndex + 1}
              </p>
            </div>

            <div className="absolute right-5 top-5 z-40 sm:right-7 sm:top-7">
              <CarouselControls
                activeIndex={activeIndex}
                total={testimonials.length}
                onPrevious={
                  showPreviousTestimonial
                }
                onNext={showNextTestimonial}
                showCount={false}
              />
            </div>

            <ActiveAthlete
              testimonial={activeTestimonial}
              direction={direction}
              shouldReduceMotion={
                shouldReduceMotion
              }
              className="
                absolute
                inset-x-[-7%]
                bottom-[-2%]
                top-[7%]

                sm:inset-x-[4%]
                sm:top-[4%]
              "
              sizes="(max-width: 639px) 110vw, 620px"
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-30
                h-[17%]
                bg-gradient-to-t
                from-[#050605]
                to-transparent
              "
            />
          </motion.div>

          <QuotePanel
            testimonial={activeTestimonial}
            direction={direction}
            shouldReduceMotion={
              shouldReduceMotion
            }
            mobile
            className="
              relative
              z-30
              mx-3
              -mt-12
              h-[270px]

              sm:mx-auto
              sm:-mt-16
              sm:h-[250px]
              sm:max-w-[580px]
            "
          />

          <div className="mx-auto mt-7 grid max-w-[620px] grid-cols-2 gap-3 sm:mt-9 sm:gap-5">
            {previewIndexes.map(
              (testimonialIndex) => {
                const testimonial =
                  testimonials[
                    testimonialIndex
                  ];

                return (
                  <PreviewCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    index={testimonialIndex}
                    onClick={() =>
                      selectTestimonial(
                        testimonialIndex,
                      )
                    }
                  />
                );
              },
            )}
          </div>

          <p className="mt-7 text-center text-[9px] font-bold uppercase tracking-[0.24em] text-white/25">
            Swipe or tap a member to explore
          </p>
        </div>

        {/* Desktop layout */}
        <div
          className="
            relative
            mx-auto
            mt-20
            hidden
            min-h-[620px]
            max-w-[1320px]

            lg:block

            xl:mt-24
            xl:min-h-[680px]
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              left-0
              top-[7%]
              h-[77%]
              w-[52%]
              overflow-hidden
            "
            style={{
              clipPath:
                "polygon(0 0, 78% 0, 100% 23%, 100% 100%, 0 100%)",
              background:
                "linear-gradient(135deg, #060806 0%, #090d06 38%, #111a04 72%, #192503 100%)",
            }}
          >
            <div
              className="
                absolute
                -right-[10%]
                -top-[12%]
                h-[80%]
                w-[76%]
                rounded-full
                bg-[#b7ef00]/[0.055]
                blur-[75px]
              "
            />

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-[42%]
                bg-gradient-to-t
                from-black
                to-transparent
              "
            />
          </div>

          <div
            aria-hidden="true"
            className="
              absolute
              bottom-[5%]
              left-[2%]
              h-[12%]
              w-[38%]
              rounded-full
              bg-black
              blur-3xl
            "
          />

          <ActiveAthlete
            testimonial={activeTestimonial}
            direction={direction}
            shouldReduceMotion={
              shouldReduceMotion
            }
            className="
              absolute
              bottom-[-2%]
              left-[-4%]
              z-20
              h-[94%]
              w-[43%]

              xl:left-[-3%]
              xl:h-[98%]
              xl:w-[44%]
            "
            sizes="(max-width: 1279px) 46vw, 590px"
          />

          <QuotePanel
            testimonial={activeTestimonial}
            direction={direction}
            shouldReduceMotion={
              shouldReduceMotion
            }
            className="
              absolute
              bottom-[8%]
              left-[24%]
              z-40
              h-[275px]
              w-[41%]
              max-w-[535px]

              xl:bottom-[10%]
              xl:left-[25%]
              xl:h-[285px]
            "
          />

          <div
            className="
              absolute
              left-[58%]
              top-[19%]
              z-50

              xl:left-[59%]
              xl:top-[18%]
            "
          >
            <CarouselControls
              activeIndex={activeIndex}
              total={testimonials.length}
              onPrevious={
                showPreviousTestimonial
              }
              onNext={showNextTestimonial}
            />
          </div>

          <div
            className="
              absolute
              bottom-[12%]
              right-0
              z-30
              flex
              w-[31%]
              items-end
              justify-end
              gap-4

              xl:bottom-[13%]
              xl:gap-5
            "
          >
            {previewIndexes.map(
              (
                testimonialIndex,
                previewPosition,
              ) => {
                const testimonial =
                  testimonials[
                    testimonialIndex
                  ];

                return (
                  <PreviewCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    index={testimonialIndex}
                    desktop
                    className={
                      previewPosition === 0
                        ? "translate-y-6"
                        : "-translate-y-3"
                    }
                    onClick={() =>
                      selectTestimonial(
                        testimonialIndex,
                      )
                    }
                  />
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}