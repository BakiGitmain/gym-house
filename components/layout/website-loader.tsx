"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

const MINIMUM_VISIBLE_TIME = 800;
const MAXIMUM_WAIT_TIME = 12000;
const FADE_DURATION = 600;

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function waitForImage(
  image: HTMLImageElement,
  signal: AbortSignal,
) {
  if (signal.aborted) {
    return;
  }

  if (!image.complete) {
    await new Promise<void>((resolve) => {
      function finishWaiting() {
        resolve();
      }

      image.addEventListener(
        "load",
        finishWaiting,
        {
          once: true,
          signal,
        },
      );

      image.addEventListener(
        "error",
        finishWaiting,
        {
          once: true,
          signal,
        },
      );
    });
  }

  if (
    signal.aborted ||
    image.naturalWidth === 0
  ) {
    return;
  }

  try {
    await image.decode();
  } catch {
    // The image may already be decoded or
    // the browser may not support decoding.
  }
}

export default function WebsiteLoader() {
  const [isVisible, setIsVisible] =
    useState(true);

  const [isLeaving, setIsLeaving] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    const startedAt = performance.now();

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    function restorePageScrolling() {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;
    }

    async function startLoading() {
      /*
       * Wait for React and Next.js to place
       * the page images in the DOM.
       */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      if (controller.signal.aborted) {
        return;
      }

      const importantImages = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          'img[data-page-loader="true"]',
        ),
      );

      const imageLoadingPromise =
        Promise.all(
          importantImages.map((image) =>
            waitForImage(
              image,
              controller.signal,
            ),
          ),
        );

      /*
       * Wait for every marked image.
       * The timeout prevents a broken image
       * from locking the website forever.
       */
      await Promise.race([
        imageLoadingPromise,
        delay(MAXIMUM_WAIT_TIME),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      const elapsedTime =
        performance.now() - startedAt;

      const remainingMinimumTime =
        Math.max(
          MINIMUM_VISIBLE_TIME -
            elapsedTime,
          0,
        );

      if (remainingMinimumTime > 0) {
        await delay(
          remainingMinimumTime,
        );
      }

      if (controller.signal.aborted) {
        return;
      }

      setIsLeaving(true);

      await delay(FADE_DURATION);

      if (controller.signal.aborted) {
        return;
      }

      setIsVisible(false);
      restorePageScrolling();
    }

    startLoading();

    return () => {
      controller.abort();
      restorePageScrolling();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Gym House"
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#080908] transition-opacity ease-out ${
        isLeaving
          ? "opacity-0"
          : "opacity-100"
      }`}
      style={{
        transitionDuration: `${FADE_DURATION}ms`,
      }}
    >
      <div
        className={`h-[140px] w-[140px] transition-all ease-out sm:h-[180px] sm:w-[180px] ${
          isLeaving
            ? "scale-90 opacity-0"
            : "scale-100 opacity-100"
        }`}
        style={{
          transitionDuration: `${FADE_DURATION}ms`,
        }}
      >
        <DotLottieReact
          src="/animations/loader.lottie"
          autoplay
          loop
          className="h-full w-full"
        />
      </div>

      <span className="sr-only">
        Loading images...
      </span>
    </div>
  );
}