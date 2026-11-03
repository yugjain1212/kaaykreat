"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import styles from "./RotatingText.module.css";

export interface RotatingTextRef {
  jumpTo: (index: number) => void;
}

interface RotatingTextProps {
  texts: string[];
  effect?: "slide";
  direction?: "up" | "down";
  staggerDuration?: number;
  staggerFrom?: "first" | "last";
  splitBy?: "characters";
  auto?: boolean;
  rotationInterval?: number;
  className?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  function RotatingText(
    {
      texts,
      direction = "up",
      staggerDuration = 0.025,
      staggerFrom = "last",
      className,
    },
    ref
  ) {
    const [index, setIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const activeIndex = useRef(0);
    const reduceMotion = useReducedMotion();

    useImperativeHandle(ref, () => ({
      jumpTo(nextIndex) {
        const next = Math.max(0, Math.min(nextIndex, texts.length - 1));
        if (next === activeIndex.current) return;
        setReverse(next < activeIndex.current);
        activeIndex.current = next;
        setIndex(next);
      },
    }), [texts.length]);

    const activeText = texts[index] ?? "";
    const characters = Array.from(activeText);
    const startFromBottom = reverse ? direction === "down" : direction === "up";

    return (
      <span className={className}>
        <span className="sr-only">{activeText}</span>
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={index}
            aria-hidden="true"
            className={styles.line}
            initial={reduceMotion ? { opacity: 1 } : { y: startFromBottom ? "105%" : "-105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: startFromBottom ? "-105%" : "105%", opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}
          >
            {characters.map((character, characterIndex) => {
              const delayIndex = staggerFrom === "last" ? characters.length - 1 - characterIndex : characterIndex;
              return (
                <motion.span
                  key={`${characterIndex}-${character}`}
                  aria-hidden="true"
                  className={styles.character}
                  initial={reduceMotion ? false : { y: startFromBottom ? "110%" : "-110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { y: startFromBottom ? "-110%" : "110%", opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.46,
                    delay: reduceMotion ? 0 : delayIndex * staggerDuration,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {character === " " ? "\u00a0" : character}
                </motion.span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
);

export default RotatingText;
