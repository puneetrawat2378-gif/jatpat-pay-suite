import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function callerMerchantId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("merchant_members")
    .select("merchant_id")
    .eq("user_id", userId)
    .limit(1);
  return data?.[0]?.merchant_id ?? null;
}

export const getMerchantAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      dataset: z.enum(["test", "live", "all"]).default("live"),
    }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const merchantId = await callerMerchantId(supabase, userId);
    if (!merchantId) {
      return {
        totals: { volume_minor: 0, successful: 0, failed: 0, pending: 0, refunded_minor: 0 },
        currencies: [],
        international_volume_minor: 0,
        domestic_volume_minor: 0,
        success_rate: 0,
      };
    }

    let query = supabase
      .from("payments")
      .select("status, amount_minor, currency, is_test")
      .eq("merchant_id", merchantId);
    if (data.dataset === "test") query = query.eq("is_test", true);
    else if (data.dataset === "live") query = query.eq("is_test", false);

    const { data: rows, error } = await query.limit(10000);
    if (error) throw new Error(error.message);

    const totals = { volume_minor: 0, successful: 0, failed: 0, pending: 0, refunded_minor: 0 };
    const byCurrency = new Map<string, number>();
    let intlVolume = 0;
    let domVolume = 0;

    for (const r of rows ?? []) {
      const amt = Number(r.amount_minor);
      if (r.status === "successful" || r.status === "partially_refunded") {
        totals.volume_minor += amt;
        totals.successful++;
        byCurrency.set(r.currency, (byCurrency.get(r.currency) ?? 0) + amt);
        if (r.currency === "INR") domVolume += amt;
        else intlVolume += amt;
      } else if (r.status === "refunded") {
        totals.refunded_minor += amt;
      } else if (r.status === "failed" || r.status === "cancelled") {
        totals.failed++;
      } else if (["created", "pending", "processing", "requires_action"].includes(r.status)) {
        totals.pending++;
      }
    }

    const attempted = totals.successful + totals.failed;
    return {
      totals,
      currencies: Array.from(byCurrency.entries()).map(([currency, minor]) => ({ currency, minor })),
      international_volume_minor: intlVolume,
      domestic_volume_minor: domVolume,
      success_rate: attempted ? totals.successful / attempted : 0,
    };
  });
