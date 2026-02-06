import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  location_name: string | null;
  city: string | null;
  address_text: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  price_from: number | null;
  price_to: number | null;
  lot_size_from: number | null;
  lot_size_to: number | null;
  available_lots: number | null;
  total_lots: number | null;
  amenities: string[] | null;
  features: string[] | null;
  hero_image: string | null;
  gallery: string[];
  lots: LotData[];
  meta_title: string | null;
  meta_description: string | null;
}

interface LotData {
  id: string;
  lot_number: string;
  status: "available" | "reserved" | "sold" | null;
  price: number | null;
  size_m2: number | null;
}

async function getProject(slug: string, preview: boolean = false): Promise<ProjectData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const url = `${baseUrl}/api/projects/${slug}${preview ? "?preview=true" : ""}`;
    const res = await fetch(url, {
      next: { revalidate: preview ? 0 : 60 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: project.meta_title || `${project.name} | Terrenos Costa Oaxaca`,
    description:
      project.meta_description ||
      project.short_description ||
      `Descubre ${project.name} en ${project.location_name}. Terrenos de inversión en la costa de Oaxaca.`,
    openGraph: {
      title: project.name,
      description: project.short_description || undefined,
      images: project.hero_image ? [project.hero_image] : undefined,
    },
  };
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

function formatArea(area: number | null): string {
  if (!area) return "-";
  return `${area.toLocaleString("es-MX")} m²`;
}

export default async function ProjectDetailPage({ params, searchParams }: PageParams) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const project = await getProject(slug, preview === "true");

  if (!project) {
    notFound();
  }

  const availableLots =
    project.lots?.filter((l) => l.status === "available") || [];
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "529511234567";
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el proyecto ${project.name}. ¿Podrían darme más información?`
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] bg-gray-900">
        {project.hero_image ? (
          <Image
            src={project.hero_image}
            alt={project.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <nav className="mb-4">
              <Link
                href="/proyectos"
                className="text-emerald-300 hover:text-emerald-200 text-sm flex items-center gap-1"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver a proyectos
              </Link>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {project.name}
            </h1>
            {project.location_name && (
              <p className="text-xl text-gray-200 flex items-center gap-2">
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
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(project.price_from)}
              </p>
              <p className="text-sm text-gray-500">Precio desde</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {availableLots.length}
              </p>
              <p className="text-sm text-gray-500">Lotes disponibles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatArea(project.lot_size_from)}
              </p>
              <p className="text-sm text-gray-500">Tamaño desde</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {project.description && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Acerca del proyecto
                  </h2>
                  <div className="prose prose-emerald max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Características
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(project.features as string[]).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <svg
                          className="w-5 h-5 text-emerald-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {project.amenities && project.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Amenidades
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(project.amenities as string[]).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg"
                      >
                        <span className="text-2xl">✨</span>
                        <span className="text-gray-700 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Galería
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery.map((media, index) => {
                      const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'].some(ext => media.toLowerCase().includes(ext));
                      return (
                        <div
                          key={index}
                          className="relative aspect-video rounded-lg overflow-hidden group"
                        >
                          {isVideo ? (
                            <>
                              <video
                                src={media}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                                playsInline
                              />
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Video
                              </div>
                            </>
                          ) : (
                            <Image
                              src={media}
                              alt={`${project.name} - Imagen ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Location */}
              {(project.google_maps_url || project.latitude) && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ubicación
                  </h2>

                  {/* Location Info */}
                  <div className="mb-4 space-y-2">
                    {project.address_text && (
                      <p className="text-gray-600 flex items-start gap-2">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.address_text}
                      </p>
                    )}
                    {project.postal_code && (
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        C.P. {project.postal_code}
                      </p>
                    )}
                  </div>

                  {/* Embedded Map with Marker */}
                  {project.latitude && project.longitude ? (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.longitude - 0.01},${project.latitude - 0.008},${project.longitude + 0.01},${project.latitude + 0.008}&layer=mapnik&marker=${project.latitude},${project.longitude}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        title={`Ubicación de ${project.name}`}
                      />
                      {/* Fallback link */}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${project.latitude}&mlon=${project.longitude}#map=15/${project.latitude}/${project.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs text-gray-700 px-2 py-1 rounded shadow"
                      >
                        Ver mapa completo
                      </a>
                    </div>
                  ) : null}

                  {project.google_maps_url && (
                    <a
                      href={project.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Abrir en Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sticky CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* CTA Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ¿Te interesa este proyecto?
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Agenda una visita sin compromiso o pide más información.
                  </p>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition-colors mb-4"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contactar por WhatsApp
                  </a>

                  <Link
                    href={`/proyectos/${project.slug}/lotes`}
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Ver todos los lotes
                  </Link>
                </div>

                {/* Quick Info */}
                <div className="bg-emerald-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-emerald-900 mb-4">
                    Resumen del proyecto
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Total de lotes:</span>
                      <span className="font-medium text-gray-900">
                        {project.total_lots || 0}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Disponibles:</span>
                      <span className="font-medium text-emerald-600">
                        {availableLots.length}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Precio desde:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(project.price_from)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Tamaño desde:</span>
                      <span className="font-medium text-gray-900">
                        {formatArea(project.lot_size_from)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
