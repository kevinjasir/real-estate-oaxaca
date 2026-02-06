-- ============================================================================
-- DEBUG: Verificar y corregir el trigger handle_new_user
-- ============================================================================

-- Primero, vamos a eliminar el trigger existente y la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recrear la función con manejo de errores más robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  new_role user_role;
  is_active BOOLEAN;
  user_full_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Contar usuarios existentes
  SELECT COUNT(*) INTO user_count FROM public.users;

  -- Determinar rol y estado activo
  IF user_count = 0 THEN
    new_role := 'super_admin';
    is_active := true;
  ELSE
    new_role := 'agent';
    is_active := false;
  END IF;

  -- Extraer el nombre completo de varias posibles fuentes en los metadatos
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, 'user@example.com'), '@', 1),
    'Usuario'
  );

  -- Extraer avatar
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Insertar nuevo usuario
  INSERT INTO public.users (id, email, full_name, avatar_url, role, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'unknown@example.com'),
    user_full_name,
    user_avatar,
    new_role,
    is_active
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Dar permisos necesarios
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
