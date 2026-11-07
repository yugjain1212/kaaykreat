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

export default function TextMorphSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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
        let active = 0;

        gsap.set(panels, { autoAlpha: 0, y: 18 });
        gsap.set(panels[0], { autoAlpha: 1, y: 0 });
        panels.forEach((panel, index) => panel.setAttribute("aria-hidden", String(index !== 0)));

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.7}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = self.progress < 0.38 ? 0 : self.progress < 0.75 ? 1 : 2;
              if (next === active) return;
              active = next;
              panels.forEach((panel, index) => panel.setAttribute("aria-hidden", String(index !== active)));
            },
          },
        });

        timeline
          .to(panels[0], { autoAlpha: 0, y: -18, duration: 0.24 }, 0.78)
          .fromTo(panels[1], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.78)
          .to(panels[1], { autoAlpha: 0, y: -18, duration: 0.24 }, 1.78)
          .fromTo(panels[2], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.24 }, 1.78)
          .to({}, { duration: 0.76 });

        section.dataset.motionReady = "true";
        return () => {
          delete section.dataset.motionReady;
          panels.forEach((panel) => panel.removeAttribute("aria-hidden"));
        };
      });
    })();

    return () => {
      cancelled = true;
      revertMotion();
      delete section.dataset.motionReady;
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="How we work">
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
          <article key={word} data-stage className={styles.stage}>
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
