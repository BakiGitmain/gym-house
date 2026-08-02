"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

const IMAGE_SELECTOR =
  'img[data-page-loader="true"]';

const MINIMUM_VISIBLE_TIME = 900;
const DISCOVERY_QUIET_TIME = 250;
const MAXIMUM_DISCOVERY_TIME = 1500;
const MAXIMUM_LOADING_TIME = 20000;
const FADE_DURATION = 550;

function wait(
  milliseconds: number,
  signal?: AbortSignal,
) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    let completed = false;

    function finish() {
      if (completed) {
        return;
      }

      completed = true;

      window.clearTimeout(timeoutId);

      signal?.removeEventListener(
        "abort",
        finish,
      );

      resolve();
    }

    const timeoutId = window.setTimeout(
      finish,
      milliseconds,
    );

    signal?.addEventListener(
      "abort",
      finish,
      {
        once: true,
      },
    );
  });
}

function waitForTwoAnimationFrames(
  signal: AbortSignal,
) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    let firstFrameId = 0;
    let secondFrameId = 0;
    let completed = false;

    function finish() {
      if (completed) {
        return;
      }

      completed = true;

      if (firstFrameId !== 0) {
        cancelAnimationFrame(firstFrameId);
      }

      if (secondFrameId !== 0) {
        cancelAnimationFrame(secondFrameId);
      }

      signal.removeEventListener(
        "abort",
        finish,
      );

      resolve();
    }

    signal.addEventListener(
      "abort",
      finish,
      {
        once: true,
      },
    );

    firstFrameId = requestAnimationFrame(
      () => {
        secondFrameId =
          requestAnimationFrame(() => {
            finish();
          });
      },
    );
  });
}

function findMarkedImages() {
  return Array.from(
    document.querySelectorAll<HTMLImageElement>(
      IMAGE_SELECTOR,
    ),
  );
}

async function discoverMarkedImages(
  signal: AbortSignal,
) {
  const discoveredImages =
    new Set<HTMLImageElement>();

  const startedAt = performance.now();
  let lastImageFoundAt = startedAt;

  function collectImages() {
    let foundNewImage = false;

    findMarkedImages().forEach((image) => {
      if (!discoveredImages.has(image)) {
        discoveredImages.add(image);
        foundNewImage = true;
      }
    });

    if (foundNewImage) {
      lastImageFoundAt = performance.now();
    }
  }

  collectImages();

  const observer = new MutationObserver(() => {
    collectImages();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  while (!signal.aborted) {
    collectImages();

    const currentTime = performance.now();

    const totalDiscoveryTime =
      currentTime - startedAt;

    const quietTime =
      currentTime - lastImageFoundAt;

    const discoveryFinished =
      quietTime >= DISCOVERY_QUIET_TIME;

    const discoveryTimedOut =
      totalDiscoveryTime >=
      MAXIMUM_DISCOVERY_TIME;

    if (
      discoveryFinished ||
      discoveryTimedOut
    ) {
      break;
    }

    await wait(50, signal);
  }

  observer.disconnect();

  return Array.from(discoveredImages);
}

async function decodeLoadedImage(
  image: HTMLImageElement,
  signal: AbortSignal,
) {
  if (
    signal.aborted ||
    !image.complete ||
    image.naturalWidth === 0
  ) {
    return;
  }

  try {
    await image.decode();
  } catch {
    /*
     * Some browsers reject decode() even
     * when the image has loaded correctly.
     */
  }
}

async function waitForImage(
  image: HTMLImageElement,
  signal: AbortSignal,
) {
  if (signal.aborted) {
    return;
  }

  if (image.complete) {
    await decodeLoadedImage(
      image,
      signal,
    );

    return;
  }

  await new Promise<void>((resolve) => {
    let completed = false;

    function cleanup() {
      image.removeEventListener(
        "load",
        handleLoad,
      );

      image.removeEventListener(
        "error",
        handleError,
      );

      signal.removeEventListener(
        "abort",
        handleAbort,
      );
    }

    function finish() {
      if (completed) {
        return;
      }

      completed = true;
      cleanup();
      resolve();
    }

    function handleLoad() {
      finish();
    }

    function handleError() {
      /*
       * Broken images must not keep the
       * website locked forever.
       */
      finish();
    }

    function handleAbort() {
      finish();
    }

    image.addEventListener(
      "load",
      handleLoad,
      {
        once: true,
      },
    );

    image.addEventListener(
      "error",
      handleError,
      {
        once: true,
      },
    );

    signal.addEventListener(
      "abort",
      handleAbort,
      {
        once: true,
      },
    );

    /*
     * The image may finish between the
     * first complete check and adding the
     * event listeners.
     */
    if (image.complete) {
      finish();
    }
  });

  await decodeLoadedImage(
    image,
    signal,
  );
}

export default function WebsiteLoader() {
  const [isVisible, setIsVisible] =
    useState(true);

  const [isLeaving, setIsLeaving] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    const { signal } = controller;

    const startedAt = performance.now();

    const originalBodyOverflow =
      document.body.style.overflow;

    const originalBodyTouchAction =
      document.body.style.touchAction;

    const originalHtmlOverflow =
      document.documentElement.style
        .overflow;

    let scrollingRestored = false;

    function lockScrolling() {
      document.body.style.overflow =
        "hidden";

      document.body.style.touchAction =
        "none";

      document.documentElement.style.overflow =
        "hidden";
    }

    function restoreScrolling() {
      if (scrollingRestored) {
        return;
      }

      scrollingRestored = true;

      document.body.style.overflow =
        originalBodyOverflow;

      document.body.style.touchAction =
        originalBodyTouchAction;

      document.documentElement.style.overflow =
        originalHtmlOverflow;
    }

    async function loadWebsite() {
      lockScrolling();

      /*
       * Wait for React and Next.js to place
       * initial server and client images
       * into the page.
       */
      await waitForTwoAnimationFrames(
        signal,
      );

      if (signal.aborted) {
        return;
      }

      const images =
        await discoverMarkedImages(signal);

      if (signal.aborted) {
        return;
      }

      const loadingPromise = Promise.all(
        images.map((image) =>
          waitForImage(image, signal),
        ),
      ).then(() => undefined);

      /*
       * Wait for every marked image, with
       * a safety timeout for failed networks.
       */
      await Promise.race([
        loadingPromise,
        wait(
          MAXIMUM_LOADING_TIME,
          signal,
        ),
      ]);

      if (signal.aborted) {
        return;
      }

      const elapsed =
        performance.now() - startedAt;

      const remainingMinimumTime =
        Math.max(
          MINIMUM_VISIBLE_TIME - elapsed,
          0,
        );

      if (remainingMinimumTime > 0) {
        await wait(
          remainingMinimumTime,
          signal,
        );
      }

      if (signal.aborted) {
        return;
      }

      setIsLeaving(true);

      await wait(
        FADE_DURATION,
        signal,
      );

      if (signal.aborted) {
        return;
      }

      setIsVisible(false);
      restoreScrolling();
    }

    void loadWebsite();

    return () => {
      controller.abort();
      restoreScrolling();
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
          ? "pointer-events-none opacity-0"
          : "pointer-events-auto opacity-100"
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
        Loading website images
      </span>
    </div>
  );
}