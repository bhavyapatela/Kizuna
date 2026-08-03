"use client";

import {
  Copy,
  FolderTree,
  KeyRound,
  MonitorSmartphone,
  Search,
  StickyNote,
  TimerReset,
  Vault,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  soon?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Vault,
    title: "Password Vault",
    description: "Every credential encrypted and organized in one calm place.",
  },
  {
    icon: StickyNote,
    title: "Secure Notes",
    description: "Recovery codes, licenses, and secrets beyond passwords.",
  },
  {
    icon: Search,
    title: "Fast Search",
    description: "Hit ⌘K and land on any item in milliseconds.",
  },
  {
    icon: KeyRound,
    title: "Password Generator",
    description: "Cryptographically random passwords, tuned to any policy.",
  },
  {
    icon: FolderTree,
    title: "Vault Organization",
    description: "Personal, work, finance — clean spaces for every context.",
  },
  {
    icon: TimerReset,
    title: "Auto Lock",
    description: "Steps away are covered. Your vault locks itself.",
  },
  {
    icon: Copy,
    title: "One-click Copy",
    description: "Copy usernames and passwords without ever revealing them.",
  },
  {
    icon: MonitorSmartphone,
    title: "Cross-device Ready",
    description: "A sync architecture designed for every screen you own.",
    soon: true,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything a vault should do. Nothing it shouldn't."
            description="Focused tools that keep your secrets safe and your flow unbroken."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 4) * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="group h-full rounded-2xl border bg-card/60 p-5 transition-colors hover:border-primary/30 hover:bg-card"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border bg-muted/50 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                  <feature.icon
                    className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  {feature.title}
                  {feature.soon && (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Soon
                    </span>
                  )}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
