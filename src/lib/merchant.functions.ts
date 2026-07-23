import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the current user's primary merchant + role + settings + currency map.
 * Used everywhere the dashboard needs to know "which merchant am I acting for".
 */
export const getMerchantContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1) memberships (we take the first — multi-workspace switcher can come later)
    const { data: memberships, error: memErr } = await supabase
      .from("merchant_members")
      .select("merchant_id, role")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (memErr) throw new Error(memErr.message);
    const member = memberships?.[0];
    if (!member) {
      // Signup trigger should have created one; return a safe null shape.
      return { merchant: null, roles: [] as string[], settings: null, currencies: [], profile: null };
    }

    const merchantId = member.merchant_id;
    const rolesForMerchant = (memberships ?? [])
      .filter((m) => m.merchant_id === merchantId)
      .map((m) => m.role);

    const [merchantRes, settingsRes, currenciesRes, profileRes] = await Promise.all([
      supabase.from("merchants").select("*").eq("id", merchantId).single(),
      supabase.from("merchant_settings").select("*").eq("merchant_id", merchantId).maybeSingle(),
      supabase.from("merchant_enabled_currencies").select("*").eq("merchant_id", merchantId).order("currency"),
      supabase.from("profiles").select("*").eq("id", userId).single(),
    ]);

    if (merchantRes.error) throw new Error(merchantRes.error.message);

    return {
      merchant: merchantRes.data,
      roles: rolesForMerchant,
      settings: settingsRes.data ?? null,
      currencies: currenciesRes.data ?? [],
      profile: profileRes.data ?? null,
    };
  });

/** List all team members of the caller's merchant. Any member can read. */
export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: ms, error } = await supabase
      .from("merchant_members")
      .select("merchant_id")
      .eq("user_id", userId)
      .limit(1);
    if (error) throw new Error(error.message);
    const merchantId = ms?.[0]?.merchant_id;
    if (!merchantId) return [];

    const { data, error: err2 } = await supabase
      .from("merchant_members")
      .select("id, user_id, role, created_at")
      .eq("merchant_id", merchantId)
      .order("created_at");
    if (err2) throw new Error(err2.message);
    return data ?? [];
  });
