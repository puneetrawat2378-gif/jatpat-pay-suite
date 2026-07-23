import { useEffect, useState } from "react";
import { Check, TrendingUp, Globe2 } from "lucide-react";

const notifications = [
  { title: "Payment Received", amount: "₹24,999", method: "UPI · Google Pay", tag: "IN" },
  { title: "International Payment", amount: "$499.00", method: "Visa · United States", tag: "US" },
  { title: "UPI Payment", amount: "₹8,500", method: "UPI · PhonePe", tag: "IN" },
  { title: "Card Payment", amount: "£750.00", method: "Mastercard · UK", tag: "GB" },
  { title: "Wallet Payment", amount: "AED 4,500", method: "Wallet · UAE", tag: "AE" },
];

export function HeroDashboard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % notifications.length), 2600);
    return () => clearInterval(t);
  }, []);
  const shown = [notifications[i], notifications[(i + 1) % notifications.length], notifications[(i + 2) % notifications.length]];

  return (
    <div className="relative">
      {/* Floating currency symbols */}
      <div className="pointer-events-none absolute -inset-6 hidden md:block">
        {["₹", "$", "€", "£", "¥"].map((c, idx) => (
          <span
            key={c}
            className="absolute text-2xl font-bold text-electric/40 animate-floatY"
            style={{
              left: `${[3, 88, 8, 92, 45][idx]}%`,
              top: `${[10, 20, 70, 60, -6][idx]}%`,
              animationDelay: `${idx * 0.5}s`,
            }}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="relative rounded-3xl bg-gradient-dark p-1 shadow-glow">
        <div className="rounded-[22px] bg-navy overflow-hidden">
          {/* Dashboard chrome */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="text-[11px] font-mono text-white/40">dashboard.jatpatpay.com</div>
            <div className="w-8" />
          </div>

          <div className="p-5 grid grid-cols-2 gap-4">
            {/* KPI */}
            <div className="col-span-2 grid grid-cols-3 gap-3">
              {[
                { label: "Today", value: "₹1,84,320", trend: "+18%", icon: TrendingUp },
                { label: "International", value: "$12,480", trend: "+24%", icon: Globe2 },
                { label: "Success rate", value: "99.2%", trend: "+0.4%", icon: Check },
              ].map((k) => (
                <div key={k.label} className="rounded-xl bg-white/5 border border-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-white/50">{k.label}</span>
                    <k.icon className="h-3.5 w-3.5 text-cyan" />
                  </div>
                  <div className="mt-1 text-base font-bold text-white">{k.value}</div>
                  <div className="text-[10px] text-mint">{k.trend}</div>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="col-span-2 rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-white/50">Payment volume</div>
                  <div className="text-lg font-bold text-white">₹24.8L this week</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-md bg-mint/15 text-mint font-medium">Live</div>
              </div>
              <svg viewBox="0 0 300 80" className="w-full h-16">
                <defs>
                  <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="oklch(0.62 0.22 258)" stopOpacity="0.5" />
                    <stop offset="1" stopColor="oklch(0.62 0.22 258)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 L30,50 L60,55 L90,40 L120,45 L150,30 L180,35 L210,22 L240,28 L270,15 L300,10 L300,80 L0,80 Z"
                  fill="url(#area)"
                />
                <path
                  d="M0,60 L30,50 L60,55 L90,40 L120,45 L150,30 L180,35 L210,22 L240,28 L270,15 L300,10"
                  fill="none"
                  stroke="oklch(0.62 0.22 258)"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Notifications */}
            <div className="col-span-2 space-y-2">
              {shown.map((n, idx) => (
                <div
                  key={`${n.title}-${idx}-${i}`}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/5 p-3 animate-float-up"
                  style={{ animationDelay: `${idx * 0.08}s`, opacity: 1 - idx * 0.15 }}
                >
                  <div className="relative">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mint/15 text-mint">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="absolute inset-0 rounded-lg bg-mint/40 animate-ping-slow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{n.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                        {n.tag}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 truncate">{n.method}</div>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{n.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
