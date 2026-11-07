"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.12,
      respectReducedMotion: true,
    });

    const handleScrollLock = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    window.addEventListener("kaay:scroll-lock", handleScrollLock);

    return () => {
      window.removeEventListener("kaay:scroll-lock", handleScrollLock);
      lenis.start();
      lenis.destroy();
    };
  }, []);

  return null;
}
