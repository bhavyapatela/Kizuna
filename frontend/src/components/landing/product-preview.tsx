"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import {
  DashboardMock,
  DetailsMock,
  SearchMock,
  SettingsMock,
  VaultMock,
} from "@/components/landing/mockups";

const PREVIEWS = [
  { value: "dashboard", label: "Dashboard", mock: DashboardMock },
  { value: "vault", label: "Vault", mock: VaultMock },
  { value: "details", label: "Details", mock: DetailsMock },
  { value: "search", label: "Search", mock: SearchMock },
  { value: "settings", label: "Settings", mock: SettingsMock },
] as const;

export function ProductPreview() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Product"
            title="Take a look inside."
            description="Every screen is designed to be calm, fast, and obvious — even with hundreds of secrets."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Tabs defaultValue="dashboard" className="items-center gap-8">
            <TabsList className="h-auto flex-wrap justify-center">
              {PREVIEWS.map((preview) => (
                <TabsTrigger
                  key={preview.value}
                  value={preview.value}
                  className="px-4 py-1.5"
                >
                  {preview.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PREVIEWS.map((preview) => (
              <TabsContent
                key={preview.value}
                value={preview.value}
                className="w-full"
              >
                <div className="relative mx-auto max-w-2xl">
                  <div
                    className="absolute -inset-8 rounded-[3rem] bg-primary/8 blur-3xl"
                    aria-hidden="true"
                  />
                  <preview.mock className="relative animate-in duration-500 fade-in slide-in-from-bottom-2" />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
