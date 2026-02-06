import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_WHATSAPP = "529711567474";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const lotId = searchParams.get("lot_id");

    const supabase = await createClient();

    // Intentar obtener el número desde la función de la DB
    // Usamos any para evitar error de tipos mientras se regeneran
    const { data, error } = await (supabase.rpc as any)("get_contact_whatsapp", {
      p_project_id: projectId || null,
      p_lot_id: lotId || null,
    });

    if (!error && data) {
      return NextResponse.json({ number: data });
    }

    // Fallback: obtener el número general de site_settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_general")
      .single();

    const number = (settings?.value as any)?.number || DEFAULT_WHATSAPP;

    return NextResponse.json({ number });
  } catch (error) {
    console.error("Error in GET /api/config/whatsapp:", error);
    return NextResponse.json({ number: DEFAULT_WHATSAPP });
  }
}
