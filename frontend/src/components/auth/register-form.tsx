"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrength } from "@/components/shared/password-strength";
import { useRegister } from "@/hooks/use-auth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

export function RegisterForm() {
  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (values: RegisterFormValues) => {
    register.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  const isBusy = form.formState.isSubmitting || register.isPending;
  const passwordValue = useWatch({ control: form.control, name: "password" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-8 space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your vault
        </h2>
        <p className="text-sm text-muted-foreground">
          One master password protects everything. Make it count.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="register-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="register-name"
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={isBusy}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="register-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
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
                <FieldLabel htmlFor="register-password">
                  Master password
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="register-password"
                  placeholder="At least 12 characters"
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
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="register-confirm">
                  Confirm master password
                </FieldLabel>
                <PasswordInput
                  {...field}
                  id="register-confirm"
                  placeholder="Repeat your master password"
                  autoComplete="new-password"
                  disabled={isBusy}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
            {isBusy ? (
              <>
                <Spinner data-icon="inline-start" />
                Creating vault…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground">
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </motion.div>
  );
}
