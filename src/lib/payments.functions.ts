import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Payment orchestration server functions.
 * - startPaymentForLink (public): given a link slug, creates a provider order and returns
 *   the safe checkout config for the browser (public key id + order id + amount + name).
 * - verifyPaymentReturn  (public): called by the checkout success callback; verifies the
 *   Razorpay signature and marks the payment "successful" only if verification succeeds.
 * - getPaymentStatus      (public): status poll used by /pay/:slug/status/:ref page.
 */

function ref() {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const b64 = Buffer.from(bytes).toString("base64url");
  return "jp_pay_" + b64;
}

// ---------- Start payment ----------

export const startPaymentForLink = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      slug: z.string().trim().min(4).max(40),
      customerEmail: z.string().trim().email().max(255).optional().nullable(),
      customerName: z.string().trim().max(120).optional().nullable(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createRazorpayOrder, razorpayConfigured, razorpayPublicKeyId } =
      await import("@/lib/razorpay.server");

    const { data: link, error } = await supabaseAdmin
      .from("payment_links")
      .select("id, slug, title, amount_minor, currency, status, expires_at, is_test, merchant_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error || !link) throw new Error("Payment link not found");
    if (link.status !== "active") throw new Error("This payment link is no longer active.");
    if (link.expires_at && new Date(link.expires_at as string).getTime() < Date.now()) {
      throw new Error("This payment link has expired.");
    }

    // Merchant settings + currency validation
    const { data: settings } = await supabaseAdmin
      .from("merchant_settings")
      .select("active_provider, payment_mode")
      .eq("merchant_id", link.merchant_id)
      .single();
    const provider = settings?.active_provider ?? "razorpay";

    const { data: cur } = await supabaseAdmin
      .from("merchant_enabled_currencies")
      .select("status")
      .eq("merchant_id", link.merchant_id)
      .eq("currency", link.currency)
      .maybeSingle();
    if (!cur || cur.status !== "enabled") {
      throw new Error("This currency is currently unavailable for this merchant.");
    }

    if (provider !== "razorpay") throw new Error("Provider not implemented yet.");
    if (!razorpayConfigured()) {
      throw new Error("This merchant's payment provider is not yet configured. Please try again later.");
    }

    const internalRef = ref();

    // Idempotency: if the same link+ref pattern is retried within seconds we still
    // create a fresh order — status polling uses internal_reference as the anchor.
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        merchant_id: link.merchant_id,
        payment_link_id: link.id,
        internal_reference: internalRef,
        provider,
        amount_minor: link.amount_minor,
        currency: link.currency,
        status: "created",
        is_test: link.is_test,
      })
      .select()
      .single();
    if (payErr || !payment) throw new Error("Could not initialize payment.");

    let order;
    try {
      order = await createRazorpayOrder({
        amountMinor: Number(link.amount_minor),
        currency: link.currency,
        receipt: internalRef,
        notes: { jatpat_payment_id: payment.id, payment_link_slug: link.slug },
      });
    } catch (e) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", error_description: "provider_order_failed" })
        .eq("id", payment.id);
      throw e;
    }

    await supabaseAdmin
      .from("payments")
      .update({ provider_order_id: order.id, status: "pending" })
      .eq("id", payment.id);

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("business_name")
      .eq("id", link.merchant_id)
      .single();

    return {
      internalReference: internalRef,
      checkout: {
        provider: "razorpay" as const,
        key: razorpayPublicKeyId(),   // publishable — safe
        orderId: order.id,
        amountMinor: Number(link.amount_minor),
        currency: link.currency,
        name: merchant?.business_name ?? "Jatpat Pay Merchant",
        description: link.title,
        prefill: {
          name: data.customerName ?? undefined,
          email: data.customerEmail ?? undefined,
        },
      },
    };
  });

// ---------- Verify payment return (from browser) ----------

export const verifyPaymentReturn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      internalReference: z.string().trim().min(6).max(120),
      razorpay_order_id: z.string().trim().min(6).max(120),
      razorpay_payment_id: z.string().trim().min(6).max(120),
      razorpay_signature: z.string().trim().min(16).max(256),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { verifyRazorpayPaymentSignature } = await import("@/lib/razorpay.server");

    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("internal_reference", data.internalReference)
      .maybeSingle();
    if (error || !payment) throw new Error("Payment not found");
    if (payment.provider_order_id !== data.razorpay_order_id) {
      throw new Error("Order mismatch");
    }

    const ok = verifyRazorpayPaymentSignature({
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
    });

    if (!ok) {
      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          error_description: "signature_mismatch",
        })
        .eq("id", payment.id);
      throw new Error("Payment verification failed.");
    }

    // Mark provisionally successful — webhook will independently confirm.
    await supabaseAdmin
      .from("payments")
      .update({
        provider_payment_id: data.razorpay_payment_id,
        status: "successful",
        provider_verified: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return { ok: true };
  });

// ---------- Public payment status (for status page polling) ----------

export const getPublicPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ internalReference: z.string().trim().min(6).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select("internal_reference, status, amount_minor, currency, payment_method_type, is_test, paid_at, provider_verified, merchant_id, payment_link_id")
      .eq("internal_reference", data.internalReference)
      .maybeSingle();
    if (error || !payment) return null;

    const { data: merchant } = await supabaseAdmin
      .from("merchants")
      .select("business_name")
      .eq("id", payment.merchant_id)
      .single();

    let linkTitle: string | null = null;
    if (payment.payment_link_id) {
      const { data: link } = await supabaseAdmin
        .from("payment_links")
        .select("title, slug")
        .eq("id", payment.payment_link_id)
        .single();
      linkTitle = link?.title ?? null;
    }

    return {
      internal_reference: payment.internal_reference,
      status: payment.status,
      amount_minor: payment.amount_minor,
      currency: payment.currency,
      payment_method_type: payment.payment_method_type,
      is_test: payment.is_test,
      paid_at: payment.paid_at,
      provider_verified: payment.provider_verified,
      merchant_name: merchant?.business_name ?? "Jatpat Pay Merchant",
      link_title: linkTitle,
    };
  });
