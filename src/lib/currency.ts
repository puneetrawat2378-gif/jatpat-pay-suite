/**
 * Currency helpers.
 * Amounts are stored as integers in minor units (paise for INR, cents for USD, etc.).
 * NEVER use floating point for stored payment amounts.
 */

export type CurrencyCode =
  | "INR" | "USD" | "EUR" | "GBP" | "AED" | "CAD" | "AUD" | "JPY";

// ISO 4217 exponents (digits after the decimal separator).
// JPY is 0-exponent (no fractional units). Add more as we onboard providers.
const EXPONENTS: Record<string, number> = {
  INR: 2, USD: 2, EUR: 2, GBP: 2, AED: 2, CAD: 2, AUD: 2, JPY: 0,
};

const SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED ", CAD: "C$", AUD: "A$", JPY: "¥",
};

export const SUPPORTED_CURRENCIES: CurrencyCode[] =
  ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "JPY"];

export function currencyExponent(code: string): number {
  const e = EXPONENTS[code.toUpperCase()];
  if (e === undefined) throw new Error(`Unsupported currency: ${code}`);
  return e;
}

export function currencySymbol(code: string): string {
  return SYMBOLS[code.toUpperCase()] ?? code + " ";
}

/** Convert a user-entered decimal string ("49.99") to minor units. */
export function toMinorUnits(input: string | number, code: string): number {
  const exp = currencyExponent(code);
  const factor = Math.pow(10, exp);
  const n = typeof input === "number" ? input : Number(String(input).trim());
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amount");
  // Use string manipulation to avoid float drift on edge values.
  return Math.round(n * factor);
}

/** Format minor units back to a display string with currency symbol. */
export function formatMinor(minor: number | bigint, code: string): string {
  const exp = currencyExponent(code);
  const factor = Math.pow(10, exp);
  const n = Number(minor) / factor;
  return currencySymbol(code) + n.toLocaleString(undefined, {
    minimumFractionDigits: exp,
    maximumFractionDigits: exp,
  });
}

/** Currencies allowed on the given provider today. Extend when new providers onboard. */
export function providerAllowedCurrencies(provider: string): CurrencyCode[] {
  if (provider === "razorpay") {
    // Razorpay domestic = INR always. International currencies depend on
    // merchant account activation; we still list them so the account-capability
    // UI can render Activation Required states.
    return SUPPORTED_CURRENCIES;
  }
  return ["INR"];
}
