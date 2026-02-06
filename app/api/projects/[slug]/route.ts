import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get("preview") === "true";

    // For preview mode, verify the user is an authenticated admin/super_admin
    let isAuthorizedForPreview = false;

    if (preview) {
      const supabaseAuth = await createClient();
      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();

      if (user) {
        // Check user role in our users table
        const { data: userData } = await supabaseAuth
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (
          userData &&
          (userData.role === "admin" || userData.role === "super_admin")
        ) {
          isAuthorizedForPreview = true;
        }
      }
    }

    // Only use service client if user is authorized for preview
    const supabase =
      preview && isAuthorizedForPreview
        ? await createServiceClient()
        : await createClient();

    // Obtener proyecto por slug
    let query = supabase.from("projects").select("*").eq("slug", slug);

    if (!isAuthorizedForPreview) {
      query = query.eq("status", "active");
    }

    const { data: project, error: projectError } = await query.single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Obtener media del proyecto
    const { data: media } = await supabase
      .from("media")
      .select("url, order_index")
      .eq("entity_type", "project")
      .eq("entity_id", project.id)
      .order("order_index", { ascending: true });

    // Obtener lotes del proyecto
    const { data: lots } = await supabase
      .from("lots")
      .select("*")
      .eq("project_id", project.id)
      .order("lot_number", { ascending: true });

    // Construir respuesta
    const result = {
      ...project,
      address_text: project.address || null,
      hero_image: (project as Record<string, unknown>).cover_image_url || media?.[0]?.url || null,
      gallery: media?.map((m) => m.url) || [],
      lots: lots || [],
      lots_count: lots?.length || 0,
      available_lots_count:
        lots?.filter((l) => l.status === "available").length || 0,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/projects/[slug]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
