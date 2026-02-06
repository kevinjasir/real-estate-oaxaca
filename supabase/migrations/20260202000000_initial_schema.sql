-- ============================================================================
-- INITIAL SCHEMA - Base tables that other migrations depend on
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECT STATUS ENUM
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'coming_soon', 'sold_out', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PROJECTS TABLE (Base)
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- LEADS TABLE (Base)
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE lead_source_enum AS ENUM ('website', 'whatsapp', 'phone', 'referral', 'social_media', 'walk_in', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source lead_source_enum DEFAULT 'website',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MEDIA TABLE (Base)
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE media_entity_enum AS ENUM ('project', 'lot', 'testimonial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'document', 'virtual_tour');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type media_entity_enum NOT NULL,
  entity_id UUID NOT NULL,
  type media_type_enum NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title VARCHAR(255),
  alt_text VARCHAR(255),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);

-- ============================================================================
-- UPDATE TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to leads
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- RLS for base tables
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read for projects
DROP POLICY IF EXISTS "Public can view active projects" ON projects;
CREATE POLICY "Public can view active projects"
  ON projects FOR SELECT
  USING (status IN ('active', 'coming_soon'));

-- Public read for media
DROP POLICY IF EXISTS "Public can view media" ON media;
CREATE POLICY "Public can view media"
  ON media FOR SELECT USING (true);

-- Public insert for leads
DROP POLICY IF EXISTS "Public can create leads" ON leads;
CREATE POLICY "Public can create leads"
  ON leads FOR INSERT WITH CHECK (true);
