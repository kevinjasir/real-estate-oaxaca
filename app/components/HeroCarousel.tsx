"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Project = {
  id: string;
  name: string;
  hero_image: string | null;
  gallery: string[];
};

type HeroCarouselProps = {
  projects: Project[];
};

export default function HeroCarousel({ projects }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Collect all hero images from projects
  const heroImages = projects
    .filter((p) => p.hero_image)
    .map((p) => ({ url: p.hero_image!, name: p.name }));

  // Use a placeholder if no images available
  const images =
    heroImages.length > 0
      ? heroImages
      : [
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
            name: "Costa de Oaxaca",
          },
        ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [images.length, nextSlide]);

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden">
      {/* Background Images with Fade */}
      {images.map((image, index) => (
        <div
          key={image.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.url}
            alt={image.name}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <div className="max-w-4xl">
          {/* Badge */}
          <span className="mb-6 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            Proyectos verificados en la Costa de Oaxaca
          </span>

          {/* Main Heading - SEO optimized */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Terrenos y Residenciales
            <br />
            <span className="text-[var(--secondary)]">
              en la Costa de Oaxaca
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            Invierte con seguridad en proyectos verificados en Huatulco, Puerto
            Escondido y las mejores zonas costeras de México.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#proyectos"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold"
            >
              Ver proyectos disponibles
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:border-white hover:bg-white/20"
            >
              Hablar con un asesor
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-8 w-8 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Carousel Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
