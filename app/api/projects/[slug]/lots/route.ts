import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProjectLotsResponse, LotStatusEnum } from "@/types/api";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Filtros opcionales
    const status = searchParams.get("status");
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");

    const supabase = await createClient();

    // Obtener proyecto por slug (solo proyectos activos)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, slug, status")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Construir query de lotes con filtros
    let query = supabase
      .from("lots")
      .select("*")
      .eq("project_id", project.id);

    if (status) {
      query = query.eq("status", status as LotStatusEnum);
    }

    if (priceMin) {
      query = query.gte("price", parseFloat(priceMin));
    }

    if (priceMax) {
      query = query.lte("price", parseFloat(priceMax));
    }

    const { data: lots, error: lotsError } = await query.order("lot_number", {
      ascending: true,
    });

    if (lotsError) {
      console.error("Error fetching lots:", lotsError);
      return NextResponse.json(
        { error: "Error al obtener lotes" },
        { status: 500 }
      );
    }

    // Contar por estado
    const allLots = lots || [];
    const response: ProjectLotsResponse = {
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
      },
      lots: allLots,
      total: allLots.length,
      available: allLots.filter((l) => l.status === "available").length,
      reserved: allLots.filter((l) => l.status === "reserved").length,
      sold: allLots.filter((l) => l.status === "sold").length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/projects/[slug]/lots:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
