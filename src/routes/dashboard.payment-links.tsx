import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPaymentLink, listPaymentLinks } from "@/lib/paymentLinks.functions";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { formatMinor, SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ExternalLink, Plus, Link2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/payment-links")({
  component: PaymentLinksPage,
});

function PaymentLinksPage() {
  const qc = useQueryClient();
  const { data: ctx } = useMerchantContext();
  const listFn = useServerFn(listPaymentLinks);
  const createFn = useServerFn(createPaymentLink);
  const { data: links } = useQuery({ queryKey: ["payment_links"], queryFn: () => listFn() });

  const enabledCurrencies = (ctx?.currencies ?? []).filter((c: any) => c.status === "enabled").map((c: any) => c.currency);

  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "INR",
    expiresAt: "",
    customerName: "",
    customerEmail: "",
  });
  const [showForm, setShowForm] = useState(false);

  const create = useMutation({
    mutationFn: (data: any) => createFn({ data }),
    onSuccess: () => {
      toast.success("Payment link created");
      qc.invalidateQueries({ queryKey: ["payment_links"] });
      setShowForm(false);
      setForm({ ...form, title: "", amount: "", description: "" });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not create link"),
  });

  function submit() {
    if (!form.title || !form.amount) return toast.error("Title and amount are required");
    create.mutate({
      title: form.title,
      description: form.description || null,
      amount: form.amount,
      currency: form.currency,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Links</h1>
          <p className="text-sm text-muted-foreground mt-1">Shareable Jatpat Pay checkout URLs — send to any customer, get paid instantly.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" /> Create Payment Link
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Payment title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Website Design Fee" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount *</Label>
                <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="4999.00" inputMode="decimal" />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {SUPPORTED_CURRENCIES.map((c) => {
                    const enabled = enabledCurrencies.includes(c);
                    return (
                      <option key={c} value={c} disabled={!enabled}>
                        {c} {enabled ? "" : "(activation required)"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this payment for?" />
            </div>
            <div>
              <Label>Expiry (optional)</Label>
              <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={create.isPending} className="bg-gradient-brand">
              {create.isPending ? "Creating..." : "Create link"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {(links ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Link2 className="h-10 w-10 text-electric mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">No payment links yet. Create your first one above.</p>
          </div>
        )}
        {(links ?? []).map((l: any) => {
          const url = typeof window !== "undefined" ? `${window.location.origin}/pay/${l.slug}` : `/pay/${l.slug}`;
          return (
            <div key={l.id} className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{l.title}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{url}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatMinor(l.amount_minor, l.currency)}</div>
                <div className="text-[10px] uppercase text-muted-foreground">{l.status} · {l.is_test ? "TEST" : "LIVE"}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(url); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <a href={url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" /> Open</Button>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
