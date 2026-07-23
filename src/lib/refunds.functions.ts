import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function callerMerchantId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("merchant_members")
    .select("merchant_id")
    .eq("user_id", userId)
    .limit(1);
  return data?.[0]?.merchant_id ?? null;
}

async function hasRole(supabase: any, merchantId: string, allowed: string[]): Promise<boolean> {
  const { data } = await supabase
    .from("merchant_members")
    .select("role")
    .eq("merchant_id", merchantId);
  return (data ?? []).some((r: any) => allowed.includes(r.role));
}

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) return [];
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listWebhookEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) return [];
    const { data, error } = await supabase
      .from("webhook_events")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("received_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listRefunds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) return [];
    const { data, error } = await supabase
      .from("refunds")
      .select("*, payments(internal_reference, amount_minor, currency)")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Refund request ----------

export const requestRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      paymentId: z.string().uuid(),
      amountMinor: z.number().int().positive().optional().nullable(), // omit => full refund
      reason: z.string().trim().max(500).optional().nullable(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) throw new Error("Not a merchant member.");
    if (!(await hasRole(supabase, merchantId, ["owner", "admin", "finance"]))) {
      throw new Error("You do not have permission to issue refunds.");
    }

    // Load payment via RLS (already scoped to merchant)
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", data.paymentId)
      .single();
    if (error || !payment) throw new Error("Payment not found");
    if (payment.status !== "successful" && payment.status !== "partially_refunded") {
      throw new Error("This payment is not eligible for refund.");
    }
    if (!payment.provider_payment_id) throw new Error("Missing provider payment reference.");

    // Existing refund total
    const { data: prior } = await supabase
      .from("refunds")
      .select("amount_minor, status")
      .eq("payment_id", data.paymentId);
    const refundedSoFar = (prior ?? [])
      .filter((r: any) => r.status === "successful" || r.status === "processing")
      .reduce((sum: number, r: any) => sum + Number(r.amount_minor), 0);

    const amount = data.amountMinor ?? Number(payment.amount_minor) - refundedSoFar;
    if (amount <= 0) throw new Error("Nothing left to refund.");
    if (refundedSoFar + amount > Number(payment.amount_minor)) {
      throw new Error("Refund amount exceeds original payment.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createRazorpayRefund } = await import("@/lib/razorpay.server");

    // Insert local refund row first so we have a stable idempotency key.
    const { data: refundRow, error: rErr } = await supabaseAdmin
      .from("refunds")
      .insert({
        merchant_id: merchantId,
        payment_id: payment.id,
        provider: payment.provider,
        amount_minor: amount,
        currency: payment.currency,
        status: "created",
        reason: data.reason ?? null,
        requested_by: userId,
      })
      .select()
      .single();
    if (rErr || !refundRow) throw new Error("Could not create refund record.");

    try {
      const rzp = await createRazorpayRefund({
        paymentId: payment.provider_payment_id,
        amountMinor: amount,
        idempotencyKey: refundRow.id,
      });
      await supabaseAdmin
        .from("refunds")
        .update({
          provider_refund_id: rzp.id,
          status: rzp.status === "processed" ? "successful" : "processing",
        })
        .eq("id", refundRow.id);

      const newPaymentStatus =
        refundedSoFar + amount >= Number(payment.amount_minor) ? "refunded" : "partially_refunded";
      await supabaseAdmin
        .from("payments")
        .update({ status: newPaymentStatus })
        .eq("id", payment.id);

      await supabaseAdmin.from("audit_logs").insert({
        actor_id: userId,
        merchant_id: merchantId,
        action: "refund.requested",
        resource_type: "payment",
        resource_id: payment.id,
        safe_metadata: { amount_minor: amount, provider_refund_id: rzp.id },
      });

      return { ok: true, refundId: refundRow.id };
    } catch (e) {
      await supabaseAdmin
        .from("refunds")
        .update({ status: "failed" })
        .eq("id", refundRow.id);
      throw e;
    }
  });
