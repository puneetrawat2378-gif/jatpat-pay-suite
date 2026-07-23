import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMerchantAnalytics } from "@/lib/analytics.functions";
import { listPayments } from "@/lib/refunds.functions";
import { formatMinor } from "@/lib/currency";
import { useState } from "react";
import { TrendingUp, CheckCircle2, XCircle, Clock, RotateCcw, Globe2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const [dataset, setDataset] = useState<"test" | "live" | "all">("live");
  const fetchAnalytics = useServerFn(getMerchantAnalytics);
  const fetchPayments = useServerFn(listPayments);
  const { data: analytics } = useQuery({
    queryKey: ["analytics", dataset],
    queryFn: () => fetchAnalytics({ data: { dataset } }),
  });
  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: () => fetchPayments() });

  const stats = analytics?.totals;
  const recent = (payments ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Payments performance and recent activity</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border text-xs">
          {(["live", "test", "all"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDataset(d)}
              className={`px-3 py-1.5 rounded-md capitalize ${
                dataset === d ? "bg-electric text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d} data
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Kpi icon={TrendingUp} label="Volume" value={formatMinor(stats?.volume_minor ?? 0, "INR")} accent="from-electric to-cyan" />
        <Kpi icon={CheckCircle2} label="Successful" value={String(stats?.successful ?? 0)} accent="from-emerald-500 to-teal-400" />
        <Kpi icon={XCircle} label="Failed" value={String(stats?.failed ?? 0)} accent="from-rose-500 to-orange-400" />
        <Kpi icon={Clock} label="Pending" value={String(stats?.pending ?? 0)} accent="from-amber-500 to-yellow-400" />
        <Kpi icon={RotateCcw} label="Refunded" value={formatMinor(stats?.refunded_minor ?? 0, "INR")} accent="from-purple-500 to-pink-400" />
        <Kpi icon={Globe2} label="International" value={formatMinor(analytics?.international_volume_minor ?? 0, "USD")} accent="from-cyan-500 to-electric" />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-semibold">Recent transactions</div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Mode</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No payments yet — share a payment link to get started.</td></tr>
            )}
            {recent.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{p.internal_reference}</td>
                <td className="px-4 py-2">{formatMinor(p.amount_minor, p.currency)}</td>
                <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-2"><ModeBadge test={p.is_test} /></td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className={`inline-flex h-8 w-8 rounded-lg bg-gradient-to-br ${accent} items-center justify-center text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-lg font-bold tracking-tight">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    successful: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    partially_refunded: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    refunded: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    failed: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    processing: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    created: "bg-muted text-muted-foreground border-border",
    requires_action: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function ModeBadge({ test }: { test: boolean }) {
  return test ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-warning/20 text-warning border-warning/30">TEST</span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">LIVE</span>
  );
}
