"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

// three + gsap live in this chunk — fetched only when the section nears
// the viewport, so the landing bundle and LCP are untouched.
const GlobeCanvas = lazy(() => import("./globe/globe-canvas"));

/** Static stand-in rendered beneath (and before) the WebGL canvas. */
function GlobePlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-[8%] rounded-full border border-primary/10 bg-[radial-gradient(circle_at_38%_32%,color-mix(in_oklab,var(--primary)_14%,transparent),color-mix(in_oklab,var(--card)_55%,transparent)_65%)]"
    />
  );
}

export function DigitalWorld() {
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // Mount the 3D chunk only once the section approaches the viewport.
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24"
      aria-labelledby="digital-world-heading"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="lg:order-2">
          <span className="inline-block rounded-full border bg-muted/50 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Your digital world
          </span>
          <h2
            id="digital-world-heading"
            className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Everywhere you are online,{" "}
            <span className="bg-gradient-to-br from-primary to-sky-300 bg-clip-text text-transparent">
              protected.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Your digital life spans dozens of platforms, devices, and
            identities. Kizuna brings them together into one secure place —
            and helps you understand and strengthen your digital presence.
          </p>
          <div className="mt-8">
            <Button size="lg" className="group h-11 px-6 text-base" asChild>
              <Link href="/register">
                Explore Your Digital Identity
                <ArrowRight
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-success" aria-hidden="true" />
            Illustrative visualization — Kizuna never tracks where you sign in
            from.
          </p>
        </Reveal>

        {/* Fixed aspect ratio reserves space up front — zero layout shift. */}
        <div className="lg:order-1" aria-hidden="true">
          <div className="relative mx-auto aspect-square w-full max-w-[32.5rem]">
            <div
              className="absolute inset-[4%] rounded-full bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <GlobePlaceholder />
            {near && (
              <Suspense fallback={null}>
                <GlobeCanvas />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
