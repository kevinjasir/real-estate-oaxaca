-- ============================================================================
-- REAL ESTATE PLATFORM - COMPLETE SCHEMA ENHANCEMENT
-- Safe migration that won't fail on existing objects
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENHANCE PROJECTS TABLE
-- ============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location_name VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Oaxaca';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS price_from DECIMAL(12, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS price_to DECIMAL(12, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MXN';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_lots INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS available_lots INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lot_size_from DECIMAL(10, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lot_size_to DECIMAL(10, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_title VARCHAR(70);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location_name);

-- ============================================================================
-- ENUM TYPES (safe creation)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE lot_status AS ENUM ('available', 'reserved', 'sold', 'not_for_sale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_source AS ENUM ('website', 'whatsapp', 'phone', 'referral', 'social_media', 'walk_in', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video', 'document', 'virtual_tour');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- LOTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lot_number VARCHAR(50) NOT NULL,
  block VARCHAR(50),
  status lot_status NOT NULL DEFAULT 'available',
  area_m2 DECIMAL(10, 2) NOT NULL,
  front_meters DECIMAL(6, 2),
  depth_meters DECIMAL(6, 2),
  price DECIMAL(12, 2),
  price_per_m2 DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'MXN',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  zone VARCHAR(100),
  features JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_lots_project ON lots(project_id);

-- ============================================================================
-- ENHANCE LEADS TABLE (if exists, add columns; if not, create)
-- ============================================================================

-- First check if leads table exists and add columns
DO $$
BEGIN
  -- Add columns if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES lots(id) ON DELETE SET NULL;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_min DECIMAL(12, 2);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_max DECIMAL(12, 2);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer_url TEXT;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS internal_notes TEXT;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  client_title VARCHAR(255),
  client_location VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured) WHERE featured = true AND active = true;

-- ============================================================================
-- FAQ TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- ============================================================================
-- SITE_SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CONTACT_SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  responded BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ============================================================================
-- SCHEDULED VISITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(50) NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  cancelled BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  visitor_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_visits_project ON scheduled_visits(project_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON scheduled_visits(preferred_date);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS update_lots_updated_at ON lots;
CREATE TRIGGER update_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update available_lots
CREATE OR REPLACE FUNCTION update_project_available_lots()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET available_lots = (
    SELECT COUNT(*) FROM lots
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND status = 'available'
  )
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_available_lots_on_lot_change ON lots;
CREATE TRIGGER update_available_lots_on_lot_change
  AFTER INSERT OR UPDATE OF status OR DELETE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_project_available_lots();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_visits ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "Public can view lots" ON lots;
CREATE POLICY "Public can view lots"
  ON lots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
CREATE POLICY "Public can view testimonials"
  ON testimonials FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view faqs" ON faqs;
CREATE POLICY "Public can view faqs"
  ON faqs FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
CREATE POLICY "Public can view settings"
  ON site_settings FOR SELECT USING (true);

-- Public insert policies
DROP POLICY IF EXISTS "Public can submit contact" ON contact_submissions;
CREATE POLICY "Public can submit contact"
  ON contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can schedule visits" ON scheduled_visits;
CREATE POLICY "Public can schedule visits"
  ON scheduled_visits FOR INSERT WITH CHECK (true);

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Settings
INSERT INTO site_settings (key, value, description) VALUES
  ('company_name', '"Costa Oaxaca Real Estate"', 'Company name'),
  ('company_phone', '"+52 951 123 4567"', 'Phone'),
  ('company_whatsapp', '"+52 951 123 4567"', 'WhatsApp'),
  ('company_email', '"info@costaoaxaca.com"', 'Email')
ON CONFLICT (key) DO NOTHING;

-- Sample testimonials
INSERT INTO testimonials (client_name, client_title, client_location, content, rating, featured)
SELECT * FROM (VALUES
  ('María González', 'Inversionista', 'Ciudad de México',
   'Excelente experiencia comprando mi terreno. El equipo fue muy profesional y me acompañaron en todo el proceso.', 5, true),
  ('Roberto Méndez', 'Empresario', 'Monterrey',
   'Compré dos terrenos como inversión y ya han aumentado su valor. Proceso transparente y rápido.', 5, true)
) AS v(client_name, client_title, client_location, content, rating, featured)
WHERE NOT EXISTS (SELECT 1 FROM testimonials LIMIT 1);

-- Sample FAQs
INSERT INTO faqs (question, answer, category, order_index)
SELECT * FROM (VALUES
  ('¿Cómo es el proceso de compra?',
   'Agenda una visita, elige tu lote, firma contrato con enganche, completa pagos y recibe tu escritura.',
   'Proceso', 1),
  ('¿Ofrecen financiamiento?',
   'Sí, planes hasta 36 meses con enganche desde 30%. Sin comprobar ingresos.',
   'Financiamiento', 2),
  ('¿Los terrenos tienen escrituras?',
   'Todos nuestros proyectos cuentan con escrituras individuales por lote.',
   'Legal', 3),
  ('¿Puedo visitar antes de comprar?',
   'Sí, agenda una visita sin compromiso. Te llevamos a conocer los desarrollos.',
   'Visitas', 4)
) AS v(question, answer, category, order_index)
WHERE NOT EXISTS (SELECT 1 FROM faqs LIMIT 1);

-- Update existing projects with enhanced data
UPDATE projects SET
  location_name = COALESCE(location_name, 'Costa de Oaxaca'),
  city = COALESCE(city, 'Huatulco'),
  amenities = COALESCE(amenities, '["Seguridad 24/7", "Áreas verdes"]'::jsonb),
  features = COALESCE(features, '["Escrituras disponibles", "Servicios"]'::jsonb)
WHERE location_name IS NULL OR amenities IS NULL;
