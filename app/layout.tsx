import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playa Viva - Inversión Inmobiliaria en Al Marjan Island | Uniestate",
  description:
    "Invierta en Playa Viva, un exclusivo complejo residencial frente al mar en Al Marjan Island, Ras Al Khaimah. Desde £150,000 con plan de pago 1% mensual.",
  generator: "v0.app",
  keywords:
    "inversión inmobiliaria Dubai, Al Marjan Island, Playa Viva, propiedades lujo Emiratos, real estate investment",
  icons: {
    icon: "/logo-playa-viva.png",
    apple: "/logo-playa-viva.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
