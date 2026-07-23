import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How secure are payments on Jatpat Pay?",
    a: "We use end-to-end encryption, tokenised card handling, and least-privilege access. All transactions run through approved and compliant processors.",
  },
  {
    q: "Which payment methods can my customers use?",
    a: "UPI, credit and debit cards, net banking, wallets, and — for supported merchants — international cards and wire transfers.",
  },
  {
    q: "How do refunds work?",
    a: "Full and partial refunds can be issued from your dashboard within seconds. Funds typically reach the customer within 5–7 business days depending on their bank.",
  },
  {
    q: "Do you support international payments?",
    a: "Yes. Once your merchant profile is approved for international acceptance, you can charge global customers in their local currency.",
  },
  {
    q: "What kind of customer support do you provide?",
    a: "24×7 support via WhatsApp, phone and email. Enterprise merchants get a dedicated account manager.",
  },
  {
    q: "Are there any transaction limits?",
    a: "Limits depend on your KYC tier and the payment method. Full limits are shown in your dashboard after onboarding.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-muted/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/5 px-3 py-1 text-xs font-semibold text-electric mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-electric" /> FAQs
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
            Questions, <span className="text-gradient">answered</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-border bg-card divide-y divide-border">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-none px-5">
              <AccordionTrigger className="text-left text-base font-semibold font-display hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}