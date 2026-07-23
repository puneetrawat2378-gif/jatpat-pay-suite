import {
  Smartphone, QrCode, Store, Phone, Tv, Zap, Droplet, Flame, Wifi, Car,
  CreditCard, Landmark, ShieldCheck, Send, Building2, Fingerprint, HandCoins,
  Wallet, ScrollText, Receipt, IdCard, FileBadge, Globe2, Coins, Gift,
  Repeat, Users, Server, ShoppingBag, Layers, Banknote, Package, Lock,
  Cpu, ArrowLeftRight, PiggyBank, KeyRound, Rocket, Briefcase, Building,
} from "lucide-react";

type Svc = { icon: any; title: string; desc: string; tint: string };

const services: Svc[] = [
  { icon: Smartphone, title: "UPI Payments", desc: "Instant UPI collect and pay across all major apps.", tint: "electric" },
  { icon: QrCode, title: "QR Code Payments", desc: "Dynamic and static QR for shops and events.", tint: "cyan" },
  { icon: Store, title: "Merchant Payments", desc: "In-store checkout for retail and services.", tint: "mint" },
  { icon: Phone, title: "Mobile Recharge", desc: "Prepaid recharges for every operator.", tint: "electric" },
  { icon: Tv, title: "DTH Recharge", desc: "All major DTH providers in one place.", tint: "cyan" },
  { icon: Zap, title: "Electricity Bill", desc: "Pay electricity bills instantly, 24×7.", tint: "mint" },
  { icon: Droplet, title: "Water Bill", desc: "Municipal water bill payments made simple.", tint: "electric" },
  { icon: Flame, title: "Gas Bill", desc: "Piped gas and cylinder booking bills.", tint: "cyan" },
  { icon: Wifi, title: "Broadband Bill", desc: "Pay ISP and fiber bills in seconds.", tint: "mint" },
  { icon: Car, title: "FASTag Recharge", desc: "Top up FASTag for hassle-free tolls.", tint: "electric" },
  { icon: CreditCard, title: "Credit Card Bill", desc: "Pay any bank credit card bill.", tint: "cyan" },
  { icon: Landmark, title: "Loan EMI Payment", desc: "Never miss an EMI due date again.", tint: "mint" },
  { icon: ShieldCheck, title: "Insurance Premium", desc: "Life, health and vehicle insurance premiums.", tint: "electric" },
  { icon: Send, title: "Money Transfer", desc: "Send money to anyone, anywhere.", tint: "cyan" },
  { icon: Building2, title: "Bank Transfer", desc: "IMPS, NEFT and RTGS transfers.", tint: "mint" },
  { icon: Fingerprint, title: "AEPS", desc: "Aadhaar Enabled Payment System.", tint: "electric" },
  { icon: Cpu, title: "Micro ATM", desc: "Card-based cash services on the go.", tint: "cyan" },
  { icon: HandCoins, title: "Cash Withdrawal", desc: "Withdraw cash via AEPS or Micro ATM.", tint: "mint" },
  { icon: Banknote, title: "Cash Deposit", desc: "Deposit cash to any bank account.", tint: "electric" },
  { icon: ScrollText, title: "Mini Statement", desc: "Fetch mini statements for customers.", tint: "cyan" },
  { icon: IdCard, title: "PAN Card Services", desc: "New PAN, correction and reprint services.", tint: "mint" },
  { icon: FileBadge, title: "Aadhaar Services", desc: "Aadhaar utility services for retailers.", tint: "electric" },
  { icon: Receipt, title: "GST Payments", desc: "GST challan payments made easy.", tint: "cyan" },
  { icon: Layers, title: "BBPS Services", desc: "Bharat Bill Payment System, all billers.", tint: "mint" },
  { icon: Wallet, title: "Wallet Services", desc: "Load, spend and manage wallet balance.", tint: "electric" },
  { icon: Gift, title: "Gift Cards", desc: "Buy and redeem popular brand gift cards.", tint: "cyan" },
  { icon: Globe2, title: "International Transfer", desc: "Send money across borders securely.", tint: "mint" },
  { icon: ArrowLeftRight, title: "International Payments", desc: "Accept payments from global customers.", tint: "electric" },
  { icon: CreditCard, title: "Visa & Mastercard", desc: "Global card acceptance out of the box.", tint: "cyan" },
  { icon: Rocket, title: "Payment Gateway", desc: "Accept payments on your website or app.", tint: "mint" },
  { icon: KeyRound, title: "API Integration", desc: "Developer-first REST APIs and SDKs.", tint: "electric" },
  { icon: ShoppingBag, title: "Online Store Checkout", desc: "Plug-and-play checkout for stores.", tint: "cyan" },
  { icon: Repeat, title: "Subscription Payments", desc: "Recurring billing with retries.", tint: "mint" },
  { icon: PiggyBank, title: "Recurring Payments", desc: "Auto-debit on the schedule you choose.", tint: "electric" },
  { icon: Package, title: "Bulk Payouts", desc: "Send thousands of payouts in one click.", tint: "cyan" },
  { icon: Users, title: "Payroll Payments", desc: "Automated salary disbursals every cycle.", tint: "mint" },
  { icon: Briefcase, title: "Vendor Payments", desc: "Pay vendors and suppliers on time.", tint: "electric" },
  { icon: Lock, title: "Escrow Information", desc: "Learn how secure escrow protects payments.", tint: "cyan" },
  { icon: Coins, title: "Crypto (Info Only)", desc: "Educational information on crypto rails.", tint: "mint" },
  { icon: Server, title: "Business Gateway", desc: "Enterprise-grade infrastructure and SLAs.", tint: "electric" },
  { icon: Building, title: "Enterprise Solutions", desc: "Custom flows for large merchants.", tint: "cyan" },
];

function tintClass(t: string) {
  if (t === "cyan") return "from-cyan/20 to-cyan/5 text-cyan";
  if (t === "mint") return "from-mint/20 to-mint/5 text-mint";
  return "from-electric/20 to-electric/5 text-electric";
}

export function ServicesGrid() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/5 px-3 py-1 text-xs font-semibold text-electric mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-electric" />
            Our Services
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-display">
            All Your Payment Solutions in{" "}
            <span className="text-gradient">One Place</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From UPI collections to international payouts — a complete stack for
            individuals, merchants, and businesses.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:shadow-glow"
              style={{ animationDelay: `${(i % 8) * 40}ms` }}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tintClass(s.tint)}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-bold font-display">{s.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
              <div className="mt-4 text-xs font-semibold text-electric opacity-0 transition group-hover:opacity-100">
                Learn more →
              </div>
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-brand opacity-0 blur-xl transition group-hover:opacity-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}