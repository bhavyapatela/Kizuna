import { Check } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { DashboardMock } from "@/components/landing/mockups";

const REASONS = [
  "End-to-end encryption — sealed before it leaves your device",
  "Instant search across every vault and item",
  "Separate encrypted vaults for every part of your life",
  "A beautiful, focused interface with zero clutter",
  "Privacy-first: no tracking, no ads, no data mining",
];

export function WhyKizuna() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Why Kizuna"
            title="Trust is the entire product."
            description="Kizuna means bond. Everything about it is built so the only bond that matters — between you and your secrets — stays unbreakable."
          />
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <ul className="space-y-4">
              {REASONS.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Check className="size-3 text-success" aria-hidden="true" />
                  </span>
                  <span className="text-sm text-muted-foreground sm:text-base">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative" aria-hidden="true">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-2xl" />
              <DashboardMock className="relative" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
