"use client";

import { useState, type ReactNode } from "react";
import {
  Bell,
  Briefcase,
  CreditCard,
  Globe,
  KeyRound,
  Lock,
  Moon,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Star,
  StickyNote,
  User,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Hand-built product mockups for the landing page. They mirror the real
 * app's visual language (same tokens) without shipping any live logic.
 * The vault mock's sidebar is lightly interactive — clicking a space
 * filters the visible rows — everything else is decorative.
 */

export function MockWindow({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card/80 shadow-2xl shadow-black/40 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md border bg-background/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
          <Lock className="size-3 text-success" />
          {title}
        </span>
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}

function MockBadge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "warning" | "primary";
}) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "success" && "bg-success/15 text-success",
        tone === "warning" && "bg-warning/15 text-warning",
        tone === "primary" && "bg-primary/15 text-primary",
      )}
    >
      {children}
    </span>
  );
}

type MockCategory = "personal" | "work" | "finance" | "infra";

interface MockRow {
  icon: LucideIcon;
  name: string;
  user: string;
  tone: "muted" | "success" | "warning" | "primary";
  label: string;
  category: MockCategory;
}

const VAULT_ROWS: MockRow[] = [
  { icon: Globe, name: "GitHub", user: "kizuna", tone: "success", label: "Strong", category: "personal" },
  { icon: Globe, name: "Google", user: "demo@kizuna.app", tone: "success", label: "Strong", category: "personal" },
  { icon: Globe, name: "Netflix", user: "demo@kizuna.app", tone: "warning", label: "Reused", category: "personal" },
  { icon: Globe, name: "Spotify", user: "demo@kizuna.app", tone: "primary", label: "Good", category: "personal" },
  { icon: Briefcase, name: "Slack", user: "demo@kizuna.app", tone: "success", label: "Strong", category: "work" },
  { icon: Briefcase, name: "Vercel", user: "kizuna", tone: "success", label: "Strong", category: "work" },
  { icon: Briefcase, name: "Figma", user: "demo@kizuna.app", tone: "primary", label: "Good", category: "work" },
  { icon: Briefcase, name: "Notion", user: "demo@kizuna.app", tone: "success", label: "Strong", category: "work" },
  { icon: Briefcase, name: "Linear", user: "kizuna", tone: "success", label: "Strong", category: "work" },
  { icon: CreditCard, name: "Visa Platinum", user: "•••• 4321", tone: "muted", label: "Card", category: "finance" },
  { icon: CreditCard, name: "HDFC Bank", user: "kizuna", tone: "success", label: "Strong", category: "finance" },
  { icon: CreditCard, name: "Stripe", user: "demo@kizuna.app", tone: "success", label: "Strong", category: "finance" },
  { icon: Server, name: "AWS Console", user: "kizuna-admin", tone: "success", label: "Strong", category: "infra" },
  { icon: StickyNote, name: "Recovery Codes", user: "Secure note", tone: "muted", label: "Note", category: "infra" },
];

/** Representative cross-section shown when "All items" is selected. */
const ALL_ITEMS_PREVIEW = ["GitHub", "Visa Platinum", "AWS Console", "Netflix", "Recovery Codes"];

const SIDEBAR_SPACES: Array<{
  key: MockCategory | "all";
  icon: LucideIcon;
  label: string;
}> = [
  { key: "all", icon: Shield, label: "All items" },
  { key: "personal", icon: User, label: "Personal" },
  { key: "work", icon: Briefcase, label: "Work" },
  { key: "finance", icon: CreditCard, label: "Finance" },
  { key: "infra", icon: Server, label: "Infra" },
];

/**
 * Full vault preview used in the hero. The sidebar works: selecting a
 * space filters the rows, exactly like the real app.
 */
export function VaultMock({ className }: { className?: string }) {
  const [selected, setSelected] = useState<MockCategory | "all">("all");

  const rows =
    selected === "all"
      ? VAULT_ROWS.filter((row) => ALL_ITEMS_PREVIEW.includes(row.name))
      : VAULT_ROWS.filter((row) => row.category === selected);

  return (
    <MockWindow title="app.kizuna.dev — encrypted" className={className}>
      <div className="grid grid-cols-[9rem_1fr] max-sm:grid-cols-1">
        {/* Sidebar — interactive: filters the rows on the right */}
        <div className="border-r bg-sidebar/60 p-3 max-sm:hidden">
          <nav className="space-y-1" aria-label="Vault spaces preview">
            {SIDEBAR_SPACES.map((space) => {
              const count =
                space.key === "all"
                  ? VAULT_ROWS.length
                  : VAULT_ROWS.filter((row) => row.category === space.key)
                      .length;
              const active = selected === space.key;
              return (
                <button
                  key={space.key}
                  type="button"
                  onClick={() => setSelected(space.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    active
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <space.icon className="size-3.5" aria-hidden="true" />
                  <span>{space.label}</span>
                  <span className="ml-auto text-[10px] tabular-nums opacity-70">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-lg border border-success/20 bg-success/10 p-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-success">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Vault health 100
            </div>
          </div>
        </div>

        {/* Main pane */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Search className="size-3.5" aria-hidden="true" />
              Search your vault…
              <span className="ml-auto rounded border bg-background px-1 text-[9px]">
                ⌘K
              </span>
            </div>
            <span className="flex size-7 items-center justify-center rounded-lg border text-muted-foreground">
              <Bell className="size-3.5" aria-hidden="true" />
            </span>
            <span className="flex size-7 items-center justify-center rounded-lg border text-muted-foreground">
              <Moon className="size-3.5" aria-hidden="true" />
            </span>
          </div>

          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-3 min-h-56 space-y-1.5"
          >
            {rows.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-3 rounded-xl border bg-background/50 px-3 py-2"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <row.icon
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{row.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {row.user}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground max-sm:hidden">
                  ••••••••
                </span>
                <MockBadge tone={row.tone}>{row.label}</MockBadge>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </MockWindow>
  );
}

export function DashboardMock({ className }: { className?: string }) {
  return (
    <MockWindow title="Dashboard" className={className}>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Items", value: "14", icon: KeyRound },
            { label: "Vaults", value: "4", icon: Shield },
            { label: "Favorites", value: "6", icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-background/50 p-3">
              <stat.icon className="size-3.5 text-primary" />
              <p className="mt-1.5 text-lg font-semibold tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-background/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="size-3.5 text-success" /> Vault health
            </span>
            <span className="font-semibold tabular-nums">100</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-success" />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            0 weak · 0 reused across 12 passwords
          </p>
        </div>
      </div>
    </MockWindow>
  );
}

export function DetailsMock({ className }: { className?: string }) {
  return (
    <MockWindow title="GitHub — Login" className={className}>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border bg-muted/50">
            <Globe className="size-4 text-muted-foreground" />
          </span>
          <div>
            <p className="text-sm font-medium">GitHub</p>
            <p className="text-[10px] text-muted-foreground">github.com</p>
          </div>
          <Star className="ml-auto size-4 fill-warning text-warning" />
        </div>
        {[
          { label: "Username", value: "kizuna" },
          { label: "Password", value: "••••••••••••••••" },
        ].map((field) => (
          <div key={field.label} className="rounded-xl border bg-background/50 p-3">
            <p className="text-[10px] text-muted-foreground">{field.label}</p>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="font-mono text-xs">{field.value}</p>
              <MockBadge tone="primary">Copy</MockBadge>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[10px] text-success">
          <ShieldCheck className="size-3" />
          Strong password · last changed 22 days ago
        </div>
      </div>
    </MockWindow>
  );
}

export function SearchMock({ className }: { className?: string }) {
  return (
    <MockWindow title="Search" className={className}>
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2.5 text-xs">
          <Search className="size-3.5 text-muted-foreground" />
          <span>
            aws<span className="animate-pulse">|</span>
          </span>
        </div>
        <div className="mt-2 space-y-1">
          {[
            { icon: Server, name: "AWS Console", hint: "Infra vault" },
            { icon: StickyNote, name: "AWS S3 backup note", hint: "Secure note" },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs first:bg-accent/70"
            >
              <row.icon className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{row.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {row.hint}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Results in 12 ms — indexed locally
        </p>
      </div>
    </MockWindow>
  );
}

export function SettingsMock({ className }: { className?: string }) {
  return (
    <MockWindow title="Settings — Security" className={className}>
      <div className="space-y-2 p-4">
        {[
          { label: "Auto-lock vault", value: "After 10 minutes", on: true },
          { label: "Clear clipboard", value: "After 30 seconds", on: true },
          { label: "Unlock with biometrics", value: "Coming soon", on: false },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border bg-background/50 px-3 py-2.5"
          >
            <div>
              <p className="text-xs font-medium">{row.label}</p>
              <p className="text-[10px] text-muted-foreground">{row.value}</p>
            </div>
            <span
              className={cn(
                "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
                row.on ? "justify-end bg-primary" : "justify-start bg-muted",
              )}
            >
              <span className="size-3 rounded-full bg-white" />
            </span>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}
