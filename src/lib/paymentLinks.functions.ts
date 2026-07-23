import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { toMinorUnits, SUPPORTED_CURRENCIES } from "@/lib/currency";

async function callerMerchantId(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("merchant_members")
    .select("merchant_id")
    .eq("user_id", userId)
    .limit(1);
  if (error) throw new Error(error.message);
  return data?.[0]?.merchant_id ?? null;
}

/** Generate a URL-safe random slug. */
function makeSlug(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

const CreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  amount: z.string().trim().min(1),           // decimal string
  currency: z.enum(SUPPORTED_CURRENCIES as [string, ...string[]]),
  expiresAt: z.string().datetime().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
});

export const createPaymentLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) throw new Error("You are not a member of any merchant.");

    // Validate currency is enabled on this merchant.
    const { data: cur, error: curErr } = await supabase
      .from("merchant_enabled_currencies")
      .select("status")
      .eq("merchant_id", merchantId)
      .eq("currency", data.currency)
      .single();
    if (curErr || !cur || cur.status !== "enabled") {
      throw new Error(`Currency ${data.currency} is not currently enabled for this merchant.`);
    }

    // Load payment mode to stamp is_test.
    const { data: settings } = await supabase
      .from("merchant_settings")
      .select("payment_mode")
      .eq("merchant_id", merchantId)
      .single();

    const amountMinor = toMinorUnits(data.amount, data.currency);
    const slug = makeSlug();

    const { data: link, error } = await supabase
      .from("payment_links")
      .insert({
        merchant_id: merchantId,
        customer_id: data.customerId ?? null,
        slug,
        title: data.title,
        description: data.description ?? null,
        amount_minor: amountMinor,
        currency: data.currency,
        expires_at: data.expiresAt ?? null,
        is_test: settings?.payment_mode !== "live",
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return link;
  });

export const listPaymentLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) return [];
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/**
 * PUBLIC: fetch the *safe* subset of a payment link + merchant info by slug.
 * No auth. Returns only display-safe fields.
 */
export const getPublicPaymentLink = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().trim().min(4).max(40) }).parse(data),
  )
  .handler(async ({ data }) => {
    // Server publishable client — RLS bypassed for admin here is unnecessary; we
    // instead use service role because payment_links has no anon SELECT policy
    // and we want to guarantee whitelisted projection.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin
      .from("payment_links")
      .select("id, slug, title, description, amount_minor, currency, status, expires_at, is_test, merchant_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error("Payment link not available");
    if (!link) return null;

    // Expiry
    if (link.expires_at && new Date(link.expires_at as string).getTime() < Date.now()) {
      return { ...link, status: "expired" as const, merchant: null };
    }

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("business_name, brand_logo_url")
      .eq("id", link.merchant_id)
      .single();

    return {
      id: link.id,
      slug: link.slug,
      title: link.title,
      description: link.description,
      amount_minor: link.amount_minor,
      currency: link.currency,
      status: link.status,
      is_test: link.is_test,
      expires_at: link.expires_at,
      merchant: merchant
        ? { business_name: merchant.business_name, brand_logo_url: merchant.brand_logo_url }
        : null,
    };
  });
