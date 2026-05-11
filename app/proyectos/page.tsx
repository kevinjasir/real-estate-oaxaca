import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos | Terrenos en la Costa de Oaxaca",
  description:
    "Explora nuestros desarrollos de terrenos en Huatulco, Puerto Escondido y la costa de Oaxaca. Encuentra tu inversión ideal.",
};

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  location_name: string | null;
  city: string | null;
  price_from: number | null;
  available_lots: number | null;
  total_lots: number | null;
  hero_image: string | null;
  featured: boolean | null;
}

interface BannerSettings {
  image: string | null;
  title: string;
  subtitle: string;
}

async function getProjects(): Promise<ProjectData[]> {
  try {
    // Vercel sets VERCEL_URL automatically (without https://)
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${host}/api/projects`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

async function getBannerSettings(): Promise<BannerSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["projects_banner_image", "projects_banner_title", "projects_banner_subtitle"]);

    const settings: BannerSettings = {
      image: null,
      title: "Nuestros Proyectos",
      subtitle: "Descubre los mejores desarrollos de terrenos en la costa de Oaxaca. Inversiones seguras con escrituras y servicios.",
    };

    data?.forEach((item) => {
      const value = typeof item.value === "string" ? item.value : JSON.stringify(item.value);
      const cleanValue = value.replace(/^"|"$/g, ""); // Remove surrounding quotes

      if (item.key === "projects_banner_image") settings.image = cleanValue;
      if (item.key === "projects_banner_title") settings.title = cleanValue;
      if (item.key === "projects_banner_subtitle") settings.subtitle = cleanValue;
    });

    return settings;
  } catch (error) {
    console.error("Error fetching banner settings:", error);
    return {
      image: null,
      title: "Nuestros Proyectos",
      subtitle: "Descubre los mejores desarrollos de terrenos en la costa de Oaxaca. Inversiones seguras con escrituras y servicios.",
    };
  }
}

function formatPrice(price: number | null): string {
  if (!price) return "Consultar";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ProyectosPage() {
  const [projects, banner] = await Promise.all([
    getProjects(),
    getBannerSettings(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section with Image */}
      <section className="relative h-[40vh] min-h-[300px] md:min-h-[400px]">
        {banner.image ? (
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {banner.title}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              {banner.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Próximamente
              </h2>
              <p className="text-gray-500">
                Estamos preparando proyectos increíbles para ti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  <Link href={`/proyectos/${project.slug}`}>
                    {/* Image */}
                    <div className="relative h-56 bg-gray-200">
                      {project.hero_image ? (
                        <Image
                          src={project.hero_image}
                          alt={project.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
                          <span className="text-6xl">🏝️</span>
                        </div>
                      )}
                      {project.featured && (
                        <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Destacado
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {project.name}
                        </h2>
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {project.location_name}
                          {project.city && `, ${project.city}`}
                        </p>
                      )}

                      {project.short_description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {project.short_description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Desde</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {formatPrice(project.price_from)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Disponibles</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {project.available_lots || 0}{" "}
                            <span className="text-sm font-normal text-gray-500">
                              / {project.total_lots || 0}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Contáctanos y te ayudamos a encontrar el terreno perfecto para ti.
            Sin compromiso.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "529511234567"}?text=Hola, me gustaría más información sobre sus terrenos`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contáctanos por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
