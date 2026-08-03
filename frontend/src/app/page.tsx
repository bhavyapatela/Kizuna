import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Hero } from "@/components/landing/hero";
import { DigitalWorld } from "@/components/landing/digital-world";
import { WhyKizuna } from "@/components/landing/why-kizuna";
import { Features } from "@/components/landing/features";
import { SecurityFlow } from "@/components/landing/security-flow";
import { ProductPreview } from "@/components/landing/product-preview";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "Kizuna — The password manager built on trust",
  description:
    "Kizuna is a fast, end-to-end encrypted password manager for people who value privacy and simplicity. One master password. Every secret sealed.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <DigitalWorld />
        <WhyKizuna />
        <Features />
        <SecurityFlow />
        <ProductPreview />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
