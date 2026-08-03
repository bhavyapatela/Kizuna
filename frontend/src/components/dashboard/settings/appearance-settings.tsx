"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> =
  [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  // next-themes is client-only; avoid a hydration mismatch on the selector.
  const mounted = useMounted();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Make Kizuna feel like home.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Theme</legend>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm transition-colors hover:bg-accent/50",
                  "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  mounted && theme === option.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={mounted && theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="sr-only"
                />
                <option.icon className="size-5" aria-hidden="true" />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="show-favicons">Show website icons</Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Display favicons next to login items.
            </p>
          </div>
          <Switch
            id="show-favicons"
            checked={settings?.showFavicons ?? true}
            onCheckedChange={(checked) =>
              updateSettings.mutate({ showFavicons: checked })
            }
            disabled={!settings || updateSettings.isPending}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="compact-mode">Compact mode</Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tighter spacing to fit more on screen.
            </p>
          </div>
          <Switch
            id="compact-mode"
            checked={settings?.compactMode ?? false}
            onCheckedChange={(checked) =>
              updateSettings.mutate({ compactMode: checked })
            }
            disabled={!settings || updateSettings.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
