"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
  type Transition,
} from "motion/react";

export type TrainingCarouselItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  alt: string;
};

type TrainingCarouselProps = {
  items: TrainingCarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
};

type TrainingSlideProps = {
  item: TrainingCarouselItem;
  index: number;
  itemWidth: number;
  trackItemOffset: number;
  x: MotionValue<number>;
  transition: Transition;
};

const GAP = 18;
const DRAG_BUFFER = 45;
const VELOCITY_THRESHOLD = 450;

const SPRING_OPTIONS: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 30,
  mass: 0.85,
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
      className={`h-5 w-5 ${
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

function TrainingSlide({
  item,
  index,
  itemWidth,
  trackItemOffset,
  x,
  transition,
}: TrainingSlideProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ];

  const rotateY = useTransform(
    x,
    range,
    [55, 0, -55],
    {
      clamp: false,
    },
  );

  const scale = useTransform(
    x,
    range,
    [0.91, 1, 0.91],
    {
      clamp: false,
    },
  );

  const opacity = useTransform(
    x,
    range,
    [0.45, 1, 0.45],
    {
      clamp: false,
    },
  );

  return (
    <motion.article
      className="group relative shrink-0 cursor-grab select-none overflow-hidden active:cursor-grabbing"
      style={{
        width: itemWidth,
        rotateY,
        scale,
        opacity,
      }}
      transition={transition}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-white/10 bg-[#111111]">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          draggable={false}
          sizes="(max-width: 640px) 88vw, 430px"
          className="pointer-events-none object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.035] group-hover:grayscale-0"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/10" />

        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

        

        <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/65 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
          {item.category}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#b7ef00]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b7ef00]">
              Course 0{item.id}
            </span>
          </div>

          <h3 className="max-w-[90%] text-[clamp(1.65rem,7vw,2.4rem)] font-black leading-[0.95] tracking-[-0.055em] text-white">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="flex items-start justify-between gap-5 px-2 pb-1 pt-5">
        <p className="max-w-[310px] text-sm leading-6 text-white/45">
          {item.description}
        </p>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#151515] text-[#b7ef00] transition duration-300 group-hover:rotate-45 group-hover:bg-[#b7ef00] group-hover:text-black">
          <ArrowIcon direction="right" />
        </span>
      </div>
    </motion.article>
  );
}

export default function TrainingCarousel({
  items,
  baseWidth = 460,
  autoplay = true,
  autoplayDelay = 3800,
  pauseOnHover = true,
  loop = true,
}: TrainingCarouselProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] =
    useState(Math.min(baseWidth, 340));

  const [position, setPosition] = useState(
    loop ? 1 : 0,
  );

  const [isHovered, setIsHovered] =
    useState(false);

  const [isJumping, setIsJumping] =
    useState(false);

  const [isAnimating, setIsAnimating] =
    useState(false);

  const x = useMotionValue(0);

  const containerPadding = 14;

  const itemWidth = Math.max(
    containerWidth - containerPadding * 2,
    240,
  );

  const trackItemOffset =
    itemWidth + GAP;

  const itemsForRender = useMemo(() => {
    if (!loop || items.length === 0) {
      return items;
    }

    return [
      items[items.length - 1],
      ...items,
      items[0],
    ];
  }, [items, loop]);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    function updateWidth() {
      if (!container) {
        return;
      }

      setContainerWidth(
        Math.min(
          baseWidth,
          container.clientWidth,
        ),
      );
    }

    updateWidth();

    const resizeObserver =
      new ResizeObserver(updateWidth);

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [baseWidth]);

  useEffect(() => {
    if (
      !autoplay ||
      shouldReduceMotion ||
      itemsForRender.length <= 1
    ) {
      return;
    }

    if (pauseOnHover && isHovered) {
      return;
    }

    const timer = window.setInterval(() => {
      setPosition((currentPosition) =>
        Math.min(
          currentPosition + 1,
          itemsForRender.length - 1,
        ),
      );
    }, autoplayDelay);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    itemsForRender.length,
    pauseOnHover,
    shouldReduceMotion,
  ]);

  if (items.length === 0) {
    return null;
  }

  const activeIndex = loop
    ? (position - 1 + items.length) %
      items.length
    : Math.min(
        position,
        items.length - 1,
      );

  const effectiveTransition: Transition =
    isJumping || shouldReduceMotion
      ? {
          duration: 0,
        }
      : SPRING_OPTIONS;

  function handleAnimationStart() {
    setIsAnimating(true);
  }

  function handleAnimationComplete() {
    if (
      !loop ||
      itemsForRender.length <= 1
    ) {
      setIsAnimating(false);
      return;
    }

    const lastCloneIndex =
      itemsForRender.length - 1;

    if (position === lastCloneIndex) {
      const targetPosition = 1;

      setIsJumping(true);
      setPosition(targetPosition);
      x.set(
        -targetPosition *
          trackItemOffset,
      );

      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });

      return;
    }

    if (position === 0) {
      const targetPosition =
        items.length;

      setIsJumping(true);
      setPosition(targetPosition);
      x.set(
        -targetPosition *
          trackItemOffset,
      );

      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });

      return;
    }

    setIsAnimating(false);
  }

  function handleDragEnd(
    _event:
      | MouseEvent
      | TouchEvent
      | PointerEvent,
    info: PanInfo,
  ) {
    const { offset, velocity } = info;

    const direction =
      offset.x < -DRAG_BUFFER ||
      velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER ||
            velocity.x >
              VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) {
      return;
    }

    setPosition((currentPosition) => {
      const nextPosition =
        currentPosition + direction;

      return Math.max(
        0,
        Math.min(
          nextPosition,
          itemsForRender.length - 1,
        ),
      );
    });
  }

  function goToPreviousSlide() {
    if (isAnimating) {
      return;
    }

    setPosition((currentPosition) =>
      Math.max(currentPosition - 1, 0),
    );
  }

  function goToNextSlide() {
    if (isAnimating) {
      return;
    }

    setPosition((currentPosition) =>
      Math.min(
        currentPosition + 1,
        itemsForRender.length - 1,
      ),
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full"
      style={{
        maxWidth: baseWidth,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Training courses"
    >
      <div className="relative overflow-hidden px-[14px] pt-4">
        <motion.div
          className="flex"
          drag={
            isAnimating ? false : "x"
          }
          dragConstraints={{
            left:
              -trackItemOffset *
              Math.max(
                itemsForRender.length -
                  1,
                0,
              ),
            right: 0,
          }}
          dragElastic={0.08}
          dragMomentum={false}
          style={{
            width: itemWidth,
            gap: GAP,
            perspective: 1200,
            perspectiveOrigin: `${
              position *
                trackItemOffset +
              itemWidth / 2
            }px 50%`,
            x,
            touchAction: "pan-y",
          }}
          animate={{
            x:
              -position *
              trackItemOffset,
          }}
          transition={effectiveTransition}
          onAnimationStart={
            handleAnimationStart
          }
          onAnimationComplete={
            handleAnimationComplete
          }
          onDragEnd={handleDragEnd}
        >
          {itemsForRender.map(
            (item, index) => (
              <TrainingSlide
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                itemWidth={itemWidth}
                trackItemOffset={
                  trackItemOffset
                }
                x={x}
                transition={
                  effectiveTransition
                }
              />
            ),
          )}
        </motion.div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Previous training course"
          onClick={goToPreviousSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#121312] text-white transition duration-300 hover:border-[#b7ef00]/50 hover:bg-[#b7ef00] hover:text-black active:scale-95"
        >
          <ArrowIcon direction="left" />
        </button>

        <div className="flex min-w-[130px] items-center justify-center gap-2.5">
          {items.map((item, index) => {
            const isActive =
              activeIndex === index;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to ${item.title}`}
                aria-current={
                  isActive
                    ? "true"
                    : undefined
                }
                onClick={() => {
                  setPosition(
                    loop
                      ? index + 1
                      : index,
                  );
                }}
                className={`h-2 rounded-full border-0 transition-all duration-300 ${
                  isActive
                    ? "w-8 bg-[#b7ef00]"
                    : "w-2 bg-white/20 hover:bg-white/45"
                }`}
              />
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next training course"
          onClick={goToNextSlide}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#121312] text-white transition duration-300 hover:border-[#b7ef00]/50 hover:bg-[#b7ef00] hover:text-black active:scale-95"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <p className="mt-5 text-center text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 sm:hidden">
        Swipe to explore
      </p>
    </div>
  );
}