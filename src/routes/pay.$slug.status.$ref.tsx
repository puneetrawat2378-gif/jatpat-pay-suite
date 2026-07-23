import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublicPaymentStatus } from "@/lib/payments.functions";
import { formatMinor } from "@/lib/currency";
import { Logo } from "@/components/brand/Logo";
import { CheckCircle2, XCircle, Loader2, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pay/$slug/status/$ref")({
  head: () => ({ meta: [{ title: "Payment status — Jatpat Pay" }] }),
  component: StatusPage,
});

function StatusPage() {
  const { slug, ref } = Route.useParams();
  const getStatus = useServerFn(getPublicPaymentStatus);
  const { data: p } = useQuery({
    queryKey: ["pay_status", ref],
    queryFn: () => getStatus({ data: { internalReference: ref } }),
    // Poll while non-terminal
    refetchInterval: (q) => {
      const d = q.state.data as any;
      if (!d) return 2000;
      if (["created", "pending", "processing", "requires_action"].includes(d.status)) return 3000;
      return false;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-center"><Logo /></div>
        <div className="bg-white rounded-3xl shadow-2xl border border-border p-8 text-center">
          {!p && <Loader2 className="h-10 w-10 animate-spin text-electric mx-auto" />}

          {p && p.status === "successful" && (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h1 className="mt-4 text-2xl font-bold">Payment Successful</h1>
              <p className="text-sm text-muted-foreground mt-1">Your payment has been successfully confirmed.</p>
              <ReceiptBlock p={p} />
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button className="bg-gradient-brand flex-1" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" /> Download Receipt
                </Button>
                <Link to="/pay/$slug" params={{ slug }} className="flex-1">
                  <Button variant="outline" className="w-full">Return to Merchant</Button>
                </Link>
              </div>
            </>
          )}

          {p && (p.status === "pending" || p.status === "processing" || p.status === "created" || p.status === "requires_action") && (
            <>
              <Loader2 className="h-14 w-14 text-electric mx-auto animate-spin" />
              <h1 className="mt-4 text-2xl font-bold">Payment Processing</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {p.provider_verified ? "Payment confirmation is taking longer than expected." : "We are confirming your payment."}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">This page refreshes automatically.</div>
            </>
          )}

          {p && (p.status === "failed" || p.status === "cancelled") && (
            <>
              <XCircle className="h-14 w-14 text-rose-500 mx-auto" />
              <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
              <p className="text-sm text-muted-foreground mt-1">Your payment could not be completed.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Link to="/pay/$slug" params={{ slug }} className="flex-1">
                  <Button className="bg-gradient-brand w-full">Try Again</Button>
                </Link>
                <Link to="/pay/$slug" params={{ slug }} className="flex-1">
                  <Button variant="outline" className="w-full">Choose Another Method</Button>
                </Link>
              </div>
            </>
          )}

          {p && (p.status === "refunded" || p.status === "partially_refunded") && (
            <>
              <Clock className="h-14 w-14 text-purple-500 mx-auto" />
              <h1 className="mt-4 text-2xl font-bold">Payment Refunded</h1>
              <ReceiptBlock p={p} />
            </>
          )}
        </div>
        <div className="mt-4 text-center text-[11px] text-muted-foreground">
          Payment processing is provided through the connected payment provider.
        </div>
      </div>
    </div>
  );
}

function ReceiptBlock({ p }: { p: any }) {
  return (
    <div className="mt-6 rounded-2xl bg-muted/30 border border-border p-5 text-left text-sm space-y-2">
      <RRow k="Payment Reference" v={<span className="font-mono text-xs">{p.internal_reference}</span>} />
      <RRow k="Amount" v={<span className="font-bold">{formatMinor(p.amount_minor, p.currency)}</span>} />
      <RRow k="Currency" v={p.currency} />
      {p.payment_method_type && <RRow k="Payment Method" v={p.payment_method_type} />}
      {p.paid_at && <RRow k="Payment Date" v={new Date(p.paid_at).toLocaleString()} />}
      <RRow k="Merchant" v={p.merchant_name} />
      {p.is_test && <RRow k="Mode" v={<span className="text-amber-600 font-semibold">TEST</span>} />}
    </div>
  );
}
function RRow({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}
