import { Construction } from "lucide-react";

export function StubPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
        <Construction className="h-10 w-10 text-electric mx-auto" />
        <div className="mt-4 font-semibold text-lg">Coming next</div>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          This section is scaffolded and ready. The full interface will land in the next iteration.
        </p>
      </div>
    </div>
  );
}
