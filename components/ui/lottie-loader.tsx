"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type LottieLoaderProps = {
  fullScreen?: boolean;
  size?: number;
};

export default function LottieLoader({
  fullScreen = true,
  size = 180,
}: LottieLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading website"
      className={
        fullScreen
          ? "flex min-h-screen w-full items-center justify-center bg-black"
          : "flex items-center justify-center"
      }
    >
      <div
        style={{
          width: size,
          height: size,
        }}
        className="shrink-0"
      >
        <DotLottieReact
          src="/animations/loader.lottie"
          autoplay
          loop
          className="h-full w-full"
          renderConfig={{
            autoResize: true,
          }}
        />
      </div>

      <span className="sr-only">
        Loading...
      </span>
    </div>
  );
}