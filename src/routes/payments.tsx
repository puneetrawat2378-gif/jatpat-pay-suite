import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PaymentMethodsSection } from "@/components/site/PaymentMethodsSection";
import { CTASection } from "@/components/site/CTASection";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Jatpat Pay" },
      { name: "description", content: "Accept UPI, cards, net banking, wallets, subscriptions and payment links with Jatpat Pay." },
      { property: "og:title", content: "Payments — Jatpat Pay" },
      { property: "og:description", content: "Every payment method your customers want — in one platform." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            One platform for <span className="text-gradient">every payment</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            From a first UPI collect to a global subscription — Jatpat Pay
            handles the whole payment lifecycle.
          </p>
        </div>
      </section>
      <PaymentMethodsSection />
      <CTASection />
    </SiteLayout>
  );
}
