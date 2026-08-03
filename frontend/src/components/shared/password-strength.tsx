"use client";

import { useMemo } from "react";
import { estimateStrength } from "@/lib/password";
import { cn } from "@/lib/utils";

const STRENGTH_STYLES: Record<string, string> = {
  Weak: "bg-destructive",
  Fair: "bg-warning",
  Good: "bg-primary",
  Strong: "bg-success",
};

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

/** Segmented strength meter with a live text label. */
export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => estimateStrength(password), [password]);
  const activeSegments = Math.ceil((strength.score / 100) * 4);

  if (!password) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className="flex gap-1.5"
        role="meter"
        aria-valuenow={strength.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Password strength: ${strength.label}`}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors duration-300",
              index < activeSegments && STRENGTH_STYLES[strength.label],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {strength.label === "Strong"
          ? "Strong password"
          : `${strength.label} — longer is stronger`}
      </p>
    </div>
  );
}
