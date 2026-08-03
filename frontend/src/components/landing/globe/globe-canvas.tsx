"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createGlobeScene } from "./globe-scene";

gsap.registerPlugin(ScrollTrigger);

/**
 * Client-only WebGL layer for the Digital World section. Loaded lazily
 * (three + gsap live in this chunk, not the landing bundle). Rendering
 * pauses gracefully off-screen and honors prefers-reduced-motion.
 */
export default function GlobeCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const globe = createGlobeScene(canvas);
    if (!globe) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width > 0) globe.setSize(rect.width, rect.height);
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      globe.render();
    });
    resizeObserver.observe(wrap);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      // Static, fully-lit single frame — no loop, no tweens.
      globe.uniforms.uActivity.value = 1;
      globe.frame(0.001, 1);
      globe.render();
      gsap.set(wrap, { autoAlpha: 1 });
      return () => {
        resizeObserver.disconnect();
        globe.dispose();
      };
    }

    // --- Render loop with eased pause/resume -------------------------
    let rafId = 0;
    let running = false;
    let last = 0;
    const speed = { value: 0, target: 1 };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      speed.value += (speed.target - speed.value) * Math.min(dt * 3.5, 1);
      globe.frame(dt, speed.value);
      globe.render();
      if (speed.target === 0 && speed.value < 0.02) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(loop);
    };
    const play = () => {
      speed.target = 1;
      if (!running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };
    /** Graceful: time eases to a stop, then the loop parks itself. */
    const pause = () => {
      speed.target = 0;
    };
    // --- GSAP: entrance, scroll rotation, lifecycle ------------------
    gsap.set(wrap, { autoAlpha: 0, scale: 0.92 });

    const entrance = ScrollTrigger.create({
      trigger: wrap,
      start: "top 82%",
      once: true,
      onEnter: () => {
        play();
        gsap.to(wrap, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power3.out" });
        gsap.to(globe.state, { spinOffset: "+=0.55", duration: 1.5, ease: "power2.out" });
        gsap.to(globe.uniforms.uActivity, {
          value: 1,
          duration: 1.6,
          delay: 0.35,
          ease: "power2.inOut",
        });
      },
    });

    const scrub = gsap.fromTo(
      globe.state,
      { scrollOffset: -0.1 },
      {
        scrollOffset: 0.22,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      },
    );

    const lifecycle = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? play() : pause()),
    });

    const onVisibility = () => {
      if (document.hidden) pause();
      else if (ScrollTrigger.isInViewport(wrap)) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Gentle pointer parallax.
    const onPointerMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(globe.state, {
        pointerX: nx * 0.14,
        pointerY: ny * 0.1,
        duration: 0.9,
        ease: "power2.out",
      });
    };
    const onPointerLeave = () => {
      gsap.to(globe.state, { pointerX: 0, pointerY: 0, duration: 1.1, ease: "power2.out" });
    };
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      entrance.kill();
      scrub.scrollTrigger?.kill();
      scrub.kill();
      lifecycle.kill();
      document.removeEventListener("visibilitychange", onVisibility);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf([wrap, globe.state, globe.uniforms.uActivity]);
      resizeObserver.disconnect();
      globe.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="size-full" aria-hidden="true" />
    </div>
  );
}
