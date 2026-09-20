# Jatpat Pay automation setup

This repository now contains a website assistant and a Gmail Pub/Sub draft-only workflow. The Gmail workflow never sends mail: matching messages create Gmail drafts for review.

## Website assistant

Deploy the `website-assistant` Supabase Edge Function. It uses guided, deterministic replies by default. To enable an OpenAI-compatible model, add `AI_API_KEY`, `AI_API_BASE_URL`, and optionally `AI_MODEL` as Supabase function secrets. The function is intentionally constrained to Jatpat Pay's known business context and falls back to safe responses if the model is unavailable.

## Gmail Pub/Sub workflow

Deploy `gmail-pubsub` and `gmail-watch` as Supabase Edge Functions. Add these secrets to both functions where applicable:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CLOUD_PROJECT_ID` — the exact Google Cloud project ID, not only the display name
- `GOOGLE_PUBSUB_TOPIC` — `gmail-notifications`
- `GMAIL_USER_EMAIL` — `aiagentconsumer@gmail.com`
- `GMAIL_PUBSUB_VERIFICATION_TOKEN`
- `GMAIL_WATCH_SETUP_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Enable the Gmail API and Pub/Sub API in the Google Cloud project. Create the topic `gmail-notifications` and grant the Gmail push service account publisher access to it. The OAuth grant must include permissions to read matching messages and create drafts. Create a Pub/Sub push subscription pointing to:

`https://<supabase-project-ref>.supabase.co/functions/v1/gmail-pubsub`

Run `gmail-watch` once with `POST` and the `x-setup-secret` header. Gmail watches expire and must be renewed before the returned expiration time. A small scheduled renewal job is recommended.

The workflow matches message content, subject, and snippets containing `AI agent` or `automation`. It creates this reply as a draft:

> Thanks for your interest in AI agent automation! We provide high-quality AI solutions to automate your business. Let's discuss how we can help you.

Deduplication is enforced by `gmail_automation_events` so repeated Pub/Sub deliveries do not create repeated drafts for the same Gmail message.

## Database migration

Apply `supabase/migrations/20260920100000_gmail_automation.sql` before deploying the functions. The automation tables have no public or authenticated access policies; only the service role used by the function can write them.

## WhatsApp

WhatsApp is not connected in this repository yet. Add Meta WhatsApp Cloud API credentials through secure function secrets before implementing inbound webhooks and outbound replies. Do not place those credentials in the frontend or commit them to Git.
