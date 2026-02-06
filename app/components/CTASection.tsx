export default function CTASection() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-[var(--accent)] py-20 md:py-28"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[var(--primary)]/5" />
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[var(--secondary)]/10" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1 text-sm font-medium text-[var(--primary)]">
          Sin compromiso
        </span>

        {/* Heading */}
        <h2 className="mb-6 text-3xl font-bold text-[var(--foreground)] md:text-4xl lg:text-5xl">
          Agenda una visita o recibe
          <br className="hidden sm:block" />
          información sin compromiso
        </h2>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted)]">
          Nuestro equipo está listo para ayudarte a encontrar el terreno ideal
          para tu inversión. Respuesta en menos de 24 horas.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://wa.me/529511234567?text=Hola,%20me%20interesa%20recibir%20información%20sobre%20terrenos"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-3 rounded-lg px-8 py-4 text-lg font-semibold"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hablar con un asesor
          </a>

          <a
            href="tel:+529511234567"
            className="inline-flex items-center gap-3 rounded-lg border-2 border-[var(--primary)] bg-white px-8 py-4 text-lg font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-white"
          >
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Llamar ahora
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-[var(--primary)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Respuesta en 24 hrs
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-[var(--primary)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Sin compromiso
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-[var(--primary)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Atención personalizada
          </div>
        </div>
      </div>
    </section>
  );
}
