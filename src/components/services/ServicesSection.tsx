"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./services.module.css";

const services = [
  {
    number: "01",
    title: "AI strategy & advisory",
    description: "Clear, execution-ready AI plans aligned with your business goals.",
    artwork: "strategy",
  },
  {
    number: "02",
    title: "Custom AI agents",
    description: "Tailored agents designed to handle real operational tasks.",
    artwork: "agents",
  },
  {
    number: "03",
    title: "AI product development",
    description: "Scalable AI-powered features, tools and internal systems.",
    artwork: "product",
  },
  {
    number: "04",
    title: "Workflow automation",
    description: "Connect the tools, data and teams your operation already relies on.",
    artwork: "workflow",
  },
] as const;

type GlyphKind = "slash" | "cross" | "bracket" | "chevron" | "wave";

function GlyphShape({ kind }: { kind: GlyphKind }) {
  switch (kind) {
    case "cross":
      return <><path d="m-7-7 14 14" /><path d="M7-7-7 7" /></>;
    case "bracket":
      return <path d="M-7 7V-7H7" />;
    case "chevron":
      return <path d="m-5-7 10 7-10 7" />;
    case "wave":
      return <path d="M-9 3c4.5 0 4.5-6 9-6s4.5 6 9 6" />;
    default:
      return <path d="m-7 7 14-14" />;
  }
}

function ServiceArtwork({ type }: { type: (typeof services)[number]["artwork"] }) {
  const columns = 4;
  const rows = 4;
  const cells = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const center = (columns - 1) / 2;
    let glyph: GlyphKind = "slash";
    let lit = true;
    let phase = 0;
    let moveX = 0;
    let moveY = 0;
    let moveRotate = 0;

    if (type === "strategy") {
      lit = row === rows - 1 - column;
      phase = column * 0.22;
      moveX = 5;
      moveY = -5;
    } else if (type === "agents") {
      glyph = "cross";
      const distance = Math.abs(column - center) + Math.abs(row - center);
      lit = distance <= 1;
      phase = distance * 0.2 + (column + row) * 0.08;
      moveX = Math.sign(column - center) * 4;
      moveY = Math.sign(row - center) * 4;
    } else if (type === "product") {
      glyph = "bracket";
      const radius = Math.max(Math.abs(column - center), Math.abs(row - center));
      lit = radius >= 1.5;
      phase = (Math.abs(column - center) + Math.abs(row - center)) * 0.11;
      moveX = Math.sign(column - center) * 5;
      moveY = Math.sign(row - center) * 5;
      moveRotate = Math.sign(column - center) * Math.sign(row - center) * 7;
    } else {
      const streamRow = Math.round(center + Math.cos((column / (columns - 1)) * Math.PI * 2) * 0.5);
      glyph = row === streamRow ? "chevron" : (column + row) % 2 === 0 ? "wave" : "slash";
      lit = row === streamRow;
      phase = column * 0.16;
      moveX = 7;
      moveY = row === streamRow ? 0 : Math.sign(streamRow - row) * 2;
    }

    return { column, row, glyph, lit, phase, moveX, moveY, moveRotate, key: index };
  });

  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
      {cells.map(({ column, row, glyph, lit, phase, moveX, moveY, moveRotate, key }) => (
        <g key={key} transform={`translate(${25 + column * 37} ${25 + row * 37})`}>
          <g
            className={styles.glyphMark}
            data-lit={lit ? "true" : undefined}
            style={{
              animationDelay: `${phase}s`,
              "--move-x": `${moveX}px`,
              "--move-y": `${moveY}px`,
              "--move-rotate": `${moveRotate}deg`,
            } as CSSProperties}
          >
            <GlyphShape kind={glyph} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function PixelEdge({ placement }: { placement: "top" | "bottom" }) {
  const edgeClass = placement === "top" ? styles.pixelEdgeTop : styles.pixelEdgeBottom;
  const cut = placement === "top"
    ? "M0 52 H4 V22 H6 V52 H10 V78 H13 V44 H16 V66 H19 V52 H24 V16 H27 V58 H30 V52 H35 V76 H38 V42 H41 V64 H44 V52 H50 V28 H53 V55 H56 V52 H62 V17 H65 V59 H68 V52 H73 V79 H76 V42 H79 V62 H82 V52 H88 V26 H91 V58 H94 V72 H97 V48 H100 V100 H0 Z"
    : "M0 0 H100 V51 H97 V74 H94 V52 H91 V34 H88 V62 H85 V51 H82 V76 H79 V50 H76 V28 H73 V58 H70 V51 H65 V70 H62 V46 H59 V51 H53 V78 H50 V49 H47 V66 H44 V51 H39 V24 H36 V58 H33 V51 H28 V74 H25 V48 H22 V51 H17 V33 H14 V57 H11 V51 H6 V69 H3 V45 H0 Z";

  return (
    <div className={`${styles.pixelEdge} ${edgeClass}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect className={styles.pixelBase} width="100" height="100" />
        <path className={styles.pixelCut} d={cut} />
      </svg>
    </div>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (typeof IntersectionObserver === "undefined") return;

    const reveals = Array.from(section.querySelectorAll<HTMLElement>("[data-services-reveal]"));
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-service-card]"));
    reveals.forEach((element) => {
      element.dataset.revealed = "false";
      if (element.hasAttribute("data-service-card")) element.dataset.visible = "false";
    });
    section.dataset.motionReady = "true";

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(({ target, isIntersecting }) => {
        const element = target as HTMLElement;
        if (isIntersecting) element.dataset.revealed = "true";
        if (element.hasAttribute("data-service-card")) {
          element.dataset.visible = String(isIntersecting);
        }
      }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    reveals.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      reveals.forEach((element) => delete element.dataset.revealed);
      cards.forEach((card) => delete card.dataset.visible);
      delete section.dataset.motionReady;
    };
  }, []);

  return (
    <section ref={sectionRef} id="services" className={styles.section} aria-labelledby="services-title">
      <PixelEdge placement="top" />
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow} data-services-reveal>What we do</p>
          <h2 id="services-title" className={styles.heading} data-services-reveal>
            <span>OUR</span>
            <span>SERVICES</span>
          </h2>
          <p className={styles.introText} data-services-reveal>
            End-to-end work spanning strategy, design, engineering and deployment.
          </p>
          <a className={styles.cta} href="/contact" data-services-reveal>
            <span>Discuss a project</span>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 16 16 4M6 4h10v10" />
            </svg>
          </a>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <article
              key={service.number}
              className={styles.card}
              data-service-card
              data-services-reveal
              data-artwork={service.artwork}
            >
              <span className={styles.number}>{service.number}</span>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardText}>{service.description}</p>
              <div className={styles.artwork} aria-hidden="true">
                <ServiceArtwork type={service.artwork} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <PixelEdge placement="bottom" />
    </section>
  );
}
