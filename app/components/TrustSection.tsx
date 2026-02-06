const trustItems = [
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Proyectos verificados",
    description:
      "Cada proyecto cuenta con documentación legal revisada y títulos de propiedad verificados.",
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Acompañamiento personalizado",
    description:
      "Te guiamos en cada paso del proceso de compra, desde la visita hasta la escrituración.",
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Atención local",
    description:
      "Equipo con presencia física en Huatulco y Puerto Escondido para atenderte de forma directa.",
  },
  {
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Inversión transparente",
    description:
      "Precios claros sin costos ocultos. Conoce el valor real de tu inversión desde el inicio.",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-gradient-subtle py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1 text-sm font-medium text-[var(--primary)]">
            Por qué elegirnos
          </span>
          <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            Tu inversión en manos confiables
          </h2>
          <p className="text-lg text-[var(--muted)]">
            Más de una década ayudando a inversionistas a encontrar las mejores
            oportunidades en la costa de Oaxaca.
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl bg-white p-8 shadow-sm border border-[var(--border)] transition-all hover:shadow-md hover:border-[var(--primary)]/20"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex rounded-xl bg-[var(--primary)]/10 p-3 text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-bold text-[var(--foreground)]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
