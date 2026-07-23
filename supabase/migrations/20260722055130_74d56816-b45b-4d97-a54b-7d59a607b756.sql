
-- ============================================================
-- PHASE 1: Onboarding, internal review, admin verification
-- ============================================================

-- ---------- ENUMS ----------
CREATE TYPE public.platform_role AS ENUM (
  'support_agent','verification_reviewer','risk_reviewer','admin','super_admin'
);

CREATE TYPE public.auth_state AS ENUM (
  'email_unverified','active','restricted','suspended','disabled'
);

CREATE TYPE public.merchant_internal_status AS ENUM (
  'draft','onboarding','submitted','under_internal_review',
  'action_required','internally_approved','internally_rejected',
  'restricted','suspended'
);

CREATE TYPE public.provider_status AS ENUM (
  'not_connected','test_credentials_required','test_connected',
  'configuration_error','provider_activation_required','provider_review',
  'live_available','live_connected','restricted'
);

CREATE TYPE public.capability_status AS ENUM (
  'not_requested','requested','internal_review','provider_activation_required',
  'provider_review','enabled','restricted','unavailable'
);

CREATE TYPE public.document_review_status AS ENUM (
  'not_uploaded','uploaded','under_internal_review','action_required',
  'internally_accepted','internally_rejected','provider_submission_required','provider_review_pending'
);

CREATE TYPE public.info_request_status AS ENUM (
  'open','merchant_responded','under_review','resolved','cancelled'
);

CREATE TYPE public.risk_status AS ENUM (
  'not_reviewed','standard_review','enhanced_review','escalated','restricted','closed'
);

-- ---------- profiles.auth_state ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_state public.auth_state NOT NULL DEFAULT 'email_unverified';

-- ---------- merchants.merchant_ref (JPP-M-XXXXXXXX) ----------
CREATE OR REPLACE FUNCTION public.generate_merchant_ref()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'JPP-M-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
$$;

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS merchant_ref text UNIQUE;

UPDATE public.merchants SET merchant_ref = public.generate_merchant_ref() WHERE merchant_ref IS NULL;

ALTER TABLE public.merchants
  ALTER COLUMN merchant_ref SET NOT NULL,
  ALTER COLUMN merchant_ref SET DEFAULT public.generate_merchant_ref();

-- ============================================================
-- platform_admins
-- ============================================================
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.platform_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER, referenced by later policies)
CREATE OR REPLACE FUNCTION public.has_platform_role(_user uuid, _role public.platform_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user
      AND role IN ('verification_reviewer','risk_reviewer','admin','super_admin','support_agent')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_verification_reviewer(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user AND role IN ('verification_reviewer','admin','super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_risk_reviewer(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user AND role IN ('risk_reviewer','admin','super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user AND role = 'super_admin')
$$;

-- platform_admins policies
CREATE POLICY "platform admins visible to admins"
  ON public.platform_admins FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "super admins manage platform admins"
  ON public.platform_admins FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================================
-- merchant_onboarding
-- ============================================================
CREATE TABLE public.merchant_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
  internal_status public.merchant_internal_status NOT NULL DEFAULT 'draft',
  current_step smallint NOT NULL DEFAULT 1,
  completion_percent smallint NOT NULL DEFAULT 0,
  business_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  business_type jsonb NOT NULL DEFAULT '{}'::jsonb,
  address_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  website_review jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  declaration jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  under_review_at timestamptz,
  internal_decision_at timestamptz,
  internal_decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.merchant_onboarding TO authenticated;
GRANT ALL ON public.merchant_onboarding TO service_role;
ALTER TABLE public.merchant_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding: merchant members read"
  ON public.merchant_onboarding FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "onboarding: merchant admins write"
  ON public.merchant_onboarding FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));
CREATE POLICY "onboarding: merchant admins update"
  ON public.merchant_onboarding FOR UPDATE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_verification_reviewer(auth.uid()))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_verification_reviewer(auth.uid()));

CREATE TRIGGER trg_onboarding_updated BEFORE UPDATE ON public.merchant_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- merchant_addresses
-- ============================================================
CREATE TABLE public.merchant_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('registered','operating')),
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'IN',
  review_status text NOT NULL DEFAULT 'not_reviewed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_addresses TO authenticated;
GRANT ALL ON public.merchant_addresses TO service_role;
ALTER TABLE public.merchant_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses read" ON public.merchant_addresses FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "addresses write" ON public.merchant_addresses FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));

CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON public.merchant_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- merchant_representatives
-- ============================================================
CREATE TABLE public.merchant_representatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role_in_business text,
  representative_type text NOT NULL,
  email text NOT NULL,
  phone text,
  identity_verification_provider text,
  identity_verification_status text NOT NULL DEFAULT 'information_submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_representatives TO authenticated;
GRANT ALL ON public.merchant_representatives TO service_role;
ALTER TABLE public.merchant_representatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reps read" ON public.merchant_representatives FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "reps write" ON public.merchant_representatives FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));

CREATE TRIGGER trg_reps_updated BEFORE UPDATE ON public.merchant_representatives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- merchant_documents (metadata only; files live in private storage bucket)
-- ============================================================
CREATE TABLE public.merchant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  document_category text NOT NULL,
  document_type text NOT NULL,
  storage_path text NOT NULL,
  original_filename_safe text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  review_status public.document_review_status NOT NULL DEFAULT 'uploaded',
  safe_rejection_reason text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_documents TO authenticated;
GRANT ALL ON public.merchant_documents TO service_role;
ALTER TABLE public.merchant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docs merchant read" ON public.merchant_documents FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_verification_reviewer(auth.uid()));
CREATE POLICY "docs merchant insert" ON public.merchant_documents FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));
CREATE POLICY "docs merchant delete" ON public.merchant_documents FOR DELETE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));
CREATE POLICY "docs reviewer update" ON public.merchant_documents FOR UPDATE TO authenticated
  USING (public.is_verification_reviewer(auth.uid()))
  WITH CHECK (public.is_verification_reviewer(auth.uid()));

CREATE TRIGGER trg_docs_updated BEFORE UPDATE ON public.merchant_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- merchant_bank_accounts (masked view exposed; full stored server-side)
-- ============================================================
CREATE TABLE public.merchant_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  account_number_encrypted text NOT NULL,
  account_number_last4 text NOT NULL,
  ifsc_code text NOT NULL,
  account_type text NOT NULL,
  bank_name text NOT NULL,
  internal_status text NOT NULL DEFAULT 'information_submitted',
  provider_verified boolean NOT NULL DEFAULT false,
  provider_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_bank_accounts TO authenticated;
GRANT ALL ON public.merchant_bank_accounts TO service_role;
ALTER TABLE public.merchant_bank_accounts ENABLE ROW LEVEL SECURITY;

-- No SELECT policy exposing raw encrypted column to merchant; use view below
CREATE POLICY "bank verify insert" ON public.merchant_bank_accounts FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));
CREATE POLICY "bank verify update" ON public.merchant_bank_accounts FOR UPDATE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_verification_reviewer(auth.uid()))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_verification_reviewer(auth.uid()));
-- Reviewers can also SELECT
CREATE POLICY "bank reviewer read" ON public.merchant_bank_accounts FOR SELECT TO authenticated
  USING (public.is_verification_reviewer(auth.uid()));

CREATE TRIGGER trg_bank_updated BEFORE UPDATE ON public.merchant_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Masked view for merchant dashboard reads
CREATE VIEW public.merchant_bank_accounts_masked
WITH (security_invoker=on) AS
SELECT id, merchant_id, account_holder_name,
       '••••••••' || account_number_last4 AS account_number_masked,
       account_number_last4, ifsc_code, account_type, bank_name,
       internal_status, provider_verified, provider_verified_at, created_at, updated_at
FROM public.merchant_bank_accounts;

GRANT SELECT ON public.merchant_bank_accounts_masked TO authenticated;

-- Allow merchant members to see masked view rows (view uses security_invoker, so it needs a table-level SELECT policy)
CREATE POLICY "bank masked merchant read" ON public.merchant_bank_accounts FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
-- NOTE: this SELECT policy applies to the base table too, but merchant frontend must query the view (never the raw column). Server functions do decryption using service role.

-- ============================================================
-- information_requests + messages
-- ============================================================
CREATE TABLE public.information_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  section text NOT NULL,
  status public.info_request_status NOT NULL DEFAULT 'open',
  opened_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.information_requests TO authenticated;
GRANT ALL ON public.information_requests TO service_role;
ALTER TABLE public.information_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info req read" ON public.information_requests FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "info req reviewer insert" ON public.information_requests FOR INSERT TO authenticated
  WITH CHECK (public.is_verification_reviewer(auth.uid()));
CREATE POLICY "info req update" ON public.information_requests FOR UPDATE TO authenticated
  USING (public.is_verification_reviewer(auth.uid()) OR public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]))
  WITH CHECK (public.is_verification_reviewer(auth.uid()) OR public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));

CREATE TRIGGER trg_info_req_updated BEFORE UPDATE ON public.information_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.information_request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.information_requests(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_kind text NOT NULL CHECK (author_kind IN ('merchant','reviewer','system')),
  safe_message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.information_request_messages TO authenticated;
GRANT ALL ON public.information_request_messages TO service_role;
ALTER TABLE public.information_request_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "info msg read" ON public.information_request_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.information_requests r
    WHERE r.id = request_id
      AND (public.is_merchant_member(auth.uid(), r.merchant_id) OR public.is_platform_admin(auth.uid()))
  ));
CREATE POLICY "info msg insert" ON public.information_request_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.information_requests r
    WHERE r.id = request_id
      AND (public.has_any_merchant_role(auth.uid(), r.merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_verification_reviewer(auth.uid()))
  ));

-- ============================================================
-- internal_review_events (append-only)
-- ============================================================
CREATE TABLE public.internal_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  section text,
  previous_status text,
  new_status text,
  safe_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.internal_review_events TO authenticated;
GRANT ALL ON public.internal_review_events TO service_role;
ALTER TABLE public.internal_review_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events read merchant" ON public.internal_review_events FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "events insert reviewer" ON public.internal_review_events FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()) OR public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]));
CREATE POLICY "events super admin update" ON public.internal_review_events FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "events super admin delete" ON public.internal_review_events FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE INDEX idx_review_events_merchant ON public.internal_review_events(merchant_id, created_at DESC);

-- ============================================================
-- internal_risk_cases + signals
-- ============================================================
CREATE TABLE public.internal_risk_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
  status public.risk_status NOT NULL DEFAULT 'not_reviewed',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes_private text,
  decision text,
  decision_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.internal_risk_cases TO authenticated;
GRANT ALL ON public.internal_risk_cases TO service_role;
ALTER TABLE public.internal_risk_cases ENABLE ROW LEVEL SECURITY;
-- Only risk reviewers/admins can see or manage
CREATE POLICY "risk cases risk reviewer" ON public.internal_risk_cases FOR ALL TO authenticated
  USING (public.is_risk_reviewer(auth.uid())) WITH CHECK (public.is_risk_reviewer(auth.uid()));

CREATE TRIGGER trg_risk_updated BEFORE UPDATE ON public.internal_risk_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.internal_risk_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.internal_risk_cases(id) ON DELETE CASCADE,
  signal_code text NOT NULL,
  signal_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.internal_risk_signals TO authenticated;
GRANT ALL ON public.internal_risk_signals TO service_role;
ALTER TABLE public.internal_risk_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk signals risk reviewer" ON public.internal_risk_signals FOR ALL TO authenticated
  USING (public.is_risk_reviewer(auth.uid())) WITH CHECK (public.is_risk_reviewer(auth.uid()));

-- ============================================================
-- provider_accounts (Razorpay)
-- ============================================================
CREATE TABLE public.provider_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  status public.provider_status NOT NULL DEFAULT 'not_connected',
  test_key_id_masked text,
  live_key_id_masked text,
  webhook_configured boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  last_error_safe text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, provider)
);
GRANT SELECT, INSERT, UPDATE ON public.provider_accounts TO authenticated;
GRANT ALL ON public.provider_accounts TO service_role;
ALTER TABLE public.provider_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "provider account read" ON public.provider_accounts FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "provider account manage" ON public.provider_accounts FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_platform_admin(auth.uid()))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_platform_admin(auth.uid()));

CREATE TRIGGER trg_provider_updated BEFORE UPDATE ON public.provider_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- provider_capabilities
-- ============================================================
CREATE TABLE public.provider_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  capability text NOT NULL,
  status public.capability_status NOT NULL DEFAULT 'not_requested',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, capability)
);
GRANT SELECT, INSERT, UPDATE ON public.provider_capabilities TO authenticated;
GRANT ALL ON public.provider_capabilities TO service_role;
ALTER TABLE public.provider_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capabilities read" ON public.provider_capabilities FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "capabilities manage" ON public.provider_capabilities FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_platform_admin(auth.uid()))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::app_role[]) OR public.is_platform_admin(auth.uid()));

CREATE TRIGGER trg_capabilities_updated BEFORE UPDATE ON public.provider_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- document_requirements (config)
-- ============================================================
CREATE TABLE public.document_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type text NOT NULL,
  business_category text,
  document_category text NOT NULL,
  document_type text NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_type, business_category, document_category, document_type)
);
GRANT SELECT ON public.document_requirements TO authenticated;
GRANT ALL ON public.document_requirements TO service_role;
ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc reqs read all" ON public.document_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc reqs super admin manage" ON public.document_requirements FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Seed a minimal set (admins can extend)
INSERT INTO public.document_requirements (business_type, business_category, document_category, document_type, is_required) VALUES
  ('individual', NULL, 'identity', 'pan_card', true),
  ('individual', NULL, 'address', 'address_proof', true),
  ('individual', NULL, 'bank', 'bank_statement_or_cheque', true),
  ('proprietorship', NULL, 'business_registration', 'gst_or_udyam', true),
  ('proprietorship', NULL, 'identity', 'proprietor_pan', true),
  ('proprietorship', NULL, 'bank', 'bank_statement_or_cheque', true),
  ('partnership', NULL, 'business_registration', 'partnership_deed', true),
  ('partnership', NULL, 'business_registration', 'firm_pan', true),
  ('llp', NULL, 'business_registration', 'llp_incorporation_certificate', true),
  ('llp', NULL, 'business_registration', 'llp_pan', true),
  ('private_limited', NULL, 'business_registration', 'certificate_of_incorporation', true),
  ('private_limited', NULL, 'business_registration', 'company_pan', true),
  ('private_limited', NULL, 'authorized_representative', 'director_authorization_letter', true),
  ('public_limited', NULL, 'business_registration', 'certificate_of_incorporation', true),
  ('public_limited', NULL, 'business_registration', 'company_pan', true),
  ('trust', NULL, 'business_registration', 'trust_deed', true),
  ('society', NULL, 'business_registration', 'society_registration_certificate', true);

-- ============================================================
-- admin_assignments
-- ============================================================
CREATE TABLE public.admin_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_assignments TO authenticated;
GRANT ALL ON public.admin_assignments TO service_role;
ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments admins" ON public.admin_assignments FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.admin_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Extend signup trigger: seed onboarding + provider row
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_merchant_id uuid;
BEGIN
  INSERT INTO public.profiles (id, display_name, auth_state)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'name',
             split_part(NEW.email,'@',1)),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'::public.auth_state
         ELSE 'email_unverified'::public.auth_state END
  );

  INSERT INTO public.merchants (owner_user_id, business_name, business_email, business_country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', split_part(NEW.email,'@',1) || ' Merchant'),
    NEW.email,
    'IN'
  )
  RETURNING id INTO new_merchant_id;

  INSERT INTO public.merchant_members (merchant_id, user_id, role) VALUES (new_merchant_id, NEW.id, 'owner');
  INSERT INTO public.merchant_settings (merchant_id) VALUES (new_merchant_id);

  INSERT INTO public.merchant_enabled_currencies (merchant_id, currency, status) VALUES
    (new_merchant_id, 'INR', 'enabled'),
    (new_merchant_id, 'USD', 'activation_required'),
    (new_merchant_id, 'EUR', 'activation_required'),
    (new_merchant_id, 'GBP', 'activation_required'),
    (new_merchant_id, 'AED', 'activation_required'),
    (new_merchant_id, 'CAD', 'activation_required'),
    (new_merchant_id, 'AUD', 'activation_required'),
    (new_merchant_id, 'JPY', 'activation_required');

  INSERT INTO public.merchant_onboarding (merchant_id) VALUES (new_merchant_id);
  INSERT INTO public.provider_accounts (merchant_id, provider, status) VALUES (new_merchant_id, 'razorpay', 'not_connected');

  RETURN NEW;
END; $$;

-- Backfill onboarding + provider_accounts for existing merchants
INSERT INTO public.merchant_onboarding (merchant_id)
  SELECT id FROM public.merchants
  WHERE NOT EXISTS (SELECT 1 FROM public.merchant_onboarding o WHERE o.merchant_id = merchants.id);

INSERT INTO public.provider_accounts (merchant_id, provider, status)
  SELECT id, 'razorpay', 'not_connected' FROM public.merchants
  WHERE NOT EXISTS (SELECT 1 FROM public.provider_accounts p WHERE p.merchant_id = merchants.id AND p.provider = 'razorpay');

-- Mark existing confirmed users as active
UPDATE public.profiles p SET auth_state = 'active'
  FROM auth.users u WHERE p.id = u.id AND u.email_confirmed_at IS NOT NULL AND p.auth_state = 'email_unverified';

-- Trigger to flip profile auth_state when a user confirms email
CREATE OR REPLACE FUNCTION public.sync_auth_state_on_confirm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL) THEN
    UPDATE public.profiles SET auth_state = 'active' WHERE id = NEW.id AND auth_state = 'email_unverified';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_sync_state ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_sync_state
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.sync_auth_state_on_confirm();
