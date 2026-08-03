"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
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
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { DEMO_CREDENTIALS } from "@/lib/demo-session";

export function LoginForm() {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

  const isBusy = form.formState.isSubmitting || login.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-8 space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Enter your master password to unlock your vault.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="login-email"
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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">
                    Master password
                  </FieldLabel>
                  <Link
                    href="/login"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id="login-password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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
                Unlocking…
              </>
            ) : (
              "Unlock vault"
            )}
          </Button>

          <FieldDescription className="text-center">
            New to Kizuna?{" "}
            <Link href="/register" className="font-medium text-foreground">
              Create an account
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>

      {/* TEMPORARY: demo access card — remove once FastAPI auth is live. */}
      <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Try the demo</p>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-primary hover:text-primary"
            disabled={isBusy}
            onClick={() => {
              form.reset({
                email: DEMO_CREDENTIALS.email,
                password: DEMO_CREDENTIALS.password,
              });
            }}
          >
            Fill credentials
          </Button>
        </div>
        <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between gap-4">
            <dt>Email</dt>
            <dd className="font-mono">{DEMO_CREDENTIALS.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Password</dt>
            <dd className="font-mono">{DEMO_CREDENTIALS.password}</dd>
          </div>
        </dl>
      </div>
    </motion.div>
  );
}
