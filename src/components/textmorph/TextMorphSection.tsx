"use client";

import { useEffect, useRef } from "react";
import PatternWaves from "@/components/ui/PatternWaves";
import styles from "./textmorph.module.css";

const stages = [
  {
    word: "IMAGINE",
    body: "We bring ideas to life through thoughtful design, technology and motion — from the first spark to the final launch.",
    note: "Every project starts with an obsession.",
  },
  {
    word: "CREATE",
    body: "We turn direction into reality, combining considered design, purposeful engineering and experimentation.",
    note: "Make the idea impossible to ignore.",
  },
  {
    word: "LAUNCH",
    body: "We refine the details, test the experience and bring the finished work into the world.",
    note: "Built with intention. Ready to make an impact.",
  },
];

type TextMorphSectionProps = {
  transitionManaged?: boolean;
};

export default function TextMorphSection({ transitionManaged = false }: TextMorphSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (transitionManaged) return;

    let revertMotion: () => void = () => {};
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      revertMotion = () => media.revert();
      media.add("(min-width: 701px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-stage]", section);
        const content = section.querySelector<HTMLElement>(`.${styles.content}`);
        let active = 0;

        gsap.set(panels, { autoAlpha: 0, y: 18 });
        gsap.set(panels[0], { autoAlpha: 1, y: 0 });
        panels.forEach((panel, index) => panel.setAttribute("aria-hidden", String(index !== 0)));

        // Start content scaled down for the zoom-in entry
        if (content) {
          gsap.set(content, { scale: 0.72, autoAlpha: 0, transformOrigin: "50% 50%" });
        }

        // Total scroll distance:
        //   0.00 → 0.28  zoom-in entry  (content scales 0.72 → 1, fades in)
        //   0.28 → 1.00  word cycling   (same proportions as before, shifted right)
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.4}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Remap progress past the intro phase (0.28) into [0,1] for stage tracking
              const morphProgress = Math.max(0, (self.progress - 0.28) / 0.72);
              const next = morphProgress < 0.38 ? 0 : morphProgress < 0.75 ? 1 : 2;
              if (next === active) return;
              active = next;
              panels.forEach((panel, index) =>
                panel.setAttribute("aria-hidden", String(index !== active))
              );
            },
          },
        });

        // ── Phase 1: zoom-in entry (0 → 0.28 of total progress) ──────────
        if (content) {
          timeline
            .to(content, { autoAlpha: 1, duration: 0.14, ease: "none" }, 0)
            .to(content, { scale: 1, duration: 0.28, ease: "power2.out" }, 0);
        }

        // ── Phase 2: word cycling (starts at 0.28) ────────────────────────
        // Original keyframes were at 0.78 and 1.78 over a 2.7vh timeline.
        // Shifted here to start after the 0.28 intro beat on a 3.4vh timeline.
        // New absolute positions (mapped so relative spacing is preserved):
        //   first swap:  0.28 + 0.72 * (0.78/2.78) ≈ 0.48
        //   second swap: 0.28 + 0.72 * (1.78/2.78) ≈ 0.74
        timeline
          .to(panels[0], { autoAlpha: 0, y: -18, duration: 0.24 }, 1.00)
          .fromTo(panels[1], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 1.00)
          .to(panels[1], { autoAlpha: 0, y: -18, duration: 0.24 }, 2.00)
          .fromTo(panels[2], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 2.00)
          .to({}, { duration: 0.76 });

        section.dataset.motionReady = "true";
        return () => {
          delete section.dataset.motionReady;
          panels.forEach((panel) => panel.removeAttribute("aria-hidden"));
          if (content) gsap.set(content, { clearProps: "all" });
        };
      });
    })();

    return () => {
      cancelled = true;
      revertMotion();
      delete section.dataset.motionReady;
    };
  }, [transitionManaged]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-text-morph
      data-transition-managed={transitionManaged ? "true" : undefined}
      aria-label="How we work"
    >
      <div className={styles.background} data-morph-pattern aria-hidden="true">
        <PatternWaves
          preset="terminal"
          color="#ffffff"
          backgroundColor="#000000"
          fade="bottom"
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          pattern="glyph"
          wave="ripple"
          spacing={13}
          markSize={0.95}
          depth={0.9}
          light={0}
          shine={0.9}
          contrast={1.55}
          speed={0.4}
          scale={0.95}
          direction={266}
          opacity={0.65}
          fadeSize={0.75}
          characters="KAAYKREAT"
          intro
          paused={false}
        />
      </div>

      <div className={styles.content}>
        {stages.map(({ word, body, note }) => (
          <article key={word} data-stage data-text-morph-stage className={styles.stage}>
            <h2 className={styles.heading}>
              <span>WE</span>
              <span>{word}</span>
            </h2>
            <div className={styles.copy}>
              <p className={styles.copyText}>{body}</p>
              <p className={styles.copyMeta}>{note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
