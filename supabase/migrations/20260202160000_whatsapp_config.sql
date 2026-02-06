-- ============================================================================
-- WHATSAPP CONFIGURATION
-- Almacena configuración de WhatsApp: general de plataforma y por agente
-- ============================================================================

-- Insertar configuración global de WhatsApp
INSERT INTO site_settings (key, value, description)
VALUES (
  'whatsapp_general',
  '{"number": "529711567474", "message_template": "Hola, me interesa información sobre sus terrenos"}',
  'Número de WhatsApp general de la plataforma'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Agregar columna de WhatsApp a usuarios (agentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Agregar columna de WhatsApp a promoters también si existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promoters') THEN
    ALTER TABLE promoters ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
  END IF;
END $$;

-- ============================================================================
-- FUNCIÓN PARA OBTENER WHATSAPP DE CONTACTO
-- Prioridad: agente asignado > proyecto > general
-- ============================================================================

CREATE OR REPLACE FUNCTION get_contact_whatsapp(
  p_project_id UUID DEFAULT NULL,
  p_lot_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_whatsapp TEXT;
  v_agent_id UUID;
BEGIN
  -- 1. Si hay lote, buscar agente asignado al lote
  IF p_lot_id IS NOT NULL THEN
    SELECT agent_id INTO v_agent_id
    FROM agent_assignments
    WHERE lot_id = p_lot_id
    LIMIT 1;

    IF v_agent_id IS NOT NULL THEN
      SELECT whatsapp_number INTO v_whatsapp
      FROM users
      WHERE id = v_agent_id AND whatsapp_number IS NOT NULL;

      IF v_whatsapp IS NOT NULL THEN
        RETURN v_whatsapp;
      END IF;
    END IF;
  END IF;

  -- 2. Si hay proyecto, buscar agente asignado al proyecto
  IF p_project_id IS NOT NULL THEN
    SELECT agent_id INTO v_agent_id
    FROM agent_assignments
    WHERE project_id = p_project_id AND lot_id IS NULL
    LIMIT 1;

    IF v_agent_id IS NOT NULL THEN
      SELECT whatsapp_number INTO v_whatsapp
      FROM users
      WHERE id = v_agent_id AND whatsapp_number IS NOT NULL;

      IF v_whatsapp IS NOT NULL THEN
        RETURN v_whatsapp;
      END IF;
    END IF;
  END IF;

  -- 3. Fallback: WhatsApp general de la plataforma
  SELECT value->>'number' INTO v_whatsapp
  FROM site_settings
  WHERE key = 'whatsapp_general';

  RETURN COALESCE(v_whatsapp, '529711567474');
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION get_contact_whatsapp TO anon, authenticated;
