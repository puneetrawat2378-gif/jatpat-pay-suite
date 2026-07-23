import { useEffect, useState } from "react";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { CONTACT } from "./ContactSection";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-card transition hover:-translate-y-0.5 hover:text-electric"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <a
        href={`tel:${CONTACT.phoneRaw}`}
        aria-label="Call Jatpat Pay"
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-electric text-white shadow-glow transition hover:scale-105"
      >
        <Phone className="h-5 w-5" />
        <span className="absolute inset-0 rounded-full bg-electric animate-ping-slow -z-10" />
      </a>
      <a
        href={`https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent("Hi Jatpat Pay, I'd like to know more about your services.")}`}
        target="_blank" rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow transition hover:scale-105"
        style={{ background: "linear-gradient(135deg, oklch(0.72 0.21 152), oklch(0.62 0.20 152))" }}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-mint ring-2 ring-background animate-pulse-glow" />
      </a>
    </div>
  );
}