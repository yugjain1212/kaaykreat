"use client";

/**
 * TextMorph — blur-morphing text canvas component
 * Cycles through an array of words with a soft Gaussian-blur dissolve.
 * Matches the @reactbits-starter/text-morph-tw API.
 */

import {
  useEffect,
  useRef,
  useCallback,
  type HTMLAttributes,
} from "react";

export interface TextMorphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Words to cycle through */
  words?: string[];
  /** Animation variant — only "blur" is implemented */
  morph?: "blur";
  /** Accent color painted briefly during the morph peak */
  morphColor?: string;
  /** Canvas font-family */
  fontFamily?: string;
  /** Font size in px */
  fontSize?: number;
  /** Font weight */
  fontWeight?: number | string;
  /** Letter-spacing as em fraction (e.g. -0.055) */
  letterSpacing?: number;
  /** 0–1 stagger between the outgoing and incoming word */
  stagger?: number;
  /** Peak blur radius multiplier */
  goo?: number;
  /** Scale-up during morph (0–1 fraction above 1) */
  swell?: number;
  /** Milliseconds per word */
  duration?: number;
  /** Pause in ms before next morph starts */
  pause?: number;
  /** Fill / text color */
  color?: string;
  /** Background fill (default transparent) */
  backgroundColor?: string;
  /** Canvas height — defaults to fontSize * 1.4 */
  height?: number;
}

const DEFAULT_WORDS = [
  "CREATIVITY",
  "TECHNOLOGY",
  "INNOVATION",
  "DIGITAL",
  "MOTION",
  "DESIGN",
];

export function TextMorph({
  words = DEFAULT_WORDS,
  morph: _morph = "blur",
  morphColor = "#d10023",
  fontFamily = "ui-serif, Georgia, serif",
  fontSize = 160,
  fontWeight = 700,
  letterSpacing = -0.055,
  stagger = 0.5,
  goo = 0.26,
  swell = 0.05,
  duration = 1600,
  pause = 900,
  color = "#F1EEE6",
  backgroundColor = "transparent",
  height,
  className,
  style,
  ...props
}: TextMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    wordIndex: 0,
    progress: 0, // 0 → 1 during morph
    phase: "pausing" as "morphing" | "pausing",
    elapsed: 0,
    lastTime: 0,
    raf: 0,
  });

  const canvasHeight = height ?? Math.ceil(fontSize * 1.45);

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const s = stateRef.current;
      const dt = s.lastTime ? Math.min((now - s.lastTime) / 1000, 0.1) : 0;
      s.lastTime = now;

      // Advance phase
      s.elapsed += dt * 1000;

      if (s.phase === "pausing") {
        if (s.elapsed >= pause) {
          s.elapsed = 0;
          s.phase = "morphing";
          s.progress = 0;
        }
      } else {
        s.progress = Math.min(s.elapsed / duration, 1);
        if (s.progress >= 1) {
          s.wordIndex = (s.wordIndex + 1) % words.length;
          s.progress = 0;
          s.elapsed = 0;
          s.phase = "pausing";
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      const h = canvasHeight;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Ease
      const p = s.progress;
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      const fromWord = words[s.wordIndex] ?? "";
      const toWord = words[(s.wordIndex + 1) % words.length] ?? "";

      // Blur amounts
      const renderFontSize = fitFontSize(ctx, words, w, fontFamily, fontWeight, fontSize, letterSpacing);
      const maxBlur = renderFontSize * goo;
      const fromBlur =
        s.phase === "pausing"
          ? 0
          : eased * maxBlur * (1 + stagger);
      const toBlur =
        s.phase === "pausing"
          ? maxBlur
          : Math.max(0, maxBlur * (1 - (eased - stagger) / (1 - stagger)));

      // Opacities
      const fromOpacity = s.phase === "pausing" ? 1 : 1 - eased;
      const toOpacity = s.phase === "pausing" ? 0 : eased;

      // Scale swell at mid-morph
      const swellAmount = 1 + swell * Math.sin(eased * Math.PI);

      ctx.clearRect(0, 0, w, h);

      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      const lsEm = letterSpacing * renderFontSize;
      ctx.font = `${fontWeight} ${Math.round(renderFontSize * swellAmount)}px ${fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Tint toward morphColor at peak
      const tint = Math.sin(eased * Math.PI);
      const r1 = parseInt(color.slice(1, 3), 16);
      const g1 = parseInt(color.slice(3, 5), 16);
      const b1 = parseInt(color.slice(5, 7), 16);
      const r2 = parseInt(morphColor.slice(1, 3), 16);
      const g2 = parseInt(morphColor.slice(3, 5), 16);
      const b2 = parseInt(morphColor.slice(5, 7), 16);
      const mixR = Math.round(r1 + (r2 - r1) * tint * 0.4);
      const mixG = Math.round(g1 + (g2 - g1) * tint * 0.4);
      const mixB = Math.round(b1 + (b2 - b1) * tint * 0.4);
      const blendedColor = `rgb(${mixR},${mixG},${mixB})`;

      const cx = w / 2;
      const cy = h / 2;

      const drawWord = (
        word: string,
        blur: number,
        opacity: number,
      ) => {
        if (opacity <= 0.002) return;
        ctx.save();
        ctx.globalAlpha = Math.min(opacity, 1);
        ctx.filter = blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none";
        ctx.fillStyle = blendedColor;
        // Manual letter spacing via individual chars
        const totalWidth = [...word].reduce((acc, ch) => {
          return acc + ctx.measureText(ch).width + lsEm;
        }, -lsEm);
        let x = cx - totalWidth / 2;
        for (const ch of word) {
          const cw = ctx.measureText(ch).width;
          ctx.fillText(ch, x + cw / 2, cy);
          x += cw + lsEm;
        }
        ctx.restore();
      };

      drawWord(fromWord, fromBlur, fromOpacity);
      drawWord(toWord, toBlur, toOpacity);

      s.raf = requestAnimationFrame(draw);
    },
    [
      words,
      fontFamily,
      fontSize,
      fontWeight,
      letterSpacing,
      goo,
      swell,
      stagger,
      duration,
      pause,
      color,
      morphColor,
      backgroundColor,
      canvasHeight,
    ]
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // Just paint the first word statically
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(canvasHeight * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const renderFontSize = fitFontSize(ctx, words, w, fontFamily, fontWeight, fontSize, letterSpacing);
      ctx.font = `${fontWeight} ${renderFontSize}px ${fontFamily}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = color;
      ctx.fillText(words[0] ?? "", w / 2, canvasHeight / 2);
      return;
    }

    const s = stateRef.current;
    const container = containerRef.current;
    if (!container) return;
    let visible = false;
    const start = () => {
      if (!visible || s.raf) return;
      s.lastTime = 0;
      s.raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.lastTime = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [draw, words, fontSize, fontFamily, fontWeight, color, canvasHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: canvasHeight, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-label={`Cycling words: ${words.join(", ")}`}
        role="img"
        style={{ display: "block" }}
      />
    </div>
  );
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  words: string[],
  width: number,
  fontFamily: string,
  fontWeight: number | string,
  fontSize: number,
  letterSpacing: number,
) {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const widest = Math.max(1, ...words.map((word) =>
    [...word].reduce((sum, character) => sum + ctx.measureText(character).width, 0)
      + Math.max(0, word.length - 1) * letterSpacing * fontSize,
  ));
  return Math.max(24, fontSize * Math.min(1, Math.max(0, width - 32) / widest));
}

export default TextMorph;
