"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrength } from "@/components/shared/password-strength";
import { ITEM_TYPE_META, ITEM_TYPES } from "@/constants/vault";
import { useCreateItem, useUpdateItem } from "@/hooks/use-vault-items";
import { DEFAULT_PASSWORD_OPTIONS, generatePassword } from "@/lib/password";
import {
  vaultItemSchema,
  type VaultItemFormValues,
} from "@/lib/validations/vault";
import type { VaultItem } from "@/types";

const EMPTY_VALUES: VaultItemFormValues = {
  type: "login",
  name: "",
  username: "",
  password: "",
  url: "",
  notes: "",
};

interface ItemFormSheetProps {
  vaultId: string;
  /** When set, the sheet edits this item; otherwise it creates a new one. */
  item?: VaultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemFormSheet({
  vaultId,
  item,
  open,
  onOpenChange,
}: ItemFormSheetProps) {
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const isEditing = Boolean(item);
  const isBusy = createItem.isPending || updateItem.isPending;

  const form = useForm<VaultItemFormValues>({
    resolver: zodResolver(vaultItemSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Sync form contents whenever the sheet opens for a different target.
  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
              type: item.type,
              name: item.name,
              username: item.username ?? "",
              password: item.password ?? "",
              url: item.url ?? "",
              notes: item.notes ?? "",
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, item, form]);

  const onSubmit = (values: VaultItemFormValues) => {
    const payload = {
      ...values,
      username: values.username || undefined,
      password: values.password || undefined,
      url: values.url || undefined,
      notes: values.notes || undefined,
    };

    if (isEditing && item) {
      updateItem.mutate(
        { itemId: item.id, payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createItem.mutate(
        { vaultId, ...payload },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  const passwordValue =
    useWatch({ control: form.control, name: "password" }) ?? "";
  const typeValue = useWatch({ control: form.control, name: "type" });
  const showCredentialFields = typeValue === "login" || typeValue === "identity";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit item" : "Add item"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Changes are encrypted the moment you save."
              : "Everything you store is encrypted end-to-end."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-0 px-4 pb-4">
            <FieldGroup>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="item-type">Type</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isBusy || isEditing}
                    >
                      <SelectTrigger id="item-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TYPES.map((type) => {
                          const meta = ITEM_TYPE_META[type];
                          return (
                            <SelectItem key={type} value={type}>
                              <meta.icon aria-hidden="true" />
                              {meta.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="item-name"
                      placeholder="e.g. GitHub"
                      disabled={isBusy}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              {showCredentialFields && (
                <>
                  <Controller
                    control={form.control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="item-username">
                          Username or email
                        </FieldLabel>
                        <Input
                          {...field}
                          id="item-username"
                          placeholder="you@example.com"
                          autoComplete="off"
                          disabled={isBusy}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor="item-password">
                            Password
                          </FieldLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-primary hover:text-primary"
                            disabled={isBusy}
                            onClick={() =>
                              form.setValue(
                                "password",
                                generatePassword(DEFAULT_PASSWORD_OPTIONS),
                                { shouldDirty: true },
                              )
                            }
                          >
                            <Sparkles aria-hidden="true" />
                            Generate
                          </Button>
                        </div>
                        <PasswordInput
                          {...field}
                          id="item-password"
                          placeholder="Enter or generate a password"
                          autoComplete="new-password"
                          disabled={isBusy}
                          aria-invalid={fieldState.invalid}
                        />
                        <PasswordStrength password={passwordValue} />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="url"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="item-url">Website</FieldLabel>
                        <Input
                          {...field}
                          id="item-url"
                          type="url"
                          placeholder="https://example.com"
                          disabled={isBusy}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </>
              )}

              <Controller
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="item-notes">Notes</FieldLabel>
                    <Textarea
                      {...field}
                      id="item-notes"
                      placeholder="Anything else worth remembering…"
                      rows={4}
                      disabled={isBusy}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <SheetFooter className="border-t">
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <>
                  <Spinner data-icon="inline-start" />
                  {isEditing ? "Saving…" : "Adding…"}
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add item"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
