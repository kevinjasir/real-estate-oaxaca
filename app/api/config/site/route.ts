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

    // Get Email config (try contact_email first, then company_email)
    let { data: emailData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "contact_email")
      .single();

    // Fallback to company_email if contact_email not found
    if (!emailData) {
      const { data: companyEmail } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "company_email")
        .single();
      emailData = companyEmail;
    }

    const whatsappNumber = (whatsappData?.value as any)?.number || DEFAULT_WHATSAPP;

    // Handle both formats: {email: "..."} or direct string "..."
    let contactEmail = DEFAULT_EMAIL;
    if (emailData?.value) {
      const val = emailData.value as any;
      if (typeof val === 'string') {
        // Direct string value (from company_email)
        contactEmail = val.replace(/^"|"$/g, '');
      } else if (val.email) {
        // Object format (from contact_email)
        contactEmail = val.email;
      }
    }

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
