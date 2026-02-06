import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface DashboardStats {
  projects: { total: number; active: number };
  lots: { total: number; available: number; reserved: number; sold: number };
  leads: { total: number; recent: number };
  sales: { total: number; completed: number };
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Proyectos
  const { count: totalProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: activeProjects } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Lotes
  const { count: totalLots } = await supabase
    .from("lots")
    .select("*", { count: "exact", head: true });

  const { count: availableLots } = await supabase
    .from("lots")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");

  const { count: reservedLots } = await supabase
    .from("lots")
    .select("*", { count: "exact", head: true })
    .eq("status", "reserved");

  const { count: soldLots } = await supabase
    .from("lots")
    .select("*", { count: "exact", head: true })
    .eq("status", "sold");

  // Leads
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  // Ventas
  const { count: totalSales } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true });

  const { count: completedSales } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  return {
    projects: {
      total: totalProjects || 0,
      active: activeProjects || 0,
    },
    lots: {
      total: totalLots || 0,
      available: availableLots || 0,
      reserved: reservedLots || 0,
      sold: soldLots || 0,
    },
    leads: {
      total: totalLeads || 0,
      recent: recentLeads || 0,
    },
    sales: {
      total: totalSales || 0,
      completed: completedSales || 0,
    },
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Proyectos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <Link
              href="/admin/proyectos"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.projects.total}</p>
          <p className="text-sm text-gray-500">
            Proyectos totales
            <span className="text-emerald-600 ml-2">
              ({stats.projects.active} activos)
            </span>
          </p>
        </div>

        {/* Lotes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.lots.total}</p>
          <p className="text-sm text-gray-500">Lotes totales</p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              {stats.lots.available} disponibles
            </span>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
              {stats.lots.reserved} reservados
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
              {stats.lots.sold} vendidos
            </span>
          </div>
        </div>

        {/* Leads */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <Link
              href="/admin/leads"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.leads.total}</p>
          <p className="text-sm text-gray-500">
            Leads totales
            <span className="text-purple-600 ml-2">
              (+{stats.leads.recent} esta semana)
            </span>
          </p>
        </div>

        {/* Ventas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.sales.total}</p>
          <p className="text-sm text-gray-500">
            Ventas totales
            <span className="text-emerald-600 ml-2">
              ({stats.sales.completed} completadas)
            </span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/proyectos/nuevo"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
              Nuevo proyecto
            </span>
          </Link>
          <Link
            href="/admin/leads"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
              Ver leads
            </span>
          </Link>
          <Link
            href="/proyectos"
            target="_blank"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
              Ver sitio público
            </span>
          </Link>
          <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">
              Generar reporte
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
