-- 1) brand_kit_profiles: token-scoped anonymous updates
DROP POLICY IF EXISTS "Anon update fresh unclaimed brand profiles" ON public.brand_kit_profiles;

CREATE OR REPLACE FUNCTION public.brand_kit_apply_patch(_id uuid, _token text, _patch jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE p jsonb := COALESCE(_patch, '{}'::jsonb);
BEGIN
  IF _token IS NULL OR length(_token) < 16 THEN
    RAISE EXCEPTION 'Token inválido';
  END IF;

  UPDATE public.brand_kit_profiles b SET
    diagnostic_score      = COALESCE((p->>'diagnostic_score')::int, b.diagnostic_score),
    diagnostic_level      = COALESCE(p->>'diagnostic_level', b.diagnostic_level),
    publication_frequency = COALESCE(p->>'publication_frequency', b.publication_frequency),
    self_perception       = COALESCE(p->>'self_perception', b.self_perception),
    goal_90_days          = COALESCE(p->>'goal_90_days', b.goal_90_days),
    competitors           = COALESCE(p->>'competitors', b.competitors),
    market_position       = COALESCE(p->>'market_position', b.market_position),
    value_proposition     = COALESCE(p->>'value_proposition', b.value_proposition),
    target_audience       = COALESCE(p->>'target_audience', b.target_audience),
    differentiator        = COALESCE(p->>'differentiator', b.differentiator),
    brand_tone            = COALESCE(p->>'brand_tone', b.brand_tone),
    bio_text              = COALESCE(p->>'bio_text', b.bio_text),
    post_text             = COALESCE(p->>'post_text', b.post_text),
    post_type             = COALESCE(p->>'post_type', b.post_type),
    post_published        = COALESCE((p->>'post_published')::boolean, b.post_published),
    reference_accounts    = COALESCE(p->>'reference_accounts', b.reference_accounts),
    content_restrictions  = COALESCE(p->>'content_restrictions', b.content_restrictions),
    key_dates             = COALESCE(p->>'key_dates', b.key_dates),
    content_pillars       = COALESCE(p->'content_pillars', b.content_pillars),
    preferred_formats     = COALESCE(p->'preferred_formats', b.preferred_formats),
    content_grid          = COALESCE(p->'content_grid', b.content_grid),
    consent_email         = COALESCE((p->>'consent_email')::boolean, b.consent_email),
    consent_whatsapp      = COALESCE((p->>'consent_whatsapp')::boolean, b.consent_whatsapp),
    updated_at            = now()
  WHERE b.id = _id
    AND b.profile_token = _token
    AND b.user_id IS NULL
    AND b.created_at > now() - interval '30 days';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil no encontrado o no editable';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.brand_kit_apply_patch(uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.brand_kit_apply_patch(uuid, text, jsonb) TO anon, authenticated;

-- 2) gto-corpus storage: no direct public access; server-side only
DROP POLICY IF EXISTS "Upload gto-corpus by participant folder" ON storage.objects;
DROP POLICY IF EXISTS "Read gto-corpus by participant folder" ON storage.objects;
DROP POLICY IF EXISTS "Delete gto-corpus by participant folder" ON storage.objects;