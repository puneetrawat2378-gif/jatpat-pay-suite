const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const setupSecret = Deno.env.get("GMAIL_WATCH_SETUP_SECRET");
  if (!setupSecret || request.headers.get("x-setup-secret") !== setupSecret)
    return json({ error: "Unauthorized" }, 401);

  const token = await accessToken();
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/watch", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      topicName: `projects/${Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")}/topics/${Deno.env.get("GOOGLE_PUBSUB_TOPIC")}`,
      labelIds: ["INBOX"],
      labelFilterBehavior: "INCLUDE",
    }),
  });
  if (!response.ok)
    return json(
      { error: "Gmail watch setup failed", details: await response.text() },
      response.status,
    );
  return json({
    ok: true,
    watch: await response.json(),
    renew_before: "Renew before the returned expiration; Gmail watches expire.",
  });
}

Deno.serve(handler);
