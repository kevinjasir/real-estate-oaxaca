import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Obtener proyectos activos con campos extendidos
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        status,
        featured,
        location_name,
        city,
        price_from,
        price_to,
        currency,
        total_lots,
        available_lots,
        lot_size_from,
        lot_size_to,
        amenities,
        features,
        meta_title,
        meta_description,
        featured
      `)
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: projectsError.message },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json([]);
    }

    const projectIds = projects.map((p) => p.id);

    // Obtener media de proyectos
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("entity_id, url, order_index")
      .eq("entity_type", "project")
      .in("entity_id", projectIds)
      .order("order_index", { ascending: true });

    if (mediaError) {
      console.error("Error fetching media:", mediaError);
      // No falla, solo continúa sin imágenes
    }

    // Merge de datos
    const result = projects.map((project) => {
      const projectMedia =
        media?.filter((m) => m.entity_id === project.id) || [];

      return {
        ...project,
        hero_image: projectMedia[0]?.url || null,
        gallery: projectMedia.map((m) => m.url),
        lots_count: project.total_lots || 0,
        available_lots_count: project.available_lots || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Unexpected error in GET /api/projects:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
