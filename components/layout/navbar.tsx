"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
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

function LogoMark() {
  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="simple-brand-icon"
    >
      <path
        d="M11.4 13.7C14.1 9.8 18.2 7.5 22.9 7.5C28.2 7.5 33 10.5 35.3 15.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M30.8 28.9C28.2 32.3 24.5 34.4 20.2 34.4C14.5 34.4 9.4 31 7.3 25.9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M9.2 22.3L16.2 17.1L20.1 22L27.9 15.9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M27.7 15.8L33.1 19.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <path
        d="M10 25.4L15.2 29"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="simple-arrow-icon"
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

function MenuIcon({
  isOpen,
}: {
  isOpen: boolean;
}) {
  return (
    <span
      className={`simple-menu-icon ${
        isOpen ? "is-open" : ""
      }`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const indicatorIndex =
    hoveredIndex ?? activeIndex;

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
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  useEffect(() => {
    const desktopMedia = window.matchMedia(
      "(min-width: 1024px)",
    );

    function handleDesktopChange(
      event: MediaQueryListEvent,
    ) {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    }

    desktopMedia.addEventListener(
      "change",
      handleDesktopChange,
    );

    return () => {
      desktopMedia.removeEventListener(
        "change",
        handleDesktopChange,
      );
    };
  }, []);

  useEffect(() => {
    const sections =
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
        const visibleSection = entries
          .filter(
            (entry) => entry.isIntersecting,
          )
          .sort(
            (first, second) =>
              second.intersectionRatio -
              first.intersectionRatio,
          )[0];

        if (!visibleSection) {
          return;
        }

        const matchingSection =
          sections.find(
            ({ section }) =>
              section ===
              visibleSection.target,
          );

        if (matchingSection) {
          setActiveIndex(
            matchingSection.index,
          );
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [
          0.05,
          0.15,
          0.3,
          0.5,
        ],
      },
    );

    sections.forEach(({ section }) => {
      observer.observe(section);
    });

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
    closeMenu();
  }

  const navigationStyle = {
    "--navigation-index": indicatorIndex,
    "--navigation-count":
      navigationLinks.length,
  } as CSSProperties;

  return (
    <header className="simple-site-header">
      <div className="simple-navbar">
        <Link
          href="/"
          onClick={closeMenu}
          className="simple-brand"
          aria-label="GYM House homepage"
        >
          <LogoMark />

          <span className="simple-brand-name">
            <span>GYM</span>

            <span className="simple-brand-accent">
              House
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="simple-desktop-navigation"
          style={navigationStyle}
          onMouseLeave={() => {
            setHoveredIndex(null);
          }}
        >
          <span
            aria-hidden="true"
            className="simple-navigation-indicator"
          />

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
                  className={`simple-navigation-link ${
                    isHighlighted
                      ? "is-highlighted"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            },
          )}
        </nav>

        <Link
          href="/login"
          className="simple-navbar-cta"
        >
          <span>Login</span>
          <ArrowIcon />
        </Link>

        <button
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="simple-mobile-navigation"
          onClick={() => {
            setIsMenuOpen(
              (current) => !current,
            );
          }}
          className={`simple-menu-button ${
            isMenuOpen ? "is-open" : ""
          }`}
        >
          <MenuIcon isOpen={isMenuOpen} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Close navigation menu"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeMenu}
        className={`simple-mobile-overlay ${
          isMenuOpen ? "is-visible" : ""
        }`}
      />

      <div
        id="simple-mobile-navigation"
        aria-hidden={!isMenuOpen}
        className={`simple-mobile-navigation ${
          isMenuOpen ? "is-open" : ""
        }`}
      >
        <div className="simple-mobile-menu-header">
          <span>Navigation</span>

          <span className="simple-mobile-menu-count">
            0{navigationLinks.length}
          </span>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="simple-mobile-links"
        >
          {navigationLinks.map(
            (link, index) => {
              const isActive =
                activeIndex === index;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  tabIndex={
                    isMenuOpen ? 0 : -1
                  }
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  onClick={() => {
                    selectNavigation(index);
                  }}
                  className={`simple-mobile-link ${
                    isActive
                      ? "is-active"
                      : ""
                  }`}
                >
                  <span className="simple-mobile-link-number">
                    0{index + 1}
                  </span>

                  <span className="simple-mobile-link-label">
                    {link.label}
                  </span>

                  <span className="simple-mobile-link-arrow">
                    <ArrowIcon />
                  </span>
                </Link>
              );
            },
          )}
        </nav>

        <Link
  href="/login"
  tabIndex={isMenuOpen ? 0 : -1}
  onClick={closeMenu}
  className="simple-mobile-cta"
>
  <span>Login</span>

  <span className="simple-mobile-cta-icon">
    <ArrowIcon />
  </span>
</Link>
      </div>
    </header>
  );
}