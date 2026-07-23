import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-10 sm:p-16 shadow-glow">
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-purple/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-electric/30 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Ready to Move Payments at{" "}
              <span className="text-gradient">Jatpat Speed?</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Create your Jatpat Pay account and build your next payment experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-navy hover:bg-white/90 h-12 px-6 text-base">
                  Create Jatpat Pay Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/company">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
