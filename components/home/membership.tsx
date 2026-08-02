function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[15px] w-[15px]"
      aria-hidden="true"
    >
      <path
        d="M5 12.5L9.2 16.5L19 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M13.2 2L5 13.2H11L10.8 22L19 10.8H13L13.2 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

const membershipBenefits = [
  "Unlimited gym access for month",
  "Professional training support",
  "Full equipment access",
  "Progress tracking",
  "Aerobics training"
];

export default function MembershipSection() {
  return (
<section
  id="membership"
  aria-labelledby="membership-title"
  className="
    relative
    isolate
    overflow-hidden
    border-y
    border-white/[0.05]
    bg-[#050605]
    px-4
    py-24
    text-white

    sm:px-8
    sm:py-32

    lg:px-12
    lg:py-40

    xl:px-16
  "
>
      {/* Large soft background light */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-20
          h-[620px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#b7ef00]/[0.035]
          blur-[130px]
        "
      />

      {/* Background grid */}
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
            "linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Side typography */}
      <p
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[-45px]
          top-1/2
          hidden
          -translate-y-1/2
          -rotate-90
          whitespace-nowrap
          text-[10px]
          font-bold
          uppercase
          tracking-[0.5em]
          text-white/10

          xl:block
        "
      >
        Gym House Membership
      </p>

      <p
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-32px]
          top-1/2
          hidden
          -translate-y-1/2
          rotate-90
          whitespace-nowrap
          text-[10px]
          font-bold
          uppercase
          tracking-[0.5em]
          text-white/10

          xl:block
        "
      >
        Become Stronger
      </p>

      <div className="mx-auto w-full max-w-[1240px]">
        <header className="mx-auto max-w-[800px] text-center">
          <p
            className="
              mb-5
              text-[9px]
              font-black
              uppercase
              tracking-[0.34em]
              text-[#b7ef00]

              sm:text-[11px]
              sm:tracking-[0.42em]
            "
          >
            One membership. Everything included.
          </p>

          <h2
            id="membership-title"
            className="
              text-[clamp(2.8rem,12vw,4.5rem)]
              font-black
              leading-[0.88]
              tracking-[-0.065em]
              text-[#f4f5ef]

              sm:text-[clamp(4.2rem,8vw,7rem)]
            "
          >
            Built For Your
            <span className="block text-[#dfff61]">
              Strongest Self
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[590px]
              text-[12px]
              leading-6
              text-white/45

              sm:mt-7
              sm:text-[14px]
            "
          >
            Full access to the space, equipment,
            training environment and support you
            need to keep progressing.
          </p>
        </header>

        <div
          className="
            relative
            mx-auto
            mt-14
            w-full
            max-w-[960px]

            sm:mt-18

            lg:mt-20
          "
        >
          {/* Outside outline */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -inset-3
              rounded-[35px]
              border
              border-white/[0.045]

              sm:-inset-4
              sm:rounded-[46px]
            "
          />

          <article
            className="
              relative
              isolate
              overflow-hidden
              rounded-[30px]
              border
              border-white/[0.12]
              bg-[#0b0d0a]

              sm:rounded-[40px]

              lg:min-h-[525px]
            "
          >
            {/* Main card background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-20"
              style={{
                background:
                  "linear-gradient(125deg, #171b13 0%, #0d100c 40%, #070807 75%, #050605 100%)",
              }}
            />

            {/* Green light */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-[12%]
                -top-[38%]
                -z-10
                h-[620px]
                w-[620px]
                rounded-full
                bg-[#b7ef00]/[0.10]
                blur-[100px]
              "
            />

            {/* Bottom glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -bottom-[45%]
                left-[10%]
                -z-10
                h-[420px]
                w-[520px]
                rounded-full
                bg-white/[0.035]
                blur-[100px]
              "
            />

            {/* Fine top highlight */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-[8%]
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/40
                to-transparent
              "
            />

            {/* Decorative number */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-3
                -top-14
                text-[180px]
                font-black
                leading-none
                tracking-[-0.1em]
                text-white/[0.018]

                sm:-right-2
                sm:-top-24
                sm:text-[300px]

                lg:text-[360px]
              "
            >
              01
            </span>

            {/* Desktop divider */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[11%]
                left-1/2
                top-[11%]
                hidden
                w-px
                bg-gradient-to-b
                from-transparent
                via-white/10
                to-transparent

                lg:block
              "
            />

            <div
              className="
                grid
                min-h-[inherit]
                grid-cols-1

                lg:grid-cols-2
              "
            >
              {/* Left side */}
              <div
                className="
                  relative
                  flex
                  flex-col
                  justify-between
                  px-6
                  pb-9
                  pt-7

                  sm:px-10
                  sm:pb-11
                  sm:pt-10

                  lg:min-h-[525px]
                  lg:px-12
                  lg:py-12

                  xl:px-14
                "
              >
                <div>
                  <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#b7ef00]/30
                          bg-[#b7ef00]/10
                          text-[#b7ef00]
                        "
                      >
                        <LightningIcon />
                      </span>

                      <div>
                        <p
                          className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.24em]
                            text-white/35
                          "
                        >
                          Gym House
                        </p>

                        <p
                          className="
                            mt-1
                            text-[15px]
                            font-black
                            uppercase
                            tracking-[-0.025em]
                            text-white
                          "
                        >
                          Full Membership
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        rounded-full
                        border
                        border-white/10
                        bg-white/[0.035]
                        px-3
                        py-2
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-white/40
                      "
                    >
                      Monthly
                    </span>
                  </div>

                  <div className="mt-12 sm:mt-16 lg:mt-20">
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-white/30
                      "
                    >
                      Membership investment
                    </p>

                    <div
                      className="
                        mt-3
                        flex
                        flex-wrap
                        items-end
                        gap-x-3
                        gap-y-1
                      "
                    >
                      <span
                        className="
                          text-[clamp(4rem,18vw,6.3rem)]
                          font-black
                          leading-[0.78]
                          tracking-[-0.09em]
                          text-[#efffc8]

                          sm:text-[7.5rem]

                          lg:text-[6.7rem]

                          xl:text-[7.6rem]
                        "
                      >
                        2400
                      </span>

                      <div className="pb-1 sm:pb-2">
                        <p
                          className="
                            text-[17px]
                            font-black
                            uppercase
                            leading-none
                            tracking-[-0.04em]
                            text-[#b7ef00]
                          "
                        >
                          Birr
                        </p>

                        <p
                          className="
                            mt-1
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.17em]
                            text-white/25
                          "
                        >
                          Per month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-12
                    flex
                    items-center
                    justify-between
                    border-t
                    border-white/[0.07]
                    pt-6

                    lg:mt-8
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.21em]
                        text-white/25
                      "
                    >
                      Membership type
                    </p>

                    <p
                      className="
                        mt-2
                        text-[12px]
                        font-bold
                        uppercase
                        tracking-[0.08em]
                        text-white/75
                      "
                    >
                      Unlimited access
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.21em]
                        text-white/25
                      "
                    >
                      Status
                    </p>

                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#b7ef00]" />

                      <p
                        className="
                          text-[12px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-white/75
                        "
                      >
                        Available
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile separator */}
              <div
                aria-hidden="true"
                className="
                  mx-6
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent

                  sm:mx-10

                  lg:hidden
                "
              />

              {/* Right side */}
              <div
                className="
                  relative
                  flex
                  flex-col
                  justify-between
                  px-6
                  pb-8
                  pt-9

                  sm:px-10
                  sm:pb-10
                  sm:pt-11

                  lg:min-h-[525px]
                  lg:px-12
                  lg:py-12

                  xl:px-14
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.28em]
                      text-[#b7ef00]
                    "
                  >
                    Included with membership
                  </p>

                  <h3
                    className="
                      mt-5
                      max-w-[410px]
                      text-[30px]
                      font-black
                      leading-[0.95]
                      tracking-[-0.055em]
                      text-[#f4f5ef]

                      sm:text-[42px]

                      lg:text-[39px]

                      xl:text-[44px]
                    "
                  >
                    Everything You Need To
                    <span className="text-white/25">
                      {" "}
                      Keep Moving Forward.
                    </span>
                  </h3>

                  <div className="mt-9 space-y-3 sm:mt-10">
                    {membershipBenefits.map(
                      (benefit, index) => (
                        <div
                          key={benefit}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            gap-4
                            border-b
                            border-white/[0.065]
                            pb-3
                          "
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#b7ef00]/25
                                bg-[#b7ef00]/[0.075]
                                text-[#b7ef00]
                              "
                            >
                              <CheckIcon />
                            </span>

                            <span
                              className="
                                text-[12px]
                                font-semibold
                                text-white/70

                                sm:text-[13px]
                              "
                            >
                              {benefit}
                            </span>
                          </div>

                          <span
                            className="
                              text-[9px]
                              font-black
                              tracking-[0.14em]
                              text-white/15
                            "
                          >
                            0{index + 1}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div
                  className="
                    mt-10
                    rounded-[20px]
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    px-5
                    py-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#b7ef00]" />

                    <p
                      className="
                        text-[10px]
                        leading-[1.7]
                        text-white/35

                        sm:text-[11px]
                      "
                    >
                      A simple monthly membership
                      created for consistent
                      training, real progress and
                      long-term strength.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership card serial */}
            <p
              aria-hidden="true"
              className="
                absolute
                bottom-3
                left-1/2
                hidden
                -translate-x-1/2
                text-[7px]
                font-bold
                uppercase
                tracking-[0.45em]
                text-white/[0.09]

                lg:block
              "
            >
              GH — 2400 — FULL ACCESS
            </p>
          </article>
        </div>

        <p
          className="
            mx-auto
            mt-9
            max-w-[560px]
            text-center
            text-[9px]
            font-bold
            uppercase
            leading-5
            tracking-[0.22em]
            text-white/20

            sm:text-[10px]
          "
        >
          No complicated plans. No hidden tiers.
          Just full access to build a stronger you.
        </p>
      </div>
    </section>
  );
}