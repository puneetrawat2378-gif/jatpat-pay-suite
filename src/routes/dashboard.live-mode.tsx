import { createFileRoute } from "@tanstack/react-router";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProviderCapabilitiesSafe } from "@/lib/settings.functions";
import { Rocket, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/dashboard/live-mode")({
  component: LiveModePage,
});

function LiveModePage() {
  const { data: ctx } = useMerchantContext();
  const fetchCaps = useServerFn(getProviderCapabilitiesSafe);
  const { data: caps } = useQuery({ queryKey: ["provider_caps"], queryFn: () => fetchCaps() });
  const active = (caps ?? []).find((c: any) => c.id === (ctx?.settings?.active_provider ?? "razorpay"));

  const enabledCurrencies = (ctx?.currencies ?? []).filter((c: any) => c.status === "enabled");

  const items: { label: string; done: boolean; hint?: string }[] = [
    { label: "Business Information Complete", done: Boolean(ctx?.merchant?.business_name && ctx?.merchant?.business_email) },
    { label: "Provider Account Connected", done: Boolean(active?.configured), hint: "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend secrets." },
    { label: "Webhook Secret Configured", done: Boolean(active?.webhookConfigured), hint: "Add RAZORPAY_WEBHOOK_SECRET." },
    { label: "Webhook Verification Tested", done: Boolean(ctx?.settings?.last_webhook_at) },
    { label: "Domestic Payment Capability Checked", done: Boolean(active?.configured) },
    { label: "International Payment Capability Reviewed", done: ctx?.settings?.international_status !== "not_requested" },
    { label: "Enabled Currencies Configured", done: enabledCurrencies.length > 0 },
    { label: "Merchant Verification Status Reviewed", done: false, hint: "Review your Razorpay merchant KYC completion." },
    { label: "Refund Policy Published", done: false },
    { label: "Privacy Policy Published", done: false },
    { label: "Terms Published", done: false },
    { label: "Merchant Agreement Published", done: false },
    { label: "Security Configuration Reviewed", done: false },
  ];
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-electric" /> Live Mode Readiness
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Technical readiness checklist. Passing this checklist does not constitute regulatory approval.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Completion</div>
          <div className="text-sm font-mono">{doneCount} / {items.length}</div>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-brand transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {items.map((it) => (
          <div key={it.label} className="p-4 flex items-start gap-3">
            {it.done ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
            <div className="flex-1">
              <div className={`text-sm font-medium ${it.done ? "" : "text-muted-foreground"}`}>{it.label}</div>
              {it.hint && !it.done && <div className="text-xs text-muted-foreground mt-1">{it.hint}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-100">
        Requesting Live Mode does not automatically activate real payments. Your provider account must be verified and live credentials must be configured on the Jatpat Pay backend. After all items are complete, ask your account owner to switch to Live using the toggle in the sidebar.
      </div>
    </div>
  );
}
