"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "agent" | "client";
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  agent: "Agente",
  client: "Cliente",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  agent: "bg-emerald-100 text-emerald-700",
  client: "bg-gray-100 text-gray-700",
};

export default function UsuariosPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
      setMessage({ type: "error", text: "Error al cargar usuarios" });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole as "agent" | "admin" | "super_admin", updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: "success", text: "Rol actualizado correctamente" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error updating role:", err);
      setMessage({ type: "error", text: "Error al actualizar el rol" });
    }
  };

  const handleActiveChange = async (userId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ active, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, active } : u));
      setMessage({ type: "success", text: active ? "Usuario activado" : "Usuario desactivado" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error updating active status:", err);
      setMessage({ type: "error", text: "Error al cambiar el estado" });
    }
  };

  const filteredUsers = filter === "all"
    ? users
    : users.filter(u => u.role === filter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-500 mt-1">
          Administra los usuarios y sus roles en el sistema
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats/Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border text-left transition-colors ${
            filter === "all" ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </button>
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`p-4 rounded-xl border text-left transition-colors ${
              filter === role ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === role).length}
            </p>
            <p className="text-sm text-gray-500">{label}s</p>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Registro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No hay usuarios {filter !== "all" && `con rol ${ROLE_LABELS[filter]}`}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name || user.email}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold">
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name || "Sin nombre"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as User["role"])}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${ROLE_COLORS[user.role]}`}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleActiveChange(user.id, !user.active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        user.active ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          user.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={`ml-2 text-sm ${user.active ? "text-emerald-600" : "text-gray-500"}`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Help text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Información sobre roles</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Super Admin:</strong> Acceso completo a todas las funciones del sistema</li>
          <li><strong>Administrador:</strong> Gestión de proyectos, lotes y configuración</li>
          <li><strong>Agente:</strong> Gestión de leads y ventas asignadas</li>
          <li><strong>Cliente:</strong> Acceso solo a la parte pública del sitio (se asigna automáticamente al registrarse)</li>
        </ul>
      </div>
    </div>
  );
}
