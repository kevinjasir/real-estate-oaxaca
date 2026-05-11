import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import ProjectCard from "./components/ProjectCard";
import TrustSection from "./components/TrustSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image: string | null;
  gallery: string[];
  featured?: boolean;
};

const SB_URL = "https://fenarzhhpgwzrietytvx.supabase.co";
const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbmFyemhocGd3enJpZXR5dHZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk5MTg3NSwiZXhwIjoyMDg1NTY3ODc1fQ.r4V1h9029pWZGjwUMe5Or6uTuYh6AuG_ozfkkYacdfA";
const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function getProjects(): Promise<Project[]> {
  try {
    const fields = "id,name,slug,description,short_description,featured,cover_image_url";
    const res = await fetch(
      `${SB_URL}/rest/v1/projects?status=eq.active&select=${fields}&order=featured.desc,created_at.desc&limit=6`,
      { headers: SB_HEADERS, cache: "no-store" }
    );
    if (!res.ok) return [];
    const projects = await res.json();
    if (!projects.length) return [];

    const ids = projects.map((p: Record<string, string>) => p.id).join(",");
    const mediaRes = await fetch(
      `${SB_URL}/rest/v1/media?entity_type=eq.project&entity_id=in.(${ids})&select=entity_id,url,order_index&order=order_index.asc`,
      { headers: SB_HEADERS, cache: "no-store" }
    );
    const media: { entity_id: string; url: string }[] = mediaRes.ok
      ? await mediaRes.json()
      : [];

    return projects.map((p: Record<string, unknown>) => {
      const imgs = media.filter((m) => m.entity_id === p.id).map((m) => m.url);
      return {
        ...p,
        hero_image: (p.cover_image_url as string | null) || imgs[0] || null,
        gallery: imgs,
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
