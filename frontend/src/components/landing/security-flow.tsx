"use client";

import {
  FileKey,
  LockKeyhole,
  ServerCog,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

interface SecurityStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: SecurityStep[] = [
  {
    icon: FileKey,
    title: "Your data",
    description: "Passwords, notes, and identities — created on your device.",
  },
  {
    icon: LockKeyhole,
    title: "Encrypted",
    description:
      "Sealed with AES-256 using keys derived from your master password.",
  },
  {
    icon: ServerCog,
    title: "Stored securely",
    description: "Only ciphertext ever leaves your device. Never plaintext.",
  },
  {
    icon: UserCheck,
    title: "Only you can access it",
    description:
      "Zero-knowledge: without your master password, the vault is noise.",
  },
];

export function SecurityFlow() {
  return (
    <section id="security" className="relative scroll-mt-24 py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Security"
            title="From your keyboard to noise — in one step."
            description="Kizuna is built zero-knowledge from the ground up. Here's the entire journey your data takes."
          />
        </Reveal>

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.12}>
                <li className="relative flex flex-col items-center text-center">
                  <motion.span
                    whileHover={{ scale: 1.06 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-card shadow-lg shadow-primary/10"
                  >
                    <step.icon className="size-6 text-primary" aria-hidden="true" />
                  </motion.span>
                  <span className="mt-4 text-[11px] font-semibold tracking-widest text-primary/70">
                    STEP {index + 1}
                  </span>
                  <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-52 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
