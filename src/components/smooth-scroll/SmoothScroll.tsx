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

    return () => lenis.destroy();
  }, []);

  return null;
}
