import TrainingCarousel, {
  type TrainingCarouselItem,
} from "@/components/ui/training-carousel";

const trainingCourses: TrainingCarouselItem[] =
  [
    {
      id: 1,
      title: "Barbell Basics",
      category: "Strength",
      description:
        "Master the main barbell movements with safe technique, stronger form, and progressive training.",
      image:
        "/images/courses/barbell-basics.jpg",
      alt: "Athlete performing a barbell squat",
    },
    {
      id: 2,
      title: "Kettlebell Masterclass",
      category: "Power",
      description:
        "Build explosive strength, coordination, and conditioning through focused kettlebell sessions.",
      image:
        "/images/courses/kettlebell-masterclass.jpg",
      alt: "Athlete training with a kettlebell",
    },
    {
      id: 3,
      title: "Cardio Power Boost",
      category: "Cardio",
      description:
        "Improve endurance, speed, and cardiovascular performance with structured high-energy workouts.",
      image:
        "/images/courses/cardio-power.jpg",
      alt: "Athlete sprinting during cardio training",
    },
    {
      id: 4,
      title: "Hypertrophy",
      category: "Muscle",
      description:
        "Use intelligent volume and progressive overload to build size, strength, and balanced muscle.",
      image:
        "/images/courses/hypertrophy.jpg",
      alt: "Bodybuilder performing strength training",
    },
    {
      id: 5,
      title: "Rope Climbing",
      category: "Athletic",
      description:
        "Develop grip strength, upper-body power, control, and full-body athletic conditioning.",
      image:
        "/images/courses/rope-climbing.jpg",
      alt: "Athlete climbing a training rope",
    },
    {
      id: 6,
      title: "TRX Suspension",
      category: "Functional",
      description:
        "Train stability, mobility, core strength, and control using suspension-based bodyweight exercises.",
      image:
        "/images/courses/trx-suspension.jpg",
      alt: "Athlete performing TRX suspension training",
    },
  ];

export default function TrainingCoursesSection() {
  return (
    <section
      id="services"
      className="relative isolate overflow-hidden bg-black px-5 py-24 text-white sm:px-8 sm:py-32 lg:px-12 lg:py-40 xl:px-16"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-20 h-[620px] w-[900px] max-w-[100vw] -translate-x-1/2 opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(183,239,0,0.22) 0%, rgba(183,239,0,0.05) 32%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="mx-auto w-full max-w-[1450px]">
        <div className="mx-auto max-w-[920px] text-center">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#b7ef00] sm:text-xs">
            Professional training courses
          </p>

          <h2 className="text-[clamp(2.6rem,7vw,6.8rem)] font-black leading-[0.87] tracking-[-0.065em]">
            <span className="block text-[#efffc8]">
              Train Smarter
            </span>

            <span className="mt-2 block text-[#b7ef00]">
              Unleash Your Potential
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-[630px] text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
            Unlock your full potential with
            expertly designed courses tailored
            to help you build strength, improve
            performance, and maximize results
            in less time.
          </p>
        </div>

        <div className="relative mx-auto mt-16 sm:mt-20 lg:mt-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[min(750px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b7ef00]/5 blur-[100px]" />

          <TrainingCarousel
            items={trainingCourses}
            baseWidth={470}
            autoplay
            autoplayDelay={4000}
            pauseOnHover
            loop
          />
        </div>
      </div>
    </section>
  );
}