import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMerchantAnalytics } from "@/lib/analytics.functions";
import { formatMinor } from "@/lib/currency";
import { useState } from "react";
import { TrendingUp, PieChart } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [dataset, setDataset] = useState<"test" | "live" | "all">("live");
  const call = useServerFn(getMerchantAnalytics);
  const { data: a } = useQuery({ queryKey: ["analytics_full", dataset], queryFn: () => call({ data: { dataset } }) });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-electric" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real payments performance. Test data is excluded from Live view by default.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border text-xs">
          {(["live", "test", "all"] as const).map((d) => (
            <button key={d} onClick={() => setDataset(d)}
              className={`px-3 py-1.5 rounded-md capitalize ${dataset === d ? "bg-electric text-white" : "text-muted-foreground"}`}>
              {d} data
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <Card label="Total Volume" value={formatMinor(a?.totals.volume_minor ?? 0, "INR")} />
        <Card label="Successful" value={String(a?.totals.successful ?? 0)} />
        <Card label="Failed" value={String(a?.totals.failed ?? 0)} />
        <Card label="Success Rate" value={((a?.success_rate ?? 0) * 100).toFixed(1) + "%"} />
        <Card label="Domestic (INR)" value={formatMinor(a?.domestic_volume_minor ?? 0, "INR")} />
        <Card label="International" value={"$" + ((a?.international_volume_minor ?? 0) / 100).toFixed(2)} />
        <Card label="Refunded" value={formatMinor(a?.totals.refunded_minor ?? 0, "INR")} />
        <Card label="Pending" value={String(a?.totals.pending ?? 0)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><PieChart className="h-4 w-4" /> Volume by currency</h2>
        <div className="space-y-2">
          {(a?.currencies ?? []).length === 0 && <p className="text-sm text-muted-foreground">No settled currency volume yet.</p>}
          {(a?.currencies ?? []).map((c: any) => (
            <div key={c.currency} className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="font-bold">{c.currency}</div>
              <div className="font-mono">{formatMinor(c.minor, c.currency)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
