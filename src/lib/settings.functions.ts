import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function callerMerchantAndRoles(
  supabase: any,
  userId: string,
): Promise<{ merchantId: string | null; roles: string[] }> {
  const { data } = await supabase
    .from("merchant_members")
    .select("merchant_id, role")
    .eq("user_id", userId);
  const first = data?.[0];
  if (!first) return { merchantId: null, roles: [] };
  const merchantId = first.merchant_id as string;
  return {
    merchantId,
    roles: (data ?? [])
      .filter((r: any) => r.merchant_id === merchantId)
      .map((r: any) => r.role as string),
  };
}

// ---------- merchant settings ----------

export const updateMerchant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      business_name: z.string().trim().min(1).max(160).optional(),
      business_email: z.string().trim().email().max(255).optional().nullable(),
      business_country: z.string().trim().length(2).optional(),
      brand_logo_url: z.string().trim().url().max(500).optional().nullable(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { merchantId, roles } = await callerMerchantAndRoles(supabase, userId);
    if (!merchantId) throw new Error("Not a merchant member.");
    if (!roles.some((r) => ["owner", "admin"].includes(r))) {
      throw new Error("You do not have permission to update merchant details.");
    }
    const { error } = await supabase.from("merchants").update(data).eq("id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPaymentMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ mode: z.enum(["test", "live"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { merchantId, roles } = await callerMerchantAndRoles(supabase, userId);
    if (!merchantId) throw new Error("Not a merchant member.");
    if (!roles.includes("owner")) {
      throw new Error("Only the merchant owner can change the payment mode.");
    }
    // Live requires backend config — enforce it server-side.
    if (data.mode === "live") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { razorpayConfigured, razorpayWebhookConfigured } = await import("@/lib/razorpay.server");
      if (!razorpayConfigured() || !razorpayWebhookConfigured()) {
        throw new Error(
          "Live mode cannot be enabled until Razorpay live credentials and webhook secret are configured on the backend.",
        );
      }
      await supabaseAdmin.from("audit_logs").insert({
        actor_id: userId,
        merchant_id: merchantId,
        action: "payment_mode.set_live",
        resource_type: "merchant_settings",
        resource_id: merchantId,
        safe_metadata: {},
      });
    }
    const { error } = await supabase
      .from("merchant_settings")
      .update({ payment_mode: data.mode })
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setInternationalStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      status: z.enum(["not_requested", "activation_required", "under_review", "enabled", "restricted", "unavailable"]),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { merchantId, roles } = await callerMerchantAndRoles(supabase, userId);
    if (!merchantId) throw new Error("Not a merchant member.");
    if (!roles.some((r) => ["owner", "admin"].includes(r))) {
      throw new Error("You do not have permission to change international status.");
    }
    const { error } = await supabase
      .from("merchant_settings")
      .update({ international_status: data.status })
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCurrencyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      currency: z.string().trim().length(3).toUpperCase(),
      status: z.enum(["enabled", "disabled", "activation_required", "unsupported"]),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { merchantId, roles } = await callerMerchantAndRoles(supabase, userId);
    if (!merchantId) throw new Error("Not a merchant member.");
    if (!roles.some((r) => ["owner", "admin", "finance"].includes(r))) {
      throw new Error("You do not have permission to change currencies.");
    }
    const { error } = await supabase
      .from("merchant_enabled_currencies")
      .update({ status: data.status })
      .eq("merchant_id", merchantId)
      .eq("currency", data.currency);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Provider capabilities (safe read of env-configured providers) ----------

export const getProviderCapabilitiesSafe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { getProviderCapabilities } = await import("@/lib/providers.server");
    const caps = await getProviderCapabilities();
    // Never leak secret. publicKeyId (Razorpay Key ID) is a publishable identifier,
    // safe to display in the dashboard for verification purposes.
    return caps;
  });
