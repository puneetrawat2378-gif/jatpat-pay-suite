import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { InternationalSection } from "@/components/site/InternationalSection";
import { CTASection } from "@/components/site/CTASection";

export const Route = createFileRoute("/international")({
  head: () => ({
    meta: [
      { title: "International Payments — Jatpat Pay" },
      { name: "description", content: "Accept payments in USD, EUR, GBP, AED, CAD, AUD, JPY and more with Jatpat Pay." },
      { property: "og:title", content: "International Payments — Jatpat Pay" },
      { property: "og:description", content: "Your business is global. Your payments should be too." },
    ],
  }),
  component: InternationalPage,
});

function InternationalPage() {
  return (
    <SiteLayout>
      <InternationalSection />
      <CTASection />
    </SiteLayout>
  );
}
