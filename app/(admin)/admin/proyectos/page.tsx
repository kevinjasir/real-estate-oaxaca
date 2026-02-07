import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | null;
  location_name: string | null;
  total_lots: number | null;
  available_lots: number | null;
  price_from: number | null;
  created_at: string | null;
  image?: string | null;
}

async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      slug,
      status,
      location_name,
      total_lots,
      available_lots,
      price_from,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!projects || projects.length === 0) return [];

  // Fetch media for these projects
  const projectIds = projects.map((p) => p.id);
  const { data: media } = await supabase
    .from("media")
    .select("entity_id, url")
    .eq("entity_type", "project")
    .in("entity_id", projectIds)
    .order("order_index", { ascending: true });

  // Merge media with projects
  return projects.map((project) => {
    const projectMedia = media?.find((m) => m.entity_id === project.id);
    return {
      ...project,
      image: projectMedia?.url || null,
    } as Project;
  });
}

function formatPrice(price: number | null): string {
  if (!price) return "-";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "active":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
          Activo
        </span>
      );
    case "inactive":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          Inactivo
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          -
        </span>
      );
  }
}

export default async function ProyectosAdminPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500">Gestiona tus desarrollos inmobiliarios</p>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          Nuevo proyecto
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No hay proyectos aún
          </h2>
          <p className="text-gray-500 mb-6">
            Crea tu primer proyecto para empezar a vender terrenos.
          </p>
          <Link
            href="/admin/proyectos/nuevo"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            Crear proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Project Image */}
              <div className="relative h-48 w-full bg-gray-100">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <span className="text-5xl">🏝️</span>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {project.name}
                  </h3>
                  {getStatusBadge(project.status)}
                </div>

                {project.location_name && (
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {project.location_name}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Lotes</p>
                    <p className="font-semibold text-gray-900">
                      {project.available_lots || 0} / {project.total_lots || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Desde</p>
                    <p className="font-semibold text-emerald-600">
                      {formatPrice(project.price_from)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/proyectos/${project.id}`}
                    className="flex-1 text-center py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/proyectos/${project.slug}`}
                    target="_blank"
                    className="flex-1 text-center py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Ver público
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
