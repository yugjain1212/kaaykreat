"use client";

import Preloader from "@/components/preloader/Preloader";
import Hero from "@/components/hero/Hero";

export default function HomePage() {
  return (
    <>
      <Preloader />

      {/* Homepage — revealed after preloader exits */}
      <main
        id="main-content"
        style={{ opacity: 0 }}
        aria-label="Kaay Kreat"
      >
        <Hero />
      </main>
    </>
  );
}
