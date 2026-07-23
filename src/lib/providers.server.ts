/**
 * Payment provider registry.
 * Adapter interface designed so PayU / Stripe can be added later without
 * touching call sites. Only Razorpay is implemented today.
 */

export type ProviderId = "razorpay" | "payu" | "stripe";

export type ProviderStatus =
  | "not_configured"
  | "configured"
  | "future_integration"
  | "optional_future";

export interface ProviderCapability {
  id: ProviderId;
  displayName: string;
  status: ProviderStatus;
  configured: boolean;
  webhookConfigured: boolean;
  publicKeyId: string | null;
  supportsInternational: boolean;
}

/**
 * Live capability snapshot from server-side environment.
 * Never returned to unauthenticated clients wholesale — the settings page
 * projects only safe fields.
 */
export async function getProviderCapabilities(): Promise<ProviderCapability[]> {
  const rzp = await import("./razorpay.server");
  return [
    {
      id: "razorpay",
      displayName: "Razorpay",
      status: rzp.razorpayConfigured() ? "configured" : "not_configured",
      configured: rzp.razorpayConfigured(),
      webhookConfigured: rzp.razorpayWebhookConfigured(),
      publicKeyId: rzp.razorpayPublicKeyId(),
      supportsInternational: true, // capability depends on merchant account activation
    },
    {
      id: "payu",
      displayName: "PayU",
      status: "future_integration",
      configured: false,
      webhookConfigured: false,
      publicKeyId: null,
      supportsInternational: true,
    },
    {
      id: "stripe",
      displayName: "Stripe",
      status: "optional_future",
      configured: false,
      webhookConfigured: false,
      publicKeyId: null,
      supportsInternational: true,
    },
  ];
}
