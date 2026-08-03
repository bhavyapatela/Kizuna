export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const CHARSETS = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*-_=+?",
} as const;

/**
 * Generates a password using the Web Crypto API. Ambiguous characters
 * (I, l, 1, O, 0) are excluded from the charsets for readability.
 */
export function generatePassword(options: PasswordOptions): string {
  const pools = (
    ["uppercase", "lowercase", "numbers", "symbols"] as const
  ).filter((key) => options[key]);

  if (pools.length === 0 || options.length < 1) return "";

  const all = pools.map((key) => CHARSETS[key]).join("");
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  const chars = Array.from(randomValues, (value) => all[value % all.length]);

  // Guarantee at least one character from every enabled pool.
  pools.forEach((key, index) => {
    if (index >= chars.length) return;
    const pool = CHARSETS[key];
    const position = randomValues[index] % chars.length;
    if (!chars.some((char) => pool.includes(char))) {
      chars[position] = pool[randomValues[index] % pool.length];
    }
  });

  return chars.join("");
}

export type StrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export interface PasswordStrength {
  /** 0–100 */
  score: number;
  label: StrengthLabel;
}

/**
 * Lightweight entropy-based strength estimate. Not a substitute for a
 * breach check — used purely for inline UI feedback.
 */
export function estimateStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "Weak" };

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = password.length * Math.log2(poolSize || 1);
  const score = Math.min(100, Math.round((entropy / 90) * 100));

  const label: StrengthLabel =
    score >= 80 ? "Strong" : score >= 55 ? "Good" : score >= 30 ? "Fair" : "Weak";

  return { score, label };
}
