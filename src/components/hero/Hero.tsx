"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { AsciiEffect } from "@/components/ui/ascii-effect";
import MetallicPaint from "@/components/preloader/MetallicPaint";
import styles from "./hero.module.css";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const artworkY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const artworkScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const artworkOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.72, 0.38]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.5, 0]);

  // Entrance animation — stagger text elements in after preloader
  useEffect(() => {
    let raf: number;
    let revealed = false;
    const elements = heroRef.current?.querySelectorAll<HTMLElement>(
      "[data-reveal]"
    );
    if (!elements) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      elements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Set initial hidden state
    elements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 14px, 0)";
      el.style.transition = "none";
    });

    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    const reveal = () => {
      if (
        revealed ||
        Number.parseFloat(window.getComputedStyle(mainContent).opacity) <= 0.1
      ) return;

      revealed = true;
      observer.disconnect();
      raf = requestAnimationFrame(() => {
        elements.forEach((el, i) => {
          const delay = `${i * 55}ms`;
          const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transition = `opacity 650ms ${ease} ${delay}, transform 650ms ${ease} ${delay}`;
          el.style.opacity = "1";
          el.style.transform = "translate3d(0, 0, 0)";
        });
      });
    };

    const observer = new MutationObserver(reveal);
    observer.observe(mainContent, { attributes: true, attributeFilter: ["style"] });
    reveal();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={heroRef} id="hero-section" className={styles.hero} aria-label="Hero">

      {/* ════ NAVIGATION ════ */}
      <nav className={styles.nav} aria-label="Main navigation">
        {/* Left: logo + wordmark */}
        <div className={styles.navLeft} data-reveal>
          <a href="/" className={styles.logoLink} aria-label="Kaay Kreat home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="kaay-navbar-logo"
              src="/logo.svg"
              alt="Kaay Kreat"
              className={styles.navLogo}
              draggable={false}
            />
          </a>
          <span className={styles.wordmark}>KAAY KREAT</span>
        </div>

        {/* Center: nav links */}
        <ul className={styles.navLinks} role="list" data-reveal>
          {["WORK", "SERVICES", "ABOUT", "CONTACT"].map((label) => (
            <li key={label}>
              <a
                href={label === "SERVICES" ? "#services" : `/${label.toLowerCase()}`}
                className={styles.navLink}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right: CTA pill */}
        <div className={styles.navRight} data-reveal>
          <a href="/contact" className={styles.navCta}>
            HAVE A PROJECT?&nbsp;<span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>

      {/* ════ ASCII SCULPTURE — full bleed, right-weighted ════ */}
      <motion.div
        className={styles.asciiWrap}
        aria-hidden="true"
        style={{ y: artworkY, scale: artworkScale, opacity: artworkOpacity }}
      >
        <AsciiEffect
          imageSrc="/images/ascii-profile.png"
          alt="Metallic female profile formed from flowing digital ribbons"
          variant="flow"
          chars=".,:;irsXA253hMHGS#9B&@"
          colors={["#55565b", "#898b91", "#c0c1c5", "#f0eee8"]}
          colorMode="gradient"
          backgroundColor="#000000"
          fontSize={8}
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight={400}
          lineHeight={1}
          characterSpacing={1}
          brightnessBoost={3.1}
          contrast={1.2}
          threshold={0.015}
          posterize={28}
          dither="bayer"
          ditherStrength={0.35}
          flowSpeed={0.18}
          flowDirection={8}
          flowStrength={10}
          flowFrequency={0.016}
          mouseRadius={160}
          mouseStrength={24}
          mouseWaveSpeed={1.0}
          scale={1.2}
          fit="cover"
        />
        <MetallicPaint
          imageSrc="/images/ascii-profile.png"
          color="#d6d3cc"
          backgroundColor="transparent"
          density={1.6}
          softness={0.34}
          dispersion={0}
          distortion={0.025}
          edgeBend={0.38}
          angle={90}
          scale={0.833}
          speed={0.38}
          rotation={0}
          mouseTilt={0.48}
          intro
          className={styles.metallicOverlay}
        />
      </motion.div>

      {/* Left-side gradient to keep text legible */}
      <div className={styles.leftFade} aria-hidden="true" />

      {/* ════ MAIN CONTENT — left side ════ */}
      <motion.div className={styles.content} style={{ y: contentY, opacity: contentOpacity }}>

        {/* Technical label */}
        <p className={styles.techLabel} data-reveal>
          <span className={styles.techNum}>01</span>
          <span className={styles.techRule} aria-hidden="true" />
          <span>INDEPENDENT CREATIVE TECHNOLOGY STUDIO</span>
        </p>

        {/* Headline */}
        <h1 className={styles.headline} data-reveal>
          <span className={styles.headlineIvory}>WE MAKE</span>
          <span className={styles.headlineItalic}>COOL STUFF.</span>
        </h1>

        {/* Description */}
        <p className={styles.description} data-reveal>
          We turn ambitious ideas into digital experiences worth remembering.
        </p>

        {/* CTA buttons */}
        <div className={styles.ctaRow} data-reveal>
          <a href="/contact" className={styles.ctaPrimary}>
            HAVE A PROJECT?&nbsp;<span aria-hidden="true">↗</span>
          </a>
          <a href="/work" className={styles.ctaSecondary}>
            EXPLORE OUR WORK&nbsp;<span aria-hidden="true">↓</span>
          </a>
        </div>
      </motion.div>

      {/* ════ BOTTOM BAR ════ */}
      <div className={styles.bottomBar} aria-hidden="true">
        {/* Left metadata */}
        <div className={styles.bottomLeft} data-reveal>
          <span className={styles.bottomRule} />
          <span className={styles.bottomLabel}>
            WEB&nbsp;/&nbsp;AI&nbsp;/&nbsp;DIGITAL PRODUCTS&nbsp;/&nbsp;MOTION
          </span>
        </div>

        {/* Right counter */}
        <div className={styles.bottomRight}>
          <span className={styles.bottomCounter}>01 — 04</span>
        </div>
      </div>

      {/* ════ SCROLL INDICATOR ════ */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span className={styles.scrollText}>SCROLL</span>
        <span className={styles.scrollLine} />
      </div>

    </section>
  );
}
