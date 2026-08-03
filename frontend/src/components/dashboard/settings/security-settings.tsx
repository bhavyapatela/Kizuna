"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

const AUTO_LOCK_OPTIONS = [
  { value: 1, label: "After 1 minute" },
  { value: 5, label: "After 5 minutes" },
  { value: 10, label: "After 10 minutes" },
  { value: 30, label: "After 30 minutes" },
];

const CLIPBOARD_OPTIONS = [
  { value: 15, label: "After 15 seconds" },
  { value: 30, label: "After 30 seconds" },
  { value: 60, label: "After 1 minute" },
];

export function SecuritySettings() {
  const { data: settings, isPending } = useSettings();
  const updateSettings = useUpdateSettings();

  if (isPending || !settings) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Control how Kizuna locks and cleans up after you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Control how Kizuna locks and cleans up after you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label htmlFor="auto-lock">Auto-lock vault</Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Lock automatically when you step away.
            </p>
          </div>
          <Select
            value={String(settings.autoLockMinutes)}
            onValueChange={(value) =>
              updateSettings.mutate({ autoLockMinutes: Number(value) })
            }
            disabled={updateSettings.isPending}
          >
            <SelectTrigger id="auto-lock" className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTO_LOCK_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label htmlFor="clipboard-clear">Clear clipboard</Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Copied secrets are wiped from the clipboard automatically.
            </p>
          </div>
          <Select
            value={String(settings.clipboardClearSeconds)}
            onValueChange={(value) =>
              updateSettings.mutate({ clipboardClearSeconds: Number(value) })
            }
            disabled={updateSettings.isPending}
          >
            <SelectTrigger id="clipboard-clear" className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIPBOARD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
