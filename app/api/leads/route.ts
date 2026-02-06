import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreateLeadRequest } from "@/types/api";

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max 5 leads per IP per minute
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return true;
  }
  return false;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
        { status: 429 }
      );
    }

    const body: CreateLeadRequest = await request.json();

    // Validación básica - phone y project_id son requeridos según el esquema
    if (!body.phone || body.phone.trim().length < 8) {
      return NextResponse.json(
        { error: "El teléfono es requerido (mínimo 8 caracteres)" },
        { status: 400 }
      );
    }

    if (!body.project_id) {
      return NextResponse.json(
        { error: "El proyecto es requerido" },
        { status: 400 }
      );
    }

    if (!body.source) {
      return NextResponse.json(
        { error: "La fuente del lead es requerida" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = body.name
      ? body.name.trim().substring(0, 255)
      : null;
    const sanitizedPhone = body.phone.trim().substring(0, 50);

    const supabase = await createClient();

    // Verificar que project_id existe y está activo
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", body.project_id)
      .eq("status", "active")
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 400 }
      );
    }

    // Verificar que lot_id existe si se proporciona
    if (body.lot_id) {
      const { data: lot } = await supabase
        .from("lots")
        .select("id")
        .eq("id", body.lot_id)
        .single();

      if (!lot) {
        return NextResponse.json(
          { error: "Lote no encontrado" },
          { status: 400 }
        );
      }
    }

    // Crear lead según el esquema real de la DB
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: sanitizedName,
        phone: sanitizedPhone,
        whatsapp: body.whatsapp?.trim().substring(0, 50) || null,
        source: body.source,
        project_id: body.project_id,
        lot_id: body.lot_id || null,
        utm_source: body.utm_source?.substring(0, 255) || null,
        utm_medium: body.utm_medium?.substring(0, 255) || null,
        utm_campaign: body.utm_campaign?.substring(0, 255) || null,
        referrer_url: body.referrer_url?.substring(0, 500) || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      return NextResponse.json(
        { error: "Error al registrar el contacto" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: data.id,
        message: "Contacto registrado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/leads:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
