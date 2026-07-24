-- 1) Platform admins can read audit logs
DROP POLICY IF EXISTS "audit admin read" ON public.audit_logs;
CREATE POLICY "audit admin read" ON public.audit_logs
FOR SELECT TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR (
    merchant_id IS NOT NULL
    AND public.has_any_merchant_role(auth.uid(), merchant_id, ARRAY['owner'::app_role, 'admin'::app_role])
  )
);

-- 2) Reviewers must use the masked view; remove raw base-table read
DROP POLICY IF EXISTS "bank reviewer read" ON public.merchant_bank_accounts;

-- 3) Prevent last-owner removal / self-demotion lockout
CREATE OR REPLACE FUNCTION public.prevent_last_owner_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining_owners int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM public.merchant_members
      WHERE merchant_id = OLD.merchant_id
        AND role = 'owner'
        AND id <> OLD.id;
      IF remaining_owners = 0 THEN
        RAISE EXCEPTION 'Cannot remove the last owner of a merchant.';
      END IF;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM public.merchant_members
      WHERE merchant_id = OLD.merchant_id
        AND role = 'owner'
        AND id <> OLD.id;
      IF remaining_owners = 0 THEN
        RAISE EXCEPTION 'Cannot demote the last owner of a merchant.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_last_owner_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_last_owner_change ON public.merchant_members;
CREATE TRIGGER trg_prevent_last_owner_change
BEFORE UPDATE OR DELETE ON public.merchant_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_owner_change();