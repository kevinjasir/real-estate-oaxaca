"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  slug: string;
  location_name: string;
  status: string;
  cover_image_url: string | null;
}

interface Assignment {
  id: string;
  project: Project;
  assigned_at: string;
}

export default function MisProyectosPage() {
  const supabase = createClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    console.log("Auth user:", user?.id, user?.email);
    if (!user) {
      console.log("No user found");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("agent_assignments")
      .select(`
        id,
        assigned_at,
        project:projects(id, name, slug, location_name, status, cover_image_url)
      `)
      .eq("agent_id", user.id)
      .not("project_id", "is", null);

    console.log("Assignments query result:", { data, error });

    if (error) {
      console.error("Error loading assignments:", JSON.stringify(error, null, 2));
    } else {
      setAssignments(data as unknown as Assignment[]);
    }
    setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
        <p className="text-gray-500 mt-1">
          Proyectos asignados para gestionar lotes y ventas
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes proyectos asignados
          </h2>
          <p className="text-gray-500">
            Contacta a un administrador para que te asigne proyectos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/admin/mis-proyectos/${assignment.project.slug}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {assignment.project.cover_image_url ? (
                  <Image
                    src={assignment.project.cover_image_url}
                    alt={assignment.project.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.project.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {assignment.project.status === "active" ? "Activo" : assignment.project.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {assignment.project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {assignment.project.location_name}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Asignado: {new Date(assignment.assigned_at).toLocaleDateString("es-MX")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
