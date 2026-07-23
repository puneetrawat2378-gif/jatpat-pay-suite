# Jatpat Pay — Merchant Onboarding, Internal Review & Razorpay Test Mode

This is a very large build. I'll ship it in **four phases** so you can review each phase before the next lands. Everything below explicitly separates **Jatpat Pay internal review** from **Razorpay account / KYC / activation** — no fake regulatory language anywhere.

---

## Positioning guardrails (applied everywhere)

All UI copy and DB status names use language like:
- "Jatpat Pay internal review"
- "Provider verification (Razorpay)"
- "Payment activation"

Never used: "KYC verified", "RBI approved", "PCI certified", "Bank verified" (unless a real provider response supports it), "Razorpay partner".

---

## Phase 1 — Data model, roles, storage, audit

**Migration** (single call, GRANTs + RLS + policies inline):

New tables:
- `merchant_onboarding` — one row per merchant, JSONB per step (`business_details`, `business_type`, `address`, `representatives`, `website_review`, `payment_requirements`, `bank_info_masked`, `declaration`), `current_step`, `completion_percent`, `internal_status` enum.
- `merchant_documents` — private metadata; storage path in a **private** bucket `merchant-documents`; fields exactly as spec (id, merchant_id, category, type, storage_path, safe filename, mime, size, review_status, uploaded_by/at, reviewed_by/at, safe_rejection_reason).
- `merchant_bank_accounts` — encrypted-at-rest columns, only masked last-4 exposed to merchant dashboard reads via a view.
- `merchant_representatives`, `merchant_addresses`.
- `information_requests` — admin→merchant request/response thread with section + safe message + status.
- `internal_review_events` — append-only audit log; no UPDATE/DELETE policy for non-super-admin.
- `internal_risk_cases` + `internal_risk_signals` — reviewer-only.
- `provider_accounts` — per-merchant Razorpay linkage + `provider_status` enum (`not_connected`…`live_connected`).
- `provider_capabilities` — per-feature capability status.
- `admin_assignments` — reviewer queue assignment.

Enums:
- `auth_state`: email_unverified, active, restricted, suspended, disabled
- `merchant_internal_status`: draft, onboarding, submitted, under_internal_review, action_required, internally_approved, internally_rejected, restricted, suspended
- `provider_status`, `capability_status`, `document_review_status`, `info_request_status`, `risk_status` — exactly the values in your spec.

**Roles** extended in existing `app_role`:
`support_agent`, `verification_reviewer`, `risk_reviewer`, `admin`, `super_admin` (merchant roles already exist).

Helper SECURITY DEFINER fns:
- `is_platform_admin(uid)`, `is_verification_reviewer(uid)`, `is_risk_reviewer(uid)`, `is_super_admin(uid)` — read from a new `platform_admin_roles` table (separate from merchant_members, never based on email).

RLS: every table gets policies scoped to merchant membership OR platform admin role. Storage bucket `merchant-documents` **private** with policies restricting read to (a) uploading merchant's owner/admin, (b) verification/super admins.

---

## Phase 2 — Merchant onboarding UI (10 steps)

Route: `/dashboard/onboarding` (layout) with children `.step-1` … `.step-10` and a shared progress rail.

Components:
- `OnboardingLayout` — sticky progress (`70% Complete`), Prev/Save Draft/Continue/Submit, autosave per section via `saveOnboardingSection` server fn.
- Step forms use `react-hook-form` + `zod`. Each step schema validated client- and server-side.
- Bank step: writes to server fn, response returns **masked** value only; UI never re-reads full account number.
- Documents step: uploads through a signed-URL server fn → private bucket; UI shows category-driven required list computed from business type + category (configurable table `document_requirements`).
- Declaration step stores version snapshots.
- Step 10 review page + `submitMerchantApplication` server fn (backend re-validates all required fields, then transitions `draft → submitted → under_internal_review`).

Post-submit page: "Application Submitted" with reference `JPP-M-XXXXXXXX`, explicit note that internal review ≠ Razorpay KYC.

**Verification Overview** at `/dashboard/verification`: six independent cards (Jatpat Pay Internal Review, Razorpay Account Status, Provider Verification, Domestic Payments, International Payments, Live Mode). Each reads its own status; no cross-mapping.

---

## Phase 3 — Admin review console

New route tree `/admin/*`, gated by `is_platform_admin` in `beforeLoad`, using the existing `_authenticated` layout PLUS a `_admin` pathless layout.

- `/admin/verification` — summary cards + queue with filters + priority; sensitive fields hidden in list.
- `/admin/verification/$merchantRef` — full workspace: Overview, Business Details, Representatives, Documents, Bank Info (masked), Website Review, Payment Requirements, Internal Risk Review, Provider Status, Review History, Audit Logs.
- Reviewer actions: Assign to me, Request Information (modal with section + safe message), Mark Section Reviewed, Escalate to Enhanced Review, Internally Approve (confirmation modal with the exact spec copy), Internally Reject, Restrict Merchant.
- Document review inline: Accept / Request Replacement / Reject / Escalate — with safe rejection reason picker.
- Risk review sub-tab: signals list, reviewer notes (admin-only RLS), decision.
- All actions write to `internal_review_events`.

Merchant side of information requests: banner "Action Required", deep link to the specific section, response threads status transitions (`open → merchant_responded → under_review → resolved`).

---

## Phase 4 — Razorpay Test Mode setup

`/dashboard/settings/payment-provider/razorpay`:
- Banner: "Razorpay Test Mode — Test transactions do not move real money."
- Show `provider_status` from `provider_accounts`.
- Credential entry via **`add_secret`** flow — never stored in DB, never redisplayed. Fields show `••••••••` when configured; only "Replace" action available.
- Test connection button → server fn calls Razorpay `GET /v1/payments?count=1` with the stored secret to verify credentials, then flips status to `test_connected`.
- Webhook setup card: shows the fixed URL `/api/public/webhooks/razorpay` (already implemented), copy button, list of expected event names from current Razorpay docs, and a **verified test-webhook indicator** driven by real received `webhook_events` rows (not faked).
- Test payment flow: "Send Test Payment" button creates a ₹1 test order via existing payment fns and shows live status; requires a captured test payment plus a signed webhook event received before flipping a computed "Test Mode Ready" flag.
- **Live Mode Readiness** page (already exists) is extended with the new checks: internal review approved, provider credentials verified, webhook received, capabilities requested. Live Mode itself remains gated behind Razorpay's own activation — the UI states this explicitly and links to Razorpay's official account activation.

Explicitly **not built**: any partner-onboarding/sub-merchant/account-creation SDK calls. The provider status page instructs the merchant to activate through Razorpay's official process.

---

## Auth & security additions

- Extend auth pages already scaffolded with: Email Verification landing, Account Locked, Session Expired (public routes).
- Backend `authState` middleware: server fns check `auth_state` before allowing merchant-scoped writes; `email_unverified` blocks onboarding submit; `restricted`/`suspended` blocks all merchant writes with a typed 403.
- Increase Supabase `rate_limit_email_sent` via `configure_auth` at end of phase 1.
- Configure Lovable auth email templates via `email_domain--scaffold_auth_email_templates` (I'll ask about the sending domain when we get there).

---

## Technical details

- **No** invented Razorpay endpoints/algorithms. Only endpoints already in `src/lib/razorpay.server.ts` (Orders API, Payments Fetch, Refunds API, HMAC-SHA256 webhook verification per docs) are used; anything new is added only after re-reading current Razorpay docs.
- Storage: private bucket via `supabase--storage_create_bucket`; access via signed URLs from server fns only.
- Bank account numbers stored via `pgcrypto` (`pgp_sym_encrypt`) with key from env; only masked-last-4 exposed through a view.
- All admin-mutating server fns use `requireSupabaseAuth` + platform role check + audit-log insert in a single transaction (via `rpc` SECURITY DEFINER helpers).
- Every new public-schema table follows the CREATE → GRANT → ENABLE RLS → POLICY order in one migration.
- Client-reachable `.functions.ts` files never top-level-import `client.server`; admin client is loaded inside handlers with `await import(...)`.

---

## What I need from you before I start

1. **Confirm the phase order** above (data model → merchant UI → admin console → Razorpay setup). I can also do it all in one go if you prefer, but review will be harder.
2. **First platform admin**: give me the email of the user who should be granted `super_admin` after phase 1 (I'll insert them via `supabase--insert` post-migration — no email-based auth).
3. **Bank encryption key**: I'll generate one via `generate_secret` as `BANK_ENCRYPTION_KEY` unless you want a specific value.
4. **Auth email domain**: do you already have a domain you want to use for outbound auth emails, or should we use Lovable's default sender for now and set up a custom domain later?

Reply with answers (or just "go" to accept all defaults and start phase 1) and I'll begin.