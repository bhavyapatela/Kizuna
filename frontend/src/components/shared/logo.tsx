import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app";

interface LogoProps {
  className?: string;
  /** Hide the wordmark and render only the mark. */
  markOnly?: boolean;
}

/**
 * Kizuna mark — an interlocked knot inside a rounded square, a nod to the
 * word's meaning ("bond") and the trust the product is built on.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-4.5"
        >
          <path
            d="M8.5 4.5a4 4 0 0 1 4 4v7a4 4 0 1 1-4-4h7a4 4 0 1 1-4 4v-7a4 4 0 0 1 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!markOnly && (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </span>
  );
}
