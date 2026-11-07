"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./about.module.css";

/* ------------------------------------------------------------------ */
/*  GIF paths (served from /public/about/)                             */
/* ------------------------------------------------------------------ */
const GIFS = {
  mountain: "/about/mountain.gif",
  ui:       "/about/ui.gif",
  laptop:   "/about/laptop.gif",
  flower:   "/about/flower.gif",
} as const;

const step = (i: number) => ({ "--i": i }) as CSSProperties;

function Media({ src, className }: { src: string; className: string }) {
  return (
    <span className={`${styles.media} ${className}`} aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 820px) 40vw, 320px"
        className={styles.mediaImg}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  AboutSection                                                        */
/*  – parallax entry: section slides up from below while the hero      */
/*    stays pinned, giving a "paper pushing up" feel                   */
/* ------------------------------------------------------------------ */
type AboutSectionProps = {
  transitionManaged?: boolean;
};

export default function AboutSection({ transitionManaged = false }: AboutSectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const parallaxRef  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  /* ── Intersection observer: trigger staggered row reveal ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── Parallax: translate the inner content upward as user scrolls ── */
  useEffect(() => {
    const section  = sectionRef.current;
    const inner    = parallaxRef.current;
    if (!section || !inner) return;
    if (transitionManaged) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect   = section.getBoundingClientRect();
        const vh     = window.innerHeight;
        // progress: 0 when section top hits viewport bottom, 1 when section top hits viewport top
        const raw    = 1 - rect.top / vh;
        const progress = Math.max(0, Math.min(1, raw));
        // Slide inner content up by up to 60px as the section enters
        const y = (1 - progress) * 60;
        inner.style.transform = `translate3d(0, ${y}px, 0)`;
        inner.style.opacity   = String(Math.min(1, progress * 2));
      });
    };

    // Set initial state before any scroll
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transitionManaged]);

  return (
    <section
      id="about"
      ref={sectionRef}
      data-visible={visible}
      aria-labelledby="about-heading"
      className={styles.section}
    >
      <div className={styles.grain} aria-hidden="true" />

      {/* Parallax inner wrapper */}
      <div
        ref={parallaxRef}
        className={styles.parallaxInner}
        /* start slightly translated down + invisible; JS animates on scroll */
        style={transitionManaged ? undefined : { transform: "translate3d(0, 60px, 0)", opacity: 0 }}
      >
        {/* Eyebrow */}
        <div className={styles.eyebrow}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="about-heading" className={styles.eyebrowText}>
            About KaayKreat
          </h2>
          <span className={styles.rule} aria-hidden="true" />
        </div>

        <div className={styles.copy}>
          {/* Row 1 — text (right aligned) + mountain GIF */}
          <p className={`${styles.row} ${styles.rowOne}`} style={step(0)}>
            <span className={`${styles.block} ${styles.alignRight}`}>
              <span className={styles.line}>
                Hi, we're <span className={styles.brand}>KaayKreat</span> — a
                creative studio
              </span>
              <span className={styles.line}>
                that turns{" "}
                <span className={styles.pill}>
                  <em className={styles.italic}>ideas</em>
                </span>{" "}
                into digital experiences.
              </span>
            </span>
            <Media src={GIFS.mountain} className={styles.mountain} />
          </p>

          {/* Row 2 — UI GIF + text (left aligned) */}
          <p className={`${styles.row} ${styles.rowTwo}`} style={step(1)}>
            <Media src={GIFS.ui} className={styles.ui} />
            <span className={`${styles.block} ${styles.alignLeft}`}>
              <span className={styles.line}>
                We design, <em className={styles.italic}>build</em> and bring
                to life products, brands,
              </span>
              <span className={styles.line}>
                and experiences people actually{" "}
                <span className={`${styles.pill} ${styles.pillStrong}`}>
                  love.
                </span>
              </span>
            </span>
          </p>

          {/* Row 3 — text + laptop GIF + text */}
          <p className={`${styles.row} ${styles.rowThree}`} style={step(2)}>
            <span className={styles.chunk}>
              From <em className={styles.italic}>web</em> and{" "}
              <em className={styles.italic}>apps</em>
            </span>
            <Media src={GIFS.laptop} className={styles.laptop} />
            <span className={styles.chunk}>
              to <em className={styles.italic}>brand, motion</em>
            </span>
          </p>

          {/* Row 4 — text + flower GIF + text */}
          <p className={`${styles.row} ${styles.rowFour}`} style={step(3)}>
            <span className={styles.chunk}>
              and <em className={styles.italic}>creative campaigns</em>
            </span>
            <Media src={GIFS.flower} className={styles.flower} />
            <span className={styles.chunk}>— we make cool stuff.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
