/**
 * Utilidades para WhatsApp
 * El número se obtiene dinámicamente según el contexto:
 * - Si hay lote asignado a un agente, usa el WhatsApp del agente
 * - Si hay proyecto asignado a un agente, usa el WhatsApp del agente
 * - Por defecto, usa el WhatsApp general de la plataforma
 */

const DEFAULT_WHATSAPP = "529711567474";

interface WhatsAppConfig {
  projectId?: string;
  lotId?: string;
}

/**
 * Obtiene el número de WhatsApp según el contexto (server-side)
 */
export async function getWhatsAppNumber(config?: WhatsAppConfig): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const params = new URLSearchParams();

    if (config?.projectId) params.set("project_id", config.projectId);
    if (config?.lotId) params.set("lot_id", config.lotId);

    const res = await fetch(`${baseUrl}/api/config/whatsapp?${params}`, {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (!res.ok) return DEFAULT_WHATSAPP;

    const data = await res.json();
    return data.number || DEFAULT_WHATSAPP;
  } catch {
    return DEFAULT_WHATSAPP;
  }
}

/**
 * Genera un link de WhatsApp con mensaje pre-llenado
 */
export function generateWhatsAppLink(number: string, message: string): string {
  // Asegurar formato correcto del número (solo dígitos, con código de país)
  const cleanNumber = number.replace(/\D/g, "");
  const formattedNumber = cleanNumber.startsWith("52")
    ? cleanNumber
    : `52${cleanNumber}`;

  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensajes predefinidos
 */
export const whatsappMessages = {
  general: "Hola, me gustaría más información sobre sus terrenos",
  project: (projectName: string) =>
    `Hola, me interesa el proyecto ${projectName}. ¿Podrían darme más información?`,
  lot: (projectName: string, lotNumber: string) =>
    `Hola, me interesa el lote ${lotNumber} del proyecto ${projectName}. ¿Podrían darme más información?`,
  visit: (projectName: string) =>
    `Hola, me gustaría agendar una visita al proyecto ${projectName}`,
};
