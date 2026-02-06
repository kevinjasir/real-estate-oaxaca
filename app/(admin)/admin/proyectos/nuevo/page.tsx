"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ProjectFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  status: "draft" | "active" | "coming_soon" | "sold_out";
  location_name: string;
  city: string;
  state: string;
  address: string;
  google_maps_url: string;
  price_from: string;
  price_to: string;
  total_lots: string;
  lot_size_from: string;
  lot_size_to: string;
  amenities: string[];
  lot_numbering_format: "alphanumeric" | "numeric";
}

const AMENITIES_OPTIONS = [
  "Acceso pavimentado",
  "Agua potable",
  "Electricidad",
  "Drenaje",
  "Seguridad 24/7",
  "Área común",
  "Palapa comunitaria",
  "Alberca",
  "Cerca de playa",
  "Vista al mar",
  "Zona arbolada",
  "Ciclovía",
];

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    status: "draft",
    location_name: "",
    city: "",
    state: "Oaxaca",
    address: "",
    google_maps_url: "",
    price_from: "",
    price_to: "",
    total_lots: "",
    lot_size_from: "",
    lot_size_to: "",
    amenities: [],
    lot_numbering_format: "alphanumeric",
  });

  const supabase = createClient();

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for insert
      const projectData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        status: formData.status,
        location_name: formData.location_name || null,
        city: formData.city || null,
        state: formData.state || null,
        address: formData.address || null,
        google_maps_url: formData.google_maps_url || null,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        price_to: formData.price_to ? parseFloat(formData.price_to) : null,
        total_lots: formData.total_lots ? parseInt(formData.total_lots) : null,
        available_lots: formData.total_lots ? parseInt(formData.total_lots) : null,
        lot_size_from: formData.lot_size_from ? parseFloat(formData.lot_size_from) : null,
        lot_size_to: formData.lot_size_to ? parseFloat(formData.lot_size_to) : null,
        amenities: formData.amenities,
        lot_numbering_format: formData.lot_numbering_format,
      };

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to project detail/edit page
      router.push(`/admin/proyectos/${data.id}`);
    } catch (err: unknown) {
      console.error("Error creating project:", err);
      let errorMessage = "Error al crear el proyecto";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/proyectos"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a proyectos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Proyecto</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo desarrollo inmobiliario</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-emerald-600 text-white"
                    : step > s
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {s}
              </button>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? "bg-emerald-200" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2 text-sm text-gray-500">
          <span className="w-8 text-center">Info</span>
          <span className="w-16 mx-2"></span>
          <span className="w-8 text-center">Ubicación</span>
          <span className="w-16 mx-2"></span>
          <span className="w-8 text-center">Detalles</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">
                Información básica
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del proyecto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Costa Esmeralda"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL amigable (slug)
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2">/proyectos/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="costa-esmeralda"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción corta
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Breve descripción para tarjetas y listados"
                  maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción completa
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Descripción detallada del proyecto..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del proyecto
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectFormData["status"] })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="coming_soon">Próximamente</option>
                  <option value="active">Activo (visible al público)</option>
                  <option value="sold_out">Vendido</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">
                Ubicación
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la ubicación *
                </label>
                <input
                  type="text"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="Ej: Puerto Escondido, Oaxaca"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Puerto Escondido"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Oaxaca"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección completa
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="Carretera costera km 5..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Google Maps
                </label>
                <input
                  type="url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">
                Detalles del proyecto
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio desde (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.price_from}
                    onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                    placeholder="800000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio hasta (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.price_to}
                    onChange={(e) => setFormData({ ...formData, price_to: e.target.value })}
                    placeholder="1500000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número total de lotes
                </label>
                <input
                  type="number"
                  value={formData.total_lots}
                  onChange={(e) => setFormData({ ...formData, total_lots: e.target.value })}
                  placeholder="20"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño mínimo de lote (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.lot_size_from}
                    onChange={(e) => setFormData({ ...formData, lot_size_from: e.target.value })}
                    placeholder="200"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño máximo de lote (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.lot_size_to}
                    onChange={(e) => setFormData({ ...formData, lot_size_to: e.target.value })}
                    placeholder="500"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de numeración de lotes
                </label>
                <select
                  value={formData.lot_numbering_format}
                  onChange={(e) => setFormData({ ...formData, lot_numbering_format: e.target.value as "alphanumeric" | "numeric" })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="alphanumeric">Alfanumérico (A1, A2, B1, B2...)</option>
                  <option value="numeric">Numérico (1, 2, 3...)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.amenities.includes(amenity)
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded flex items-center justify-center ${
                        formData.amenities.includes(amenity)
                          ? "bg-emerald-600 text-white"
                          : "border border-gray-300"
                      }`}>
                        {formData.amenities.includes(amenity) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando...
                  </>
                ) : (
                  "Crear proyecto"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
