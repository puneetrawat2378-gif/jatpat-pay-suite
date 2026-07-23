import { useEffect, useRef, useState } from "react";

type Stat = { label: string; value: number; suffix?: string; prefix?: string };

const stats: Stat[] = [
  { label: "Happy Customers", value: 10000, suffix: "+" },
  { label: "Payment Services", value: 50, suffix: "+" },
  { label: "Support Hours", value: 24, suffix: "×7" },
  { label: "Uptime SLA", value: 99.9, suffix: "%" },
];

function useInViewCount(target: number, duration = 1600) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(target * eased);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, n };
}

function StatCard({ s }: { s: Stat }) {
  const { ref, n } = useInViewCount(s.value);
  const display = s.value % 1 === 0 ? Math.floor(n).toLocaleString() : n.toFixed(1);
  return (
    <div ref={ref} className="rounded-2xl glass-dark p-6 text-center">
      <div className="text-4xl sm:text-5xl font-extrabold font-display text-white">
        {s.prefix}
        <span className="bg-gradient-brand bg-clip-text text-transparent">{display}</span>
        {s.suffix}
      </div>
      <div className="mt-2 text-sm text-white/60 font-medium">{s.label}</div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-dark overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-10" />
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-electric/20 blur-3xl animate-floatY" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan/20 blur-3xl animate-floatY" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}