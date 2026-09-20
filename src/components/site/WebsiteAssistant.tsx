import { useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const welcome =
  "Hi, I’m the Jatpat Pay assistant. Ask me about payment links, international payments, pricing, or connecting with our team.";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function WebsiteAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: welcome },
  ]);

  const send = async () => {
    const message = draft.trim();
    if (!message || loading) return;
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setDraft("");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("website-assistant", {
      body: { message, history: next },
    });
    setLoading(false);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: error
          ? "I’m having trouble connecting right now. Please email support@jatpatpay.com and our team will help."
          : data.reply,
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40">
      {open && (
        <div className="mb-3 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
          <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Jatpat Pay assistant</span>
            </div>
            <button aria-label="Close assistant" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${item.role === "user" ? "ml-auto bg-electric text-white" : "bg-muted text-foreground"}`}
              >
                {item.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about your business…"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-electric/40"
              aria-label="Message the Jatpat Pay assistant"
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              aria-label="Send message"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-electric text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-mint ring-2 ring-background animate-pulse-glow" />
        )}
      </button>
    </div>
  );
}
