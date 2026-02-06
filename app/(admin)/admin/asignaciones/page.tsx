"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Assignment {
  id: string;
  agent_id: string;
  project_id: string;
  assigned_at: string;
  agent: User;
  project: Project;
}

export default function AsignacionesPage() {
  const supabase = createClient();
  const [agents, setAgents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Cargar agentes (usuarios con rol 'agent')
    const { data: agentsData } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url, role")
      .eq("role", "agent")
      .eq("active", true)
      .order("full_name");

    // Cargar proyectos activos
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, name, slug, status")
      .eq("status", "active")
      .order("name");

    // Cargar asignaciones existentes
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("agent_assignments")
      .select(`
        id,
        agent_id,
        project_id,
        assigned_at,
        agent:users!agent_assignments_agent_id_fkey(id, email, full_name, avatar_url, role),
        project:projects(id, name, slug, status)
      `)
      .not("project_id", "is", null)
      .order("assigned_at", { ascending: false });

    console.log("Agents:", agentsData);
    console.log("Assignments:", assignmentsData);
    if (assignmentsError) {
      console.error("Assignments Error:", JSON.stringify(assignmentsError, null, 2));
    }

    setAgents(agentsData || []);
    setProjects(projectsData || []);
    setAssignments(assignmentsData as unknown as Assignment[] || []);
    setLoading(false);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !selectedProject) return;

    setAssigning(true);
    setMessage(null);

    // Verificar si ya existe
    const existing = assignments.find(
      (a) => a.agent_id === selectedAgent && a.project_id === selectedProject
    );

    if (existing) {
      setMessage({ type: "error", text: "Este proyecto ya está asignado a este agente" });
      setAssigning(false);
      return;
    }

    const { error } = await supabase.from("agent_assignments").insert({
      agent_id: selectedAgent,
      project_id: selectedProject,
    });

    if (error) {
      console.error("Error assigning:", error);
      setMessage({ type: "error", text: "Error al asignar el proyecto" });
    } else {
      setMessage({ type: "success", text: "Proyecto asignado correctamente" });
      setSelectedAgent("");
      setSelectedProject("");
      loadData();
    }

    setAssigning(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from("agent_assignments").delete().eq("id", assignmentId);

    if (error) {
      console.error("Error removing assignment:", error);
      setMessage({ type: "error", text: "Error al remover la asignación" });
    } else {
      setMessage({ type: "success", text: "Asignación removida" });
      loadData();
    }

    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Asignaciones de Proyectos</h1>
        <p className="text-gray-500 mt-1">Asigna proyectos a los agentes para que gestionen sus lotes</p>
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

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Nueva Asignación</h2>

        {agents.length === 0 ? (
          <p className="text-gray-500">No hay agentes disponibles. Primero cambia el rol de un usuario a &quot;Agente&quot;.</p>
        ) : (
          <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Agente</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Seleccionar agente...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={assigning || !selectedAgent || !selectedProject}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {assigning ? "Asignando..." : "Asignar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Asignaciones Actuales</h2>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay asignaciones aún</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Agent Avatar */}
                  {assignment.agent?.avatar_url ? (
                    <Image
                      src={assignment.agent.avatar_url}
                      alt={assignment.agent.full_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold">
                        {assignment.agent?.full_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-900">{assignment.agent?.full_name}</p>
                    <p className="text-sm text-gray-500">{assignment.agent?.email}</p>
                  </div>

                  <svg className="w-5 h-5 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  <div>
                    <p className="font-medium text-gray-900">{assignment.project?.name}</p>
                    <p className="text-xs text-gray-500">
                      Asignado: {new Date(assignment.assigned_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Remover asignación"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
