import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { WhyChoose } from "@/components/site/WhyChoose";
import { StatsCounter } from "@/components/site/StatsCounter";
import { PaymentPartners } from "@/components/site/PaymentPartners";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { ContactSection } from "@/components/site/ContactSection";
import { CTASection } from "@/components/site/CTASection";
import { PaymentLinksSection } from "@/components/site/HomeSections";

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
      <PaymentPartners />
      <ServicesGrid />
      <WhyChoose />
      <StatsCounter />
      <PaymentLinksSection />
      <Testimonials />
      <FAQ />
      <ContactSection />
      <CTASection />
    </SiteLayout>
  );
}
