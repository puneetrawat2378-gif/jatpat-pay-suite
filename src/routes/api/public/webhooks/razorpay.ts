import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

/**
 * Razorpay webhook receiver.
 * Public path (bypasses Lovable auth). Signature is verified against the raw
 * body using RAZORPAY_WEBHOOK_SECRET before ANY database write.
 *
 * Idempotency: `webhook_events (provider, provider_event_id)` UNIQUE constraint
 * plus a payload hash prevent duplicate processing.
 *
 * Docs to verify at implementation time: https://razorpay.com/docs/webhooks/
 */
export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        // Verify BEFORE anything else.
        const { verifyRazorpayWebhookSignature } = await import("@/lib/razorpay.server");
        if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
          // Do not leak details.
          return new Response("Invalid signature", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const eventType: string = event?.event ?? "unknown";
        // Razorpay's official event id: prefer top-level `id`, fall back to a hash.
        const providerEventId: string =
          event?.id ??
          event?.payload?.payment?.entity?.id ??
          createHash("sha256").update(rawBody).digest("hex");

        const payloadHash = createHash("sha256").update(rawBody).digest("hex");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotent insert. If a row exists we ACK 200 and skip work.
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("webhook_events")
          .insert({
            provider: "razorpay",
            provider_event_id: providerEventId,
            event_type: eventType,
            payload_hash: payloadHash,
            processing_status: "processing",
          })
          .select()
          .single();

        if (insertErr) {
          // Unique constraint violation = duplicate delivery. That's success.
          if ((insertErr as any).code === "23505") {
            return new Response("Duplicate event ignored", { status: 200 });
          }
          console.error("webhook.insert failed", insertErr.message);
          return new Response("Ingest error", { status: 500 });
        }

        try {
          await processRazorpayEvent(event, supabaseAdmin, inserted.id);
          await supabaseAdmin
            .from("webhook_events")
            .update({ processing_status: "processed", processed_at: new Date().toISOString() })
            .eq("id", inserted.id);
        } catch (e: any) {
          await supabaseAdmin
            .from("webhook_events")
            .update({
              processing_status: "failed",
              error_message_safe: String(e?.message ?? "processing_error").slice(0, 300),
              processed_at: new Date().toISOString(),
            })
            .eq("id", inserted.id);
          console.error("webhook.process failed", e);
          // 200 anyway — signature was valid; failing keeps Razorpay retrying and
          // will duplicate our processing_status=failed rows. Return 500 to signal
          // retry desired.
          return new Response("Processing error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function processRazorpayEvent(event: any, supabaseAdmin: any, webhookRowId: string) {
  const eventType: string = event?.event ?? "";
  const paymentEntity = event?.payload?.payment?.entity;
  const refundEntity = event?.payload?.refund?.entity;

  // Try to resolve merchant via payment link stored on our order.
  let merchantId: string | null = null;

  if (paymentEntity) {
    const orderId: string | undefined = paymentEntity.order_id;
    const paymentId: string = paymentEntity.id;

    // Find our payment record by provider_order_id (created before checkout).
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, merchant_id, amount_minor, currency, status")
      .eq("provider", "razorpay")
      .eq("provider_order_id", orderId)
      .maybeSingle();

    if (payment) {
      merchantId = payment.merchant_id;

      const update: Record<string, any> = {
        provider_payment_id: paymentId,
        payment_method_type: paymentEntity.method ?? null,
        provider_verified: true,
      };

      if (eventType === "payment.captured" || paymentEntity.status === "captured") {
        update.status = "successful";
        update.paid_at = new Date().toISOString();
      } else if (eventType === "payment.failed" || paymentEntity.status === "failed") {
        update.status = "failed";
        update.error_code = paymentEntity.error_code ?? null;
        update.error_description = paymentEntity.error_description ?? null;
      } else if (eventType === "payment.authorized" || paymentEntity.status === "authorized") {
        update.status = "processing";
      }

      await supabaseAdmin.from("payments").update(update).eq("id", payment.id);
    }
  }

  if (refundEntity) {
    const refundId: string = refundEntity.id;
    const { data: refund } = await supabaseAdmin
      .from("refunds")
      .select("id, merchant_id, payment_id")
      .eq("provider", "razorpay")
      .eq("provider_refund_id", refundId)
      .maybeSingle();
    if (refund) {
      merchantId = merchantId ?? refund.merchant_id;
      const newStatus =
        eventType.endsWith(".processed") || refundEntity.status === "processed"
          ? "successful"
          : eventType.endsWith(".failed")
            ? "failed"
            : "processing";
      await supabaseAdmin.from("refunds").update({ status: newStatus }).eq("id", refund.id);
    }
  }

  // Attach merchant to the webhook row + settings ping.
  if (merchantId) {
    await supabaseAdmin
      .from("webhook_events")
      .update({ merchant_id: merchantId })
      .eq("id", webhookRowId);
    await supabaseAdmin
      .from("merchant_settings")
      .update({ last_webhook_at: new Date().toISOString(), webhook_configured: true })
      .eq("merchant_id", merchantId);
  }
}
