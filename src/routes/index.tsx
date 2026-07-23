import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { PaymentMethodsSection } from "@/components/site/PaymentMethodsSection";
import { InternationalSection } from "@/components/site/InternationalSection";
import { CTASection } from "@/components/site/CTASection";
import {
  PaymentDemoSection,
  PaymentLinksSection,
  DeveloperSection,
  DashboardPreviewSection,
  SecuritySection,
  BusinessSection,
  AnalyticsSection,
  PricingPreviewSection,
  MetricsStrip,
} from "@/components/site/HomeSections";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Jatpat Pay — Payments. Jatpat. Anywhere." },
      {
        name: "description",
        content:
          "Jatpat Pay is a premium payment platform for modern businesses. Accept payments, create payment links, track transactions and prepare for global payment acceptance.",
      },
      { property: "og:title", content: "Jatpat Pay — Payments. Jatpat. Anywhere." },
      {
        property: "og:description",
        content:
          "Jatpat Pay is a premium payment platform for modern businesses. Accept payments, create payment links, track transactions and prepare for global payment acceptance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <MetricsStrip />
      <PaymentMethodsSection />
      <PaymentDemoSection />
      <PaymentLinksSection />
      <DashboardPreviewSection />
      <InternationalSection />
      <DeveloperSection />
      <SecuritySection />
      <BusinessSection />
      <AnalyticsSection />
      <PricingPreviewSection />
      <CTASection />
    </SiteLayout>
  );
}
