"use client";

import Preloader from "@/components/preloader/Preloader";
import Hero from "@/components/hero/Hero";
import SmoothScroll from "@/components/smooth-scroll/SmoothScroll";
import TextMorphSection from "@/components/textmorph/TextMorphSection";

export default function HomePage() {
  return (
    <>
      <SmoothScroll />
      <Preloader />

      {/* Homepage — revealed after preloader exits */}
      <main
        id="main-content"
        style={{ opacity: 0 }}
        aria-label="Kaay Kreat"
      >
        <Hero />
        <TextMorphSection />
      </main>
    </>
  );
}
