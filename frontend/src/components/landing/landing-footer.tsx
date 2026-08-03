import Link from "next/link";
import { BrandLogo } from "@/components/landing/brand-logo";
import { APP_NAME } from "@/constants/app";

/** Lucide dropped brand icons, so the GitHub mark ships inline. */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-xs space-y-3">
            <BrandLogo height={30} />
            <p className="text-sm text-muted-foreground">
              A fast, encrypted password manager built on a simple idea: your
              secrets belong to you, and no one else.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © 2026 {APP_NAME}. All rights reserved.
          </p>
          <Link
            href="#"
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Kizuna on GitHub (coming soon)"
          >
            <GithubIcon className="size-4" />
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
