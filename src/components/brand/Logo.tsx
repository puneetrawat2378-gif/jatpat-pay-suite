import { Link } from "@tanstack/react-router";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const text = variant === "dark" ? "text-white" : "text-navy";
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow transition group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12 L10 6 L10 10 L20 10 L20 14 L10 14 L10 18 Z" fill="currentColor" />
        </svg>
        <span className="absolute inset-0 rounded-xl bg-gradient-brand blur-lg opacity-40 -z-10" />
      </span>
      <span className={`text-xl font-bold tracking-tight ${text}`}>
        Jatpat <span className="text-gradient">Pay</span>
      </span>
    </Link>
  );
}
