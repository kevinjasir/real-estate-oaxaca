import type { Database } from "./database";

// ============================================================================
// TIPOS BASE EXTRAÍDOS DE DATABASE
// ============================================================================

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Lot = Database["public"]["Tables"]["lots"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];
export type Commission = Database["public"]["Tables"]["commissions"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type AgentAssignment = Database["public"]["Tables"]["agent_assignments"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type ScheduledVisit = Database["public"]["Tables"]["scheduled_visits"]["Row"];
export type Promoter = Database["public"]["Tables"]["promoters"]["Row"];

// Enums
export type LeadSourceEnum = Database["public"]["Enums"]["lead_source_enum"];
export type LotStatusEnum = Database["public"]["Enums"]["lot_status_enum"];
export type ProjectStatusEnum = Database["public"]["Enums"]["project_status_enum"];
export type SaleStatus = Database["public"]["Enums"]["sale_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type CommissionType = Database["public"]["Enums"]["commission_type"];
export type CommissionScope = Database["public"]["Enums"]["commission_scope"];
export type UserRole = Database["public"]["Enums"]["user_role"];

// Vistas
export type AgentSalesSummary = Database["public"]["Views"]["agent_sales_summary"]["Row"];
export type ProjectSummary = Database["public"]["Views"]["project_summary"]["Row"];
export type LeadExtended = Database["public"]["Views"]["leads_extended"]["Row"];

// ============================================================================
// TIPOS EXTENDIDOS CON RELACIONES
// ============================================================================

// Proyecto con media
export interface ProjectWithMedia extends Project {
  hero_image: string | null;
  gallery: string[];
  lots_count?: number;
  available_lots_count?: number;
}

// Proyecto con lotes
export interface ProjectWithLots extends ProjectWithMedia {
  lots: Lot[];
}

// Lote con proyecto
export interface LotWithProject extends Lot {
  project: Pick<Project, "id" | "name" | "slug" | "location_name" | "city">;
  images?: string[];
}

// Lote con detalles completos
export interface LotDetails extends Lot {
  project: Pick<Project, "id" | "name" | "slug" | "location_name" | "city" | "google_maps_url">;
  images: string[];
}

// Lead con relaciones
export interface LeadWithRelations extends Lead {
  project?: Pick<Project, "id" | "name" | "slug"> | null;
  lot?: Pick<Lot, "id" | "lot_number"> | null;
  assigned_user?: Pick<User, "id" | "full_name" | "email"> | null;
}

// Venta con relaciones
export interface SaleWithRelations extends Sale {
  lot: Pick<Lot, "id" | "lot_number" | "size_m2" | "project_id"> & {
    project: Pick<Project, "id" | "name" | "slug">;
  };
  agent: Pick<User, "id" | "full_name" | "email">;
  lead?: Pick<Lead, "id" | "name" | "phone"> | null;
}

// Usuario con estadísticas
export interface UserWithStats extends User {
  total_sales?: number;
  total_revenue?: number;
  total_commission?: number;
  assigned_projects?: number;
}

// ============================================================================
// TIPOS PARA REQUESTS
// ============================================================================

// Crear lead (público) - basado en el esquema real de la tabla leads
export interface CreateLeadRequest {
  name?: string;
  phone: string; // requerido en la DB
  whatsapp?: string;
  source: LeadSourceEnum; // requerido: "web" | "whatsapp"
  project_id: string; // requerido en la DB
  lot_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_url?: string;
}

// Crear contacto (público)
export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// Agendar visita (público)
export interface ScheduleVisitRequest {
  visitor_name: string;
  visitor_email?: string;
  visitor_phone: string;
  project_id: string;
  preferred_date: string;
  preferred_time?: string;
  visitor_notes?: string;
}

// Crear proyecto (admin)
export interface CreateProjectRequest {
  name: string;
  slug: string;
  city_id: string;
  state_id: string;
  country_id: string;
  description?: string;
  short_description?: string;
  status?: ProjectStatusEnum;
  featured?: boolean;
  location_name?: string;
  address?: string;
  address_text?: string;
  city?: string;
  state?: string;
  price_from?: number;
  price_to?: number;
  lot_size_from?: number;
  lot_size_to?: number;
  lot_numbering_format?: string;
  amenities?: string[];
  features?: string[];
  meta_title?: string;
  meta_description?: string;
}

// Crear lote (admin)
export interface CreateLotRequest {
  project_id: string;
  lot_number: string;
  custom_label?: string;
  status?: LotStatusEnum;
  size_m2?: number;
  price?: number;
  commission_override?: number;
  coordinates?: Record<string, unknown>;
}

// Crear venta (admin/agent)
export interface CreateSaleRequest {
  lot_id: string;
  lead_id?: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_rfc?: string;
  sale_price: number;
  down_payment?: number;
  financing_months?: number;
}

// ============================================================================
// TIPOS PARA RESPONSES
// ============================================================================

// Respuesta de API exitosa
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

// Error de API
export interface ApiError {
  data?: never;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Resultado de API (union type)
export type ApiResult<T> = ApiResponse<T> | ApiError;

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Respuesta de lotes de proyecto
export interface ProjectLotsResponse {
  project: Pick<Project, "id" | "name" | "slug">;
  lots: Lot[];
  total: number;
  available: number;
  reserved: number;
  sold: number;
}

// ============================================================================
// TIPOS PARA FILTROS Y QUERIES
// ============================================================================

export interface ProjectsFilter {
  status?: ProjectStatusEnum;
  featured?: boolean;
  location?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface LotsFilter {
  status?: LotStatusEnum;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
}

export interface LeadsFilter {
  source?: LeadSourceEnum;
  assigned_to?: string;
  project_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesFilter {
  status?: SaleStatus;
  agent_id?: string;
  project_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// TIPOS PARA MÉTRICAS
// ============================================================================

export interface DashboardMetrics {
  projects: {
    total: number;
    active: number;
  };
  lots: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  sales: {
    total: number;
    completed: number;
    totalRevenue: number;
    totalCommissions: number;
  };
}

export interface AgentMetrics {
  agent: Pick<User, "id" | "full_name" | "email">;
  sales: {
    total: number;
    completed: number;
    pending: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
  commission: {
    total: number;
    thisMonth: number;
  };
  leads: {
    assigned: number;
    converted: number;
    conversionRate: number;
  };
}

export interface SalesMetrics {
  period: "day" | "week" | "month" | "year";
  sales: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  commissions: {
    system: number;
    agents: number;
    total: number;
  };
  topAgents: Array<{
    id: string;
    name: string;
    salesCount: number;
    totalAmount: number;
  }>;
  topProjects: Array<{
    id: string;
    name: string;
    salesCount: number;
    totalAmount: number;
  }>;
}
