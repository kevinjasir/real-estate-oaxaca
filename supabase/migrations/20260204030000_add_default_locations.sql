-- Create location reference tables if they don't exist
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES countries(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Mexico/Oaxaca records with specific UUIDs
-- These are needed as foreign keys for new projects

INSERT INTO countries (id, name, code)
VALUES ('a1b2c3d4-0000-4000-8000-000000000003', 'México', 'MX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO states (id, country_id, name, code)
VALUES ('a1b2c3d4-0000-4000-8000-000000000002', 'a1b2c3d4-0000-4000-8000-000000000003', 'Oaxaca', 'OAX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cities (id, state_id, name)
VALUES ('a1b2c3d4-0000-4000-8000-000000000001', 'a1b2c3d4-0000-4000-8000-000000000002', 'Costa de Oaxaca')
ON CONFLICT (id) DO NOTHING;
