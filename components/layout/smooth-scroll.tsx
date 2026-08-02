"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({
  children,
}: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.075,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.15,
        infinite: false,

        // Smoothly handles every internal link:
        // #home, #features, #programs, #membership, etc.
        anchors: {
          lock: true,
        },

        // Stops any previous wheel momentum before
        // moving to the selected section.
        stopInertiaOnNavigate: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}