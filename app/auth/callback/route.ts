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

        // Si el usuario no está activo o no es admin, redirigir al home
        if (!userData?.active || !["admin", "super_admin", "agent"].includes(userData.role)) {
          return NextResponse.redirect(`${origin}/`);
        }

        // Si es admin activo y hay un next específico (o default /admin), permitir acceso
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Error en el flujo de auth
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Error en el flujo de auth (this line was moved outside the if(code) block)
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
