-- =========================================================
-- Jatpat Pay: multi-tenant payment platform foundation
-- =========================================================

-- ---------- ENUMS ----------
CREATE TYPE public.app_role AS ENUM ('owner','admin','developer','finance','support');
CREATE TYPE public.payment_mode AS ENUM ('test','live');
CREATE TYPE public.payment_status AS ENUM ('created','pending','processing','requires_action','successful','failed','cancelled','partially_refunded','refunded');
CREATE TYPE public.refund_status AS ENUM ('created','processing','successful','failed');
CREATE TYPE public.currency_status AS ENUM ('enabled','disabled','activation_required','unsupported');
CREATE TYPE public.intl_status AS ENUM ('not_requested','activation_required','under_review','enabled','restricted','unavailable');
CREATE TYPE public.webhook_processing_status AS ENUM ('received','processing','processed','failed','ignored');
CREATE TYPE public.payment_link_status AS ENUM ('active','paid','expired','cancelled');
CREATE TYPE public.connection_status AS ENUM ('disconnected','connected','error');

-- ---------- HELPERS ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ---------- profiles ----------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read"   ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- merchants ----------
CREATE TABLE public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  business_name text NOT NULL,
  business_email text,
  business_country text NOT NULL DEFAULT 'IN',
  brand_logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.merchants TO authenticated;
GRANT ALL ON public.merchants TO service_role;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_merchants_updated BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- merchant_members (roles per merchant) ----------
CREATE TABLE public.merchant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, user_id, role)
);
CREATE INDEX idx_members_user ON public.merchant_members(user_id);
CREATE INDEX idx_members_merchant ON public.merchant_members(merchant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_members TO authenticated;
GRANT ALL ON public.merchant_members TO service_role;
ALTER TABLE public.merchant_members ENABLE ROW LEVEL SECURITY;

-- ---------- SECURITY DEFINER role helpers ----------
CREATE OR REPLACE FUNCTION public.is_merchant_member(_user uuid, _merchant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.merchant_members WHERE user_id = _user AND merchant_id = _merchant)
$$;

CREATE OR REPLACE FUNCTION public.has_merchant_role(_user uuid, _merchant uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.merchant_members WHERE user_id = _user AND merchant_id = _merchant AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_any_merchant_role(_user uuid, _merchant uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.merchant_members WHERE user_id = _user AND merchant_id = _merchant AND role = ANY(_roles))
$$;

-- merchant policies (need helpers above)
CREATE POLICY "merchants members read" ON public.merchants FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), id));
CREATE POLICY "merchants owner insert" ON public.merchants FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "merchants admin update" ON public.merchants FOR UPDATE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), id, ARRAY['owner','admin']::public.app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), id, ARRAY['owner','admin']::public.app_role[]));

-- members policies
CREATE POLICY "members read" ON public.merchant_members FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "members owner manage" ON public.merchant_members FOR ALL TO authenticated
  USING (public.has_merchant_role(auth.uid(), merchant_id, 'owner'))
  WITH CHECK (public.has_merchant_role(auth.uid(), merchant_id, 'owner'));

-- ---------- merchant_settings ----------
CREATE TABLE public.merchant_settings (
  merchant_id uuid PRIMARY KEY REFERENCES public.merchants(id) ON DELETE CASCADE,
  active_provider text NOT NULL DEFAULT 'razorpay',
  payment_mode public.payment_mode NOT NULL DEFAULT 'test',
  international_status public.intl_status NOT NULL DEFAULT 'not_requested',
  connection_status public.connection_status NOT NULL DEFAULT 'disconnected',
  webhook_configured boolean NOT NULL DEFAULT false,
  last_webhook_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.merchant_settings TO authenticated;
GRANT ALL ON public.merchant_settings TO service_role;
ALTER TABLE public.merchant_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.merchant_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "settings members read" ON public.merchant_settings FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "settings admin insert" ON public.merchant_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::public.app_role[]));
CREATE POLICY "settings admin update" ON public.merchant_settings FOR UPDATE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::public.app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::public.app_role[]));

-- ---------- merchant_enabled_currencies ----------
CREATE TABLE public.merchant_enabled_currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  currency text NOT NULL,
  status public.currency_status NOT NULL DEFAULT 'disabled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, currency)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_enabled_currencies TO authenticated;
GRANT ALL ON public.merchant_enabled_currencies TO service_role;
ALTER TABLE public.merchant_enabled_currencies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_currencies_updated BEFORE UPDATE ON public.merchant_enabled_currencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "currencies members read" ON public.merchant_enabled_currencies FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "currencies admin manage" ON public.merchant_enabled_currencies FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance']::public.app_role[]));

-- ---------- customers ----------
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_merchant ON public.customers(merchant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "customers members read" ON public.customers FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "customers staff manage" ON public.customers FOR ALL TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','support','finance']::public.app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','support','finance']::public.app_role[]));

-- ---------- payment_links ----------
CREATE TABLE public.payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL,
  status public.payment_link_status NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  is_test boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_links_merchant ON public.payment_links(merchant_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.payment_links TO authenticated;
GRANT ALL ON public.payment_links TO service_role;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_links_updated BEFORE UPDATE ON public.payment_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "links members read" ON public.payment_links FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "links staff insert" ON public.payment_links FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance','developer']::public.app_role[]));
CREATE POLICY "links staff update" ON public.payment_links FOR UPDATE TO authenticated
  USING (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance']::public.app_role[]));

-- ---------- payments ----------
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  payment_link_id uuid REFERENCES public.payment_links(id) ON DELETE SET NULL,
  internal_reference text NOT NULL UNIQUE,
  provider text NOT NULL,
  provider_order_id text,
  provider_payment_id text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'created',
  payment_method_type text,
  is_test boolean NOT NULL DEFAULT true,
  provider_verified boolean NOT NULL DEFAULT false,
  error_code text,
  error_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX idx_payments_merchant ON public.payments(merchant_id, created_at DESC);
CREATE INDEX idx_payments_provider_order ON public.payments(provider, provider_order_id);
CREATE INDEX idx_payments_provider_payment ON public.payments(provider, provider_payment_id);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "payments members read" ON public.payments FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));

-- ---------- refunds ----------
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_refund_id text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL,
  status public.refund_status NOT NULL DEFAULT 'created',
  reason text,
  requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX idx_refunds_merchant ON public.refunds(merchant_id, created_at DESC);
GRANT SELECT, INSERT ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_refunds_updated BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "refunds members read" ON public.refunds FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id));
CREATE POLICY "refunds staff request" ON public.refunds FOR INSERT TO authenticated
  WITH CHECK (public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin','finance']::public.app_role[]));

-- ---------- webhook_events ----------
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  processing_status public.webhook_processing_status NOT NULL DEFAULT 'received',
  payload_hash text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_message_safe text,
  UNIQUE (provider, provider_event_id)
);
CREATE INDEX idx_webhook_events_merchant ON public.webhook_events(merchant_id, received_at DESC);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks members read" ON public.webhook_events FOR SELECT TO authenticated
  USING (merchant_id IS NOT NULL AND public.is_merchant_member(auth.uid(), merchant_id));

-- ---------- audit_logs ----------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_merchant ON public.audit_logs(merchant_id, created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated
  USING (merchant_id IS NOT NULL AND public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner','admin']::public.app_role[]));

-- ---------- handle_new_user ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_merchant_id uuid;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'name',
             split_part(NEW.email,'@',1))
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

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();