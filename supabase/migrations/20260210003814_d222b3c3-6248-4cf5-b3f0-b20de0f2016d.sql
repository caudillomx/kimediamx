
-- 1. Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Tabla de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Función has_role (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS para user_roles: solo admins pueden leer
CREATE POLICY "Admins can read roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Tabla de códigos de acceso
CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Solo admins gestionan códigos
CREATE POLICY "Admins can manage access codes"
  ON public.access_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anónimos pueden validar códigos (solo lectura)
CREATE POLICY "Anyone can validate codes"
  ON public.access_codes FOR SELECT
  TO anon
  USING (true);

-- 5. Tabla de participantes
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  state TEXT NOT NULL,
  role_title TEXT NOT NULL,
  social_handle TEXT NOT NULL,
  
  -- Diagnóstico
  diagnostic_score INTEGER,
  diagnostic_level TEXT, -- 'rojo', 'amarillo', 'verde'
  
  -- Mensaje político
  cause TEXT,
  cause_custom TEXT,
  conviction TEXT,
  target_population TEXT[],
  territory TEXT,
  political_message TEXT,
  
  -- Bio
  bio_text TEXT,
  
  -- Primer post
  post_type TEXT, -- 'territorio', 'causa', 'accion'
  post_text TEXT,
  post_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Control
  access_code_used TEXT NOT NULL,
  show_on_map BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (flujo sin auth)
CREATE POLICY "Anyone can create participant"
  ON public.participants FOR INSERT
  TO anon
  WITH CHECK (true);

-- Cualquiera puede actualizar su propio registro (por id en sesión)
CREATE POLICY "Anyone can update participant"
  ON public.participants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Lectura pública solo de participantes visibles en mapa
CREATE POLICY "Public can see map participants"
  ON public.participants FOR SELECT
  TO anon
  USING (show_on_map = true);

-- Admins ven todo
CREATE POLICY "Admins can manage participants"
  ON public.participants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Función para incrementar usos de código
CREATE OR REPLACE FUNCTION public.increment_code_usage(code_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code RECORD;
BEGIN
  SELECT * INTO v_code FROM public.access_codes
  WHERE code = code_text AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN RETURN false; END IF;
  IF v_code.current_uses >= v_code.max_uses THEN RETURN false; END IF;
  
  UPDATE public.access_codes SET current_uses = current_uses + 1 WHERE id = v_code.id;
  RETURN true;
END;
$$;

-- Trigger para updated_at en participants
CREATE OR REPLACE FUNCTION public.update_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participants_updated_at();
