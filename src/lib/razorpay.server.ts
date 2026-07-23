/**
 * Razorpay provider adapter — server-only.
 *
 * All calls hit Razorpay's documented REST API directly (no SDK needed on
 * Cloudflare Workers). Uses:
 *   POST /v1/orders                                — create order
 *   POST /v1/payments/{id}/refund                  — issue refund
 *   GET  /v1/payments/{id}                         — fetch payment
 * Verification (per current Razorpay docs):
 *   - Client return: HMAC-SHA256("<order_id>|<payment_id>", key_secret) === razorpay_signature
 *   - Webhook:      HMAC-SHA256(raw_body, webhook_secret)               === X-Razorpay-Signature
 *
 * Docs: https://razorpay.com/docs/api/  (verify at implementation time)
 */

import { createHmac, timingSafeEqual } from "crypto";

const RZP_BASE = "https://api.razorpay.com/v1";

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

function requireCreds() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured on the backend. " +
      "Add them via Lovable Cloud secrets before creating live orders.",
    );
  }
  return { keyId, keySecret };
}

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayWebhookConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
}

export function razorpayPublicKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}

// ---------- Orders API ----------

export interface CreateRazorpayOrderInput {
  amountMinor: number;           // amount in currency subunits
  currency: string;              // ISO 4217, e.g. "INR"
  receipt: string;               // our internal reference
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: "order";
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput,
): Promise<RazorpayOrder> {
  const { keyId, keySecret } = requireCreds();
  const res = await fetch(`${RZP_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });
  if (!res.ok) {
    // Safe surface — we log the detail server-side but bubble a generic message.
    const raw = await res.text().catch(() => "");
    console.error("razorpay.createOrder failed", res.status, raw.slice(0, 400));
    throw new Error("Payment order could not be created.");
  }
  return (await res.json()) as RazorpayOrder;
}

// ---------- Verification ----------

/**
 * Verify the signature Razorpay returns to the browser after checkout success.
 * From current Razorpay docs.
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const { keySecret } = requireCreds();
  const expected = createHmac("sha256", keySecret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");
  return safeEqualHex(expected, params.razorpay_signature);
}

/**
 * Verify a Razorpay webhook. Pass the **raw** request body (never re-serialize).
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

// ---------- Payments / Refunds ----------

export interface RazorpayPayment {
  id: string;
  order_id: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  amount: number;
  currency: string;
  method?: string;
  error_code?: string;
  error_description?: string;
  captured?: boolean;
  international?: boolean;
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  const { keyId, keySecret } = requireCreds();
  const res = await fetch(`${RZP_BASE}/payments/${paymentId}`, {
    headers: { Authorization: basicAuth(keyId, keySecret) },
  });
  if (!res.ok) throw new Error("Could not fetch payment status");
  return (await res.json()) as RazorpayPayment;
}

export interface CreateRazorpayRefundInput {
  paymentId: string;
  amountMinor?: number;   // omit for full refund
  notes?: Record<string, string>;
  idempotencyKey: string; // required — our refund UUID
}

export interface RazorpayRefund {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processed" | "failed";
}

export async function createRazorpayRefund(
  input: CreateRazorpayRefundInput,
): Promise<RazorpayRefund> {
  const { keyId, keySecret } = requireCreds();
  const res = await fetch(`${RZP_BASE}/payments/${input.paymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(keyId, keySecret),
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      amount: input.amountMinor,
      notes: input.notes ?? {},
    }),
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    console.error("razorpay.createRefund failed", res.status, raw.slice(0, 400));
    throw new Error("Refund could not be created.");
  }
  return (await res.json()) as RazorpayRefund;
}
