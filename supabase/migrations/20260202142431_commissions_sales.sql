-- ============================================================================
-- SISTEMA DE COMISIONES, VENTAS Y ASIGNACIONES
-- Plataforma Inmobiliaria Costa Oaxaca
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE commission_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE commission_scope AS ENUM ('global', 'project', 'lot', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('pending', 'in_process', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLA DE COMISIONES
-- Configuración flexible: global, por proyecto, por lote o por agente
-- ============================================================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Tipo y valor
  type commission_type NOT NULL DEFAULT 'percentage',
  value DECIMAL(10, 4) NOT NULL, -- Porcentaje (0.05 = 5%) o monto fijo

  -- Alcance (scope)
  scope commission_scope NOT NULL DEFAULT 'global',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Comisión del sistema vs agente
  is_system_commission BOOLEAN NOT NULL DEFAULT true, -- true = comisión del sistema, false = comisión del agente

  -- Prioridad (mayor número = mayor prioridad)
  priority INTEGER NOT NULL DEFAULT 0,

  -- Vigencia
  active BOOLEAN NOT NULL DEFAULT true,
  valid_from DATE,
  valid_until DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_commission_value CHECK (
    (type = 'percentage' AND value >= 0 AND value <= 1) OR
    (type = 'fixed' AND value >= 0)
  ),
  CONSTRAINT valid_commission_scope CHECK (
    (scope = 'global' AND project_id IS NULL AND lot_id IS NULL AND agent_id IS NULL) OR
    (scope = 'project' AND project_id IS NOT NULL AND lot_id IS NULL) OR
    (scope = 'lot' AND lot_id IS NOT NULL) OR
    (scope = 'agent' AND agent_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_commissions_scope ON commissions(scope);
CREATE INDEX IF NOT EXISTS idx_commissions_project ON commissions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_agent ON commissions(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_active ON commissions(active) WHERE active = true;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_commissions_updated_at ON commissions;
CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TABLA DE ASIGNACIONES DE AGENTES
-- Asigna proyectos o lotes específicos a agentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agente asignado
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Recurso asignado (proyecto o lote)
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,

  -- Metadata
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_assignment CHECK (
    (project_id IS NOT NULL AND lot_id IS NULL) OR
    (lot_id IS NOT NULL)
  ),
  -- Un agente no puede tener duplicados para el mismo recurso
  CONSTRAINT unique_agent_project UNIQUE (agent_id, project_id) ,
  CONSTRAINT unique_agent_lot UNIQUE (agent_id, lot_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_assignments_agent ON agent_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_assignments_project ON agent_assignments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_lot ON agent_assignments(lot_id) WHERE lot_id IS NOT NULL;

-- ============================================================================
-- TABLA DE VENTAS
-- Registro completo de ventas con cálculo de comisiones
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias principales
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Datos del comprador
  buyer_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(50),
  buyer_rfc VARCHAR(20), -- RFC mexicano
  buyer_curp VARCHAR(20), -- CURP mexicano
  buyer_address TEXT,

  -- Montos de la venta
  sale_price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MXN',

  -- Pagos
  down_payment DECIMAL(12, 2) DEFAULT 0,
  financing_months INTEGER DEFAULT 0, -- 0 = contado
  monthly_payment DECIMAL(12, 2),

  -- Comisiones calculadas
  system_commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  system_commission_percentage DECIMAL(6, 4),
  agent_commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  agent_commission_percentage DECIMAL(6, 4),
  net_amount DECIMAL(12, 2) NOT NULL DEFAULT 0, -- sale_price - comisiones

  -- Estados
  status sale_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',

  -- Fechas importantes
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contract_signed_at TIMESTAMPTZ,
  deed_signed_at TIMESTAMPTZ, -- Fecha de escrituración

  -- Documentos y notas
  contract_number VARCHAR(100),
  deed_number VARCHAR(100), -- Número de escritura
  internal_notes TEXT,

  -- Timestamps y auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_lot ON sales(lot_id);
CREATE INDEX IF NOT EXISTS idx_sales_agent ON sales(agent_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_lead ON sales(lead_id) WHERE lead_id IS NOT NULL;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCIÓN PARA CALCULAR COMISIONES
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_sale_commissions(
  p_lot_id UUID,
  p_agent_id UUID,
  p_sale_price DECIMAL
)
RETURNS TABLE (
  system_commission DECIMAL,
  system_percentage DECIMAL,
  agent_commission DECIMAL,
  agent_percentage DECIMAL,
  net_amount DECIMAL
) AS $$
DECLARE
  v_project_id UUID;
  v_system_comm DECIMAL := 0;
  v_system_pct DECIMAL := 0;
  v_agent_comm DECIMAL := 0;
  v_agent_pct DECIMAL := 0;
  comm_record RECORD;
BEGIN
  -- Obtener project_id del lote
  SELECT project_id INTO v_project_id FROM lots WHERE id = p_lot_id;

  -- Buscar comisión del sistema (prioridad: lote > proyecto > global)
  SELECT INTO comm_record *
  FROM commissions
  WHERE is_system_commission = true
    AND active = true
    AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND (
      (scope = 'lot' AND lot_id = p_lot_id) OR
      (scope = 'project' AND project_id = v_project_id) OR
      (scope = 'global')
    )
  ORDER BY priority DESC,
    CASE scope WHEN 'lot' THEN 1 WHEN 'project' THEN 2 WHEN 'global' THEN 3 END
  LIMIT 1;

  IF FOUND THEN
    IF comm_record.type = 'percentage' THEN
      v_system_pct := comm_record.value;
      v_system_comm := p_sale_price * comm_record.value;
    ELSE
      v_system_comm := comm_record.value;
      v_system_pct := comm_record.value / p_sale_price;
    END IF;
  END IF;

  -- Buscar comisión del agente (prioridad: agente específico > lote > proyecto > global)
  SELECT INTO comm_record *
  FROM commissions
  WHERE is_system_commission = false
    AND active = true
    AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND (
      (scope = 'agent' AND agent_id = p_agent_id) OR
      (scope = 'lot' AND lot_id = p_lot_id) OR
      (scope = 'project' AND project_id = v_project_id) OR
      (scope = 'global')
    )
  ORDER BY priority DESC,
    CASE scope WHEN 'agent' THEN 0 WHEN 'lot' THEN 1 WHEN 'project' THEN 2 WHEN 'global' THEN 3 END
  LIMIT 1;

  IF FOUND THEN
    IF comm_record.type = 'percentage' THEN
      v_agent_pct := comm_record.value;
      v_agent_comm := p_sale_price * comm_record.value;
    ELSE
      v_agent_comm := comm_record.value;
      v_agent_pct := comm_record.value / p_sale_price;
    END IF;
  END IF;

  RETURN QUERY SELECT
    v_system_comm,
    v_system_pct,
    v_agent_comm,
    v_agent_pct,
    p_sale_price - v_system_comm - v_agent_comm;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- TRIGGER PARA ACTUALIZAR ESTADO DEL LOTE AL CAMBIAR VENTA
-- ============================================================================

CREATE OR REPLACE FUNCTION update_lot_on_sale_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la venta se completa, marcar lote como vendido
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE lots SET status = 'sold', updated_at = NOW() WHERE id = NEW.lot_id;

  -- Si la venta pasa a pending o in_process desde otro estado, marcar como reservado
  ELSIF NEW.status IN ('pending', 'in_process') AND OLD.status NOT IN ('pending', 'in_process') THEN
    UPDATE lots SET status = 'reserved', updated_at = NOW() WHERE id = NEW.lot_id;

  -- Si la venta se cancela, volver a disponible
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE lots SET status = 'available', updated_at = NOW() WHERE id = NEW.lot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lot_status_on_sale ON sales;
CREATE TRIGGER update_lot_status_on_sale
  AFTER INSERT OR UPDATE OF status ON sales
  FOR EACH ROW EXECUTE FUNCTION update_lot_on_sale_change();

-- ============================================================================
-- TRIGGER PARA RESERVAR LOTE AL CREAR VENTA
-- ============================================================================

CREATE OR REPLACE FUNCTION reserve_lot_on_sale_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Al crear una venta, reservar el lote automáticamente
  IF NEW.status IN ('pending', 'in_process') THEN
    UPDATE lots SET status = 'reserved', updated_at = NOW() WHERE id = NEW.lot_id AND status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reserve_lot_on_new_sale ON sales;
CREATE TRIGGER reserve_lot_on_new_sale
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION reserve_lot_on_sale_insert();

-- ============================================================================
-- TRIGGER PARA ACTUALIZAR LEAD AL COMPLETAR VENTA
-- ============================================================================

CREATE OR REPLACE FUNCTION update_lead_on_sale_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.lead_id IS NOT NULL THEN
    UPDATE leads SET
      status = 'won',
      converted_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lead_on_sale ON sales;
CREATE TRIGGER update_lead_on_sale
  AFTER UPDATE OF status ON sales
  FOR EACH ROW EXECUTE FUNCTION update_lead_on_sale_complete();

-- ============================================================================
-- RLS PARA COMMISSIONS
-- ============================================================================

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver comisiones
DROP POLICY IF EXISTS "Admins can view commissions" ON commissions;
CREATE POLICY "Admins can view commissions"
  ON commissions FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver comisiones globales y las suyas
DROP POLICY IF EXISTS "Agents can view own and global commissions" ON commissions;
CREATE POLICY "Agents can view own and global commissions"
  ON commissions FOR SELECT
  USING (
    scope = 'global' OR
    agent_id = auth.uid() OR
    public.is_admin()
  );

-- Solo super_admins pueden modificar comisiones
DROP POLICY IF EXISTS "Super admins can manage commissions" ON commissions;
CREATE POLICY "Super admins can manage commissions"
  ON commissions FOR ALL
  USING (public.is_super_admin());

-- ============================================================================
-- RLS PARA AGENT_ASSIGNMENTS
-- ============================================================================

ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Admins pueden ver todas las asignaciones
DROP POLICY IF EXISTS "Admins can view all assignments" ON agent_assignments;
CREATE POLICY "Admins can view all assignments"
  ON agent_assignments FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver sus propias asignaciones
DROP POLICY IF EXISTS "Agents can view own assignments" ON agent_assignments;
CREATE POLICY "Agents can view own assignments"
  ON agent_assignments FOR SELECT
  USING (agent_id = auth.uid());

-- Solo admins pueden gestionar asignaciones
DROP POLICY IF EXISTS "Admins can manage assignments" ON agent_assignments;
CREATE POLICY "Admins can manage assignments"
  ON agent_assignments FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA SALES
-- ============================================================================

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Admins pueden ver todas las ventas
DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
CREATE POLICY "Admins can view all sales"
  ON sales FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver sus propias ventas
DROP POLICY IF EXISTS "Agents can view own sales" ON sales;
CREATE POLICY "Agents can view own sales"
  ON sales FOR SELECT
  USING (agent_id = auth.uid());

-- Usuarios autenticados pueden crear ventas (solo para sí mismos)
DROP POLICY IF EXISTS "Authenticated users can create sales" ON sales;
CREATE POLICY "Authenticated users can create sales"
  ON sales FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    agent_id = auth.uid()
  );

-- Agentes pueden actualizar sus propias ventas, admins todas
DROP POLICY IF EXISTS "Users can update sales" ON sales;
CREATE POLICY "Users can update sales"
  ON sales FOR UPDATE
  USING (agent_id = auth.uid() OR public.is_admin());

-- Solo admins pueden eliminar ventas
DROP POLICY IF EXISTS "Admins can delete sales" ON sales;
CREATE POLICY "Admins can delete sales"
  ON sales FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- INSERTAR COMISIONES POR DEFECTO
-- ============================================================================

INSERT INTO commissions (name, description, type, value, scope, is_system_commission, priority, active)
SELECT
  'Comisión Sistema Global',
  'Comisión base del sistema para todas las ventas',
  'percentage'::commission_type,
  0.05,
  'global'::commission_scope,
  true,
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM commissions WHERE scope = 'global' AND is_system_commission = true LIMIT 1);

INSERT INTO commissions (name, description, type, value, scope, is_system_commission, priority, active)
SELECT
  'Comisión Agente Global',
  'Comisión base para agentes en todas las ventas',
  'percentage'::commission_type,
  0.03,
  'global'::commission_scope,
  false,
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM commissions WHERE scope = 'global' AND is_system_commission = false LIMIT 1);
