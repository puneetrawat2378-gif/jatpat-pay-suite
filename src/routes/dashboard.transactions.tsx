import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPayments } from "@/lib/refunds.functions";
import { formatMinor } from "@/lib/currency";
import { StatusBadge, ModeBadge } from "@/routes/dashboard.index";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/transactions")({
  component: TransactionsPage,
});

const FILTERS = ["all", "successful", "pending", "processing", "failed", "refunded", "test", "live", "inr", "international"] as const;

function TransactionsPage() {
  const fetchFn = useServerFn(listPayments);
  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: () => fetchFn() });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<any | null>(null);

  const rows = useMemo(() => {
    const list = payments ?? [];
    switch (filter) {
      case "successful": return list.filter((p: any) => p.status === "successful" || p.status === "partially_refunded");
      case "pending": return list.filter((p: any) => ["pending", "created", "requires_action"].includes(p.status));
      case "processing": return list.filter((p: any) => p.status === "processing");
      case "failed": return list.filter((p: any) => p.status === "failed" || p.status === "cancelled");
      case "refunded": return list.filter((p: any) => p.status === "refunded" || p.status === "partially_refunded");
      case "test": return list.filter((p: any) => p.is_test);
      case "live": return list.filter((p: any) => !p.is_test);
      case "inr": return list.filter((p: any) => p.currency === "INR");
      case "international": return list.filter((p: any) => p.currency !== "INR");
      default: return list;
    }
  }, [payments, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Every payment attempted on Jatpat Pay for this merchant.</p>
      </div>

      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-card border border-border">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs capitalize ${filter === f ? "bg-electric text-white" : "text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Verified</th>
              <th className="px-4 py-2 text-left">Mode</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No transactions match this filter.</td></tr>
            )}
            {rows.map((p: any) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(p)}>
                <td className="px-4 py-2 font-mono text-xs">{p.internal_reference}</td>
                <td className="px-4 py-2">{formatMinor(p.amount_minor, p.currency)}</td>
                <td className="px-4 py-2 text-muted-foreground">{p.payment_method_type ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-2 text-xs">{p.provider_verified ? "✓" : "—"}</td>
                <td className="px-4 py-2"><ModeBadge test={p.is_test} /></td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md bg-card border-l border-border p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Payment detail</h3>
            <dl className="space-y-2 text-sm">
              <Row k="Internal ref" v={<span className="font-mono text-xs">{selected.internal_reference}</span>} />
              <Row k="Provider" v={selected.provider} />
              <Row k="Provider payment id" v={<span className="font-mono text-xs">{selected.provider_payment_id ?? "—"}</span>} />
              <Row k="Amount" v={formatMinor(selected.amount_minor, selected.currency)} />
              <Row k="Status" v={<StatusBadge status={selected.status} />} />
              <Row k="Verified" v={selected.provider_verified ? "Yes" : "No"} />
              <Row k="Method" v={selected.payment_method_type ?? "—"} />
              <Row k="Created" v={new Date(selected.created_at).toLocaleString()} />
              <Row k="Paid at" v={selected.paid_at ? new Date(selected.paid_at).toLocaleString() : "—"} />
              <Row k="Mode" v={selected.is_test ? "Test" : "Live"} />
              {selected.error_description && <Row k="Error" v={<span className="text-rose-400">{selected.error_description}</span>} />}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b border-border/40 pb-1"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
}
