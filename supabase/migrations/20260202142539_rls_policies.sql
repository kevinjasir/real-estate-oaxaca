-- ============================================================================
-- POLÍTICAS RLS PARA TABLAS EXISTENTES
-- Plataforma Inmobiliaria Costa Oaxaca
-- ============================================================================

-- ============================================================================
-- RLS PARA PROJECTS
-- ============================================================================

-- Ya tiene RLS habilitado, actualizar políticas

-- Público puede ver proyectos activos (ya existe, pero la recreamos limpia)
DROP POLICY IF EXISTS "Public can view active projects" ON projects;
CREATE POLICY "Public can view active projects"
  ON projects FOR SELECT
  USING (status = 'active');

-- Admins pueden ver todos los proyectos
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (public.is_admin());

-- Admins pueden crear proyectos
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins pueden actualizar proyectos
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (public.is_admin());

-- Super admins pueden eliminar proyectos
DROP POLICY IF EXISTS "Super admins can delete projects" ON projects;
CREATE POLICY "Super admins can delete projects"
  ON projects FOR DELETE
  USING (public.is_super_admin());

-- ============================================================================
-- RLS PARA LOTS
-- ============================================================================

-- Público puede ver lotes de proyectos activos
DROP POLICY IF EXISTS "Public can view lots of active projects" ON lots;
DROP POLICY IF EXISTS "Public can view lots" ON lots;
CREATE POLICY "Public can view lots of active projects"
  ON lots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = lots.project_id
      AND projects.status = 'active'
    )
  );

-- Admins pueden ver todos los lotes
DROP POLICY IF EXISTS "Admins can view all lots" ON lots;
CREATE POLICY "Admins can view all lots"
  ON lots FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver lotes de sus proyectos asignados
DROP POLICY IF EXISTS "Agents can view assigned lots" ON lots;
CREATE POLICY "Agents can view assigned lots"
  ON lots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_assignments aa
      WHERE aa.agent_id = auth.uid()
      AND (aa.project_id = lots.project_id OR aa.lot_id = lots.id)
    )
  );

-- Admins pueden gestionar lotes
DROP POLICY IF EXISTS "Admins can manage lots" ON lots;
CREATE POLICY "Admins can manage lots"
  ON lots FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA LEADS
-- ============================================================================

-- Ya tiene RLS habilitado, actualizar políticas

-- Público puede crear leads (formularios)
DROP POLICY IF EXISTS "Public can submit leads" ON leads;
CREATE POLICY "Public can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver todos los leads
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
CREATE POLICY "Admins can view all leads"
  ON leads FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver leads asignados a ellos o sin asignar
DROP POLICY IF EXISTS "Agents can view assigned leads" ON leads;
CREATE POLICY "Agents can view assigned leads"
  ON leads FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    assigned_to IS NULL OR
    public.is_admin()
  );

-- Agentes pueden actualizar leads asignados a ellos
DROP POLICY IF EXISTS "Agents can update assigned leads" ON leads;
CREATE POLICY "Agents can update assigned leads"
  ON leads FOR UPDATE
  USING (assigned_to = auth.uid() OR public.is_admin());

-- Admins pueden asignar leads (actualizar assigned_to)
DROP POLICY IF EXISTS "Admins can manage leads" ON leads;
CREATE POLICY "Admins can manage leads"
  ON leads FOR UPDATE
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA MEDIA
-- ============================================================================

-- Público puede ver media
DROP POLICY IF EXISTS "Public can view active media" ON media;
DROP POLICY IF EXISTS "Public can view media" ON media;
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

-- Admins pueden gestionar toda la media
DROP POLICY IF EXISTS "Admins can manage media" ON media;
CREATE POLICY "Admins can manage media"
  ON media FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA TESTIMONIALS
-- ============================================================================

-- Público puede ver testimonios activos (ya existe)
DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
CREATE POLICY "Public can view active testimonials"
  ON testimonials FOR SELECT
  USING (active = true);

-- Admins pueden gestionar testimonios
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA FAQS
-- ============================================================================

-- Público puede ver FAQs activas
DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Public can view faqs" ON faqs;
CREATE POLICY "Public can view active FAQs"
  ON faqs FOR SELECT
  USING (active = true);

-- Admins pueden gestionar FAQs
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
CREATE POLICY "Admins can manage faqs"
  ON faqs FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA SITE_SETTINGS
-- ============================================================================

-- Público puede ver configuraciones
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Solo super_admins pueden modificar configuraciones
DROP POLICY IF EXISTS "Super admins can manage site settings" ON site_settings;
CREATE POLICY "Super admins can manage site settings"
  ON site_settings FOR ALL
  USING (public.is_super_admin());

-- ============================================================================
-- RLS PARA CONTACT_SUBMISSIONS
-- ============================================================================

-- Público puede enviar formularios de contacto
DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;
DROP POLICY IF EXISTS "Public can submit contact" ON contact_submissions;
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver y gestionar submissions
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (public.is_admin());

-- ============================================================================
-- RLS PARA SCHEDULED_VISITS
-- ============================================================================

-- Público puede agendar visitas
DROP POLICY IF EXISTS "Public can schedule visits" ON scheduled_visits;
CREATE POLICY "Public can schedule visits"
  ON scheduled_visits FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver todas las visitas
DROP POLICY IF EXISTS "Admins can view all visits" ON scheduled_visits;
CREATE POLICY "Admins can view all visits"
  ON scheduled_visits FOR SELECT
  USING (public.is_admin());

-- Agentes pueden ver visitas de sus proyectos asignados
DROP POLICY IF EXISTS "Agents can view assigned visits" ON scheduled_visits;
CREATE POLICY "Agents can view assigned visits"
  ON scheduled_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_assignments aa
      WHERE aa.agent_id = auth.uid()
      AND aa.project_id = scheduled_visits.project_id
    )
  );

-- Admins pueden gestionar visitas
DROP POLICY IF EXISTS "Admins can manage visits" ON scheduled_visits;
CREATE POLICY "Admins can manage visits"
  ON scheduled_visits FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================================================

-- Vista de resumen de ventas por agente
CREATE OR REPLACE VIEW agent_sales_summary AS
SELECT
  u.id as agent_id,
  u.full_name as agent_name,
  u.email as agent_email,
  COUNT(s.id) as total_sales,
  COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_sales,
  COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.sale_price END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN s.status = 'completed' THEN s.agent_commission_amount END), 0) as total_commission
FROM users u
LEFT JOIN sales s ON s.agent_id = u.id
WHERE u.role = 'agent' AND u.active = true
GROUP BY u.id, u.full_name, u.email;

-- Vista de resumen de proyectos
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.location_name,
  p.status,
  COUNT(l.id) as total_lots,
  COUNT(CASE WHEN l.status = 'available' THEN 1 END) as available_lots,
  COUNT(CASE WHEN l.status = 'reserved' THEN 1 END) as reserved_lots,
  COUNT(CASE WHEN l.status = 'sold' THEN 1 END) as sold_lots,
  COALESCE(MIN(l.price), 0) as min_price,
  COALESCE(MAX(l.price), 0) as max_price
FROM projects p
LEFT JOIN lots l ON l.project_id = p.id
GROUP BY p.id, p.name, p.slug, p.location_name, p.status;

-- Vista de leads con información relacionada
CREATE OR REPLACE VIEW leads_extended AS
SELECT
  l.*,
  p.name as project_name,
  p.slug as project_slug,
  lot.lot_number,
  u.full_name as assigned_to_name
FROM leads l
LEFT JOIN projects p ON p.id = l.project_id
LEFT JOIN lots lot ON lot.id = l.lot_id
LEFT JOIN users u ON u.id = l.assigned_to;
