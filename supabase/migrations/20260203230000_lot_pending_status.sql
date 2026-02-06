-- ============================================================================
-- AGREGAR ESTADO "PENDING_REVIEW" A LOTES
-- Para cuando un agente quiera revertir una venta, necesita aprobación
-- ============================================================================

-- Agregar nuevo valor al enum lot_status si no existe
DO $$
BEGIN
  -- Verificar si el valor ya existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'pending_review'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lot_status')
  ) THEN
    ALTER TYPE lot_status ADD VALUE IF NOT EXISTS 'pending_review';
  END IF;
END $$;

-- Comentario
COMMENT ON TYPE lot_status IS 'Estados de lotes: available (disponible), reserved (reservado), sold (vendido), pending_review (pendiente de revisión - requiere aprobación admin)';
