import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
};

interface ProjectLotsData {
  project: {
    id: string;
    name: string;
    slug: string;
  };
  lots: LotData[];
  total: number;
  available: number;
  reserved: number;
  sold: number;
}

interface LotData {
  id: string;
  lot_number: string;
  custom_label: string | null;
  status: "available" | "reserved" | "sold" | null;
  price: number | null;
  size_m2: number | null;
}

async function getProjectLots(
  slug: string,
  status?: string
): Promise<ProjectLotsData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const statusParam = status ? `?status=${status}` : "";

  try {
    const res = await fetch(`${baseUrl}/api/projects/${slug}/lots${statusParam}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching lots:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectLots(slug);

  if (!data) {
    return {
      title: "Proyecto no encontrado",
    };
  }

  return {
    title: `Lotes en ${data.project.name} | Terrenos Costa Oaxaca`,
    description: `Explora ${data.available} lotes disponibles en ${data.project.name}. Encuentra tu terreno ideal en la costa de Oaxaca.`,
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

function getStatusColor(status: string | null): string {
  switch (status) {
    case "available":
      return "bg-emerald-500";
    case "reserved":
      return "bg-amber-500";
    case "sold":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function getStatusText(status: string | null): string {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    default:
      return "No disponible";
  }
}

export default async function ProjectLotsPage({
  params,
  searchParams,
}: PageParams) {
  const { slug } = await params;
  const { status } = await searchParams;
  const data = await getProjectLots(slug, status);

  if (!data) {
    notFound();
  }

  const { project, lots, total, available, reserved, sold } = data;
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "529511234567";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4">
            <Link
              href={`/proyectos/${slug}`}
              className="text-emerald-300 hover:text-emerald-200 text-sm flex items-center gap-1 w-fit"
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
              Volver al proyecto
            </Link>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Lotes en {project.name}
          </h1>
          <p className="text-emerald-100">
            Selecciona un lote para ver más detalles y contactarnos
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <Link
              href={`/proyectos/${slug}/lotes`}
              className={`text-center px-4 py-2 rounded-lg transition-colors ${
                !status ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </Link>
            <Link
              href={`/proyectos/${slug}/lotes?status=available`}
              className={`text-center px-4 py-2 rounded-lg transition-colors ${
                status === "available" ? "bg-emerald-50" : "hover:bg-gray-50"
              }`}
            >
              <p className="text-2xl font-bold text-emerald-600">{available}</p>
              <p className="text-xs text-gray-500">Disponibles</p>
            </Link>
            <Link
              href={`/proyectos/${slug}/lotes?status=reserved`}
              className={`text-center px-4 py-2 rounded-lg transition-colors ${
                status === "reserved" ? "bg-amber-50" : "hover:bg-gray-50"
              }`}
            >
              <p className="text-2xl font-bold text-amber-600">{reserved}</p>
              <p className="text-xs text-gray-500">Reservados</p>
            </Link>
            <Link
              href={`/proyectos/${slug}/lotes?status=sold`}
              className={`text-center px-4 py-2 rounded-lg transition-colors ${
                status === "sold" ? "bg-red-50" : "hover:bg-gray-50"
              }`}
            >
              <p className="text-2xl font-bold text-red-600">{sold}</p>
              <p className="text-xs text-gray-500">Vendidos</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Lots Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {lots.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No hay lotes{" "}
                {status === "available"
                  ? "disponibles"
                  : status === "reserved"
                    ? "reservados"
                    : status === "sold"
                      ? "vendidos"
                      : ""}
              </h2>
              <p className="text-gray-500 mb-6">
                {status
                  ? "Prueba quitando el filtro para ver todos los lotes."
                  : "Próximamente agregaremos lotes a este proyecto."}
              </p>
              {status && (
                <Link
                  href={`/proyectos/${slug}/lotes`}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Ver todos los lotes
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {lots.map((lot) => {
                const isAvailable = lot.status === "available";
                const whatsappMessage = encodeURIComponent(
                  `Hola, me interesa el lote ${lot.lot_number} del proyecto ${project.name}. ¿Podrían darme más información?`
                );

                return (
                  <div
                    key={lot.id}
                    className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                      isAvailable
                        ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        : "opacity-75"
                    }`}
                  >
                    {/* Status Badge */}
                    <div
                      className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(lot.status)}`}
                      title={getStatusText(lot.status)}
                    />

                    {/* Lot Number */}
                    <div className="p-4 text-center border-b">
                      <p className="text-2xl font-bold text-gray-900">
                        {lot.lot_number}
                      </p>
                      {lot.custom_label && (
                        <p className="text-xs text-gray-500 mt-1">
                          {lot.custom_label}
                        </p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Área</p>
                        <p className="font-semibold text-gray-900">
                          {formatArea(lot.size_m2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Precio</p>
                        <p
                          className={`font-bold ${isAvailable ? "text-emerald-600" : "text-gray-500"}`}
                        >
                          {formatPrice(lot.price)}
                        </p>
                      </div>

                      {/* Status Text */}
                      <div className="pt-2 border-t">
                        <p
                          className={`text-xs font-medium text-center ${
                            lot.status === "available"
                              ? "text-emerald-600"
                              : lot.status === "reserved"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {getStatusText(lot.status)}
                        </p>
                      </div>

                      {/* WhatsApp Button */}
                      {isAvailable && (
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full mt-3 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors"
                        >
                          Consultar
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Legend */}
      <section className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-gray-600">Vendido</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            ¿Necesitas ayuda para elegir?
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            Nuestro equipo te puede asesorar sin compromiso para encontrar el
            lote ideal para ti.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, necesito asesoría para elegir un lote en ${project.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Solicitar asesoría
          </a>
        </div>
      </section>
    </main>
  );
}
