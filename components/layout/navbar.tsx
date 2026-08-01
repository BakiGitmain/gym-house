"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

const navigationLinks = [
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
    label: "Training",
    href: "#programs",
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-[14px] w-[14px]"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 7H17V16"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const navbarRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [isScrolled, setIsScrolled] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const indicatorIndex =
    hoveredIndex ?? activeIndex;

  function resetPointerEffect() {
    const element = navbarRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty(
      "--glass-x",
      "50%",
    );

    element.style.setProperty(
      "--glass-y",
      "0%",
    );

    element.style.setProperty(
      "--glass-shift-x",
      "0px",
    );

    element.style.setProperty(
      "--glass-shift-y",
      "0px",
    );

    element.style.setProperty(
      "--glass-rotate-x",
      "0deg",
    );

    element.style.setProperty(
      "--glass-rotate-y",
      "0deg",
    );
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const desktopMedia = window.matchMedia(
      "(min-width: 768px)",
    );

    function handleViewportChange() {
      setHoveredIndex(null);
      resetPointerEffect();

      if (desktopMedia.matches) {
        setIsMenuOpen(false);
      }
    }

    handleViewportChange();

    desktopMedia.addEventListener(
      "change",
      handleViewportChange,
    );

    window.addEventListener(
      "resize",
      handleViewportChange,
    );

    return () => {
      desktopMedia.removeEventListener(
        "change",
        handleViewportChange,
      );

      window.removeEventListener(
        "resize",
        handleViewportChange,
      );
    };
  }, []);

  useEffect(() => {
    function handleEscapeKey(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 18);
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  useEffect(() => {
    const observedSections =
      navigationLinks.flatMap(
        (link, index) => {
          const section =
            document.querySelector<HTMLElement>(
              link.href,
            );

          if (!section) {
            return [];
          }

          return [
            {
              section,
              index,
            },
          ];
        },
      );

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter(
            (entry) => entry.isIntersecting,
          )
          .sort(
            (first, second) =>
              second.intersectionRatio -
              first.intersectionRatio,
          );

        const mostVisible =
          visibleEntries[0];

        if (!mostVisible) {
          return;
        }

        const index =
          navigationLinks.findIndex(
            (link) =>
              link.href ===
              `#${mostVisible.target.id}`,
          );

        if (index >= 0) {
          setActiveIndex(index);
        }
      },
      {
        rootMargin: "-22% 0px -62% 0px",
        threshold: [
          0.05,
          0.15,
          0.3,
          0.5,
        ],
      },
    );

    observedSections.forEach(
      ({ section }) => {
        observer.observe(section);
      },
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function selectNavigation(
    index: number,
  ) {
    setActiveIndex(index);
    setHoveredIndex(null);
    setIsMenuOpen(false);
  }

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const element = navbarRef.current;

    if (!element) {
      return;
    }

    const bounds =
      element.getBoundingClientRect();

    if (
      bounds.width === 0 ||
      bounds.height === 0
    ) {
      return;
    }

    const x =
      ((event.clientX - bounds.left) /
        bounds.width) *
      100;

    const y =
      ((event.clientY - bounds.top) /
        bounds.height) *
      100;

    const normalizedX =
      (x - 50) / 50;

    const normalizedY =
      (y - 50) / 50;

    element.style.setProperty(
      "--glass-x",
      `${x}%`,
    );

    element.style.setProperty(
      "--glass-y",
      `${y}%`,
    );

    element.style.setProperty(
      "--glass-shift-x",
      `${normalizedX * 10}px`,
    );

    element.style.setProperty(
      "--glass-shift-y",
      `${normalizedY * 5}px`,
    );

    element.style.setProperty(
      "--glass-rotate-x",
      `${normalizedY * -0.75}deg`,
    );

    element.style.setProperty(
      "--glass-rotate-y",
      `${normalizedX * 0.75}deg`,
    );
  }

  return (
    <header className="site-navbar fixed left-0 top-0 z-[100] w-full px-3 pt-3 sm:px-5 sm:pt-4 lg:px-7 lg:pt-5">
      <div
        ref={navbarRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointerEffect}
        className={`liquid-navbar relative z-[120] mx-auto flex h-[64px] w-full max-w-[1760px] items-center justify-between px-4 sm:h-[72px] sm:px-5 lg:h-[78px] lg:px-6 ${
          isScrolled
            ? "liquid-navbar-scrolled"
            : ""
        }`}
      >
        <span
          aria-hidden="true"
          className="liquid-navbar-base"
        />

        <span
          aria-hidden="true"
          className="liquid-navbar-refraction"
        />

        <span
          aria-hidden="true"
          className="liquid-navbar-spectrum"
        />

        <span
          aria-hidden="true"
          className="liquid-navbar-caustic"
        />

        <span
          aria-hidden="true"
          className="liquid-navbar-shine"
        />

        <Link
          href="/"
          onClick={closeMenu}
          className="navbar-logo relative z-10 flex shrink-0 items-center"
        >
          <span className="text-[clamp(17px,1.25vw,23px)] font-black uppercase tracking-[-0.065em] text-white">
            GYM
          </span>

          <span className="ml-1.5 text-[clamp(17px,1.25vw,23px)] font-black uppercase tracking-[-0.065em] text-[#baff00]">
            House
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          onMouseLeave={() => {
            setHoveredIndex(null);
          }}
          className="desktop-nav-shell absolute left-1/2 hidden -translate-x-1/2 md:grid"
        >
          <span
            aria-hidden="true"
            className="desktop-nav-liquid-indicator"
            style={{
              transform: `translate3d(${
                indicatorIndex * 100
              }%, 0, 0)`,
            }}
          >
            <span className="desktop-indicator-reflection" />
            <span className="desktop-indicator-spectrum" />
          </span>

          {navigationLinks.map(
            (link, index) => {
              const isHighlighted =
                indicatorIndex === index;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={
                    activeIndex === index
                      ? "page"
                      : undefined
                  }
                  onMouseEnter={() => {
                    setHoveredIndex(index);
                  }}
                  onFocus={() => {
                    setHoveredIndex(index);
                  }}
                  onBlur={() => {
                    setHoveredIndex(null);
                  }}
                  onClick={() => {
                    selectNavigation(index);
                  }}
                  className={`desktop-nav-link ${
                    isHighlighted
                      ? "desktop-nav-link-active"
                      : ""
                  }`}
                >
                  <span className="relative z-10">
                    {link.label}
                  </span>
                </Link>
              );
            },
          )}
        </nav>

        <Link
          href="/login"
          className="liquid-login-button relative z-10 hidden md:flex"
        >
          <span
            aria-hidden="true"
            className="liquid-login-reflection"
          />

          <span className="relative z-10">
            Login
          </span>

          <span
            aria-hidden="true"
            className="liquid-login-icon"
          >
            <ArrowIcon />
          </span>
        </Link>

        <button
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsMenuOpen(
              (current) => !current,
            );
          }}
          className="liquid-menu-button relative z-10 flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="liquid-menu-reflection" />

          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 h-[1.5px] rounded-full bg-white transition-all duration-300 ${
                isMenuOpen
                  ? "top-[7px] w-6 rotate-45"
                  : "top-0 w-6"
              }`}
            />

            <span
              className={`absolute left-0 top-[7px] h-[1.5px] rounded-full bg-white transition-all duration-300 ${
                isMenuOpen
                  ? "w-0 opacity-0"
                  : "w-4 opacity-100"
              }`}
            />

            <span
              className={`absolute left-0 h-[1.5px] rounded-full bg-white transition-all duration-300 ${
                isMenuOpen
                  ? "top-[7px] w-6 -rotate-45"
                  : "top-[14px] w-6"
              }`}
            />
          </span>
        </button>
      </div>

      <button
        type="button"
        aria-label="Close navigation menu"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-[6px] transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        className={`liquid-mobile-menu fixed left-3 right-3 top-[84px] z-[110] overflow-hidden sm:left-5 sm:right-5 sm:top-[96px] md:hidden ${
          isMenuOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-3 scale-[0.985] opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="liquid-mobile-spectrum"
        />

        <span
          aria-hidden="true"
          className="liquid-mobile-shine"
        />

        <nav className="relative z-10 flex w-full flex-col px-5 pb-6 pt-2">
          {navigationLinks.map(
            (link, index) => (
              <Link
                key={link.label}
                href={link.href}
                tabIndex={
                  isMenuOpen ? 0 : -1
                }
                onClick={() => {
                  selectNavigation(index);
                }}
                className="mobile-navigation-link group flex min-h-[58px] items-center justify-between border-b border-white/[0.07] text-[15px] font-semibold text-white/70 transition-colors duration-200 hover:text-white"
              >
                <span>{link.label}</span>

                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "scale-100 bg-[#baff00]"
                      : "scale-75 bg-white/15 group-hover:scale-100 group-hover:bg-[#baff00]"
                  }`}
                />
              </Link>
            ),
          )}

          <Link
            href="/login"
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={closeMenu}
            className="mobile-login-button relative mt-5 flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-full px-6 text-sm font-black text-black transition-transform duration-200 active:scale-[0.98]"
          >
            <span className="mobile-login-reflection" />

            <span className="relative z-10">
              Login
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}