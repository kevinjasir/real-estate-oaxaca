import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No ejecutar código entre createServerClient y supabase.auth.getUser()
  // Un simple error puede hacer que el usuario se desloguee aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Proteger rutas /admin/*
  if (pathname.startsWith("/admin")) {
    // Si no hay usuario, redirigir a login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Verificar que el usuario tenga perfil activo
    const { data: userData } = await supabase
      .from("users")
      .select("role, active")
      .eq("id", user.id)
      .single();

    // Si no hay perfil o no está activo, redirigir a unauthorized
    if (!userData || !userData.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/no-autorizado";
      return NextResponse.redirect(url);
    }
  }

  // Si el usuario está logueado y trata de ir a /login, redirigir a /admin
  if (pathname === "/login" && user) {
    const { data: userData } = await supabase
      .from("users")
      .select("active")
      .eq("id", user.id)
      .single();

    if (userData?.active) {
      const redirect = request.nextUrl.searchParams.get("redirect") || "/admin";
      const url = request.nextUrl.clone();
      url.pathname = redirect;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
