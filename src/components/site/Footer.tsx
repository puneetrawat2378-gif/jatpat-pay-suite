import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Twitter, Linkedin, Github } from "lucide-react";

const cols = [
  {
    title: "Products",
    links: [
      { label: "Payments", to: "/payments" },
      { label: "Payment Links", to: "/payments" },
      { label: "International", to: "/international" },
      { label: "Subscriptions", to: "/payments" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", to: "/developers" },
      { label: "API Reference", to: "/developers" },
      { label: "Webhooks", to: "/developers" },
      { label: "SDKs", to: "/developers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/company" },
      { label: "Mission", to: "/company" },
      { label: "Careers", to: "/company" },
      { label: "Contact", to: "/company" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "Terms of Service", to: "/legal/terms" },
      { label: "Refund Policy", to: "/legal/refund" },
      { label: "Merchant Agreement", to: "/legal/merchant" },
      { label: "Cookie Policy", to: "/legal/cookies" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" />
            <p className="text-sm text-white/60 max-w-xs">
              Payments. Jatpat. Anywhere. Accept payments from India and across
              the world with one powerful platform.
            </p>
            <div className="flex gap-3 pt-2">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/60 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/50">© 2026 Jatpat Pay. All rights reserved.</div>
          <div className="text-xs text-white/50">
            Demo mode. No real payments are processed.
          </div>
        </div>
      </div>
    </footer>
  );
}
