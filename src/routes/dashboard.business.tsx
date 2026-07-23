import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { updateMerchant } from "@/lib/settings.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/business")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: ctx } = useMerchantContext();
  const qc = useQueryClient();
  const call = useServerFn(updateMerchant);
  const mutate = useMutation({
    mutationFn: (v: any) => call({ data: v }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["merchant", "context"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const m = ctx?.merchant;
  const [form, setForm] = useState({ business_name: "", business_email: "", business_country: "IN", brand_logo_url: "" });
  useEffect(() => {
    if (m) setForm({
      business_name: m.business_name ?? "",
      business_email: m.business_email ?? "",
      business_country: m.business_country ?? "IN",
      brand_logo_url: m.brand_logo_url ?? "",
    });
  }, [m]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">These details appear on your Jatpat Pay checkout page and receipts.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <Label>Business name</Label>
          <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Business email</Label>
            <Input value={form.business_email} onChange={(e) => setForm({ ...form, business_email: e.target.value })} />
          </div>
          <div>
            <Label>Country (ISO-2)</Label>
            <Input maxLength={2} value={form.business_country} onChange={(e) => setForm({ ...form, business_country: e.target.value.toUpperCase() })} />
          </div>
        </div>
        <div>
          <Label>Brand logo URL</Label>
          <Input value={form.brand_logo_url} onChange={(e) => setForm({ ...form, brand_logo_url: e.target.value })} placeholder="https://…/logo.png" />
        </div>
        <Button className="bg-gradient-brand" disabled={mutate.isPending} onClick={() => mutate.mutate(form)}>
          {mutate.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
