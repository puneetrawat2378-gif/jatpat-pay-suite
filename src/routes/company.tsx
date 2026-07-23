import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Shield, Mail, Briefcase, Sparkles } from "lucide-react";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Company — Jatpat Pay" },
      { name: "description", content: "About Jatpat Pay, our mission, security posture, and careers." },
      { property: "og:title", content: "About Jatpat Pay" },
      { property: "og:description", content: "Make digital payments fast, simple, and accessible for modern businesses." },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-hero py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Building the future of <span className="text-gradient">business payments</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Jatpat Pay is on a mission to make digital payments fast, simple,
            and accessible for modern businesses — anywhere in the world.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Our Mission",
              body: "Make digital payments fast, simple, and accessible for modern businesses. We believe accepting money should be the easiest part of building a company.",
            },
            {
              icon: Shield,
              title: "Security",
              body: "We design Jatpat Pay with modern security principles — encrypted data in transit and at rest, tokenised card handling via approved processors, and least-privilege access to every merchant surface.",
            },
            {
              icon: Briefcase,
              title: "Careers",
              body: "We're a small, ambitious team hiring engineers, designers, and payment specialists who want to build critical infrastructure. Write to us at careers@jatpatpay.com.",
            },
            {
              icon: Mail,
              title: "Contact",
              body: "Sales · sales@jatpatpay.com  · Support · support@jatpatpay.com  · Security · security@jatpatpay.com",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-xl font-bold">{c.title}</div>
              <p className="mt-2 text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
