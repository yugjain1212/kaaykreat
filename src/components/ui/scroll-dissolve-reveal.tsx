"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import styles from "./scroll-dissolve-reveal.module.css";

export interface ScrollDissolveRevealProps {
  imageFront: string;
  children: ReactNode;
}

const dissolveTiming: KeyframeAnimationOptions = {
  duration: 1350,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  fill: "forwards",
};

export function ScrollDissolveReveal({
  imageFront,
  children,
}: ScrollDissolveRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const releaseScroll = useCallback(() => {
    window.dispatchEvent(new CustomEvent("kaay:scroll-lock", { detail: false }));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    const grain = grainRef.current;
    if (!section || !overlay || !grain) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const aboutContent = section.querySelector<HTMLElement>("[data-about-content]");
    let frame = 0;
    let activeAnimations: Animation[] = [];

    const reveal = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      if (reduceMotion) {
        overlay.hidden = true;
        return;
      }

      window.dispatchEvent(new CustomEvent("kaay:scroll-lock", { detail: true }));

      if (aboutContent) {
        aboutContent.style.opacity = "0";
        aboutContent.style.transform = "translate3d(0, 14px, 0)";
      }

      const dissolve = overlay.animate(
        [
          { opacity: 1, filter: "grayscale(0) contrast(1) blur(0)", transform: "scale(1)" },
          {
            opacity: 0.78,
            filter: "grayscale(0.55) contrast(1.28) blur(0.55px)",
            transform: "scale(1.008)",
            offset: 0.58,
          },
          { opacity: 0, filter: "grayscale(1) contrast(1.45) blur(2px)", transform: "scale(1.025)" },
        ],
        dissolveTiming,
      );
      const grainDissolve = grain.animate(
        [
          { opacity: 0.06, transform: "scale(1)" },
          { opacity: 0.52, transform: "scale(1.18)", offset: 0.45 },
          { opacity: 0, transform: "scale(1.42)" },
        ],
        dissolveTiming,
      );
      const contentReveal = aboutContent?.animate(
        [
          { opacity: 0, transform: "translate3d(0, 14px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 620,
          delay: 1040,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );

      activeAnimations = contentReveal
        ? [dissolve, grainDissolve, contentReveal]
        : [dissolve, grainDissolve];

      void dissolve.finished
        .catch(() => undefined)
        .then(() => {
          if (dissolve.playState !== "finished") return;
          overlay.hidden = true;
          releaseScroll();
        });
    };

    const checkPosition = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= 2 && bounds.bottom > 0) reveal();
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(checkPosition);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    checkPosition();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      activeAnimations.forEach((animation) => animation.cancel());
      releaseScroll();
    };
  }, [releaseScroll]);

  return (
    <div ref={sectionRef} className={styles.section}>
      {children}
      <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
        <Image
          src={imageFront}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.image}
        />
        <div ref={grainRef} className={styles.grain} />
      </div>
    </div>
  );
}
