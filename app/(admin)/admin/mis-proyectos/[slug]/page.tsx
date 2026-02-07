"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Lot {
  id: string;
  lot_number: string;
  area_m2: number | null;
  price: number | null;
  status: "available" | "reserved" | "sold" | "pending_review" | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  location_name: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
  pending_review: "Pendiente Revisión",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reserved: "bg-amber-100 text-amber-700 border-amber-200",
  sold: "bg-red-100 text-red-700 border-red-200",
  pending_review: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function MiProyectoDetallePage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadProjectAndLots();
  }, [slug]);

  const loadProjectAndLots = async () => {
    setLoading(true);

    // Cargar proyecto
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, name, slug, location_name")
      .eq("slug", slug)
      .single();

    if (projectError || !projectData) {
      console.error("Error loading project:", projectError);
      setLoading(false);
      return;
    }

    setProject(projectData);

    // Cargar lotes
    const { data: lotsData, error: lotsError } = await supabase
      .from("lots")
      .select("id, lot_number, area_m2, price, status")
      .eq("project_id", projectData.id)
      .order("lot_number", { ascending: true });

    if (lotsError) {
      console.error("Error loading lots:", lotsError);
      setMessage({ type: "error", text: "Error al cargar los lotes. Por favor intenta más tarde." });
    } else {
      setLots(lotsData || []);
    }

    setLoading(false);

    // Logging de depuración
    console.log("Load Project - Slug:", slug);
    console.log("Project Data:", projectData);
    console.log("Lots Data Length:", lotsData?.length);

    // Verificar si el usuario tiene permiso (asignación) para ver los lotes
    if (lotsData?.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Auth User:", user?.id);

      if (user) {
        const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
        console.log("User Role:", userData?.role);

        // Verificar ambas variantes del rol
        if (userData && ["agent", "agente"].includes(userData.role)) {
          const { data: assignment, error: assignmentError } = await supabase
            .from("agent_assignments")
            .select("id")
            .eq("project_id", projectData.id)
            .eq("agent_id", user.id)
            .maybeSingle();

          console.log("Assignment Check:", assignment);

          if (!assignment) {
            console.log("No assignment found, showing error.");
            setMessage({ type: "error", text: "No tienes asignado este proyecto. Contacta a un administrador para ver los detalles." });
          }
        }
      }
    }
  };

  const handleStatusChange = async (lotId: string, newStatus: Lot["status"]) => {
    setUpdating(lotId);
    setMessage(null);

    const { error } = await supabase
      .from("lots")
      .update({ status: newStatus as "available" | "reserved" | "sold", updated_at: new Date().toISOString() })
      .eq("id", lotId);

    if (error) {
      console.error("Error updating lot:", error);
      setMessage({ type: "error", text: "Error al actualizar el estado" });
    } else {
      setLots(lots.map((l) => (l.id === lotId ? { ...l, status: newStatus } : l)));
      setMessage({ type: "success", text: `Lote actualizado a "${STATUS_LABELS[newStatus || "available"]}"` });
      setTimeout(() => setMessage(null), 3000);
    }

    setUpdating(null);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "$0";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredLots = filter === "all" ? lots : lots.filter((l) => l.status === filter);

  const stats = {
    total: lots.length,
    available: lots.filter((l) => l.status === "available").length,
    reserved: lots.filter((l) => l.status === "reserved").length,
    sold: lots.filter((l) => l.status === "sold").length,
    pending_review: lots.filter((l) => l.status === "pending_review").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-700">Proyecto no encontrado</h2>
        <Link href="/admin/mis-proyectos" className="text-emerald-600 hover:underline mt-2 inline-block">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/mis-proyectos"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis proyectos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 flex items-center gap-1 mt-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {project.location_name}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border text-left transition-colors ${filter === "all" ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </button>
        <button
          onClick={() => setFilter("available")}
          className={`p-4 rounded-xl border text-left transition-colors ${filter === "available" ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
          <p className="text-sm text-gray-500">Disponibles</p>
        </button>
        <button
          onClick={() => setFilter("reserved")}
          className={`p-4 rounded-xl border text-left transition-colors ${filter === "reserved" ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <p className="text-2xl font-bold text-amber-600">{stats.reserved}</p>
          <p className="text-sm text-gray-500">Reservados</p>
        </button>
        <button
          onClick={() => setFilter("sold")}
          className={`p-4 rounded-xl border text-left transition-colors ${filter === "sold" ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.sold}</p>
          <p className="text-sm text-gray-500">Vendidos</p>
        </button>
      </div>

      {/* Lots Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            Lotes {filter !== "all" && `(${STATUS_LABELS[filter]})`}
          </h2>
        </div>

        {filteredLots.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay lotes {filter !== "all" && STATUS_LABELS[filter].toLowerCase()}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {filteredLots.map((lot) => (
              <div
                key={lot.id}
                className={`relative p-4 rounded-lg border-2 ${STATUS_COLORS[lot.status || "available"]} transition-all`}
              >
                {/* Lot Number */}
                <div className="text-center mb-3">
                  <span className="text-lg font-bold">
                    {lot.lot_number}
                  </span>
                </div>

                {/* Info */}
                <div className="text-xs space-y-1 mb-3">
                  <p>
                    <span className="text-gray-500">Área:</span> {lot.area_m2 || 0} m²
                  </p>
                  <p>
                    <span className="text-gray-500">Precio:</span> {formatPrice(lot.price)}
                  </p>
                </div>

                {/* Status Selector */}
                <select
                  value={lot.status || "available"}
                  onChange={(e) => handleStatusChange(lot.id, e.target.value as Lot["status"])}
                  disabled={updating === lot.id || lot.status === "pending_review"}
                  className={`w-full text-xs font-medium px-2 py-1.5 rounded border-0 cursor-pointer ${updating === lot.id || lot.status === "pending_review" ? "opacity-50" : ""
                    } ${STATUS_COLORS[lot.status || "available"]}`}
                >
                  {lot.status === "sold" ? (
                    <>
                      <option value="sold">Vendido</option>
                      <option value="pending_review">Solicitar Revisión</option>
                    </>
                  ) : lot.status === "pending_review" ? (
                    <option value="pending_review">Pendiente Revisión</option>
                  ) : (
                    <>
                      <option value="available">Disponible</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                    </>
                  )}
                </select>

                {updating === lot.id && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Guía de estados</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <span className="font-medium text-emerald-700">Disponible:</span> El lote está a la venta
          </li>
          <li>
            <span className="font-medium text-amber-700">Reservado:</span> Cliente interesado, apartado temporalmente
          </li>
          <li>
            <span className="font-medium text-red-700">Vendido:</span> Venta completada, lote no disponible
          </li>
          <li>
            <span className="font-medium text-purple-700">Pendiente Revisión:</span> Solicitud para revertir venta (requiere aprobación de admin)
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Nota:</strong> Los lotes vendidos solo pueden cambiarse a &quot;Pendiente Revisión&quot;. Un administrador debe aprobar la reversión.
        </p>
      </div>
    </div>
  );
}
