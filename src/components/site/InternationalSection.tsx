import { useEffect, useState } from "react";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Pound" },
  { code: "INR", symbol: "₹", name: "Rupee" },
  { code: "AED", symbol: "د.إ", name: "Dirham" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Aus Dollar" },
  { code: "JPY", symbol: "¥", name: "Yen" },
];

const flows = [
  { from: "United States", to: "India", amount: "$1,200", flag: "🇺🇸" },
  { from: "United Kingdom", to: "India", amount: "£750", flag: "🇬🇧" },
  { from: "UAE", to: "India", amount: "AED 4,500", flag: "🇦🇪" },
  { from: "Germany", to: "India", amount: "€890", flag: "🇩🇪" },
  { from: "Canada", to: "India", amount: "C$1,100", flag: "🇨🇦" },
];

export function InternationalSection() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % flows.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-24 sm:py-32 bg-gradient-dark text-white overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-glow pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
            International payments
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your business is global. <br />
            <span className="text-gradient">Your payments should be too.</span>
          </h2>
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            Built to support a future international payment infrastructure where
            verified merchants can accept supported global payment methods and
            currencies through approved payment partners.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-5 gap-6 items-center">
          {/* World map */}
          <div className="lg:col-span-3 relative aspect-[16/10] rounded-3xl glass-dark overflow-hidden">
            <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
              <defs>
                <radialGradient id="dot-color" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 210)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 258)" />
                </radialGradient>
              </defs>
              {/* Dotted world map — deterministic abstract landmass */}
              {(() => {
                const dots: { x: number; y: number }[] = [];
                // pseudo-random but deterministic (hash of index)
                const rnd = (n: number) => {
                  const s = Math.sin(n * 12.9898) * 43758.5453;
                  return s - Math.floor(s);
                };
                for (let k = 0; k < 380; k++) {
                  const x = (k % 32) * 25 + 20 + (Math.floor(k / 32) % 2) * 12;
                  const y = Math.floor(k / 32) * 30 + 30;
                  const r = rnd(k);
                  const inLand =
                    (x > 60 && x < 260 && y > 80 && y < 260 && r > 0.35) ||
                    (x > 300 && x < 470 && y > 60 && y < 240 && r > 0.3) ||
                    (x > 460 && x < 560 && y > 130 && y < 260 && r > 0.4) ||
                    (x > 540 && x < 720 && y > 100 && y < 260 && r > 0.35) ||
                    (x > 120 && x < 260 && y > 280 && y < 400 && r > 0.4) ||
                    (x > 580 && x < 720 && y > 300 && y < 420 && r > 0.5);
                  if (inLand) dots.push({ x, y });
                }
                return dots.map((d, k) => (
                  <circle key={k} cx={d.x} cy={d.y} r="1.6" fill="oklch(1 0 0 / 0.18)" />
                ));
              })()}

              {/* Payment arcs */}
              {[
                { x1: 180, y1: 180, x2: 520, y2: 220, delay: 0 },
                { x1: 420, y1: 140, x2: 520, y2: 220, delay: 0.6 },
                { x1: 560, y1: 240, x2: 520, y2: 220, delay: 1.2 },
              ].map((a, idx) => (
                <g key={idx}>
                  <path
                    d={`M${a.x1},${a.y1} Q${(a.x1 + a.x2) / 2},${Math.min(a.y1, a.y2) - 80} ${a.x2},${a.y2}`}
                    fill="none"
                    stroke="url(#dot-color)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-draw"
                    style={{ animationDelay: `${a.delay}s` }}
                  />
                  <circle cx={a.x1} cy={a.y1} r="4" fill="oklch(0.78 0.16 210)">
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={a.x2} cy={a.y2} r="6" fill="oklch(0.55 0.24 295)">
                    <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </svg>

            {/* Live payment tag */}
            <div key={i} className="absolute top-4 right-4 rounded-xl glass-dark px-4 py-3 animate-float-up min-w-[220px]">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
                Live payment
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl">{flows[i].flag}</span>
                <div>
                  <div className="text-xs text-white/50">{flows[i].from} → {flows[i].to}</div>
                  <div className="text-base font-bold text-white font-mono">{flows[i].amount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Currency grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {currencies.map((c) => (
              <div
                key={c.code}
                className="rounded-xl glass-dark p-4 hover:border-cyan/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-cyan">{c.symbol}</span>
                  <span className="text-xs font-mono text-white/40">{c.code}</span>
                </div>
                <div className="mt-2 text-sm text-white/70">{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60 text-center">
          International payment availability depends on merchant verification,
          supported countries, payment partners, banking rules, and applicable
          regulatory requirements.
        </div>
      </div>
    </section>
  );
}
