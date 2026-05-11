
-- Lock down anonymous lead tables: prevent email enumeration while keeping
-- the public onboarding/insert flows working.

-- 1) brand_kit_profiles ----------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read brand profiles" ON public.brand_kit_profiles;
DROP POLICY IF EXISTS "Anyone can update brand profile" ON public.brand_kit_profiles;

-- Admins (operations panel) can read & manage all kit profiles
CREATE POLICY "Admins read brand profiles"
  ON public.brand_kit_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update brand profiles"
  ON public.brand_kit_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Authenticated SaaS users (/mi-estrategia) can read their own kits
CREATE POLICY "Owners read own brand profiles"
  ON public.brand_kit_profiles FOR SELECT
  TO authenticated
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (email IS NOT NULL AND lower(email) = lower(coalesce(auth.jwt() ->> 'email','')))
  );

-- Anonymous onboarding: allow updates only on fresh, unclaimed drafts
-- (kit forms insert then issue several UPDATEs to fill in steps).
CREATE POLICY "Anon update fresh unclaimed brand profiles"
  ON public.brand_kit_profiles FOR UPDATE
  TO anon
  USING (user_id IS NULL AND created_at > now() - interval '30 days')
  WITH CHECK (user_id IS NULL);

-- Token-based public read for kit recipients (e.g. /kit/marca/:id?token=...)
CREATE OR REPLACE FUNCTION public.get_brand_kit_by_token(_id uuid, _token text)
RETURNS SETOF public.brand_kit_profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.brand_kit_profiles
  WHERE id = _id AND profile_token = _token
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_brand_kit_by_token(uuid, text) TO anon, authenticated;

-- 2) guide_registrations --------------------------------------------------
DROP POLICY IF EXISTS "Users can check their registration" ON public.guide_registrations;

CREATE POLICY "Admins read guide registrations"
  ON public.guide_registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) participants (legacy table, no longer used by client code) -----------
DROP POLICY IF EXISTS "Participants can read own row by id" ON public.participants;
DROP POLICY IF EXISTS "Anyone can update participant" ON public.participants;
DROP POLICY IF EXISTS "Anyone can create participant" ON public.participants;
