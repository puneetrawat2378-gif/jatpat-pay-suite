import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MATCH_TERMS = ["ai agent", "automation"];
const DRAFT_TEXT =
  "Thanks for your interest in AI agent automation! We provide high-quality AI solutions to automate your business. Let's discuss how we can help you.";

type GmailHeader = { name?: string; value?: string };
type GmailMessage = {
  id: string;
  threadId?: string;
  snippet?: string;
  payload?: { headers?: GmailHeader[]; parts?: unknown[]; body?: { data?: string } };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function base64UrlDecode(value: string): string {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getHeader(message: GmailMessage, name: string): string {
  return (
    message.payload?.headers
      ?.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value?.trim() ?? ""
  );
}

function collectText(part: any): string {
  if (part?.mimeType === "text/plain" && part.body?.data) return base64UrlDecode(part.body.data);
  return (part?.parts ?? []).map(collectText).join("\n");
}

function messageText(message: GmailMessage): string {
  return [message.snippet ?? "", collectText(message.payload)].join(" ").toLowerCase();
}

function matches(message: GmailMessage): boolean {
  const text = messageText(message);
  return MATCH_TERMS.some((term) => text.includes(term));
}

async function accessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      refresh_token: Deno.env.get("GOOGLE_REFRESH_TOKEN") ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth token exchange failed (${response.status})`);
  const payload = await response.json();
  if (!payload.access_token)
    throw new Error("Google OAuth response did not include an access token");
  return payload.access_token;
}

async function gmailRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok)
    throw new Error(`Gmail API ${path} failed (${response.status}): ${await response.text()}`);
  return (await response.json()) as T;
}

function replyMime(message: GmailMessage): string {
  const from = getHeader(message, "From");
  const originalSubject = getHeader(message, "Subject");
  const messageId = getHeader(message, "Message-ID");
  const subject = originalSubject.toLowerCase().startsWith("re:")
    ? originalSubject
    : `Re: ${originalSubject}`;
  const lines = [
    `To: ${from}`,
    `Subject: ${subject}`,
    messageId ? `In-Reply-To: ${messageId}` : "",
    messageId ? `References: ${messageId}` : "",
    "Content-Type: text/plain; charset=UTF-8",
    "MIME-Version: 1.0",
    "",
    DRAFT_TEXT,
  ].filter(Boolean);
  return lines.join("\r\n");
}

async function createDraft(token: string, message: GmailMessage): Promise<void> {
  await gmailRequest(token, "/drafts", {
    method: "POST",
    body: JSON.stringify({
      message: { threadId: message.threadId, raw: base64UrlEncode(replyMime(message)) },
    }),
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "GET")
    return json({ ok: true, service: "gmail-pubsub", mode: "draft-only" });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedToken = Deno.env.get("GMAIL_PUBSUB_VERIFICATION_TOKEN");
  if (expectedToken && request.headers.get("x-goog-channel-token") !== expectedToken)
    return json({ error: "Invalid verification token" }, 401);

  const body = await request.json().catch(() => null);
  const encoded = body?.message?.data;
  if (!encoded) return json({ ok: true, ignored: "missing Pub/Sub message data" });

  const notification = JSON.parse(base64UrlDecode(encoded));
  const emailAddress = notification.emailAddress;
  const historyId = notification.historyId;
  const configuredEmail = Deno.env.get("GMAIL_USER_EMAIL");
  if (!emailAddress || !historyId || (configuredEmail && emailAddress !== configuredEmail))
    return json({ ok: true, ignored: "unconfigured mailbox" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const token = await accessToken();
  const state = await supabase
    .from("gmail_automation_state")
    .select("last_history_id")
    .eq("mailbox", emailAddress)
    .maybeSingle();
  const startHistoryId = state.data?.last_history_id ?? historyId;
  const history = await gmailRequest<any>(
    token,
    `/history?startHistoryId=${encodeURIComponent(startHistoryId)}&historyTypes=messageAdded&maxResults=100`,
  );
  const messageIds = new Set<string>();
  for (const record of history.history ?? [])
    for (const added of record.messagesAdded ?? [])
      if (added.message?.id) messageIds.add(added.message.id);

  let draftsCreated = 0;
  for (const messageId of messageIds) {
    const message = await gmailRequest<GmailMessage>(
      token,
      `/messages/${encodeURIComponent(messageId)}?format=full`,
    );
    if (!matches(message)) continue;
    const inserted = await supabase
      .from("gmail_automation_events")
      .insert({
        mailbox: emailAddress,
        gmail_message_id: message.id,
        history_id: historyId,
        status: "processing",
      })
      .select("id")
      .maybeSingle();
    if (inserted.error || !inserted.data) continue;
    try {
      await createDraft(token, message);
      await supabase
        .from("gmail_automation_events")
        .update({ status: "draft_created", processed_at: new Date().toISOString() })
        .eq("id", inserted.data.id);
      draftsCreated++;
    } catch (error) {
      await supabase
        .from("gmail_automation_events")
        .update({
          status: "error",
          error_message: String(error),
          processed_at: new Date().toISOString(),
        })
        .eq("id", inserted.data.id);
      throw error;
    }
  }

  await supabase
    .from("gmail_automation_state")
    .upsert({
      mailbox: emailAddress,
      last_history_id: historyId,
      updated_at: new Date().toISOString(),
    });
  return json({
    ok: true,
    mailbox: emailAddress,
    history_id: historyId,
    inspected: messageIds.size,
    drafts_created: draftsCreated,
    mode: "draft-only",
  });
}

Deno.serve(handler);
