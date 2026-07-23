import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProviderCapabilitiesSafe } from "@/lib/settings.functions";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings/provider")({
  component: ProviderSettingsPage,
});

function ProviderSettingsPage() {
  const { data: ctx } = useMerchantContext();
  const fetchCaps = useServerFn(getProviderCapabilitiesSafe);
  const { data: caps } = useQuery({ queryKey: ["provider_caps"], queryFn: () => fetchCaps() });

  const settings = ctx?.settings;
  const active = settings?.active_provider ?? "razorpay";
  const activeCap = (caps ?? []).find((c: any) => c.id === active);
  const health =
    !activeCap?.configured ? { label: "Disconnected", tone: "text-rose-400" }
    : !activeCap?.webhookConfigured ? { label: "Action Required", tone: "text-amber-400" }
    : { label: "Healthy", tone: "text-emerald-400" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Provider</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage the payment processor that handles your money movement.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Provider</div><div className="mt-1 font-bold capitalize">{active}</div></div>
        <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Mode</div><div className="mt-1 font-bold uppercase">{settings?.payment_mode ?? "test"}</div></div>
        <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Health</div><div className={`mt-1 font-bold ${health.tone}`}>{health.label}</div></div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Available providers</h2>
        <div className="space-y-3">
          {(caps ?? []).map((cap: any) => (
            <div key={cap.id} className="rounded-xl border border-border p-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{cap.displayName}</span>
                  {cap.id === active && <span className="text-[10px] uppercase bg-electric/20 text-electric border border-electric/30 px-2 py-0.5 rounded-full">Active</span>}
                  <StatusChip cap={cap} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
                  <div>Key ID: <span className="font-mono">{cap.publicKeyId ? cap.publicKeyId : "—"}</span></div>
                  <div>Webhook: {cap.webhookConfigured ? "Configured" : "Not configured"}</div>
                  <div>Domestic (INR): {cap.configured ? "Ready" : "Not configured"}</div>
                  <div>International: Depends on provider account</div>
                </div>
                {cap.id === "razorpay" && !cap.configured && (
                  <div className="mt-3 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-200">
                    Add <span className="font-mono">RAZORPAY_KEY_ID</span> and <span className="font-mono">RAZORPAY_KEY_SECRET</span> to Jatpat Pay backend secrets to enable checkout, and <span className="font-mono">RAZORPAY_WEBHOOK_SECRET</span> to receive verified events.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" /> Provider secrets are stored only in the Jatpat Pay backend. They are never sent to the browser.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Webhook health</h2>
        <div className="text-sm">
          Last verified webhook:{" "}
          <span className="font-mono">{settings?.last_webhook_at ? new Date(settings.last_webhook_at).toLocaleString() : "Never"}</span>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ cap }: { cap: any }) {
  const map: Record<string, [string, any]> = {
    configured: ["Configured", CheckCircle2],
    not_configured: ["Not Configured", XCircle],
    future_integration: ["Future Integration", AlertTriangle],
    optional_future: ["Optional Future Provider", AlertTriangle],
  };
  const [label, Icon] = map[cap.status] ?? ["Unknown", XCircle];
  const tone =
    cap.status === "configured" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : cap.status === "not_configured" ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
    : "text-muted-foreground border-border bg-muted/30";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase px-2 py-0.5 rounded-full border ${tone}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}
