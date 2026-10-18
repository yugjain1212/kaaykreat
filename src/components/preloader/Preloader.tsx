"use client";

/**
 * Kaay Kreat — Cinematic Preloader
 *
 * Composition: two ASCII hands + K logo only. No text, no progress bar.
 *
 * Stage 1 (0.0s) — Hands slide in from their corners
 * Stage 2 (0.9s) — K logo fades + scales up
 * Stage 3 (3.0s) — Hands retract, logo travels into the navbar
 *
 * prefers-reduced-motion: collapses to a simple opacity fade.
 */

import { useEffect, useRef } from "react";
import MetallicPaint from "./MetallicPaint";
import styles from "./preloader.module.css";

export default function Preloader() {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const leftHandRef  = useRef<HTMLDivElement>(null);
  const rightHandRef = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const timelineRef  = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (timelineRef.current) return; // guard against Strict Mode double-invoke

    const run = async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      document.body.classList.add("preloader-active");

      const overlay   = overlayRef.current;
      const leftHand  = leftHandRef.current;
      const rightHand = rightHandRef.current;
      const logo      = logoRef.current;
      const navbarLogo = document.getElementById("kaay-navbar-logo");
      const main      = document.getElementById("main-content");

      if (!overlay || !leftHand || !rightHand || !logo) return;

      // ── Reduced-motion ──────────────────────────────────────────────────────
      if (prefersReduced) {
        const tl = gsap.timeline({
          onComplete: () => {
            document.body.classList.remove("preloader-active");
            overlay.style.display = "none";
            if (main) gsap.set(main, { opacity: 1 });
          },
        });
        timelineRef.current = tl;
        tl.to(overlay, { opacity: 0, duration: 0.6, ease: "power2.inOut" });
        if (main) tl.to(main, { opacity: 1, duration: 0.4 }, "<");
        return;
      }

      // ── Initial states ──────────────────────────────────────────────────────
      gsap.set(leftHand,  { x: "-65%", y: "65%",  opacity: 0, rotateZ: -6 });
      gsap.set(rightHand, { x:  "65%", y: "-65%", opacity: 0, rotateZ:  6 });
      gsap.set(logo,      { opacity: 0, scale: 0.82, x: 0, y: 0 });
      if (navbarLogo) gsap.set(navbarLogo, { autoAlpha: 0 });

      const logoStart = logo.getBoundingClientRect();
      const logoEnd = navbarLogo?.getBoundingClientRect();
      const canTravel = !!logoEnd && logoEnd.width > 0 && logoStart.width > 0;
      const travel = canTravel && logoEnd
        ? {
            x: logoEnd.left + logoEnd.width / 2 - (logoStart.left + logoStart.width / 2),
            y: logoEnd.top + logoEnd.height / 2 - (logoStart.top + logoStart.height / 2),
            scaleX: logoEnd.width / logo.offsetWidth,
            scaleY: logoEnd.height / logo.offsetHeight,
          }
        : null;

      const tl = gsap.timeline({
        onComplete: () => {
          if (navbarLogo) gsap.set(navbarLogo, { autoAlpha: 1 });
          document.body.classList.remove("preloader-active");
          overlay.style.display = "none";
        },
      });
      timelineRef.current = tl;

      // Stage 1 — hands enter
      tl.to(leftHand, {
        x: "0%", y: "0%", opacity: 1, rotateZ: 0,
        duration: 1.2, ease: "power3.out",
      }, 0);
      tl.to(rightHand, {
        x: "0%", y: "0%", opacity: 1, rotateZ: 0,
        duration: 1.2, ease: "power3.out",
      }, 0.1);

      // Stage 2 — logo reveals
      tl.to(logo, {
        opacity: 1, scale: 1,
        duration: 0.9, ease: "power2.out",
      }, 0.9);

      // Hold —————————————————————————————————————————————————————————————————

      // Stage 3 — hands retract
      tl.to(leftHand, {
        x: "-65%", y: "65%", opacity: 0, rotateZ: -6,
        duration: 0.9, ease: "power2.in",
      }, 3.0);
      tl.to(rightHand, {
        x: "65%", y: "-65%", opacity: 0, rotateZ: 6,
        duration: 0.9, ease: "power2.in",
      }, 3.1);

      // Move this same logo element into the measured navbar logo position.
      if (travel) {
        tl.to(logo, {
          ...travel,
          duration: 0.95,
          ease: "power3.inOut",
        }, 3.05);
      } else {
        tl.to(logo, { opacity: 0, duration: 0.4, ease: "power2.in" }, 3.05);
      }

      if (main) tl.to(main, { opacity: 1, duration: 0.65, ease: "power2.out" }, 3.05);
      tl.to(overlay, { backgroundColor: "rgba(0, 0, 0, 0)", duration: 0.95, ease: "power2.inOut" }, 3.05);
    };

    run();

    return () => {
      cancelled = true;
      timelineRef.current?.kill();
      timelineRef.current = null;
      document.body.classList.remove("preloader-active");
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="status"
      aria-label="Loading Kaay Kreat"
      aria-live="polite"
    >
      {/* Left ASCII hand — bottom-left corner */}
      <div ref={leftHandRef} className={styles.handLeft} aria-hidden="true">
        <MetallicPaint
          imageSrc="/lefthand.svg"
          color="#b4b4ba"
          density={1.6}
          softness={0.6}
          dispersion={0}
          distortion={0.05}
          edgeBend={0.5}
          angle={90}
          scale={0.6}
          speed={1}
          rotation={0}
          mouseTilt={0}
          intro
          className={styles.handMetallic}
        />
      </div>

      {/* Right ASCII hand — top-right corner */}
      <div ref={rightHandRef} className={styles.handRight} aria-hidden="true">
        <MetallicPaint
          imageSrc="/righthand.svg"
          color="#b4b4ba"
          density={1.6}
          softness={0.6}
          dispersion={0}
          distortion={0.05}
          edgeBend={0.5}
          angle={90}
          scale={0.6}
          speed={1}
          rotation={0}
          mouseTilt={0}
          intro
          className={styles.handMetallic}
        />
      </div>

      {/* K logo — dead center */}
      <div className={styles.center} aria-hidden="true">
        <div ref={logoRef} className={styles.logoTravel}>
          <MetallicPaint
            imageSrc="/logo.svg"
            color="#b4b4ba"
            density={1.6}
            softness={0.6}
            dispersion={0}
            distortion={0.05}
            edgeBend={0.5}
            angle={90}
            scale={0.6}
            speed={1}
            rotation={0}
            mouseTilt={0}
            intro
            className={styles.metallicPaint}
          />
        </div>
      </div>
    </div>
  );
}
