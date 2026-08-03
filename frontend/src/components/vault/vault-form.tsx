"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { VAULT_ICON_OPTIONS, VAULT_ICONS } from "@/constants/vault";
import { vaultSchema, type VaultFormValues } from "@/lib/validations/vault";
import { cn } from "@/lib/utils";

interface VaultFormProps {
  defaultValues?: VaultFormValues;
  submitLabel: string;
  busyLabel: string;
  isBusy: boolean;
  onSubmit: (values: VaultFormValues) => void;
}

/** Shared create/edit vault form (name, description, icon picker). */
export function VaultForm({
  defaultValues,
  submitLabel,
  busyLabel,
  isBusy,
  onSubmit,
}: VaultFormProps) {
  const form = useForm<VaultFormValues>({
    resolver: zodResolver(vaultSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      icon: "shield",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="vault-name">Name</FieldLabel>
              <Input
                {...field}
                id="vault-name"
                placeholder="e.g. Personal"
                disabled={isBusy}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="vault-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                {...field}
                id="vault-description"
                placeholder="What lives in this vault?"
                disabled={isBusy}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="icon"
          render={({ field }) => (
            <Field>
              <FieldLabel>Icon</FieldLabel>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-2"
                disabled={isBusy}
              >
                {VAULT_ICON_OPTIONS.map((iconKey) => {
                  const Icon = VAULT_ICONS[iconKey];
                  return (
                    <label
                      key={iconKey}
                      className={cn(
                        "flex size-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                        "hover:bg-accent has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                        field.value === iconKey
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <RadioGroupItem value={iconKey} className="sr-only" />
                      <Icon className="size-4.5" aria-hidden="true" />
                      <span className="sr-only">{iconKey}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </Field>
          )}
        />

        <Button type="submit" disabled={isBusy} className="w-full">
          {isBusy ? (
            <>
              <Spinner data-icon="inline-start" />
              {busyLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
