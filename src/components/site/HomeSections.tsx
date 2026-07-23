import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  ExternalLink,
  Share2,
  Loader2,
  Code2,
  Terminal,
  Key,
  Webhook,
  ShieldCheck,
  Lock,
  Users2,
  ScrollText,
  KeySquare,
  Rocket,
  Store,
  Layers,
  Building2,
  Globe2,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ============================================================
   Reusable section header
   ============================================================ */
function SectionHeader({
  eyebrow,
  title,
  highlight,
  desc,
  dark,
  center,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  desc?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl`}>
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 ${
          dark
            ? "border border-white/10 bg-white/5 text-white/70"
            : "border border-border bg-card text-muted-foreground"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-electric" />
        {eyebrow}
      </div>
      <h2
        className={`text-4xl sm:text-5xl font-bold tracking-tight ${
          dark ? "text-white" : ""
        }`}
      >
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-lg ${
            dark ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Payment Demo — interactive checkout
   ============================================================ */
export function PaymentDemoSection() {
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [pulse, setPulse] = useState(false);

  const run = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("done");
      setPulse(true);
      setTimeout(() => setPulse(false), 1600);
    }, 1800);
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-soft opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Live demo"
          title="See Payments Move at"
          highlight="Jatpat Speed."
          desc="Try a demonstration checkout and watch the payment flow to your merchant dashboard in real time. No real money moves — this is a labeled demo."
        />

        <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center">
          {/* Checkout card */}
          <div className="relative rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <div className="absolute -top-3 left-4 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Demo Checkout
            </div>
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-mono text-muted-foreground">
                checkout.jatpatpay.com
              </div>
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand text-white text-[10px] font-bold">
                J
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-5">
              <div className="text-xs text-muted-foreground">Paying to</div>
              <div className="font-semibold">Jatpat Merchant · Demo Store</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Product</div>
                  <div className="font-semibold">Business Pro Plan</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="text-2xl font-bold font-mono">₹4,999</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 text-[11px] font-semibold text-center">
              {["UPI", "Cards", "Netbank", "Wallet"].map((m, i) => (
                <div
                  key={m}
                  className={`rounded-lg border py-2 ${
                    i === 0
                      ? "border-electric bg-electric/10 text-electric"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>

            <Button
              onClick={run}
              disabled={status === "processing"}
              className="mt-5 w-full h-11 bg-gradient-brand text-white shadow-glow hover:opacity-90"
            >
              {status === "idle" && (
                <>Try Demo Payment <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
              {status === "processing" && (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payment…</>
              )}
              {status === "done" && (
                <><Check className="mr-2 h-4 w-4" /> Demo Payment Successful</>
              )}
            </Button>
            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              Demonstration only · No real funds are moved
            </div>
          </div>

          {/* Connector line */}
          <div className="hidden lg:flex items-center justify-center">
            <svg width="120" height="40" viewBox="0 0 120 40" className="text-electric">
              <line
                x1="0"
                y1="20"
                x2="120"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={status !== "idle" ? "animate-dash-flow" : ""}
                strokeDasharray="6 6"
              />
              <circle cx="120" cy="20" r="4" fill="currentColor" />
            </svg>
          </div>

          {/* Merchant dashboard mini */}
          <div className="relative rounded-3xl bg-gradient-dark p-1 shadow-glow">
            <div className="rounded-[22px] bg-navy p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-white/60">Merchant Dashboard</div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint/15 text-mint">
                  LIVE
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <div className="text-xs text-white/50">Today's revenue</div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">
                  ₹1,89,319
                </div>
                <div className="text-[11px] text-mint">+18% vs yesterday</div>
              </div>

              <div className="mt-3 space-y-2">
                {status === "done" && (
                  <div
                    className={`flex items-center gap-3 rounded-xl border border-mint/30 bg-mint/10 p-3 animate-float-up ${
                      pulse ? "ring-2 ring-mint/50" : ""
                    }`}
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mint/20 text-mint">
                      <Check className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">
                        Demo Payment Received
                      </div>
                      <div className="text-xs text-white/60">
                        Business Pro Plan · UPI
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      ₹4,999
                    </div>
                  </div>
                )}
                {[
                  { t: "Payment Received", a: "₹8,500", m: "UPI" },
                  { t: "International Payment", a: "$499", m: "Visa · US" },
                ].map((n) => (
                  <div
                    key={n.t}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/70">
                      <Check className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {n.t}
                      </div>
                      <div className="text-xs text-white/50">{n.m}</div>
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {n.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Payment Links — generator
   ============================================================ */
export function PaymentLinksSection() {
  const [title, setTitle] = useState("Design Consultation");
  const [amount, setAmount] = useState("2499");
  const [currency, setCurrency] = useState("INR");
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "payment";
    const id = Math.abs(
      title.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + Number(amount || 0),
    )
      .toString(36)
      .slice(0, 8);
    setUrl(`jatpat.pay/${slug}-${id}`);
    setCopied(false);
  };
  const copy = () => {
    if (!url) return;
    navigator.clipboard?.writeText(`https://${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="relative py-24 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Payment Links"
          title="Create. Share."
          highlight="Get Paid."
          desc="Generate a hosted checkout link in seconds and share it anywhere — email, WhatsApp, invoices, or your website."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-8 items-start">
          {/* Generator */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1.5 h-11 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-mono"
                  >
                    {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <Input
                  defaultValue="One-time consultation fee"
                  className="mt-1.5 h-11"
                />
              </div>
              <Button
                onClick={generate}
                className="mt-2 h-11 bg-gradient-brand text-white shadow-glow"
              >
                Create Payment Link <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {url && (
                <div className="mt-2 rounded-2xl border border-electric/30 bg-electric/5 p-4 animate-float-up">
                  <div className="text-xs font-semibold text-electric mb-2">
                    Demo link generated
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 font-mono text-sm">
                    <span className="text-muted-foreground">https://</span>
                    <span className="truncate font-semibold">{url}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={copy}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      {copied ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                    </Button>
                    <Button size="sm" className="bg-gradient-brand text-white">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[280px] rounded-[40px] border-[10px] border-navy bg-navy p-1 shadow-glow">
              <div className="rounded-[30px] bg-background overflow-hidden">
                <div className="h-6 bg-navy" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded bg-gradient-brand" />
                    <div className="text-xs font-semibold">Jatpat Checkout</div>
                    <div className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-mint/20 text-mint font-semibold">
                      SECURE
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{title || "Payment"}</div>
                  <div className="text-3xl font-bold font-mono mt-1">
                    {currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "AED "}
                    {Number(amount || 0).toLocaleString()}
                  </div>
                  <div className="mt-5 space-y-2">
                    {["UPI", "Card", "Net Banking", "Wallet"].map((m, i) => (
                      <div
                        key={m}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                          i === 0 ? "border-electric bg-electric/10 font-semibold" : "border-border"
                        }`}
                      >
                        {m}
                        <div className={`h-3 w-3 rounded-full border-2 ${i === 0 ? "border-electric bg-electric" : "border-muted-foreground"}`} />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-5 h-10 bg-gradient-brand text-white text-sm">
                    Pay Now
                  </Button>
                  <div className="mt-3 text-[10px] text-center text-muted-foreground">
                    Demo checkout · No real payment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Developer section
   ============================================================ */
const codeSamples: Record<string, string> = {
  JavaScript: `// Create a payment (demo)
const res = await fetch("https://api.jatpatpay.com/v1/payments", {
  method: "POST",
  headers: {
    Authorization: "Bearer jp_test_••••••••",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 499900,        // ₹4,999.00
    currency: "INR",
    description: "Business Pro Plan",
    customer: { email: "demo@example.com" },
  }),
});
const payment = await res.json();`,
  "Node.js": `import { Jatpat } from "@jatpatpay/node";

const jatpat = new Jatpat(process.env.JATPAT_TEST_KEY);

const payment = await jatpat.payments.create({
  amount: 499900,
  currency: "INR",
  description: "Business Pro Plan",
});

console.log(payment.checkout_url);`,
  Python: `import jatpatpay

jatpat = jatpatpay.Client(api_key=os.environ["JATPAT_TEST_KEY"])

payment = jatpat.payments.create(
    amount=499900,
    currency="INR",
    description="Business Pro Plan",
)

print(payment.checkout_url)`,
  PHP: `<?php
$jatpat = new Jatpat\\Client(getenv('JATPAT_TEST_KEY'));

$payment = $jatpat->payments->create([
  'amount'      => 499900,
  'currency'    => 'INR',
  'description' => 'Business Pro Plan',
]);

echo $payment->checkout_url;`,
  Java: `Jatpat jatpat = new Jatpat(System.getenv("JATPAT_TEST_KEY"));

Payment payment = jatpat.payments().create(
  PaymentCreateParams.builder()
    .amount(499900L)
    .currency("INR")
    .description("Business Pro Plan")
    .build()
);

System.out.println(payment.getCheckoutUrl());`,
};

export function DeveloperSection() {
  const [tab, setTab] = useState("JavaScript");

  return (
    <section className="relative py-24 sm:py-32 bg-gradient-dark text-white overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-glow pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeader
              eyebrow="Developer platform"
              title="Built for Developers."
              highlight="Designed for Growth."
              desc="Ship in days, not months. A single SDK, clean REST APIs, first-class webhooks, and detailed docs with real-world recipes."
              dark
            />
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {[
                { icon: Terminal, label: "Test Mode" },
                { icon: Code2, label: "API Documentation" },
                { icon: Webhook, label: "Webhooks" },
                { icon: Key, label: "SDK Ready Architecture" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-electric/20 text-electric">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/developers">
                <Button size="lg" className="bg-white text-navy hover:bg-white/90 h-11 px-5">
                  Read Documentation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/developers">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-5 border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  View API Architecture
                </Button>
              </Link>
            </div>
          </div>

          {/* Code panel */}
          <div className="relative rounded-2xl bg-navy/80 border border-white/10 shadow-glow overflow-hidden">
            <div className="flex items-center gap-1 border-b border-white/10 bg-black/30 px-3 py-2 overflow-x-auto">
              {Object.keys(codeSamples).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    tab === k
                      ? "bg-electric/20 text-electric"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed font-mono text-white/90">
              <code>{codeSamples[tab]}</code>
            </pre>
            <div className="border-t border-white/10 bg-black/30 px-4 py-2 text-[11px] font-mono text-white/40">
              // Test keys shown for demonstration only. Never expose secret keys in client code.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Dashboard preview section
   ============================================================ */
export function DashboardPreviewSection() {
  const kpis = [
    { label: "Total Revenue", value: "₹42.8L", trend: "+22%" },
    { label: "Today's Payments", value: "1,284", trend: "+8%" },
    { label: "Success Rate", value: "99.2%", trend: "+0.4%" },
    { label: "International Revenue", value: "$18,420", trend: "+31%" },
    { label: "Pending Settlements", value: "₹2.4L", trend: "T+1" },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Merchant dashboard"
          title="Every Payment."
          highlight="One Powerful Dashboard."
          desc="A dashboard purpose-built for finance and operations teams. Live revenue, per-currency insights, and instant transaction search."
        />
        <div className="mt-14 relative rounded-3xl bg-gradient-dark p-2 shadow-glow">
          <div className="rounded-[22px] bg-navy p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-xs text-white/60">Overview</div>
                <div className="text-lg font-bold text-white">Demo Merchant · Acme Inc.</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
                Live · Demo data
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl bg-white/5 border border-white/5 p-3"
                >
                  <div className="text-[10px] uppercase tracking-wider text-white/50">
                    {k.label}
                  </div>
                  <div className="mt-1 text-lg font-bold text-white font-mono">
                    {k.value}
                  </div>
                  <div className="text-[10px] text-mint">{k.trend}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-white/50">Revenue · last 30 days</div>
                  <div className="text-lg font-bold text-white">₹42,84,910</div>
                </div>
                <div className="flex gap-2 text-[10px]">
                  {["INR", "USD", "GBP", "EUR"].map((c, i) => (
                    <span
                      key={c}
                      className={`px-2 py-1 rounded font-mono ${
                        i === 0
                          ? "bg-electric/20 text-electric"
                          : "bg-white/5 text-white/60"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 600 140" className="w-full h-32">
                <defs>
                  <linearGradient id="rev-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="oklch(0.62 0.22 258)" stopOpacity="0.5" />
                    <stop offset="1" stopColor="oklch(0.62 0.22 258)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="rev-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="oklch(0.78 0.16 210)" />
                    <stop offset="1" stopColor="oklch(0.55 0.24 295)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,110 C60,90 100,100 150,70 C200,45 240,80 300,55 C360,30 400,60 460,35 C520,15 560,25 600,10 L600,140 L0,140 Z"
                  fill="url(#rev-area)"
                />
                <path
                  d="M0,110 C60,90 100,100 150,70 C200,45 240,80 300,55 C360,30 400,60 460,35 C520,15 560,25 600,10"
                  fill="none"
                  stroke="url(#rev-line)"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Recent transactions */}
            <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                <div>Transaction</div>
                <div>Method</div>
                <div>Amount</div>
                <div>Status</div>
              </div>
              {[
                { t: "pay_9F3xQ · Acme Inc.", m: "UPI · IN", a: "₹4,999", s: "Success" },
                { t: "pay_8Kd2W · Global LLC", m: "Visa · US", a: "$499.00", s: "Success" },
                { t: "pay_7Bh1M · Studio Co.", m: "MC · UK", a: "£299.00", s: "Success" },
                { t: "pay_6Nz9V · Trade FZE", m: "Wallet · AE", a: "AED 1,200", s: "Success" },
              ].map((r) => (
                <div
                  key={r.t}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 text-xs text-white/80"
                >
                  <div className="font-mono truncate">{r.t}</div>
                  <div className="text-white/60">{r.m}</div>
                  <div className="font-mono font-bold">{r.a}</div>
                  <div>
                    <span className="rounded px-2 py-0.5 bg-mint/15 text-mint text-[10px] font-semibold">
                      {r.s}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Security section
   ============================================================ */
export function SecuritySection() {
  const items = [
    { icon: Lock, title: "Secure Authentication", desc: "Modern auth flows, MFA-ready, session hardening." },
    { icon: ShieldCheck, title: "Server-Side Authorization", desc: "Sensitive actions authorized on the server, never trusted from the client." },
    { icon: KeySquare, title: "Encrypted Connections", desc: "TLS everywhere. Traffic encrypted in transit end-to-end." },
    { icon: Users2, title: "Role-Based Access", desc: "Granular team roles for operations, finance, and developers." },
    { icon: Webhook, title: "Webhook Verification", desc: "Signed webhooks with replay protection out of the box." },
    { icon: ScrollText, title: "Audit Logging", desc: "Every sensitive action logged with actor, time, and context." },
    { icon: Key, title: "Secure Secret Management", desc: "Isolated secret storage. Keys never appear in application logs." },
  ];
  return (
    <section className="relative py-24 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Security"
          title="Security at"
          highlight="Every Layer."
          desc="Architecture designed for financial-grade workloads. Real card processing is delivered through a compliant payment provider using tokenized or hosted checkout flows."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition hover:shadow-elegant hover:-translate-y-1 hover:border-electric/40"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-electric group-hover:bg-gradient-brand group-hover:text-white transition">
                <it.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-lg">{it.title}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{it.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 mx-auto max-w-3xl rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground text-center">
          Real card processing must use a compliant payment provider and secure
          tokenized or hosted checkout architecture. Jatpat Pay does not claim
          any certification it has not been formally awarded.
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Business section
   ============================================================ */
export function BusinessSection() {
  const cards = [
    { icon: Rocket, title: "Startups", desc: "Ship your first payment in a day. Test mode from minute one." },
    { icon: Store, title: "Online Businesses", desc: "Drop-in checkout, UPI QR, and subscription tools." },
    { icon: Layers, title: "SaaS Platforms", desc: "Recurring billing, plan changes, and revenue analytics." },
    { icon: Code2, title: "Developers", desc: "Clean SDKs, sandbox keys, and signed webhooks." },
    { icon: Building2, title: "Enterprises", desc: "Role-based access, SSO-ready architecture, and audit trails." },
    { icon: Globe2, title: "Global Businesses", desc: "Multi-currency ready. International payment architecture." },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="For every business"
          title="Built for Every Stage of"
          highlight="Business."
          desc="Whether you're launching your first product or scaling across borders, Jatpat Pay grows with you."
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:shadow-elegant hover:-translate-y-1"
            >
              <div
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition group-hover:opacity-60"
                style={{
                  background:
                    i % 2 === 0
                      ? "oklch(0.62 0.22 258 / 0.4)"
                      : "oklch(0.55 0.24 295 / 0.4)",
                }}
              />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-bold">{c.title}</div>
                <div className="mt-1.5 text-sm text-muted-foreground">
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Analytics section
   ============================================================ */
function useCounter(target: number, duration = 1400) {
  const [v, setV] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

export function AnalyticsSection() {
  const vol = useCounter(4284);
  const rev = useCounter(22);
  const ok = useCounter(992);
  const countries = useCounter(48);

  const bars = [40, 65, 48, 82, 60, 90, 72, 88, 95, 78, 92, 100];

  return (
    <section className="relative py-24 sm:py-32 bg-gradient-dark text-white overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Analytics"
          title="Understand"
          highlight="Every Transaction."
          desc="From payment volume to success rate to top customer countries — actionable insights, updated live."
          dark
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* Volume chart */}
          <div className="lg:col-span-2 rounded-2xl glass-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-white/60">Payment Volume</div>
                <div className="text-2xl font-bold font-mono">
                  ₹{vol.toLocaleString()}K
                </div>
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60 font-mono">
                DEMO DATA
              </div>
            </div>
            <div className="flex items-end gap-2 h-40">
              {bars.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-brand transition-all duration-1000"
                    style={{ height: `${b}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-12 gap-2 text-[10px] text-white/40 font-mono">
              {["J","F","M","A","M","J","J","A","S","O","N","D"].map((m, i) => (
                <div key={i} className="text-center">{m}</div>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid gap-4">
            <div className="rounded-2xl glass-dark p-5">
              <div className="text-xs text-white/60">Revenue Growth</div>
              <div className="text-3xl font-bold font-mono text-cyan">+{rev}%</div>
              <div className="text-[11px] text-white/50">vs. last quarter · demo</div>
            </div>
            <div className="rounded-2xl glass-dark p-5">
              <div className="text-xs text-white/60">Success Rate</div>
              <div className="text-3xl font-bold font-mono text-mint">
                {(ok / 10).toFixed(1)}%
              </div>
              <div className="text-[11px] text-white/50">last 24 hours · demo</div>
            </div>
            <div className="rounded-2xl glass-dark p-5">
              <div className="text-xs text-white/60">Customer Countries</div>
              <div className="text-3xl font-bold font-mono text-white">{countries}</div>
              <div className="text-[11px] text-white/50">unique geos · demo</div>
            </div>
          </div>

          {/* Currency breakdown */}
          <div className="lg:col-span-3 rounded-2xl glass-dark p-6">
            <div className="text-sm font-semibold mb-4">Currency Breakdown · demo</div>
            <div className="space-y-3">
              {[
                { c: "INR", p: 62, color: "oklch(0.62 0.22 258)" },
                { c: "USD", p: 18, color: "oklch(0.55 0.24 295)" },
                { c: "GBP", p: 9, color: "oklch(0.78 0.16 210)" },
                { c: "EUR", p: 7, color: "oklch(0.78 0.17 165)" },
                { c: "AED", p: 4, color: "oklch(0.78 0.16 75)" },
              ].map((row) => (
                <div key={row.c} className="grid grid-cols-[60px_1fr_50px] items-center gap-3">
                  <div className="text-xs font-mono text-white/70">{row.c}</div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${row.p}%`, background: row.color }}
                    />
                  </div>
                  <div className="text-xs font-mono text-white/70 text-right">{row.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Pricing preview
   ============================================================ */
export function PricingPreviewSection() {
  const plans = [
    {
      name: "STARTER",
      desc: "For new businesses testing payment ideas.",
      features: ["Test-mode API access", "Payment Links", "Standard dashboard", "Email support"],
      cta: "Get Started",
      to: "/signup",
      highlight: false,
    },
    {
      name: "BUSINESS",
      desc: "For growing businesses moving into production.",
      features: ["Everything in Starter", "Priority routing", "Advanced analytics", "Webhooks & SDKs"],
      cta: "Choose Business",
      to: "/signup",
      highlight: true,
    },
    {
      name: "GLOBAL",
      desc: "For international-focused businesses.",
      features: ["Everything in Business", "Multi-currency", "Dedicated account manager", "Custom integrations"],
      cta: "Talk to Sales",
      to: "/company",
      highlight: false,
    },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple Plans for"
          highlight="Growing Businesses."
          desc="Transparent, transaction-based pricing tuned to your business stage and payment provider."
          center
        />
        <div className="mt-14 grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 transition ${
                p.highlight
                  ? "bg-gradient-dark text-white shadow-glow ring-1 ring-electric/30"
                  : "border border-border bg-card shadow-card hover:-translate-y-1"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-8 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Most popular
                </div>
              )}
              <div
                className={`text-xs font-bold uppercase tracking-widest ${
                  p.highlight ? "text-cyan" : "text-electric"
                }`}
              >
                {p.name}
              </div>
              <div className={`mt-3 text-sm ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                {p.desc}
              </div>
              <div className="mt-6 text-3xl font-bold">
                Custom
                <span className={`ml-2 text-sm font-normal ${p.highlight ? "text-white/60" : "text-muted-foreground"}`}>
                  transaction pricing
                </span>
              </div>
              <div className={`mt-1 text-[11px] ${p.highlight ? "text-white/50" : "text-muted-foreground"}`}>
                Based on payment provider & business requirements
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        p.highlight ? "text-mint" : "text-electric"
                      }`}
                    />
                    <span className={p.highlight ? "text-white/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={p.to}>
                <Button
                  className={`mt-7 w-full h-11 ${
                    p.highlight
                      ? "bg-white text-navy hover:bg-white/90"
                      : "bg-gradient-brand text-white shadow-glow"
                  }`}
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Metrics strip (animated counters)
   ============================================================ */
export function MetricsStrip() {
  const currencies = useCounter(150);
  const uptime = useCounter(999);
  const countries = useCounter(190);
  const methods = useCounter(24);
  const items = [
    { v: `${currencies}+`, l: "Currencies planned" },
    { v: `${(uptime / 10).toFixed(1)}%`, l: "Architected uptime" },
    { v: `${countries}+`, l: "Countries in scope" },
    { v: `${methods}`, l: "Payment methods" },
  ];
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((i) => (
            <div key={i.l} className="text-center md:text-left">
              <div className="text-3xl sm:text-4xl font-bold text-gradient font-mono">
                {i.v}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {i.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
