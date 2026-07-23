import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listWebhookEvents } from "@/lib/refunds.functions";
import { Webhook } from "lucide-react";

export const Route = createFileRoute("/dashboard/webhooks")({
  component: WebhooksPage,
});

function WebhooksPage() {
  const fetchFn = useServerFn(listWebhookEvents);
  const { data: events } = useQuery({ queryKey: ["webhook_events"], queryFn: () => fetchFn() });

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/public/webhooks/razorpay`
    : "/api/public/webhooks/razorpay";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Webhook className="h-6 w-6 text-electric" /> Webhooks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verified provider events. Every event is signature-checked before it lands here.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs uppercase text-muted-foreground">Razorpay webhook URL</div>
        <div className="mt-2 font-mono text-sm break-all bg-muted/30 border border-border rounded-lg p-3">{webhookUrl}</div>
        <p className="text-xs text-muted-foreground mt-2">Paste this URL into your Razorpay Dashboard → Settings → Webhooks. Use the webhook secret you added to Jatpat Pay backend secrets.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Provider event id</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Received</th>
              <th className="px-4 py-2 text-left">Processed</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No webhook events received yet.</td></tr>}
            {(events ?? []).map((e: any) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{e.event_type}</td>
                <td className="px-4 py-2 font-mono text-xs">{e.provider_event_id.slice(0, 24)}…</td>
                <td className="px-4 py-2 text-xs uppercase">{e.processing_status}</td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(e.received_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{e.processed_at ? new Date(e.processed_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
