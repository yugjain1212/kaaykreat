"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AboutSection from "@/components/about/AboutSection";
import TextMorphSection from "@/components/textmorph/TextMorphSection";
import styles from "./about-textmorph-flip.module.css";

type MotionConditions = {
  desktop: boolean;
  reduced: boolean;
};

export default function AboutTextMorphFlip() {
  const sceneRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scene = sceneRef.current;
      const card = cardRef.current;
      if (!scene || !card) return;

      gsap.registerPlugin(ScrollTrigger);

      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 701px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduced } = context.conditions as MotionConditions;
          if (reduced) return;

          const morph = scene.querySelector<HTMLElement>("[data-text-morph]");
          const stages = gsap.utils.toArray<HTMLElement>("[data-text-morph-stage]", scene);
          if (!morph || stages.length !== 3) return;

          morph.dataset.motionReady = "true";
          gsap.set(stages, { autoAlpha: 0, y: 18 });
          gsap.set(stages[0], { autoAlpha: 1, y: 0 });

          let activeStage = 0;
          const setActiveStage = (index: number) => {
            if (index === activeStage) return;
            activeStage = index;
            stages.forEach((stage, stageIndex) => {
              stage.setAttribute("aria-hidden", String(stageIndex !== index));
            });
          };
          stages.forEach((stage, index) => {
            stage.setAttribute("aria-hidden", String(index !== 0));
          });

          const textMorphAt = 2.05;
          const secondStageAt = textMorphAt + 1.75 + 0.55;
          const thirdStageAt  = textMorphAt + 1.75 + 1.10;
          let timeline: gsap.core.Timeline | undefined;

          timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: () => `+=${window.innerHeight * (desktop ? 5.5 : 4.8)}`,
              pin: true,
              scrub: 0.55,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                if (!timeline) return;
                const time = timeline.time();
                setActiveStage(time < secondStageAt ? 0 : time < thirdStageAt ? 1 : 2);
              },
            },
          });

          timeline
            .addLabel("about")
            .to(card, { scale: desktop ? 0.6 : 0.7, duration: 0.9 }, "about")
            .addLabel("flip")
            .to(scene, { backgroundColor: "#000000", duration: 0.45 }, "flip")
            .to(card, { rotationY: 180, duration: 1.15 }, "flip")
            .addLabel("textMorph")
            // ── Zoom-in completes at textMorph + 1.75 ──────────────────────
            .to(card, { scale: 1, duration: 1.75 }, "textMorph")
            // ── Word cycling only starts AFTER zoom-in finishes ─────────────
            .to(stages[0], { autoAlpha: 0, y: -18, duration: 0.22 }, "textMorph+=1.75")
            .fromTo(stages[1], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.22 }, "textMorph+=1.75")
            .to(stages[1], { autoAlpha: 0, y: -18, duration: 0.22 }, "textMorph+=2.30")
            .fromTo(stages[2], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.22 }, "textMorph+=2.30")
            // ── Hold last stage so user has time to read it ─────────────────
            .to({}, { duration: 0.55 });

          return () => {
            delete morph.dataset.motionReady;
            stages.forEach((stage) => stage.removeAttribute("aria-hidden"));
          };
        },
      );

      return () => media.revert();
    },
    { scope: sceneRef, dependencies: [] },
  );

  return (
    <section ref={sceneRef} className={styles.scene} aria-label="About KaayKreat and how we work">
      <div className={styles.viewport}>
        <div ref={cardRef} className={styles.card}>
          <div className={`${styles.face} ${styles.front}`}>
            <div className={styles.faceContent}>
              <AboutSection transitionManaged />
            </div>
          </div>

          <div className={`${styles.face} ${styles.back}`}>
            <div className={styles.faceContent}>
              <TextMorphSection transitionManaged />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
