"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { VaultMock } from "@/components/landing/mockups";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
      {/* Ambient background: radial glow + faint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_12%,transparent)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 sm:px-6"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={item} className="flex justify-center">
            <span className="flex items-center gap-2.5 rounded-full border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 py-1 pr-4 pl-1 text-xs font-medium text-primary shadow-lg shadow-primary/10 backdrop-blur-sm">
              <span className="flex size-6 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
                <Sparkles className="size-3" aria-hidden="true" />
              </span>
              Private by design · End-to-end encrypted
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl"
          >
            Your passwords deserve{" "}
            <span className="bg-gradient-to-br from-primary via-primary to-sky-300 bg-clip-text text-transparent">
              more than memory.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Kizuna is a fast, encrypted password manager for people who value
            privacy and simplicity. One master password. Every secret sealed.
            Zero compromises.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" className="group h-11 px-6 text-base" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-base"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
              AES-256 encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-success" aria-hidden="true" />
              Zero-knowledge architecture
            </span>
          </motion.div>
        </div>

        {/* Product mockup — sidebar is interactive, so not aria-hidden */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div
            className="absolute -inset-x-8 -top-10 -bottom-16 rounded-[3rem] bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <VaultMock className="relative" />
        </motion.div>
      </motion.div>
    </section>
  );
}
