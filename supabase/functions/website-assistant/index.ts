const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

const reply = (message: string) => {
  const text = message.toLowerCase();
  if (text.includes("link"))
    return "Jatpat Pay supports payment links so you can collect payments without building a full checkout. Ask our team for a setup walkthrough.";
  if (text.includes("price") || text.includes("pricing") || text.includes("cost"))
    return "We can tailor pricing to your payment volume and business needs. Share your business type and expected monthly volume, and our team will follow up.";
  return "I can help with payments, payment links, international acceptance, pricing questions, and connecting you with the Jatpat Pay team. What would you like to automate?";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const headers = { ...corsHeaders, "content-type": "application/json" };
  if (request.method !== "POST")
    return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers });
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1200) : "";
  if (!message)
    return new Response(JSON.stringify({ error: "message is required" }), { status: 400, headers });
  return new Response(JSON.stringify({ reply: reply(message), mode: "guided" }), { headers });
});
