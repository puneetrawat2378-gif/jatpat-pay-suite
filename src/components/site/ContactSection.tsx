import { useState } from "react";
import { Phone, Mail, MapPin, Instagram, Youtube, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const CONTACT = {
  phone: "+91 9999861327",
  phoneRaw: "919999861327",
  email: "support@jatpatpay.com",
  address: "Pachokhra, Datia, Madhya Pradesh – 475685, India",
  instagram: "https://www.instagram.com/puneetrawat84",
  youtube: "https://www.youtube.com/@Puneetrawat2378",
  mapsQuery: "Pachokhra, Datia, Madhya Pradesh 475685, India",
};

export function ContactSection() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent! We'll get back to you shortly.");
    }, 900);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-soft opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Contact
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold font-display tracking-tight">
            Let's talk about your{" "}
            <span className="text-gradient">payments</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Reach out for sales, support, or partnership queries. We usually
            reply within a few hours.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          {/* Info + map */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phoneRaw}` },
              { icon: MessageCircle, label: "WhatsApp", value: CONTACT.phone, href: `https://wa.me/${CONTACT.phoneRaw}` },
              { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { icon: MapPin, label: "Address", value: CONTACT.address },
            ].map((row) => (
              <a
                key={row.label}
                href={row.href}
                target={row.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-electric/40"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <row.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold break-words">{row.value}</div>
                </div>
              </a>
            ))}
            <div className="flex gap-3">
              <a
                href={CONTACT.instagram}
                target="_blank" rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition hover:border-electric/40 hover:text-electric"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a
                href={CONTACT.youtube}
                target="_blank" rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition hover:border-electric/40 hover:text-electric"
              >
                <Youtube className="h-4 w-4" /> YouTube
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                title="Jatpat Pay office location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elegant"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full name
                </label>
                <Input required name="name" className="mt-1.5 h-11" placeholder="Puneet Rawat" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <Input required type="email" name="email" className="mt-1.5 h-11" placeholder="you@company.com" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </label>
                <Input name="phone" className="mt-1.5 h-11" placeholder="+91 98••• •••••" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Business
                </label>
                <Input name="business" className="mt-1.5 h-11" placeholder="Your business name" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </label>
                <Textarea required name="message" className="mt-1.5 min-h-32" placeholder="Tell us how we can help…" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="mt-6 h-12 w-full bg-gradient-brand text-white shadow-glow hover:opacity-90"
            >
              {sending ? "Sending…" : (<>Send Message <Send className="ml-2 h-4 w-4" /></>)}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              By submitting you agree to our privacy policy. We never share your details.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}