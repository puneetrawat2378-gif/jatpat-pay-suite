import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDashboard } from "./HeroDashboard";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-electric/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 h-96 w-96 rounded-full bg-purple/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/5 px-3 py-1 text-xs font-semibold text-electric mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Payments. Jatpat. Anywhere.
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
              Fast, Secure &{" "}
              <span className="relative inline-block">
                <span className="text-gradient bg-[length:200%_100%] animate-shimmer-text">
                  Smart Digital
                </span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-brand opacity-60 blur-sm" />
              </span>{" "}
              Payments
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              All your payment solutions in one place. Jatpat Pay powers UPI,
              recharges, bills, AEPS, payouts, and global acceptance for
              individuals, merchants, and businesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-brand text-white shadow-glow hover:opacity-90 h-12 px-6 text-base font-[var(--font-button)]">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base border-navy/20 font-[var(--font-button)]">
                  Contact Us
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-foreground/70">
              {["Instant UPI", "Bank-Level Security", "24×7 Support"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-gradient-brand" /> {t}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Floating currency symbols spread wider */}
            <div className="pointer-events-none absolute -inset-10 hidden md:block z-0">
              {["₹", "$", "€", "£", "¥", "AED"].map((c, idx) => (
                <span
                  key={c}
                  className="absolute font-bold text-electric/30 animate-floatY"
                  style={{
                    left: `${[-4, 96, 2, 100, 50, 30][idx]}%`,
                    top: `${[4, 12, 62, 74, -8, 96][idx]}%`,
                    fontSize: c === "AED" ? "1rem" : "1.75rem",
                    animationDelay: `${idx * 0.4}s`,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="relative z-10">
              <div className="absolute -top-3 left-4 z-20 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 border border-white/10">
                Demo Transactions
              </div>
              <HeroDashboard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
