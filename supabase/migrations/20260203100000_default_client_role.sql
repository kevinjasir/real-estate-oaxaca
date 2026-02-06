-- ============================================================================
-- FIX: Cambiar rol por defecto a 'client' para nuevos usuarios
-- Los usuarios que se registran desde el sitio público son clientes
-- ============================================================================

-- Primero verificar que 'client' esté en el enum user_role
DO $$
BEGIN
  -- Intentar agregar 'client' al enum si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'client' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
  END IF;
END $$;

-- Recrear la función para asignar 'client' por defecto
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
    -- Primer usuario es super_admin y activo
    new_role := 'super_admin';
    is_active := true;
  ELSE
    -- Todos los demás usuarios son 'client' por defecto y activos
    -- (pueden navegar el sitio público)
    new_role := 'client';
    is_active := true;
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

-- Actualizar usuarios existentes que tienen rol 'agent' pero deberían ser 'client'
-- (usuarios que no tienen asignaciones de agente)
UPDATE public.users
SET role = 'client', updated_at = NOW()
WHERE role = 'agent'
  AND id NOT IN (
    SELECT DISTINCT agent_id FROM agent_assignments WHERE agent_id IS NOT NULL
  );

-- Comentario
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea un registro en public.users cuando un nuevo usuario se registra. El primer usuario es super_admin, los demás son client.';
