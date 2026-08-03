"use client";

import { motion } from "motion/react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PasswordStrength } from "@/components/shared/password-strength";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePasswordGenerator } from "@/hooks/use-password-generator";
import type { PasswordOptions } from "@/lib/password";

const CHARSET_TOGGLES: Array<{
  key: keyof Omit<PasswordOptions, "length">;
  label: string;
  hint: string;
}> = [
  { key: "uppercase", label: "Uppercase", hint: "A–Z" },
  { key: "lowercase", label: "Lowercase", hint: "a–z" },
  { key: "numbers", label: "Numbers", hint: "0–9" },
  { key: "symbols", label: "Symbols", hint: "!@#$%" },
];

export function PasswordGenerator() {
  const { password, options, setOption, regenerate } = usePasswordGenerator();
  const { copied, copy } = useClipboard();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Password generator</CardTitle>
        <CardDescription>
          Generated locally with cryptographic randomness — nothing leaves
          this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <motion.div
            key={password}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-16 items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3"
          >
            <output
              className="font-mono text-base break-all"
              aria-live="polite"
              aria-label="Generated password"
            >
              {password}
            </output>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={regenerate}
                aria-label="Generate new password"
              >
                <RefreshCw aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copy(password, { label: "Password" })}
                aria-label="Copy password"
              >
                {copied ? (
                  <Check className="text-success" aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
              </Button>
            </div>
          </motion.div>
          <PasswordStrength password={password} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="generator-length">Length</Label>
            <span className="rounded-md border bg-muted/40 px-2 py-0.5 font-mono text-sm tabular-nums">
              {options.length}
            </span>
          </div>
          <Slider
            id="generator-length"
            value={[options.length]}
            onValueChange={([value]) => setOption("length", value)}
            min={8}
            max={64}
            step={1}
            aria-label="Password length"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CHARSET_TOGGLES.map((toggle) => (
            <label
              key={toggle.key}
              className="flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-accent/50 has-data-[state=checked]:border-primary/40"
            >
              <span>
                <span className="block text-sm font-medium">
                  {toggle.label}
                </span>
                <span className="block font-mono text-xs text-muted-foreground">
                  {toggle.hint}
                </span>
              </span>
              <Switch
                checked={options[toggle.key]}
                onCheckedChange={(checked) => setOption(toggle.key, checked)}
                aria-label={`Include ${toggle.label.toLowerCase()}`}
              />
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
