import { createClient } from "@/lib/supabase/server";

interface SalesMetrics {
  totalSales: number;
  completedSales: number;
  totalRevenue: number;
  totalCommissions: number;
}

interface ProjectMetrics {
  id: string;
  name: string;
  slug: string;
  totalLots: number;
  availableLots: number;
  soldLots: number;
  reservedLots: number;
  pendingReviewLots: number;
  occupancyRate: number;
}

interface AgentMetrics {
  id: string;
  full_name: string;
  email: string;
  assignedProjects: number;
  totalSales: number;
  completedSales: number;
  totalRevenue: number;
  commission: number;
}

interface LeadMetrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  bySource: { source: string; count: number }[];
}

async function getSalesMetrics(): Promise<SalesMetrics> {
  const supabase = await createClient();

  const { data: sales } = await supabase.from("sales").select("*");

  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      completedSales: 0,
      totalRevenue: 0,
      totalCommissions: 0,
    };
  }

  const completedSales = sales.filter((s) => s.status === "completed");

  return {
    totalSales: sales.length,
    completedSales: completedSales.length,
    totalRevenue: completedSales.reduce((sum, s) => sum + (s.sale_price || 0), 0),
    totalCommissions: completedSales.reduce(
      (sum, s) =>
        sum +
        (s.system_commission_amount || 0) +
        (s.agent_commission_amount || 0),
      0
    ),
  };
}

async function getProjectMetrics(): Promise<ProjectMetrics[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("status", "active");

  if (!projects) return [];

  const metrics: ProjectMetrics[] = [];

  for (const project of projects) {
    const { data: lots } = await supabase
      .from("lots")
      .select("status")
      .eq("project_id", project.id);

    const totalLots = lots?.length || 0;
    const availableLots = lots?.filter((l) => l.status === "available").length || 0;
    const soldLots = lots?.filter((l) => l.status === "sold").length || 0;
    const reservedLots = lots?.filter((l) => l.status === "reserved").length || 0;
    const pendingReviewLots = lots?.filter((l) => l.status === "pending_review").length || 0;

    metrics.push({
      id: project.id,
      name: project.name,
      slug: project.slug,
      totalLots,
      availableLots,
      soldLots,
      reservedLots,
      pendingReviewLots,
      occupancyRate: totalLots > 0 ? ((soldLots + reservedLots) / totalLots) * 100 : 0,
    });
  }

  return metrics;
}

async function getLeadMetrics(): Promise<LeadMetrics> {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { count: thisWeek } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneWeekAgo.toISOString());

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const { count: thisMonth } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneMonthAgo.toISOString());

  // Leads por fuente
  const { data: leadsBySource } = await supabase
    .from("leads")
    .select("source");

  const sourceCount: Record<string, number> = {};
  leadsBySource?.forEach((lead) => {
    sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
  });

  return {
    total: total || 0,
    thisWeek: thisWeek || 0,
    thisMonth: thisMonth || 0,
    bySource: Object.entries(sourceCount).map(([source, count]) => ({
      source,
      count,
    })),
  };
}

async function getAgentMetrics(): Promise<AgentMetrics[]> {
  const supabase = await createClient();

  // Get all agents
  const { data: agents } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("role", "agent")
    .eq("active", true);

  if (!agents) return [];

  const metrics: AgentMetrics[] = [];

  for (const agent of agents) {
    // Get assigned projects count
    const { count: assignedProjects } = await supabase
      .from("agent_assignments")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agent.id);

    // Get sales
    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("agent_id", agent.id);

    const totalSales = sales?.length || 0;
    const completedSales = sales?.filter((s) => s.status === "completed").length || 0;
    const totalRevenue = sales?.filter((s) => s.status === "completed").reduce((sum, s) => sum + (s.sale_price || 0), 0) || 0;
    const commission = sales?.filter((s) => s.status === "completed").reduce((sum, s) => sum + (s.agent_commission_amount || 0), 0) || 0;

    metrics.push({
      id: agent.id,
      full_name: agent.full_name,
      email: agent.email,
      assignedProjects: assignedProjects || 0,
      totalSales,
      completedSales,
      totalRevenue,
      commission,
    });
  }

  return metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ReportesPage() {
  const [salesMetrics, projectMetrics, leadMetrics, agentMetrics] = await Promise.all([
    getSalesMetrics(),
    getProjectMetrics(),
    getLeadMetrics(),
    getAgentMetrics(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Métricas</h1>
        <p className="text-gray-500">
          Análisis detallado del rendimiento de la plataforma
        </p>
      </div>

      {/* Sales Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Ventas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {salesMetrics.totalSales}
            </p>
            <p className="text-sm text-gray-500">Ventas totales</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-600">
              {salesMetrics.completedSales}
            </p>
            <p className="text-sm text-gray-500">Ventas completadas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(salesMetrics.totalRevenue)}
            </p>
            <p className="text-sm text-gray-500">Ingresos totales</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(salesMetrics.totalCommissions)}
            </p>
            <p className="text-sm text-gray-500">Comisiones generadas</p>
          </div>
        </div>
      </div>

      {/* Lead Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Métricas de Leads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {leadMetrics.total}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {leadMetrics.thisWeek}
                </p>
                <p className="text-xs text-gray-500">Esta semana</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {leadMetrics.thisMonth}
                </p>
                <p className="text-xs text-gray-500">Este mes</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Por fuente
            </h3>
            {leadMetrics.bySource.length === 0 ? (
              <p className="text-sm text-gray-400">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {leadMetrics.bySource.map(({ source, count }) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {source === "web" ? "Sitio web" : source}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(count / leadMetrics.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Proyecto
        </h2>
        {projectMetrics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay proyectos activos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Proyecto
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Disponibles
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Reservados
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Vendidos
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Pendientes
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Ocupación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectMetrics.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{project.name}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-900">
                      {project.totalLots}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-emerald-600 font-medium">
                        {project.availableLots}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-amber-600 font-medium">
                        {project.reservedLots}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-red-600 font-medium">
                        {project.soldLots}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-purple-600 font-medium">
                        {project.pendingReviewLots}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${project.occupancyRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {project.occupancyRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento de Agentes
        </h2>
        {agentMetrics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay agentes activos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Agente
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Proyectos
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Ventas
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Completadas
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Ingresos
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                    Comisión
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agentMetrics.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{agent.full_name}</p>
                      <p className="text-xs text-gray-500">{agent.email}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-900">
                      {agent.assignedProjects}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-900">
                      {agent.totalSales}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-emerald-600 font-medium">
                        {agent.completedSales}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      {formatCurrency(agent.totalRevenue)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-amber-600 font-medium">
                        {formatCurrency(agent.commission)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar CSV
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Imprimir reporte
        </button>
      </div>
    </div>
  );
}
