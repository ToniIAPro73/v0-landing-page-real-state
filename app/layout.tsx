import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://landing-page-playa-viva.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Playa Viva Residences | Inversión en Al Marjan Island desde £172k",
  description:
    "Playa Viva es un residencial frente al mar en Al Marjan Island con estudios y apartamentos llave en mano desde £172,000 / 192.000 €. Plan 1% mensual y entrega Q2 2026.",
  generator: "v0.app",
  keywords:
    "inversión inmobiliaria Dubai, Al Marjan Island, Playa Viva, propiedades lujo Emiratos, real estate investment Ras Al Khaimah, seafront apartments UAE",
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      en: "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Playa Viva Residences",
    title: "Playa Viva Residences | Inversión frente al mar en Ras Al Khaimah",
    description:
      "Viviendas llave en mano en Al Marjan Island con vistas al Wynn Resort. Desde £172k / 192.000€ con plan de pago flexible.",
    images: [
      {
        url: "/assets/imagenes/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "Render de Playa Viva frente al mar en Al Marjan Island",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playa Viva Residences | Inversión frente al mar en Ras Al Khaimah",
    description:
      "Residencias boutique con vistas al mar y plan de pago 1% mensual. Descargue el dossier oficial.",
    images: ["/assets/imagenes/hero-image.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon_playa_viva.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_playa_viva.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon_playa_viva.png",
    apple: "/favicon_playa_viva.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta
          name="description"
          content="Residencias frente al mar en Al Marjan Island con planes de pago flexibles desde £172K. Descarga el dossier de Playa Viva y descubre precios, amenities y la conexión con el nuevo Wynn Resort."
        />
        <meta
          property="og:description"
          content="Residencias frente al mar en Al Marjan Island con planes de pago flexibles desde £172K. Descarga el dossier oficial de Playa Viva y descubre la inversión junto al Wynn Resort."
        />
        <meta
          name="twitter:description"
          content="Residencias boutique en Al Marjan Island con vista al mar y planes 1% mensual. Descarga el dossier y conoce la inversión Playa Viva."
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
