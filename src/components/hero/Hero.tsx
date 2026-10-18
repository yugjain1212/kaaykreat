"use client";

import { useEffect, useRef } from "react";
import { AsciiEffect } from "@/components/ui/ascii-effect";
import MetallicPaint from "@/components/preloader/MetallicPaint";
import styles from "./hero.module.css";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

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
    <section ref={heroRef} className={styles.hero} aria-label="Hero">

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
                href={`/${label.toLowerCase()}`}
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
      <div className={styles.asciiWrap} aria-hidden="true">
        <AsciiEffect
          imageSrc="/images/ascii-source.svg"
          alt="Abstract flowing digital sculpture"
          variant="flow"
          chars=" .,:;irsXA253hMHGS#9B&@"
          colors={["#444444", "#888888", "#B8B8B8", "#E0E0E0"]}
          colorMode="gradient"
          backgroundColor="#000000"
          fontSize={8}
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight={400}
          lineHeight={1}
          characterSpacing={1}
          brightnessBoost={2.6}
          contrast={1.3}
          threshold={0.05}
          posterize={28}
          dither="bayer"
          ditherStrength={0.6}
          flowSpeed={0.18}
          flowDirection={8}
          flowStrength={10}
          flowFrequency={0.016}
          mouseRadius={160}
          mouseStrength={18}
          mouseWaveSpeed={1.0}
          scale={1.2}
          fit="cover"
        />
        <MetallicPaint
          imageSrc="/images/ascii-source.svg"
          color="#b4b4ba"
          backgroundColor="transparent"
          density={1.6}
          softness={0.6}
          dispersion={0}
          distortion={0.05}
          edgeBend={0.5}
          angle={90}
          scale={0.6}
          speed={0.8}
          rotation={0}
          mouseTilt={0}
          intro
          className={styles.metallicOverlay}
        />
      </div>

      {/* Left-side gradient to keep text legible */}
      <div className={styles.leftFade} aria-hidden="true" />

      {/* ════ MAIN CONTENT — left side ════ */}
      <div className={styles.content}>

        {/* Technical label */}
        <p className={styles.techLabel} data-reveal>
          <span className={styles.techNum}>01</span>
          <span className={styles.techRule} aria-hidden="true" />
          <span>INDEPENDENT CREATIVE TECHNOLOGY STUDIO</span>
        </p>

        {/* Headline */}
        <h1 className={styles.headline} data-reveal>
          <span className={styles.headlineIvory}>WE MAKE</span>
          <span className={styles.headlineGrey}>COOL STUFF.</span>
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
      </div>

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
