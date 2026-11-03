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
    description: "Automations that connect tools, data and teams seamlessly.",
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
  const columns = 5;
  const rows = 5;
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
      phase = column * 0.2;
      moveX = 6;
      moveY = -6;
    } else if (type === "agents") {
      glyph = "cross";
      const distance = Math.abs(column - center) + Math.abs(row - center);
      lit = distance <= 2;
      phase = distance * 0.16;
      moveX = Math.sign(column - center) * 6;
      moveY = Math.sign(row - center) * 6;
    } else if (type === "product") {
      glyph = "bracket";
      const radius = Math.max(Math.abs(column - center), Math.abs(row - center));
      lit = radius < 2 || (radius === 2 && column !== center && row !== center);
      phase = radius * 0.22;
      moveX = Math.sign(column - center) * 7;
      moveY = Math.sign(row - center) * 7;
      moveRotate = Math.sign(column - center) * Math.sign(row - center) * 9;
    } else {
      const streamRow = Math.round(center - Math.sin((column / (columns - 1)) * Math.PI) * 1.25);
      glyph = row === streamRow ? "chevron" : (column + row) % 2 === 0 ? "wave" : "slash";
      lit = row === streamRow || (column % 2 === 0 && Math.abs(row - streamRow) === 1);
      phase = column * 0.18 + row * 0.04;
      moveX = 9;
      moveY = row === streamRow ? 0 : Math.sign(streamRow - row) * 3;
    }

    return { column, row, glyph, lit, phase, moveX, moveY, moveRotate, key: index };
  });

  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
      {cells.map(({ column, row, glyph, lit, phase, moveX, moveY, moveRotate, key }) => (
        <g key={key} transform={`translate(${16 + column * 32} ${16 + row * 32})`}>
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

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-service-card]"));
    const visibilityObserver = new IntersectionObserver(
      (entries) => entries.forEach(({ target, isIntersecting }) => {
        (target as HTMLElement).dataset.visible = String(isIntersecting);
      }),
      { threshold: 0.01 },
    );
    cards.forEach((card) => {
      card.dataset.visible = "false";
      visibilityObserver.observe(card);
    });

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

      media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
        const intro = section.querySelector<HTMLElement>("[data-services-intro]");
        const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]", section);
        const scrollTrigger = {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        };

        if (intro) {
          gsap.fromTo(intro, { y: 72 }, { y: -18, ease: "none", scrollTrigger: { ...scrollTrigger } });
        }

        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 84 + (index % 2) * 28 },
            { y: -18 - (index % 2) * 18, ease: "none", scrollTrigger: { ...scrollTrigger } },
          );
        });
      });
    })();

    return () => {
      cancelled = true;
      visibilityObserver.disconnect();
      cards.forEach((card) => delete card.dataset.visible);
      revertMotion();
    };
  }, []);

  return (
    <section ref={sectionRef} id="services" className={styles.section} aria-labelledby="services-title">
      <div className={styles.layout}>
        <div className={styles.intro} data-services-intro>
          <p className={styles.eyebrow}>What we do</p>
          <h2 id="services-title" className={styles.heading}>
            <span>OUR</span>
            <span>SERVICES</span>
          </h2>
          <p className={styles.introText}>
            End-to-end work spanning strategy, design, engineering and deployment.
          </p>
          <a className={styles.cta} href="/contact">
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
    </section>
  );
}
