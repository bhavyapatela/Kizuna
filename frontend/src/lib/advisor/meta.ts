import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { AdvisorCategory, AdvisorSeverity } from "@/types";

/**
 * Presentation metadata for advisor severities/categories. Components
 * read from here so severity styling never lives inside JSX.
 */

export const SEVERITY_META: Record<
  AdvisorSeverity,
  {
    label: string;
    icon: LucideIcon;
    /** Accent color used for icons, rings, and timeline dots. */
    color: string;
    /** Tailwind classes for the icon tile. */
    tile: string;
    order: number;
  }
> = {
  critical: {
    label: "Critical",
    icon: ShieldAlert,
    color: "#ef4444",
    tile: "bg-destructive/10 text-destructive",
    order: 0,
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    color: "#f59e0b",
    tile: "bg-warning/10 text-warning",
    order: 1,
  },
  suggestion: {
    label: "Suggestion",
    icon: Lightbulb,
    color: "#3b82f6",
    tile: "bg-primary/10 text-primary",
    order: 2,
  },
  success: {
    label: "Success",
    icon: CheckCircle2,
    color: "#22c55e",
    tile: "bg-success/10 text-success",
    order: 3,
  },
};

export const CATEGORY_LABELS: Record<AdvisorCategory, string> = {
  passwords: "Password health",
  reuse: "Password reuse",
  hygiene: "Account hygiene",
  organization: "Vault organization",
  authentication: "Authentication",
  achievement: "Achievement",
};
