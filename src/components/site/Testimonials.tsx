import { Star } from "lucide-react";

const items = [
  {
    name: "Rohit Sharma", role: "Retailer, Datia",
    quote: "Jatpat Pay ne meri dukaan ke saare bill payments aur AEPS ek jagah la diya. Customers khush, main bhi khush.",
    stars: 5,
  },
  {
    name: "Sneha Verma", role: "Founder, Studio Verma",
    quote: "Payment links banaana literally 10 seconds ka kaam hai. International clients bhi easily pay kar lete hain.",
    stars: 5,
  },
  {
    name: "Ankit Jain", role: "CTO, Trellix Commerce",
    quote: "The APIs are clean and the dashboard is genuinely useful. Migration se lekar go-live tak sab smooth tha.",
    stars: 5,
  },
  {
    name: "Priya Nair", role: "Freelance Designer",
    quote: "Subscription payments set up karke maine apna monthly billing pura automate kar diya. Life saver.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Loved by merchants
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
            What our customers <span className="text-gradient">say</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((t) => (
            <div
              key={t.name}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                “{t.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-brand text-white grid place-items-center font-bold font-display">
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}