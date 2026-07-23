import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublicPaymentLink } from "@/lib/paymentLinks.functions";
import { startPaymentForLink, verifyPaymentReturn } from "@/lib/payments.functions";
import { formatMinor } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Shield, Lock, Loader2, AlertCircle } from "lucide-react";

// Razorpay checkout script — loaded on demand.
declare global {
  interface Window { Razorpay?: any }
}

export const Route = createFileRoute("/pay/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Pay ${params.slug} — Jatpat Pay` }] }),
  component: PayPage,
});

function PayPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const getLink = useServerFn(getPublicPaymentLink);
  const startFn = useServerFn(startPaymentForLink);
  const verifyFn = useServerFn(verifyPaymentReturn);

  const { data: link, isLoading, error } = useQuery({
    queryKey: ["pay_link", slug],
    queryFn: () => getLink({ data: { slug } }),
  });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Preload Razorpay checkout SDK for a snappier click-to-open.
    if (typeof window === "undefined" || window.Razorpay) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  async function ensureRazorpay() {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Could not load payment library"));
      document.body.appendChild(s);
    });
  }

  async function payNow() {
    if (!link) return;
    setBusy(true);
    try {
      await ensureRazorpay();
      const { checkout, internalReference } = await startFn({
        data: { slug, customerEmail: email || null, customerName: name || null },
      });
      if (!window.Razorpay) throw new Error("Payment library failed to load.");
      if (!checkout.key) throw new Error("This merchant's payment provider is not configured yet.");

      const rzp = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amountMinor,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.orderId,
        prefill: { email: checkout.prefill?.email, name: checkout.prefill?.name },
        theme: { color: "#1e40af" },
        handler: async (resp: any) => {
          try {
            await verifyFn({
              data: {
                internalReference,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              },
            });
          } catch (e: any) {
            toast.error(e?.message ?? "Verification failed");
          } finally {
            navigate({ to: "/pay/$slug/status/$ref", params: { slug, ref: internalReference } });
          }
        },
        modal: {
          ondismiss: () => {
            navigate({ to: "/pay/$slug/status/$ref", params: { slug, ref: internalReference } });
          },
        },
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start payment");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <Shell><Loader2 className="h-8 w-8 animate-spin text-electric mx-auto" /></Shell>;
  if (error || !link) return <Shell><ErrorMsg msg="Payment link not found" /></Shell>;
  if (link.status !== "active") return <Shell><ErrorMsg msg={link.status === "expired" ? "This payment link has expired." : "This payment link is no longer active."} /></Shell>;

  return (
    <Shell>
      <div className="p-6 md:p-8">
        <div className="text-center mb-6">
          {link.merchant?.brand_logo_url ? (
            <img src={link.merchant.brand_logo_url} alt="" className="h-12 mx-auto object-contain" />
          ) : null}
          <h1 className="mt-3 text-xl font-bold">{link.merchant?.business_name ?? "Merchant"}</h1>
          <div className="text-xs text-muted-foreground mt-1">powered by <span className="font-semibold">Jatpat Pay</span></div>
        </div>

        <div className="rounded-2xl bg-muted/30 border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold">{formatMinor(link.amount_minor, link.currency)}</span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="text-sm font-semibold">{link.title}</div>
            {link.description && <div className="text-xs text-muted-foreground mt-1">{link.description}</div>}
          </div>
        </div>

        {link.is_test && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>This is a <strong>test payment</strong>. No real money will be charged.</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div>
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>

        <Button
          onClick={payNow}
          disabled={busy}
          className="mt-6 w-full h-12 bg-gradient-brand text-white font-bold text-base"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4 mr-2" /> Pay Securely {formatMinor(link.amount_minor, link.currency)}</>}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Shield className="h-3 w-3" /> Payments are processed by the connected payment provider. Jatpat Pay never sees your card details.
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-center"><Logo /></div>
        <div className="bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
          {children}
        </div>
        <div className="mt-4 text-center text-[11px] text-muted-foreground">
          Secured by Jatpat Pay · Payment processing via your merchant's provider
        </div>
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="p-8 text-center">
      <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
      <h2 className="mt-3 font-bold text-lg">{msg}</h2>
      <p className="text-sm text-muted-foreground mt-2">Please contact the merchant for a new payment link.</p>
    </div>
  );
}
