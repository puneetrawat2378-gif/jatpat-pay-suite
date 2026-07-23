import {
  Zap, ShieldCheck, Headphones, Globe2, BadgeCheck, Timer, UserPlus, Lock, TrendingDown, Cpu,
} from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Payments", desc: "Real-time settlements and instant UPI collect." },
  { icon: ShieldCheck, title: "Bank-Level Security", desc: "Encryption, tokenisation and 2FA everywhere." },
  { icon: Headphones, title: "24×7 Support", desc: "Human support whenever you need it." },
  { icon: Globe2, title: "International Payments", desc: "Accept from customers around the globe." },
  { icon: BadgeCheck, title: "Trusted Services", desc: "Compliant with RBI and industry standards." },
  { icon: Timer, title: "Fast Processing", desc: "Optimised infrastructure for low latency." },
  { icon: UserPlus, title: "Easy Registration", desc: "Onboard in minutes, no paperwork." },
  { icon: Lock, title: "Secure Transactions", desc: "PCI-aware handling and least-privilege access." },
  { icon: TrendingDown, title: "Low Fees", desc: "Transparent pricing with no hidden costs." },
  { icon: Cpu, title: "Modern Technology", desc: "Built on a cloud-native, resilient stack." },
];

export function WhyChoose() {
  return (
    <section className="relative py-24 sm:py-32 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Why Jatpat Pay
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-display">
            Built for speed, security, and{" "}
            <span className="text-gradient">scale</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:border-electric/40"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-bold font-display">{f.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}