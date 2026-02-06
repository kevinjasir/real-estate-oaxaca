import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Lead {
  id: string;
  name: string | null;
  phone: string;
  whatsapp: string | null;
  source: "web" | "whatsapp";
  created_at: string | null;
  project: {
    name: string;
    slug: string;
  } | null;
  lot: {
    lot_number: string;
  } | null;
}

async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      name,
      phone,
      whatsapp,
      source,
      created_at,
      project:projects(name, slug),
      lot:lots(lot_number)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return data as unknown as Lead[];
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSourceBadge(source: string) {
  switch (source) {
    case "web":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          Web
        </span>
      );
    case "whatsapp":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          WhatsApp
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          {source}
        </span>
      );
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">
            Gestiona los contactos interesados en tus proyectos
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No hay leads aún
            </h2>
            <p className="text-gray-500">
              Los leads aparecerán aquí cuando los clientes se contacten.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto / Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name || "Sin nombre"}
                        </p>
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                        {lead.whatsapp && lead.whatsapp !== lead.phone && (
                          <p className="text-xs text-gray-400">
                            WA: {lead.whatsapp}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {lead.project ? (
                          <Link
                            href={`/proyectos/${lead.project.slug}`}
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                          >
                            {lead.project.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                        {lead.lot && (
                          <p className="text-xs text-gray-500">
                            Lote {lead.lot.lot_number}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSourceBadge(lead.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <a
                        href={`https://wa.me/${lead.whatsapp || lead.phone}?text=${encodeURIComponent(`Hola ${lead.name || ""}, gracias por tu interés en nuestros terrenos.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
