import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignAgent() {
  const agentEmail = "kevin.istmocode@gmail.com";

  console.log("1. Buscando usuario...");
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", agentEmail)
    .single();

  if (userError || !user) {
    console.error("Error buscando usuario:", userError);
    return;
  }

  console.log(`   Usuario encontrado: ${user.email} (rol actual: ${user.role})`);

  // 2. Cambiar rol a 'agent'
  console.log("\n2. Cambiando rol a 'agent'...");
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: "agent", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error actualizando rol:", updateError);
    return;
  }
  console.log("   Rol actualizado a 'agent'");

  // 3. Obtener proyectos disponibles
  console.log("\n3. Buscando proyectos...");
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("status", "active");

  if (projectsError || !projects?.length) {
    console.error("Error obteniendo proyectos:", projectsError);
    return;
  }

  console.log(`   Proyectos encontrados: ${projects.length}`);
  projects.forEach((p) => console.log(`   - ${p.name} (${p.slug})`));

  // 4. Asignar el primer proyecto al agente
  const projectToAssign = projects[0];
  console.log(`\n4. Asignando proyecto "${projectToAssign.name}" al agente...`);

  // Verificar si ya existe la asignación
  const { data: existingAssignment } = await supabase
    .from("agent_assignments")
    .select("id")
    .eq("agent_id", user.id)
    .eq("project_id", projectToAssign.id)
    .single();

  if (existingAssignment) {
    console.log("   El proyecto ya estaba asignado al agente");
  } else {
    const { error: assignError } = await supabase
      .from("agent_assignments")
      .insert({
        agent_id: user.id,
        project_id: projectToAssign.id,
        notes: "Asignación inicial para pruebas",
      });

    if (assignError) {
      console.error("Error asignando proyecto:", assignError);
      return;
    }
    console.log("   Proyecto asignado exitosamente");
  }

  // 5. Verificar asignación
  console.log("\n5. Verificando asignaciones del agente...");
  const { data: assignments } = await supabase
    .from("agent_assignments")
    .select(`
      id,
      project:projects(name, slug),
      assigned_at
    `)
    .eq("agent_id", user.id);

  console.log("   Asignaciones actuales:");
  assignments?.forEach((a: any) => {
    console.log(`   - ${a.project?.name} (asignado: ${new Date(a.assigned_at).toLocaleDateString()})`);
  });

  console.log("\n✅ Proceso completado!");
  console.log("\nResumen:");
  console.log(`- Usuario: ${agentEmail}`);
  console.log(`- Nuevo rol: agent`);
  console.log(`- Proyecto asignado: ${projectToAssign.name}`);
}

assignAgent();
