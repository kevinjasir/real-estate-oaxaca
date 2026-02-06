import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import AdminHeader from "@/app/components/admin/AdminHeader";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "agent";
  active: boolean;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtener datos del usuario de nuestra tabla
  const { data: userData } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, role, active")
    .eq("id", user.id)
    .single();

  if (!userData || !userData.active || (userData.role as string) === "client") {
    redirect("/no-autorizado");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={userData as UserData} />
      <div className="lg:pl-64">
        <AdminHeader user={userData as UserData} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
