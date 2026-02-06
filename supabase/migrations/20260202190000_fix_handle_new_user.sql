-- ============================================================================
-- FIX: Trigger handle_new_user para manejar mejor los metadatos de Google OAuth
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role user_role;
  is_active BOOLEAN;
  user_full_name TEXT;
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
    split_part(NEW.email, '@', 1),
    'Usuario'
  );

  -- Insertar nuevo usuario
  INSERT INTO public.users (id, email, full_name, avatar_url, role, active)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    new_role,
    is_active
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log el error pero no fallar (para debugging)
  RAISE LOG 'Error en handle_new_user: %, SQLSTATE: %', SQLERRM, SQLSTATE;
  RAISE LOG 'Datos del usuario: id=%, email=%, meta=%', NEW.id, NEW.email, NEW.raw_user_meta_data;
  -- Re-lanzar para que Supabase pueda manejarlo
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger esté creado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
