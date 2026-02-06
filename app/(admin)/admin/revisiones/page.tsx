"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Lot {
  id: string;
  lot_number: string;
  block: string | null;
  area_m2: number;
  price: number;
  status: string;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function RevisionesPage() {
  const supabase = createClient();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadPendingLots();
  }, []);

  const loadPendingLots = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("lots")
      .select(`
        id,
        lot_number,
        block,
        area_m2,
        price,
        status,
        project:projects(id, name, slug)
      `)
      .eq("status", "pending_review" as unknown as "available")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading pending lots:", error);
    } else {
      setLots(data as unknown as Lot[]);
    }
    setLoading(false);
  };

  const handleApprove = async (lotId: string) => {
    setUpdating(lotId);
    setMessage(null);

    const { error } = await supabase
      .from("lots")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("id", lotId);

    if (error) {
      console.error("Error approving:", error);
      setMessage({ type: "error", text: "Error al aprobar la reversión" });
    } else {
      setMessage({ type: "success", text: "Lote revertido a disponible" });
      setLots(lots.filter((l) => l.id !== lotId));
    }

    setUpdating(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReject = async (lotId: string) => {
    setUpdating(lotId);
    setMessage(null);

    const { error } = await supabase
      .from("lots")
      .update({ status: "sold", updated_at: new Date().toISOString() })
      .eq("id", lotId);

    if (error) {
      console.error("Error rejecting:", error);
      setMessage({ type: "error", text: "Error al rechazar la solicitud" });
    } else {
      setMessage({ type: "success", text: "Solicitud rechazada, lote sigue como vendido" });
      setLots(lots.filter((l) => l.id !== lotId));
    }

    setUpdating(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Revisiones Pendientes</h1>
        <p className="text-gray-500 mt-1">
          Solicitudes de agentes para revertir ventas de lotes
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pending Lots */}
      {lots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No hay revisiones pendientes
          </h2>
          <p className="text-gray-500">
            Todas las solicitudes han sido procesadas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-purple-50">
            <h2 className="font-semibold text-purple-900">
              {lots.length} solicitud{lots.length !== 1 ? "es" : ""} pendiente{lots.length !== 1 ? "s" : ""}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {lots.map((lot) => (
              <div key={lot.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-gray-900">
                        Lote {lot.block ? `${lot.block}-` : ""}{lot.lot_number}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        Pendiente
                      </span>
                    </div>
                    <Link
                      href={`/admin/proyectos/${lot.project?.slug}`}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      {lot.project?.name}
                    </Link>
                    <div className="mt-2 text-sm text-gray-500 space-x-4">
                      <span>Área: {lot.area_m2} m²</span>
                      <span>Precio: {formatPrice(lot.price)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      El agente solicita revertir este lote de &quot;Vendido&quot; a &quot;Disponible&quot;
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(lot.id)}
                      disabled={updating === lot.id}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {updating === lot.id ? "..." : "Aprobar"}
                    </button>
                    <button
                      onClick={() => handleReject(lot.id)}
                      disabled={updating === lot.id}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Información</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            <strong>Aprobar:</strong> El lote cambia a &quot;Disponible&quot; y puede venderse nuevamente
          </li>
          <li>
            <strong>Rechazar:</strong> El lote permanece como &quot;Vendido&quot;
          </li>
        </ul>
      </div>
    </div>
  );
}
