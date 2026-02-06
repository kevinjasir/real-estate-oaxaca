import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_WHATSAPP = "529711567474";
const DEFAULT_EMAIL = "info@costaoaxaca.com";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get WhatsApp config
    const { data: whatsappData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_general")
      .single();

    // Get Email config
    const { data: emailData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_email")
      .single();

    const whatsappNumber = (whatsappData?.value as any)?.number || DEFAULT_WHATSAPP;
    const contactEmail = (emailData?.value as any)?.email || DEFAULT_EMAIL;

    return NextResponse.json({
      whatsapp: whatsappNumber,
      email: contactEmail,
    });
  } catch (error) {
    console.error("Error in GET /api/config/site:", error);
    return NextResponse.json({
      whatsapp: DEFAULT_WHATSAPP,
      email: DEFAULT_EMAIL,
    });
  }
}
