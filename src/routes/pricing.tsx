import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Jatpat Pay" },
      { name: "description", content: "Transparent pricing for businesses of every size. Starter, Business and Global plans." },
      { property: "og:title", content: "Pricing — Jatpat Pay" },
      { property: "og:description", content: "Plans that scale with your business." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Starter",
    tag: "For small businesses",
    price: "Custom",
    features: ["UPI, cards & net banking", "Payment Links", "Hosted checkout", "Standard settlements", "Email support"],
    cta: "Start free",
  },
  {
    name: "Business",
    tag: "For growing companies",
    price: "Custom",
    highlighted: true,
    features: ["Everything in Starter", "Subscriptions", "Webhooks & API keys", "Refund workflows", "Priority support"],
    cta: "Start free",
  },
  {
    name: "Global",
    tag: "For international businesses",
    price: "Custom",
    features: ["Everything in Business", "International cards", "Multi-currency payouts", "Dedicated account manager", "99.99% uptime SLA"],
    cta: "Talk to Sales",
  },
];

function PricingPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Simple, <span className="text-gradient">predictable</span> pricing
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Volume-based rates for every stage of your business. Contact us
              for a personalised quote.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-3xl border p-8 flex flex-col ${
                  t.highlighted
                    ? "bg-gradient-dark text-white border-transparent shadow-glow scale-[1.02]"
                    : "bg-card border-border shadow-card"
                }`}
              >
                {t.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <div className="text-sm font-semibold opacity-70">{t.name}</div>
                <div className="mt-1 text-2xl font-bold">{t.tag}</div>
                <div className="mt-6 text-5xl font-bold tracking-tight">{t.price}</div>
                <div className={`text-xs mt-1 ${t.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                  Volume-based transaction fees
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${t.highlighted ? "text-cyan" : "text-electric"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button
                      className={`w-full h-11 ${
                        t.highlighted
                          ? "bg-white text-navy hover:bg-white/90"
                          : "bg-gradient-brand text-white"
                      }`}
                    >
                      {t.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Need a custom package?{" "}
            <a href="mailto:sales@jatpatpay.com" className="text-electric font-semibold hover:underline">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
