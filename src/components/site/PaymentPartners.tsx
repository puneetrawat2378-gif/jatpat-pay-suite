const partners = [
  "UPI", "Visa", "Mastercard", "RuPay", "PayPal", "Stripe",
  "Razorpay", "PhonePe", "Google Pay", "Amazon Pay", "BHIM", "Apple Pay",
];

export function PaymentPartners() {
  const doubled = [...partners, ...partners];
  return (
    <section className="py-16 border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Trusted networks and platforms we work with
        </div>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex gap-10 animate-marquee w-max">
            {doubled.map((p, i) => (
              <div
                key={`${p}-${i}`}
                className="flex h-14 min-w-[140px] items-center justify-center rounded-xl border border-border bg-card px-6 text-base font-bold font-display text-foreground/70 transition hover:text-electric hover:border-electric/40"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}