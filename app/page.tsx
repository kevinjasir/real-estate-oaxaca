import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import ProjectCard from "./components/ProjectCard";
import TrustSection from "./components/TrustSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import { createClient } from "@/lib/supabase/server";

// Type definitions for project display
type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image: string | null;
  gallery: string[];
  featured?: boolean;
  location_name?: string;
  city?: string;
};

// Fetch projects directly from Supabase (server component)
async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient();

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        slug,
        description,
        featured,
        location_name,
        city
      `)
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (projectsError || !projects) {
      console.error("Error fetching projects:", projectsError);
      return [];
    }

    const projectIds = projects.map((p) => p.id);

    // Fetch media for projects
    const { data: media } = await supabase
      .from("media")
      .select("entity_id, url, order_index")
      .eq("entity_type", "project")
      .in("entity_id", projectIds)
      .order("order_index", { ascending: true });

    // Merge projects with media
    return projects.map((project) => {
      const projectMedia = media?.filter((m) => m.entity_id === project.id) || [];
      return {
        ...project,
        hero_image: projectMedia[0]?.url || null,
        gallery: projectMedia.map((m) => m.url),
      };
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function Home() {
  const projects = await getProjects();

  // Separate featured projects for priority display
  const featuredProjects = projects.filter((p) => p.featured);
  const regularProjects = projects.filter((p) => !p.featured);

  // Combine with featured first, limit to reasonable amount for homepage
  const displayProjects = [...featuredProjects, ...regularProjects].slice(0, 6);

  return (
    <>
      {/* Navigation Header */}
      <Header />

      <main>
        {/* HERO SECTION - Above the fold with carousel */}
        <HeroCarousel projects={projects} />

        {/* FEATURED PROJECTS SECTION */}
        <section
          id="proyectos"
          className="scroll-mt-20 bg-white py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--secondary)]/20 px-4 py-1 text-sm font-medium text-[var(--primary-dark)]">
                Oportunidades de inversión
              </span>
              <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
                Proyectos disponibles
              </h2>
              <p className="text-lg text-[var(--muted)]">
                Descubre terrenos y residenciales verificados en las zonas más
                cotizadas de la costa oaxaqueña.
              </p>
            </div>

            {/* Projects Grid */}
            {displayProjects.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {displayProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              // Empty state when no projects available
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent)] p-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-[var(--muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                  Próximamente nuevos proyectos
                </h3>
                <p className="mb-6 text-[var(--muted)]">
                  Estamos preparando nuevas oportunidades de inversión para ti.
                </p>
                <a
                  href="#contacto"
                  className="btn-primary inline-block rounded-lg px-6 py-3 font-semibold"
                >
                  Notifícame cuando haya proyectos
                </a>
              </div>
            )}

            {/* View All Button - only show if there are more projects */}
            {projects.length > 6 && (
              <div className="mt-12 text-center">
                <a
                  href="/proyectos"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--primary)] px-8 py-3 font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
                >
                  Ver todos los proyectos
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* TRUST & CREDIBILITY SECTION */}
        <TrustSection />

        {/* FINAL CTA SECTION */}
        <CTASection />
      </main>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
