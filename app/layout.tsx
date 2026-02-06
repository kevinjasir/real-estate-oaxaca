import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://costaoaxaca.com"
  ),
  title: "Terrenos y Residenciales en la Costa de Oaxaca | Inversión Segura",
  description:
    "Descubre terrenos y residenciales verificados en Huatulco, Puerto Escondido y la costa de Oaxaca. Inversión inmobiliaria segura con acompañamiento personalizado.",
  keywords: [
    "terrenos en Huatulco",
    "terrenos en Puerto Escondido",
    "residenciales Oaxaca",
    "inversión inmobiliaria México",
    "terrenos costa Oaxaca",
    "bienes raíces playa México",
  ],
  authors: [{ name: "Costa Oaxaca Real Estate" }],
  openGraph: {
    title: "Terrenos y Residenciales en la Costa de Oaxaca",
    description:
      "Invierte con seguridad en proyectos verificados. Terrenos y residenciales en las mejores zonas costeras de Oaxaca.",
    type: "website",
    locale: "es_MX",
    siteName: "Costa Oaxaca Real Estate",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Terrenos y Residenciales en la Costa de Oaxaca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrenos y Residenciales en la Costa de Oaxaca",
    description:
      "Invierte con seguridad en proyectos verificados en Huatulco y Puerto Escondido.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://costaoaxaca.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#2d5a47" />
        <meta name="geo.region" content="MX-OAX" />
        <meta name="geo.placename" content="Oaxaca, México" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
