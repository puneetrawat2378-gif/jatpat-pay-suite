import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CTASection } from "@/components/site/CTASection";
import { Terminal, Key, Webhook, Book } from "lucide-react";

export const Route = createFileRoute("/developers")({
  head: () => ({
    meta: [
      { title: "Developers — Jatpat Pay" },
      { name: "description", content: "Modern REST APIs, SDKs, webhooks and typed responses. Built for developers." },
      { property: "og:title", content: "Developers — Jatpat Pay" },
      { property: "og:description", content: "Built for developers. Powerful for businesses." },
    ],
  }),
  component: DevelopersPage,
});

const snippets: Record<string, string> = {
  JavaScript: `import { JatpatPay } from "jatpatpay";

const jpp = new JatpatPay({ apiKey: process.env.JPP_KEY });

const payment = await jpp.payments.create({
  amount: 24999,
  currency: "INR",
  customer: { email: "aditi@example.com" },
  description: "Order #A-2410"
});

console.log(payment.checkoutUrl);`,
  "Node.js": `const { JatpatPay } = require("jatpatpay");

const jpp = new JatpatPay({ apiKey: process.env.JPP_KEY });

const link = await jpp.paymentLinks.create({
  amount: 49900, currency: "USD",
  customer: { name: "Ravi", email: "ravi@example.com" },
  description: "Consulting invoice", expires_in: "72h"
});`,
  Python: `import jatpatpay

client = jatpatpay.Client(api_key=os.environ["JPP_KEY"])

payment = client.payments.create(
  amount=24999,
  currency="INR",
  customer={"email": "aditi@example.com"},
  description="Order #A-2410",
)
print(payment.checkout_url)`,
  PHP: `<?php
$jpp = new JatpatPay\\Client(getenv('JPP_KEY'));

$payment = $jpp->payments->create([
  'amount' => 24999,
  'currency' => 'INR',
  'customer' => ['email' => 'aditi@example.com'],
  'description' => 'Order #A-2410',
]);`,
  Java: `JatpatPay jpp = new JatpatPay(System.getenv("JPP_KEY"));

Payment payment = jpp.payments().create(
  new PaymentCreate()
    .amount(24999L)
    .currency("INR")
    .customer(Map.of("email", "aditi@example.com"))
    .description("Order #A-2410")
);`,
};

const docs = [
  { icon: Key, title: "Authentication", desc: "Test & live keys, HMAC signatures, IP allow-lists." },
  { icon: Book, title: "Create Payment", desc: "Server-side create + hosted checkout URL." },
  { icon: Terminal, title: "Payment Status", desc: "Poll or subscribe via webhooks — your choice." },
  { icon: Webhook, title: "Webhooks", desc: "Signed events with automatic retries and DLQ." },
];

function DevelopersPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-dark text-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 mb-4">
                <Terminal className="h-3 w-3" /> Developer portal
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Built for developers. <br />
                <span className="text-gradient">Powerful for businesses.</span>
              </h1>
              <p className="mt-5 text-lg text-white/70 max-w-xl">
                Predictable REST APIs, typed SDKs in every major language,
                verified webhooks, and a test mode you can trust.
              </p>
            </div>

            <div className="rounded-2xl bg-navy/60 border border-white/10 overflow-hidden shadow-glow">
              <Tabs defaultValue="JavaScript">
                <div className="border-b border-white/10 px-2 pt-2 bg-black/20">
                  <TabsList className="bg-transparent">
                    {Object.keys(snippets).map((l) => (
                      <TabsTrigger key={l} value={l} className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10">
                        {l}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {Object.entries(snippets).map(([l, code]) => (
                  <TabsContent key={l} value={l} className="m-0">
                    <pre className="p-5 text-xs font-mono text-cyan/90 overflow-x-auto leading-relaxed">
                      <code>{code}</code>
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {docs.map((d) => (
              <div key={d.title} className="rounded-2xl border border-border bg-card p-6 hover:border-electric/40 transition">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-electric">
                  <d.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{d.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}
