import type { ReactNode } from "react";
import { EyeOff, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { APP_NAME } from "@/constants/app";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "End-to-end encrypted",
    description: "Your vault is sealed before it ever leaves this device.",
  },
  {
    icon: EyeOff,
    title: "Zero-knowledge by design",
    description: `No one — not even ${APP_NAME} — can read your secrets.`,
  },
  {
    icon: Zap,
    title: "Fast everywhere",
    description: "Instant unlock, instant search, on every device you own.",
  },
];

/**
 * Two-panel auth layout: brand story on the left (desktop only),
 * form content on the right.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Ambient glow + dot grid backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <Logo className="relative" />

        <div className="relative max-w-md space-y-10">
          <div className="space-y-3">
            <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance">
              The bond between you and your secrets.
            </h1>
            <p className="text-base text-muted-foreground">
              {APP_NAME} keeps every password, key, and note sealed behind one
              master password only you know.
            </p>
          </div>

          <ul className="space-y-5">
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card shadow-sm">
                  <point.icon
                    className="size-4.5 text-primary"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-sm font-medium">{point.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © 2026 {APP_NAME}. Built for people who take privacy personally.
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
