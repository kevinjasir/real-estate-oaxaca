import Image from "next/image";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_image: string | null;
  featured?: boolean | null;
  location_name?: string | null;
  city?: string | null;
};

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const placeholderImage =
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

  return (
    <article className="card-hover group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-[var(--border)]">
      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute left-4 top-4 z-10">
          <span className="badge-featured inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-md">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Proyecto destacado
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-56 overflow-hidden md:h-64">
        <Image
          src={project.hero_image || placeholderImage}
          alt={`Vista del proyecto ${project.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-[var(--foreground)] shadow-lg">
            Ver detalles
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Location Tag */}
        <div className="mb-3 flex items-center gap-1 text-sm text-[var(--muted)]">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Costa de Oaxaca
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
          {project.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-[var(--muted)] leading-relaxed">
          {project.description || "Descubre este increíble proyecto en la costa de Oaxaca."}
        </p>

        {/* CTA Link */}
        <Link
          href={`/proyectos/${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-dark)]"
        >
          Conocer más
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
        </Link>
      </div>
    </article>
  );
}
