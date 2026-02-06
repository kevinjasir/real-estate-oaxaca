import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LotDetails } from "@/types/api";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Obtener lote con proyecto
    const { data: lot, error: lotError } = await supabase
      .from("lots")
      .select(
        `
        *,
        project:projects!inner(
          id,
          name,
          slug,
          location_name,
          city,
          google_maps_url,
          status
        )
      `
      )
      .eq("id", id)
      .single();

    if (lotError || !lot) {
      return NextResponse.json(
        { error: "Lote no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el proyecto esté activo
    if ((lot.project as any)?.status !== "active") {
      return NextResponse.json(
        { error: "Lote no disponible" },
        { status: 404 }
      );
    }

    // Obtener imágenes del lote
    const { data: media } = await supabase
      .from("media")
      .select("source_url, order_index")
      .eq("entity_type", "lot")
      .eq("entity_id", id)
      .order("order_index", { ascending: true });

    // Construir respuesta
    const result: LotDetails = {
      ...lot,
      project: {
        id: (lot.project as any).id,
        name: (lot.project as any).name,
        slug: (lot.project as any).slug,
        location_name: (lot.project as any).location_name,
        city: (lot.project as any).city,
        google_maps_url: (lot.project as any).google_maps_url,
      },
      images: media?.map((m) => m.source_url) || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/lots/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
