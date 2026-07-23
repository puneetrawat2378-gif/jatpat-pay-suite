import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { setCurrencyStatus } from "@/lib/settings.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings/currencies")({
  component: CurrenciesPage,
});

function CurrenciesPage() {
  const { data: ctx } = useMerchantContext();
  const qc = useQueryClient();
  const call = useServerFn(setCurrencyStatus);
  const mutate = useMutation({
    mutationFn: (v: any) => call({ data: v }),
    onSuccess: () => { toast.success("Currency updated"); qc.invalidateQueries({ queryKey: ["merchant", "context"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const currencies = (ctx?.currencies ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Coins className="h-6 w-6 text-electric" /> Currencies
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Enable currencies your provider account can actually settle. Backend re-validates before every payment.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left">Currency</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((c) => (
              <tr key={c.currency} className="border-t border-border">
                <td className="px-4 py-3 font-bold">{c.currency}</td>
                <td className="px-4 py-3 text-xs uppercase">{String(c.status).replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {c.status !== "enabled" && (
                    <Button size="sm" variant="outline" disabled={mutate.isPending}
                      onClick={() => mutate.mutate({ currency: c.currency, status: "enabled" })}>Enable</Button>
                  )}
                  {c.status === "enabled" && (
                    <Button size="sm" variant="ghost" disabled={mutate.isPending}
                      onClick={() => mutate.mutate({ currency: c.currency, status: "disabled" })}>Disable</Button>
                  )}
                  {c.currency !== "INR" && c.status !== "activation_required" && (
                    <Button size="sm" variant="ghost" disabled={mutate.isPending}
                      onClick={() => mutate.mutate({ currency: c.currency, status: "activation_required" })}>Activation Required</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Note:</strong> Enabling a currency here does not bypass your payment provider's account restrictions. Payments in currencies your provider account cannot process will be rejected at the provider.
      </p>
    </div>
  );
}
