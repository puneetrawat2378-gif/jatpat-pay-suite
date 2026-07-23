import {
  Smartphone,
  CreditCard,
  Landmark,
  Link2,
  QrCode,
  Wallet,
  Repeat,
  Globe2,
  Building2,
  CircleDollarSign,
} from "lucide-react";

const methods = [
  { icon: Smartphone, label: "UPI", desc: "Instant bank-to-bank payments" },
  { icon: CreditCard, label: "Credit Cards", desc: "Visa, Mastercard, Amex, RuPay" },
  { icon: CircleDollarSign, label: "Debit Cards", desc: "All major debit networks" },
  { icon: Landmark, label: "Net Banking", desc: "70+ Indian banks supported" },
  { icon: Link2, label: "Payment Links", desc: "Share links to collect payment" },
  { icon: QrCode, label: "QR Payments", desc: "Static & dynamic QR codes" },
  { icon: Wallet, label: "Wallets", desc: "Popular digital wallets" },
  { icon: Repeat, label: "Subscriptions", desc: "Recurring billing engine" },
  { icon: Globe2, label: "International Cards", desc: "Accept from 190+ countries" },
  { icon: Building2, label: "Bank Transfers", desc: "NEFT, RTGS, IMPS, wires" },
];

export function PaymentMethodsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-electric" />
            Payment methods
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Accept every way your <span className="text-gradient">customers pay</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One integration. Every payment method. Optimised for the highest
            success rate on every network.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {methods.map((m) => (
            <div
              key={m.label}
              className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-elegant hover:-translate-y-1 hover:border-electric/40"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-electric transition group-hover:bg-gradient-brand group-hover:text-white">
                <m.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{m.label}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
