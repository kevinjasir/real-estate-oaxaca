-- ============================================================================
-- SISTEMA DE USUARIOS Y ROLES (RBAC)
-- Plataforma Inmobiliaria Costa Oaxaca
-- ============================================================================

-- ============================================================================
-- ENUM PARA ROLES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLA DE USUARIOS INTERNOS
-- Vinculada a auth.users de Supabase
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'agent',
  active BOOLEAN NOT NULL DEFAULT false, -- Por defecto inactivo, admin debe activar
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCIÓN PARA CREAR USUARIO AUTOMÁTICAMENTE AL REGISTRARSE
-- El primer usuario será SUPER_ADMIN y activo
-- Los siguientes serán AGENT e inactivos
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role user_role;
  is_active BOOLEAN;
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

  -- Insertar nuevo usuario
  INSERT INTO public.users (id, email, full_name, avatar_url, role, active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    new_role,
    is_active
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ACTUALIZAR FK EN LEADS PARA REFERENCIAR USERS
-- ============================================================================

-- Primero eliminar constraint existente si hay
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;

-- Agregar nuevo constraint
ALTER TABLE leads
  ADD CONSTRAINT leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- AGREGAR CAMPO DE FORMATO DE NUMERACIÓN A PROJECTS
-- ============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS lot_numbering_format VARCHAR(20) DEFAULT 'alphanumeric';
-- Valores: 'alphanumeric' (A1, A2, B1...) o 'numeric' (1, 2, 3...)

-- ============================================================================
-- RLS PARA USERS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver usuarios activos
DROP POLICY IF EXISTS "Authenticated users can view active users" ON users;
CREATE POLICY "Authenticated users can view active users"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL AND (active = true OR id = auth.uid()));

-- Los usuarios pueden actualizar su propio perfil (excepto rol y active)
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    active = (SELECT active FROM users WHERE id = auth.uid())
  );

-- ============================================================================
-- FUNCIONES HELPER PARA RLS
-- ============================================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función para verificar si el usuario es admin o super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
    AND active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función para verificar si el usuario es super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- POLÍTICAS ADMIN PARA USERS
-- ============================================================================

-- Admins pueden ver todos los usuarios
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (public.is_admin());

-- Super admins pueden insertar usuarios
DROP POLICY IF EXISTS "Super admins can insert users" ON users;
CREATE POLICY "Super admins can insert users"
  ON users FOR INSERT
  WITH CHECK (public.is_super_admin());

-- Super admins pueden actualizar cualquier usuario
DROP POLICY IF EXISTS "Super admins can update users" ON users;
CREATE POLICY "Super admins can update users"
  ON users FOR UPDATE
  USING (public.is_super_admin());

-- Super admins pueden eliminar usuarios (excepto a sí mismos)
DROP POLICY IF EXISTS "Super admins can delete users" ON users;
CREATE POLICY "Super admins can delete users"
  ON users FOR DELETE
  USING (public.is_super_admin() AND id != auth.uid());
