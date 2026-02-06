"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ImageUploader from "@/app/components/admin/ImageUploader";
import LocationPicker from "@/app/components/admin/LocationPicker";

interface Lot {
  id: string;
  lot_number: string;
  size_m2: number | null;
  price: number | null;
  status: "available" | "reserved" | "sold" | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  status: "draft" | "active" | "coming_soon" | "sold_out";
  location_name: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  google_maps_url: string | null;
  price_from: number | null;
  price_to: number | null;
  total_lots: number | null;
  available_lots: number | null;
  lot_size_from: number | null;
  lot_size_to: number | null;
  amenities: string[];
  lot_numbering_format: "alphanumeric" | "numeric";
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
}

const STATUS_COLORS = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
};

export default function EditarProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "images" | "location" | "lots">("info");
  const [projectImages, setProjectImages] = useState<string[]>([]);

  // Lot creation modal
  const [showLotModal, setShowLotModal] = useState(false);
  const [newLot, setNewLot] = useState({
    lot_number: "",
    zone: "",
    area_m2: "",
    price: "",
    status: "available" as "available" | "reserved" | "sold",
  });

  // Bulk lot creation
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLots, setBulkLots] = useState({
    count: "10",
    prefix: "A",
    start_number: "1",
    zone: "",
    default_area: "",
    default_price: "",
  });

  useEffect(() => {
    loadProject();
    loadLots();
    loadProjectImages();
  }, [id]);

  const loadProjectImages = async () => {
    const { data, error } = await supabase
      .from("media")
      .select("source_url, order_index")
      .eq("entity_type", "project")
      .eq("entity_id", id)
      .order("order_index", { ascending: true });

    if (!error && data) {
      setProjectImages(data.map((m) => m.source_url));
    }
  };

  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading project:", error);
      router.push("/admin/proyectos");
      return;
    }

    setProject(data as unknown as Project);
    setLoading(false);
  };

  const loadLots = async () => {
    const { data, error } = await supabase
      .from("lots")
      .select("id, lot_number, size_m2, price, status")
      .eq("project_id", id)
      .order("lot_number", { ascending: true });

    if (error) {
      console.error("Error loading lots:", error);
      return;
    }

    setLots((data || []) as unknown as Lot[]);
  };

  const handleSaveProject = async () => {
    if (!project) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: project.name,
          slug: project.slug,
          description: project.description,
          short_description: project.short_description,
          status: project.status as "active" | "inactive",
          location_name: project.location_name,
          city: project.city,
          state: project.state,
          address: project.address,
          google_maps_url: project.google_maps_url,
          price_from: project.price_from,
          price_to: project.price_to,
          total_lots: project.total_lots,
          lot_size_from: project.lot_size_from,
          lot_size_to: project.lot_size_to,
          amenities: project.amenities,
          lot_numbering_format: project.lot_numbering_format,
          cover_image_url: project.cover_image_url,
          latitude: project.latitude,
          longitude: project.longitude,
          postal_code: project.postal_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Proyecto guardado exitosamente" });
    } catch (err) {
      console.error("Error saving project:", err);
      setMessage({ type: "error", text: "Error al guardar el proyecto" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLot = async () => {
    try {
      const { error } = await supabase.from("lots").insert({
        project_id: id,
        lot_number: newLot.lot_number,
        size_m2: newLot.area_m2 ? parseFloat(newLot.area_m2) : null,
        price: newLot.price ? parseFloat(newLot.price) : null,
        status: newLot.status as "available" | "reserved" | "sold",
      });

      if (error) throw error;

      setShowLotModal(false);
      setNewLot({ lot_number: "", zone: "", area_m2: "", price: "", status: "available" });
      loadLots();
      updateProjectLotCounts();
      setMessage({ type: "success", text: "Lote creado exitosamente" });
    } catch (err) {
      console.error("Error creating lot:", err);
      setMessage({ type: "error", text: "Error al crear el lote" });
    }
  };

  const handleBulkCreateLots = async () => {
    try {
      const count = parseInt(bulkLots.count);
      const startNumber = parseInt(bulkLots.start_number);
      const lotsToCreate = [];

      for (let i = 0; i < count; i++) {
        const lotNumber = bulkLots.prefix
          ? `${bulkLots.prefix}${startNumber + i}`
          : `${startNumber + i}`;

        lotsToCreate.push({
          project_id: id,
          lot_number: lotNumber,
          size_m2: bulkLots.default_area ? parseFloat(bulkLots.default_area) : null,
          price: bulkLots.default_price ? parseFloat(bulkLots.default_price) : null,
          status: "available" as const,
        });
      }

      const { error } = await supabase.from("lots").insert(lotsToCreate);

      if (error) throw error;

      setShowBulkModal(false);
      setBulkLots({ count: "10", prefix: "A", start_number: "1", zone: "", default_area: "", default_price: "" });
      loadLots();
      updateProjectLotCounts();
      setMessage({ type: "success", text: `${count} lotes creados exitosamente` });
    } catch (err) {
      console.error("Error creating lots:", err);
      setMessage({ type: "error", text: "Error al crear los lotes" });
    }
  };

  const updateProjectLotCounts = async () => {
    // Get count of all lots and available lots
    const { data: allLots } = await supabase
      .from("lots")
      .select("status")
      .eq("project_id", id);

    if (allLots) {
      const total = allLots.length;
      const available = allLots.filter((l) => l.status === "available").length;

      await supabase
        .from("projects")
        .update({
          total_lots: total,
          available_lots: available,
        })
        .eq("id", id);

      if (project) {
        setProject({ ...project, total_lots: total, available_lots: available });
      }
    }
  };

  const handleUpdateLotStatus = async (lotId: string, newStatus: "available" | "reserved" | "sold") => {
    try {
      const { error } = await supabase
        .from("lots")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", lotId);

      if (error) throw error;

      loadLots();
      updateProjectLotCounts();
    } catch (err) {
      console.error("Error updating lot:", err);
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    if (!confirm("¿Estás seguro de eliminar este lote?")) return;

    try {
      const { error } = await supabase.from("lots").delete().eq("id", lotId);

      if (error) throw error;

      loadLots();
      updateProjectLotCounts();
      setMessage({ type: "success", text: "Lote eliminado" });
    } catch (err) {
      console.error("Error deleting lot:", err);
      setMessage({ type: "error", text: "Error al eliminar el lote" });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "-";
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

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Proyecto no encontrado</p>
        <Link href="/admin/proyectos" className="text-emerald-600 hover:underline mt-4 inline-block">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/proyectos"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a proyectos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1">
              {lots.length} lotes · {lots.filter((l) => l.status === "available").length} disponibles
            </p>
          </div>
          <Link
            href={`/proyectos/${project.slug}${project.status !== "active" ? "?preview=true" : ""}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver público
          </Link>
        </div>
      </div>

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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "info"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "images"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Imágenes ({projectImages.length})
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "location"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ubicación
          </button>
          <button
            onClick={() => setActiveTab("lots")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "lots"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Lotes ({lots.length})
          </button>
        </div>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del proyecto
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={project.status}
                onChange={(e) => setProject({ ...project, status: e.target.value as Project["status"] })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="draft">Borrador</option>
                <option value="coming_soon">Próximamente</option>
                <option value="active">Activo</option>
                <option value="sold_out">Vendido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={project.location_name || ""}
                onChange={(e) => setProject({ ...project, location_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio desde (MXN)
              </label>
              <input
                type="number"
                value={project.price_from || ""}
                onChange={(e) => setProject({ ...project, price_from: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={project.description || ""}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Galería de Imágenes</h3>
          <ImageUploader
            projectId={id}
            currentImages={projectImages}
            coverImage={project.cover_image_url}
            onImagesChange={(images) => {
              setProjectImages(images);
            }}
            onCoverChange={(url) => {
              setProject({ ...project, cover_image_url: url });
              // Also save immediately
              supabase
                .from("projects")
                .update({ cover_image_url: url, updated_at: new Date().toISOString() })
                .eq("id", id)
                .then(() => {
                  setMessage({ type: "success", text: "Portada actualizada" });
                  setTimeout(() => setMessage(null), 2000);
                });
            }}
          />
        </div>
      )}

      {/* Location Tab */}
      {activeTab === "location" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación del Proyecto</h3>
          <LocationPicker
            latitude={project.latitude}
            longitude={project.longitude}
            address={project.address}
            city={project.city}
            state={project.state}
            postalCode={project.postal_code}
            googleMapsUrl={project.google_maps_url}
            onLocationChange={(location) => {
              setProject({
                ...project,
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                city: location.city,
                state: location.state,
                postal_code: location.postalCode,
                google_maps_url: location.googleMapsUrl,
              });
            }}
          />
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar ubicación"}
            </button>
          </div>
        </div>
      )}

      {/* Lots Tab */}
      {activeTab === "lots" && (
        <div>
          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowLotModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar lote
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Crear lotes masivos
            </button>
          </div>

          {/* Lots Grid */}
          {lots.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin lotes</h3>
              <p className="text-gray-500 mb-6">Agrega lotes a este proyecto para empezar a vender.</p>
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
              >
                Crear lotes masivos
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{lot.lot_number}</td>
                      <td className="px-6 py-4 text-gray-500">{lot.size_m2 ? `${lot.size_m2} m²` : "-"}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{formatPrice(lot.price)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={lot.status || "available"}
                          onChange={(e) => handleUpdateLotStatus(lot.id, e.target.value as "available" | "reserved" | "sold")}
                          className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[lot.status || "available"]}`}
                        >
                          <option value="available">Disponible</option>
                          <option value="reserved">Reservado</option>
                          <option value="sold">Vendido</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteLot(lot.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Single Lot Modal */}
      {showLotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar lote</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de lote *</label>
                <input
                  type="text"
                  value={newLot.lot_number}
                  onChange={(e) => setNewLot({ ...newLot, lot_number: e.target.value })}
                  placeholder="A1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                <input
                  type="text"
                  value={newLot.zone}
                  onChange={(e) => setNewLot({ ...newLot, zone: e.target.value })}
                  placeholder="A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
                  <input
                    type="number"
                    value={newLot.area_m2}
                    onChange={(e) => setNewLot({ ...newLot, area_m2: e.target.value })}
                    placeholder="200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (MXN)</label>
                  <input
                    type="number"
                    value={newLot.price}
                    onChange={(e) => setNewLot({ ...newLot, price: e.target.value })}
                    placeholder="800000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={newLot.status}
                  onChange={(e) => setNewLot({ ...newLot, status: e.target.value as "available" | "reserved" | "sold" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLotModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLot}
                disabled={!newLot.lot_number}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Crear lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Lots Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear lotes masivos</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de lotes *</label>
                <input
                  type="number"
                  value={bulkLots.count}
                  onChange={(e) => setBulkLots({ ...bulkLots, count: e.target.value })}
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo (opcional)</label>
                  <input
                    type="text"
                    value={bulkLots.prefix}
                    onChange={(e) => setBulkLots({ ...bulkLots, prefix: e.target.value })}
                    placeholder="A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número inicial</label>
                  <input
                    type="number"
                    value={bulkLots.start_number}
                    onChange={(e) => setBulkLots({ ...bulkLots, start_number: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona (opcional)</label>
                <input
                  type="text"
                  value={bulkLots.zone}
                  onChange={(e) => setBulkLots({ ...bulkLots, zone: e.target.value })}
                  placeholder="Zona A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área por defecto (m²)</label>
                  <input
                    type="number"
                    value={bulkLots.default_area}
                    onChange={(e) => setBulkLots({ ...bulkLots, default_area: e.target.value })}
                    placeholder="200"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio por defecto</label>
                  <input
                    type="number"
                    value={bulkLots.default_price}
                    onChange={(e) => setBulkLots({ ...bulkLots, default_price: e.target.value })}
                    placeholder="800000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Se crearán lotes: <span className="font-medium">{bulkLots.prefix}{bulkLots.start_number}</span> hasta{" "}
                  <span className="font-medium">
                    {bulkLots.prefix}{parseInt(bulkLots.start_number) + parseInt(bulkLots.count) - 1}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkCreateLots}
                disabled={!bulkLots.count || parseInt(bulkLots.count) < 1}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Crear {bulkLots.count} lotes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
