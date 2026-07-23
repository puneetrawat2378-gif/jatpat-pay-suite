import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { setInternationalStatus } from "@/lib/settings.functions";
import { Button } from "@/components/ui/button";
import { Globe2, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/international")({
  component: InternationalPage,
});

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  not_requested: { label: "Not Requested", tone: "bg-muted text-muted-foreground" },
  activation_required: { label: "Activation Required", tone: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
  under_review: { label: "Under Review", tone: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" },
  enabled: { label: "Enabled", tone: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  restricted: { label: "Restricted", tone: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
  unavailable: { label: "Unavailable", tone: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
};

function InternationalPage() {
  const { data: ctx } = useMerchantContext();
  const qc = useQueryClient();
  const call = useServerFn(setInternationalStatus);
  const mutate = useMutation({
    mutationFn: (status: any) => call({ data: { status } }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["merchant", "context"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const status = ctx?.settings?.international_status ?? "not_requested";
  const provider = ctx?.settings?.active_provider ?? "razorpay";
  const currencies = (ctx?.currencies ?? []) as any[];
  const intlCurrencies = currencies.filter((c) => c.currency !== "INR");
  const enabledIntl = intlCurrencies.filter((c) => c.status === "enabled");

  const isEnabled = status === "enabled";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe2 className="h-6 w-6 text-cyan" /> International Payments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Accept payments in multiple currencies from customers worldwide.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground">Account Capability Status</div>
          <div className="mt-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${STATUS_LABELS[status]?.tone}`}>
              {STATUS_LABELS[status]?.label}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground">Payment Provider</div>
          <div className="mt-2 font-semibold capitalize">{provider}</div>
          <div className="text-xs text-muted-foreground mt-1">International availability depends on your provider account.</div>
        </div>
      </div>

      {!isEnabled && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">International Payments Require Provider Activation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                International payment availability depends on your connected payment provider account, business verification,
                supported currencies, business category, and applicable requirements.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  className="bg-gradient-brand"
                  onClick={() => mutate.mutate("under_review")}
                  disabled={mutate.isPending || status === "under_review"}
                >
                  {mutate.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Review Payment Provider Setup
                </Button>
                {status !== "activation_required" && (
                  <Button variant="outline" onClick={() => mutate.mutate("activation_required")} disabled={mutate.isPending}>
                    Mark as Activation Required
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Enabled Currencies</h3>
        {enabledIntl.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No international currencies enabled yet. Once your provider account supports them, enable them in{" "}
            <a href="/dashboard/settings/currencies" className="text-electric underline">Settings → Currencies</a>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {enabledIntl.map((c) => (
              <span key={c.currency} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="h-3 w-3" /> {c.currency}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Supported International Currencies (provider capability)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {intlCurrencies.map((c) => (
            <div key={c.currency} className="rounded-lg border border-border p-3">
              <div className="font-bold">{c.currency}</div>
              <div className="text-[10px] uppercase text-muted-foreground">{String(c.status).replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Currency availability is controlled by your provider account. Enabling a currency in the dashboard does not bypass provider approval.</p>
      </div>
    </div>
  );
}
