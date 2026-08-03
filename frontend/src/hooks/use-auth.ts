"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { queryKeys } from "@/lib/query-keys";
import type { LoginPayload, RegisterPayload } from "@/types";

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ user }) => {
      setUser(user);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to sign in. Please try again.");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: ({ user }) => {
      setUser(user);
      toast.success("Your account is ready");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create account.");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast.success("Signed out securely");
      router.push("/");
    },
  });
}
