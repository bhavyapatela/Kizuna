"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useCurrentUser } from "@/hooks/use-auth";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { data: user } = useCurrentUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, email: user.email });
    }
  }, [user, form]);

  const onSubmit = () => {
    // Wire to PUT /auth/profile once the backend exposes it.
    toast.success("Profile updated");
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          How you appear across Kizuna. Your email is also your sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="size-14 rounded-xl">
            <AvatarImage src={user?.avatarUrl} alt="" />
            <AvatarFallback className="rounded-xl bg-primary/15 text-lg text-primary">
              {user?.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() ?? "•"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              Member since {user ? new Date(user.createdAt).getFullYear() : "—"}
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="profile-name"
                      autoComplete="name"
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
                    <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="profile-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <div>
              <Button type="submit" disabled={!form.formState.isDirty}>
                Save changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
