import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listRefunds, listPayments, requestRefund } from "@/lib/refunds.functions";
import { formatMinor } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/dashboard/refunds")({
  component: RefundsPage,
});

function RefundsPage() {
  const qc = useQueryClient();
  const fetchRefunds = useServerFn(listRefunds);
  const fetchPayments = useServerFn(listPayments);
  const refundFn = useServerFn(requestRefund);
  const { data: refunds } = useQuery({ queryKey: ["refunds"], queryFn: () => fetchRefunds() });
  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: () => fetchPayments() });

  const refundable = (payments ?? []).filter((p: any) => p.status === "successful" || p.status === "partially_refunded");
  const [selected, setSelected] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const submit = useMutation({
    mutationFn: (v: any) => refundFn({ data: v }),
    onSuccess: () => {
      toast.success("Refund submitted");
      setSelected(null); setAmount(""); setReason("");
      qc.invalidateQueries({ queryKey: ["refunds"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Refund failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Issue partial or full refunds against successful payments. Refunds process through your connected provider.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-semibold mb-2">Refundable payments</h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {refundable.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No refundable payments.</div>}
            {refundable.map((p: any) => (
              <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs truncate">{p.internal_reference}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold">{formatMinor(p.amount_minor, p.currency)}</div>
                <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                  <RefreshCcw className="h-3 w-3 mr-1" /> Refund
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Refund history</h2>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {(refunds ?? []).length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No refunds yet.</div>}
            {(refunds ?? []).map((r: any) => (
              <div key={r.id} className="p-3 flex justify-between text-sm">
                <div>
                  <div className="font-mono text-xs">{r.provider_refund_id ?? r.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMinor(r.amount_minor, r.currency)}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Issue refund</h3>
            <div className="text-sm text-muted-foreground">
              Payment: <span className="font-mono">{selected.internal_reference}</span><br />
              Amount: <span className="font-semibold text-foreground">{formatMinor(selected.amount_minor, selected.currency)}</span>
            </div>
            <div>
              <Label>Refund amount (leave blank for full refund)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(Number(selected.amount_minor) / 100)} />
              <p className="text-[11px] text-muted-foreground mt-1">Enter in {selected.currency} major units (e.g. 100.00). Cannot exceed the original amount.</p>
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                disabled={submit.isPending}
                className="bg-gradient-brand"
                onClick={() => {
                  const parsedAmount = amount ? Math.round(Number(amount) * 100) : undefined;
                  submit.mutate({ paymentId: selected.id, amountMinor: parsedAmount, reason: reason || null });
                }}
              >
                {submit.isPending ? "Processing..." : "Confirm refund"}
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
