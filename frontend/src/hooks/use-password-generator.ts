"use client";

import { useCallback, useMemo, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import {
  DEFAULT_PASSWORD_OPTIONS,
  estimateStrength,
  generatePassword,
  type PasswordOptions,
} from "@/lib/password";

export function usePasswordGenerator(
  initial: PasswordOptions = DEFAULT_PASSWORD_OPTIONS,
) {
  const [options, setOptions] = useState<PasswordOptions>(initial);
  const [seed, setSeed] = useState(0);
  const mounted = useMounted();

  // Derived, not effect-driven: recomputes when options or the seed change.
  // Empty during SSR/first paint — crypto randomness is client-only.
  const password = useMemo(
    () => (mounted ? generatePassword(options) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed forces a fresh password
    [options, mounted, seed],
  );

  const regenerate = useCallback(() => {
    setSeed((value) => value + 1);
  }, []);

  const strength = useMemo(() => estimateStrength(password), [password]);

  const setOption = useCallback(
    <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
      setOptions((prev) => {
        const next = { ...prev, [key]: value };
        // Never allow every charset to be disabled.
        if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) {
          return prev;
        }
        return next;
      });
    },
    [],
  );

  return { password, options, strength, setOption, regenerate };
}
