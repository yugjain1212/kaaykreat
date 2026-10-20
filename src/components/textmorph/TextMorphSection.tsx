"use client";

import { useEffect, useRef } from "react";
import GhostFibers from "@/components/ui/GhostFibers";
import styles from "./textmorph.module.css";

export default function TextMorphSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!("IntersectionObserver" in window)) return;

    section.dataset.motionReady = "true";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.visible = "true";
        observer.disconnect();
      },
      { threshold: 0.24, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="studio-approach">
      <div className={styles.background} aria-hidden="true">
        <GhostFibers
          glowColor="#3b5476"
          layers={3}
          twist={0}
          threads={67}
          fiberStyle="dots"
          depthOfField={0.7}
          hoverEffect="focus"
          intro
          mouseInteraction
          lineColor="#ffffff"
          secondaryColor="#3b5476"
          gradient="depth"
          waves={1}
          volume={0.55}
          spread={2.05}
          scale={1.3}
          rotation={3}
          perspective={0.75}
          density={1}
          thickness={1}
          tips={0}
          foldGlow={1}
          speed={0.4}
          flow={0.4}
          rollSpeed={0.15}
          focusDepth={0}
          particles={0.85}
          sparkle={0.5}
          glow={0.8}
          brightness={0.7}
          vignette={0.3}
          grain={0.06}
          mouseStrength={1}
          pulseOnClick
          lightMode={false}
        />
      </div>
      <div className={styles.content}>
        <h2 id="studio-approach" className={styles.heading}>
          <span className={styles.word}>Imagine,</span>
          <span className={styles.word}>Create, Launch</span>
        </h2>

        <div className={styles.copy}>
          <p className={styles.copyText}>
            We bring ideas to life through thoughtful design, technology and
            motion — from the first spark to the final launch.
          </p>
          <p className={styles.copyMeta}>Every project starts with an obsession.</p>
        </div>
      </div>
    </section>
  );
}
