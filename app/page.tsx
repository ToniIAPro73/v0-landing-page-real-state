"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function PlayaVivaLanding() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const content = {
    es: {
      hero: {
        title: "Playa Viva",
        subtitle: "Al Marjan Island, Ras Al Khaimah",
        description:
          "Un santuario exclusivo frente al mar diseñado para la vida de lujo moderna",
        price: "Desde £150,000",
        payment: "Pague solo 1% mensual durante 5 años",
        handover: "Entrega Junio 2026",
        cta1: "Descargar Brochure",
        cta2: "Reservar Ahora",
      },
    },
    en: {
      hero: {
        title: "Playa Viva",
        subtitle: "Al Marjan Island, Ras Al Khaimah",
        description:
          "An exclusive beachfront sanctuary designed for modern luxury living",
        price: "Starting from £150,000",
        payment: "Pay Just 1% Per Month for 5 Years",
        handover: "Handover June 2026",
        cta1: "Download Brochure",
        cta2: "Book Now",
      },
    },
  };

  const t = content[language].hero;

  const logoOpacity = Math.min(scrollY / 100, 1);
  // Stage 2: Logo sharpens (100-300px scroll) - blur goes from 20px to 0px
  const logoBlur = Math.max(20 - (scrollY - 100) / 10, 0);
  // Stage 3: Content appears after logo is sharp (300px+ scroll)
  const contentOpacity = Math.min(Math.max((scrollY - 300) / 200, 0), 1);
  // Overlay appears with scroll
  const overlayOpacity = Math.min(scrollY / 300, 1);

  return (
    <div className="bg-cream-light">
      {/* Language Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="bg-cream-light/95 backdrop-blur-sm border-gold-warm/30 hover:bg-cream-light text-brown-dark"
        >
          <Globe className="mr-2 h-4 w-4" />
          {language === "es" ? "EN" : "ES"}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative h-[200vh]">
        <div className="fixed inset-0 z-0 h-screen">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Composicion_hero_transparente-8fGQo64uKeGFpOH2jWX0d2rqfvKtGK.png"
            alt="Playa Viva Al Marjan Island"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-brown-dark/60 via-brown-dark/40 to-brown-dark/70 transition-opacity duration-700"
            style={{ opacity: overlayOpacity }}
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(90,82,63,0.7)_0%,transparent_70%)] transition-opacity duration-700"
            style={{ opacity: overlayOpacity }}
          />
        </div>

        {/* Hero Content - Reveals on scroll */}
        <div className="sticky top-0 z-10 h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-5xl mx-auto space-y-8">
              <div
                className="space-y-6 transition-all duration-500"
                style={{
                  opacity: logoOpacity,
                  filter: `blur(${logoBlur}px)`,
                }}
              >
                <div className="flex justify-center mb-8">
                  <img
                    src="/logo-playa-viva.png"
                    alt="Playa Viva Logo"
                    className="w-auto h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] drop-shadow-[0_0_50px_rgba(236,232,221,1)] filter brightness-110"
                  />
                </div>

                <p className="text-gold-warm text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.3em] uppercase [text-shadow:_0_4px_20px_rgb(0_0_0_/_100%),_0_8px_40px_rgb(162_144_96_/_90%),_0_2px_8px_rgb(0_0_0_/_100%)]">
                  {t.subtitle}
                </p>
              </div>

              <div
                className="space-y-8 transition-opacity duration-700"
                style={{ opacity: contentOpacity }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 to-brown-dark/50 blur-2xl" />
                  <p className="relative text-cream-light text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light [text-shadow:_0_2px_12px_rgb(90_82_63_/_90%),_0_4px_24px_rgb(90_82_63_/_70%)]">
                    {t.description}
                  </p>
                </div>

                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-gold-warm/20 blur-3xl rounded-2xl" />
                  <div className="relative bg-brown-dark/60 backdrop-blur-xl border border-cream-light/30 rounded-2xl p-8 shadow-2xl">
                    <div className="space-y-4">
                      <div className="text-gold-warm text-4xl md:text-5xl font-semibold [text-shadow:_0_2px_10px_rgb(90_82_63_/_80%)]">
                        {t.price}
                      </div>
                      <div className="text-cream-light text-lg md:text-xl font-light [text-shadow:_0_2px_8px_rgb(90_82_63_/_70%)]">
                        {t.payment}
                      </div>
                      <div className="text-cream-light/90 text-base [text-shadow:_0_2px_8px_rgb(90_82_63_/_70%)]">
                        {t.handover}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <Button
                    size="lg"
                    className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {t.cta1}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-brown-dark/60 backdrop-blur-sm border-2 border-cream-light/40 text-cream-light hover:bg-cream-light hover:text-brown-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {t.cta2}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-cream-light/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-cream-light/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <section className="relative z-20 bg-cream-light py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-light text-brown-dark mb-6">
            Próxima Sección
          </h2>
          <p className="text-taupe-warm text-lg">
            El contenido adicional aparecerá aquí...
          </p>
        </div>
      </section>
    </div>
  );
}
