const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });

const fallback = (message: string): string => {
  const normalized = message.toLowerCase();
  if (normalized.includes("price") || normalized.includes("pricing") || normalized.includes("cost"))
    return "We can tailor pricing to your payment volume and business needs. Share your business type and expected monthly volume, and our team will follow up.";
  if (normalized.includes("payment link") || normalized.includes("link"))
    return "Jatpat Pay supports payment links so you can collect payments without building a full checkout. Ask our team for a setup walkthrough.";
  if (normalized.includes("international") || normalized.includes("global"))
    return "Jatpat Pay is designed for businesses preparing to accept domestic and international payments. Our team can explain supported corridors and settlement options.";
  if (
    normalized.includes("support") ||
    normalized.includes("human") ||
    normalized.includes("contact")
  )
    return "You can reach the team at support@jatpatpay.com or +91 9999861327. Tell me your question and I can collect the details for a follow-up.";
  return "I can help with payments, payment links, international acceptance, pricing questions, and connecting you with the Jatpat Pay team. What would you like to automate?";
};

async function llmReply(
  message: string,
  history: Array<{ role: string; content: string }>,
): Promise<string | null> {
  const apiKey = Deno.env.get("AI_API_KEY");
  const baseUrl = Deno.env.get("AI_API_BASE_URL");
  const model = Deno.env.get("AI_MODEL") ?? "gpt-4o-mini";
  if (!apiKey || !baseUrl) return null;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "You are Jatpat Pay's concise business assistant. Answer only from this known context: Jatpat Pay helps businesses accept payments, create payment links, prepare for international payments, and connect with sales/support. Never invent pricing, regulatory approvals, guarantees, or unsupported features. If unsure, ask for contact details and offer human follow-up.",
        },
        ...history.slice(-6),
        { role: "user", content: message },
      ],
    }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1200) : "";
  if (!message) return json({ error: "message is required" }, 400);
  const history = Array.isArray(body?.history)
    ? body.history.filter((item: any) => item && typeof item.content === "string").slice(-8)
    : [];
  const reply = await llmReply(message, history).catch(() => null);
  return json({ reply: reply ?? fallback(message), mode: reply ? "ai" : "guided" });
});
