import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verificar si el usuario está activo
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("active, role")
          .eq("id", user.id)
          .single();

        if (!userData?.active) {
          // Usuario no activo, redirigir a página de espera
          return NextResponse.redirect(`${origin}/no-autorizado`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error en el flujo de auth
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
