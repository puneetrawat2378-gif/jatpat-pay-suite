import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "privacy — Jatpat Pay" }] }),
  component: () => (
    <div className="min-h-screen bg-background text-foreground py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-3xl font-bold">privacy policy</h1>
        <p className="mt-4 text-muted-foreground">This document is being prepared. A production-grade privacy policy will be published before Live Mode is enabled.</p>
      </div>
    </div>
  ),
});
