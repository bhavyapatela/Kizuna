import {
  LayoutDashboard,
  Vault,
  Waypoints,
  Sparkles,
  Star,
  KeyRound,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Keyboard shortcut hint shown in the command palette. */
  shortcut?: string;
}

export const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { title: "Vaults", href: "/vaults", icon: Vault, shortcut: "G V" },
  { title: "Identity Map", href: "/identity", icon: Waypoints, shortcut: "G I" },
  { title: "Security Advisor", href: "/advisor", icon: Sparkles, shortcut: "G A" },
  { title: "Favorites", href: "/favorites", icon: Star, shortcut: "G F" },
  { title: "Generator", href: "/generator", icon: KeyRound, shortcut: "G G" },
];

export const SECONDARY_NAV: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings, shortcut: "G S" },
];
