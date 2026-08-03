"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function FinalCta() {
  return (
    <section className="px-4 pt-8 pb-24 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/20 px-6 py-16 text-center sm:py-20">
          {/* Layered gradient backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_100%,color-mix(in_oklab,var(--primary)_22%,transparent),color-mix(in_oklab,var(--card)_60%,transparent))]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_top,black,transparent_70%)]"
          />

          <div className="relative">
            <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Free to start · No card required
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Protect your digital life today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              One master password between your secrets and everyone else.
              Set up your vault in under a minute.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
