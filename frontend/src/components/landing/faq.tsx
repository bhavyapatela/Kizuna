import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { DEMO_CREDENTIALS } from "@/lib/demo-session";

const FAQ_ITEMS = [
  {
    question: "How does Kizuna keep my passwords safe?",
    answer:
      "Everything you store is encrypted on your device with AES-256 before it goes anywhere. The encryption keys are derived from your master password, which never leaves your machine — so only you can ever decrypt your vault.",
  },
  {
    question: "Can Kizuna see my passwords?",
    answer:
      "No. Kizuna is zero-knowledge by design: servers only ever hold ciphertext. Without your master password, your vault is mathematically indistinguishable from random noise — to us and to anyone else.",
  },
  {
    question: "What happens if I forget my master password?",
    answer:
      "Because of the zero-knowledge design, there's no reset link that reveals your data — that's a feature, not a limitation. During onboarding you'll be able to generate a one-time recovery kit to keep somewhere safe.",
  },
  {
    question: "Is Kizuna free?",
    answer:
      "Getting started is free, with everything an individual needs: unlimited items, vaults, the generator, and search. Paid tiers will arrive later for sync and sharing — private storage stays free.",
  },
  {
    question: "Will Kizuna work on my phone?",
    answer:
      "The interface is fully responsive today, and the sync architecture is designed for cross-device use. Native mobile apps with biometric unlock are on the roadmap.",
  },
  {
    question: "Can I try it without creating an account?",
    answer: `Yes — the live demo is open. Sign in with ${DEMO_CREDENTIALS.email} and the password ${DEMO_CREDENTIALS.password} to explore the full app with sample data.`,
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, answered."
            description="Everything people usually ask before trusting a vault with their secrets."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="rounded-2xl border bg-card/60 px-5 transition-colors last:border-b hover:border-primary/25 data-[state=open]:border-primary/30 data-[state=open]:bg-card data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
              >
                <AccordionTrigger className="gap-4 py-5 text-left text-base font-medium hover:no-underline">
                  <span className="flex items-center gap-4">
                    <span
                      className="font-mono text-xs tabular-nums text-primary/70"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-9 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
