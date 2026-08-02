import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const footerLinks = [
  {
    label: "Home",
    href: "#home",
  },
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "Programs",
    href: "#programs",
  },
  {
    label: "Membership",
    href: "#membership",
  },
  {
    label: "Stories",
    href: "#testimonials",
  },
];

function BrandMark({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 14H53L44.5 26H15.5L7 14Z"
        fill="currentColor"
      />

      <path
        d="M19 30H44L34.5 43H28.5L19 30Z"
        fill="currentColor"
      />

      <path
        d="M30 44H43L34.5 56H21L30 44Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function InstagramIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.9"
      />

      <circle
        cx="12"
        cy="12"
        r="4.1"
        stroke="currentColor"
        strokeWidth="1.9"
      />

      <circle
        cx="17.4"
        cy="6.8"
        r="1.1"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.65 21V12.8H16.4L16.81 9.61H13.65V7.58C13.65 6.66 13.91 6.03 15.24 6.03H16.94V3.18C16.12 3.09 15.3 3.05 14.48 3.06C12.04 3.06 10.37 4.55 10.37 7.28V9.61H7.61V12.8H10.37V21H13.65Z" />
    </svg>
  );
}

function YoutubeIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M21 8.2C20.78 6.62 20.1 5.8 18.52 5.58C16.35 5.28 14.17 5.13 12 5.14C9.83 5.13 7.65 5.28 5.48 5.58C3.9 5.8 3.22 6.62 3 8.2C2.78 9.46 2.68 10.73 2.69 12C2.68 13.27 2.78 14.54 3 15.8C3.22 17.38 3.9 18.2 5.48 18.42C7.65 18.72 9.83 18.87 12 18.86C14.17 18.87 16.35 18.72 18.52 18.42C20.1 18.2 20.78 17.38 21 15.8C21.22 14.54 21.32 13.27 21.31 12C21.32 10.73 21.22 9.46 21 8.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M10 9.2L15 12L10 14.8V9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M18.7 3H21.95L14.85 11.11L23.2 22H16.66L11.54 15.31L5.69 22H2.43L10.02 13.33L2 3H8.7L13.32 9.11L18.7 3ZM17.56 20.08H19.36L7.72 4.82H5.79L17.56 20.08Z" />
    </svg>
  );
}

function ArrowIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7.5V12.3L15.2 14.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M4.2 7L12 12.8L19.8 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19 10C19 15.2 12 21 12 21C12 21 5 15.2 5 10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

const socialLinks: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: FacebookIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: YoutubeIcon,
  },
  {
    label: "X",
    href: "https://x.com/",
    icon: XIcon,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="
        relative
        isolate
        overflow-hidden
        border-t
        border-[#b7ef00]/15
        bg-[#060805]
        text-white
      "
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-20
          h-[500px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#b7ef00]/[0.055]
          blur-[140px]
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
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Top statement */}
      <div
        className="
          border-b
          border-white/[0.07]
          px-5
          py-9

          sm:px-8
          sm:py-11

          lg:px-12
          lg:py-12

          xl:px-16
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1450px]
            flex-col
            gap-6

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.32em]
                text-[#b7ef00]

                sm:text-[10px]
                sm:tracking-[0.4em]
              "
            >
              Every rep builds the next version of you
            </p>

            <h2
              className="
                mt-3
                max-w-[850px]
                text-[clamp(2.2rem,10vw,4.2rem)]
                font-black
                leading-[0.88]
                tracking-[-0.065em]
                text-[#f3f5ed]

                sm:mt-4
                sm:text-[clamp(3.2rem,6vw,5.5rem)]
              "
            >
              Train Today.
              <span className="text-[#dfff61]">
                {" "}
                Own Tomorrow.
              </span>
            </h2>
          </div>

          <Link
            href="#home"
            aria-label="Return to the top of the page"
            className="
              group
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              self-end
              rounded-full
              border
              border-white/15
              bg-white/[0.035]
              text-white
              transition
              duration-300

              hover:border-[#b7ef00]
              hover:bg-[#b7ef00]
              hover:text-black

              sm:h-14
              sm:w-14
            "
          >
            <ArrowIcon
              className="
                h-5
                w-5
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>
      </div>

      {/* Main footer content */}
      <div
        className="
          px-5
          py-14

          sm:px-8
          sm:py-16

          lg:px-12
          lg:py-20

          xl:px-16
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1450px]
            grid-cols-1
            gap-14

            md:grid-cols-2

            lg:grid-cols-[0.95fr_1.25fr_0.9fr]
            lg:gap-12

            xl:gap-20
          "
        >
          {/* Brand column */}
          <div>
            <Link
              href="#home"
              aria-label="Gym House home"
              className="
                group
                inline-flex
                items-center
                gap-3
              "
            >
              <BrandMark
                className="
                  h-12
                  w-12
                  text-[#b7ef00]
                  transition-transform
                  duration-500
                  group-hover:rotate-6
                  group-hover:scale-105
                "
              />

              <div>
                <p
                  className="
                    text-[24px]
                    font-black
                    uppercase
                    leading-none
                    tracking-[-0.055em]
                    text-[#f4f5ef]

                    sm:text-[28px]
                  "
                >
                  Gym
                  <span className="text-[#b7ef00]">
                    House
                  </span>
                </p>

                <p
                  className="
                    mt-1
                    text-[7px]
                    font-black
                    uppercase
                    tracking-[0.36em]
                    text-white/30
                  "
                >
                  Stronger every day
                </p>
              </div>
            </Link>

            <p
              className="
                mt-7
                max-w-[330px]
                text-[12px]
                leading-[1.8]
                text-white/45

                sm:text-[13px]
              "
            >
              A focused training environment built
              for strength, confidence and lasting
              progress. Everything you need to become
              your strongest self.
            </p>

            <div
              className="
                mt-8
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  relative
                  flex
                  h-2.5
                  w-2.5
                "
              >
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-[#b7ef00]
                    opacity-40
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#b7ef00]
                  "
                />
              </span>

              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-white/40
                "
              >
                Membership currently available
              </p>
            </div>
          </div>

          {/* Center column */}
          <div
            className="
              border-t
              border-white/[0.07]
              pt-10

              md:border-t-0
              md:pt-0

              lg:border-x
              lg:border-white/[0.07]
              lg:px-10

              xl:px-14
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.28em]
                text-[#b7ef00]
              "
            >
              Follow the movement
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-4
                gap-2

                sm:gap-3
              "
            >
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit Gym House on ${social.label}`}
                    className="
                      group
                      relative
                      flex
                      aspect-square
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-[18px]
                      border
                      border-white/[0.09]
                      bg-white/[0.025]
                      text-white/75
                      transition
                      duration-300

                      hover:-translate-y-1
                      hover:border-[#b7ef00]/50
                      hover:bg-[#b7ef00]
                      hover:text-black

                      sm:rounded-[22px]
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        inset-x-3
                        top-0
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-white/40
                        to-transparent
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    />

                    <Icon
                      className="
                        h-[24%]
                        w-[24%]
                        min-h-6
                        min-w-6
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                    />
                  </a>
                );
              })}
            </div>

            <nav
              aria-label="Footer navigation"
              className="
                mt-9
                flex
                flex-wrap
                gap-x-6
                gap-y-4

                sm:gap-x-8
              "
            >
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="
                    group
                    relative
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-white/45
                    transition-colors
                    duration-300

                    hover:text-white

                    sm:text-[11px]
                  "
                >
                  {link.label}

                  <span
                    className="
                      absolute
                      -bottom-2
                      left-0
                      h-px
                      w-0
                      bg-[#b7ef00]
                      transition-all
                      duration-300
                      group-hover:w-full
                    "
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact column */}
          <div
            className="
              border-t
              border-white/[0.07]
              pt-10

              md:col-span-2

              lg:col-span-1
              lg:border-t-0
              lg:pt-0
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.28em]
                text-[#b7ef00]
              "
            >
              Contact
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-3

                lg:grid-cols-1
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                  rounded-[20px]
                  border
                  border-white/[0.07]
                  bg-white/[0.022]
                  p-4
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#b7ef00]/20
                    bg-[#b7ef00]/[0.07]
                    text-[#b7ef00]
                  "
                >
                  <ClockIcon className="h-4 w-4" />
                </span>

                <div>
                  <p
                    className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-white/25
                    "
                  >
                    Opening hours
                  </p>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      font-bold
                      text-white/75
                    "
                  >
                    Monday – Sunday
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-white/40
                    "
                  >
                    6:00 AM – 10:00 PM
                  </p>
                </div>
              </div>

              <a
                href="mailto:gymhouse@gmail.com"
                className="
                  group
                  flex
                  items-start
                  gap-4
                  rounded-[20px]
                  border
                  border-white/[0.07]
                  bg-white/[0.022]
                  p-4
                  transition
                  duration-300

                  hover:border-[#b7ef00]/30
                  hover:bg-white/[0.04]
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#b7ef00]/20
                    bg-[#b7ef00]/[0.07]
                    text-[#b7ef00]
                  "
                >
                  <MailIcon className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p
                    className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-white/25
                    "
                  >
                    Email
                  </p>

                  <p
                    className="
                      mt-2
                      break-all
                      text-[11px]
                      font-bold
                      text-white/75
                      transition-colors
                      duration-300
                      group-hover:text-[#dfff61]
                    "
                  >
                    gymhouse@gmail.com
                  </p>
                </div>
              </a>

              <div
                className="
                  flex
                  items-start
                  gap-4
                  rounded-[20px]
                  border
                  border-white/[0.07]
                  bg-white/[0.022]
                  p-4
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#b7ef00]/20
                    bg-[#b7ef00]/[0.07]
                    text-[#b7ef00]
                  "
                >
                  <LocationIcon className="h-4 w-4" />
                </span>

                <div>
                  <p
                    className="
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-white/25
                    "
                  >
                    Location
                  </p>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      font-bold
                      text-white/75
                    "
                  >
                    Addis Ababa
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-white/40
                    "
                  >
                    Ethiopia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className="
          border-t
          border-white/[0.07]
          px-5
          py-6

          sm:px-8

          lg:px-12

          xl:px-16
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1450px]
            flex-col
            gap-4
            text-center

            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:text-left
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-white/25
            "
          >
            © {currentYear} Gym House. All rights
            reserved.
          </p>

          <div
            className="
              flex
              items-center
              justify-center
              gap-3

              sm:justify-end
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#b7ef00]
              "
            />

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/25
              "
            >
              Discipline creates results
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}