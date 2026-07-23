import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/refund")({
  head: () => ({ meta: [{ title: "refund — Jatpat Pay" }] }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-3xl font-bold">refund policy</h1>
        <p className="mt-4 text-muted-foreground">This document is being prepared. A production-grade refund policy will be published before Live Mode is enabled.</p>
      </div>
    </div>
  ),
});
