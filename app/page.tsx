"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Home, Star, Users, Phone } from "lucide-react";

export default function PlayaVivaLanding() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [scrollY, setScrollY] = useState(0);
  const [animationStates, setAnimationStates] = useState({
    backgroundImage: false,
    logo: false,
    subtitle: false,
    description: false,
    priceBox: false,
    ctaButtons: false,
    scrollIndicator: false,
  });
  const [visibleSections, setVisibleSections] = useState({
    features: false,
    investment: false,
    location: false,
    footer: false,
  });

  const featuresRef = useRef<HTMLDivElement>(null);
  const investmentRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Automatic animation sequence on load
  useEffect(() => {
    const startAnimationSequence = () => {
      // Background image appears immediately
      setAnimationStates((prev) => ({ ...prev, backgroundImage: true }));

      // Logo appears after 0.5 seconds
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, logo: true }));
      }, 500);

      // Subtitle appears after 1 second
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, subtitle: true }));
      }, 1000);

      // Description appears after 1.5 seconds
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, description: true }));
      }, 1500);

      // Price box appears after 2 seconds
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, priceBox: true }));
      }, 2000);

      // CTA buttons appear after 2.5 seconds
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, ctaButtons: true }));
      }, 2500);

      // Scroll indicator appears after 3 seconds
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, scrollIndicator: true }));
      }, 3000);
    };

    // Start animation sequence when component mounts
    startAnimationSequence();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // Check section visibility
      const checkSectionVisibility = (
        ref: React.RefObject<HTMLDivElement | null>,
        sectionKey: keyof typeof visibleSections
      ) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

          setVisibleSections((prev) => ({
            ...prev,
            [sectionKey]: isVisible || currentScroll > 300, // Show after scrolling past hero
          }));
        }
      };

      checkSectionVisibility(featuresRef, "features");
      checkSectionVisibility(investmentRef, "investment");
      checkSectionVisibility(locationRef, "location");
      checkSectionVisibility(footerRef, "footer");
    };

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
      features: {
        title: "Características Exclusivas",
        items: [
          {
            icon: Home,
            title: "Residencias de Lujo",
            description: "Apartamentos y penthouses con vistas al mar arábigo",
          },
          {
            icon: MapPin,
            title: "Ubicación Privilegiada",
            description: "En el corazón de Al Marjan Island, Ras Al Khaimah",
          },
          {
            icon: Star,
            title: "Instalaciones Premium",
            description:
              "Piscinas infinity, spa, gimnasio y club de playa privado",
          },
          {
            icon: Users,
            title: "Comunidad Exclusiva",
            description: "Un enclave privado para inversores sofisticados",
          },
        ],
      },
      investment: {
        title: "Oportunidad de Inversión",
        subtitle: "Una inversión que trasciende el tiempo",
        description:
          "Playa Viva representa una oportunidad única de inversión en uno de los destinos más prometedores del Golfo Pérsico. Con un plan de financiamiento flexible del 1% mensual y una entrega programada para 2026, garantizamos el máximo retorno de su inversión.",
        benefits: [
          "Renta garantizada del 8% anual",
          "Cancelación anticipada disponible",
          "Gestión profesional incluida",
          "Potencial de revalorización del 15% anual",
        ],
      },
      location: {
        title: "Al Marjan Island",
        subtitle: "El futuro de la vida de lujo en los EAU",
        description:
          "Situada en las costas de Ras Al Khaimah, Al Marjan Island es una nueva joya arquitectónica que redefine el concepto de vida de lujo. Con más de 7 kilómetros de playas vírgenes, esta isla artificial combina belleza natural con sofisticación moderna.",
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
      features: {
        title: "Exclusive Features",
        items: [
          {
            icon: Home,
            title: "Luxury Residences",
            description: "Apartments and penthouses with Arabian Sea views",
          },
          {
            icon: MapPin,
            title: "Prime Location",
            description: "In the heart of Al Marjan Island, Ras Al Khaimah",
          },
          {
            icon: Star,
            title: "Premium Amenities",
            description: "Infinity pools, spa, gym and private beach club",
          },
          {
            icon: Users,
            title: "Exclusive Community",
            description: "A private enclave for sophisticated investors",
          },
        ],
      },
      investment: {
        title: "Investment Opportunity",
        subtitle: "An investment that transcends time",
        description:
          "Playa Viva represents a unique investment opportunity in one of the most promising destinations in the Persian Gulf. With flexible financing plan of 1% monthly payment and scheduled delivery for 2026, we guarantee maximum return on your investment.",
        benefits: [
          "Guaranteed 8% annual rental income",
          "Early cancellation option available",
          "Professional management included",
          "15% annual appreciation potential",
        ],
      },
      location: {
        title: "Al Marjan Island",
        subtitle: "The future of luxury living in the UAE",
        description:
          "Located on the coast of Ras Al Khaimah, Al Marjan Island is a new architectural jewel that redefines the concept of luxury living. With over 7 kilometers of pristine beaches, this artificial island combines natural beauty with modern sophistication.",
      },
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Language Toggle - Fixed positioning */}
      <div className="fixed top-6 right-6 z-[9999]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="bg-white/95 backdrop-blur-sm border-gold-warm/30 hover:bg-cream-light text-brown-dark shadow-lg"
        >
          <Globe className="mr-2 h-4 w-4" />
          {language === "es" ? "EN" : "ES"}
        </Button>
      </div>

      {/* Hero Section - Full viewport height */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 transition-all duration-1000"
          style={{
            opacity: animationStates.backgroundImage ? 1 : 0,
            transform: animationStates.backgroundImage
              ? "scale(1)"
              : "scale(1.1)",
          }}
        >
          <img
            src="/Captura.png"
            alt="Playa Viva Al Marjan Island"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-brown-dark/70 via-brown-dark/50 to-brown-dark/80"
            style={{ opacity: animationStates.backgroundImage ? 0.3 : 0 }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Logo */}
              <div
                className="transition-all duration-1000 ease-out"
                style={{
                  opacity: animationStates.logo ? 1 : 0,
                  transform: animationStates.logo
                    ? "translateY(0px)"
                    : "translateY(30px)",
                  filter: animationStates.logo ? "blur(0px)" : "blur(20px)",
                }}
              >
                <div className="flex justify-center mb-8">
                  <img
                    src="/logo-playa-viva.png"
                    alt="Playa Viva Logo"
                    className="w-auto h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] drop-shadow-[0_0_50px_rgba(236,232,221,1)] filter brightness-110"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div
                className="transition-all duration-800 ease-out"
                style={{
                  opacity: animationStates.subtitle ? 1 : 0,
                  transform: animationStates.subtitle
                    ? "translateY(0px)"
                    : "translateY(20px)",
                }}
              >
                <p className="text-gold-warm text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.3em] uppercase [text-shadow:_0_4px_20px_rgb(0_0_0_/_100%),_0_8px_40px_rgb(162_144_96_/_90%),_0_2px_8px_rgb(0_0_0_/_100%)]">
                  {t.hero.subtitle}
                </p>
              </div>

              {/* Description */}
              <div
                className="transition-all duration-800 ease-out"
                style={{
                  opacity: animationStates.description ? 1 : 0,
                  transform: animationStates.description
                    ? "translateY(0px)"
                    : "translateY(20px)",
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 to-brown-dark/50 blur-2xl" />
                  <p className="relative text-cream-light text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light [text-shadow:_0_2px_12px_rgb(90_82_63_/_90%),_0_4px_24px_rgb(90_82_63_/_70%)]">
                    {t.hero.description}
                  </p>
                </div>
              </div>

              {/* Price Box */}
              <div
                className="transition-all duration-800 ease-out"
                style={{
                  opacity: animationStates.priceBox ? 1 : 0,
                  transform: animationStates.priceBox
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-gold-warm/20 blur-3xl rounded-2xl" />
                  <div className="relative bg-brown-dark/60 backdrop-blur-xl border border-cream-light/30 rounded-2xl p-8 shadow-2xl">
                    <div className="space-y-4">
                      <div className="text-gold-warm text-4xl md:text-5xl font-semibold [text-shadow:_0_2px_10px_rgb(90_82_63_/_80%)]">
                        {t.hero.price}
                      </div>
                      <div className="text-cream-light text-lg md:text-xl font-light [text-shadow:_0_2px_8px_rgb(90_82_63_/_70%)]">
                        {t.hero.payment}
                      </div>
                      <div className="text-cream-light/90 text-base [text-shadow:_0_2px_8px_rgb(90_82_63_/_70%)]">
                        {t.hero.handover}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
                style={{
                  opacity: animationStates.ctaButtons ? 1 : 0,
                  transform: animationStates.ctaButtons
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <Button
                  size="lg"
                  className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {t.hero.cta1}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-brown-dark/60 backdrop-blur-sm border-2 border-cream-light/40 text-cream-light hover:bg-cream-light hover:text-brown-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {t.hero.cta2}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce"
          style={{
            opacity: animationStates.scrollIndicator ? 1 : 0,
            transform: animationStates.scrollIndicator
              ? "translateY(0px)"
              : "translateY(20px)",
          }}
        >
          <div className="w-6 h-10 border-2 border-cream-light/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-cream-light/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="relative py-24 bg-cream-light"
        style={{
          opacity: visibleSections.features ? 1 : 0,
          transform: visibleSections.features
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-6">
              {t.features.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/50 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{
                  opacity: visibleSections.features ? 1 : 0,
                  transform: visibleSections.features
                    ? "translateY(0px)"
                    : "translateY(30px)",
                  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                    index * 0.1
                  }s`,
                }}
              >
                <div className="flex justify-center mb-4">
                  <item.icon className="h-12 w-12 text-gold-warm" />
                </div>
                <h3 className="text-xl font-semibold text-brown-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-taupe-warm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section
        ref={investmentRef}
        className="relative py-24 bg-brown-dark"
        style={{
          opacity: visibleSections.investment ? 1 : 0,
          transform: visibleSections.investment
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl font-light text-cream-light mb-6"
              style={{
                opacity: visibleSections.investment ? 1 : 0,
                transform: visibleSections.investment
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {t.investment.title}
            </h2>
            <h3
              className="text-2xl text-gold-warm mb-8"
              style={{
                opacity: visibleSections.investment ? 1 : 0,
                transform: visibleSections.investment
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            >
              {t.investment.subtitle}
            </h3>
            <p
              className="text-cream-light/90 text-lg leading-relaxed mb-12"
              style={{
                opacity: visibleSections.investment ? 1 : 0,
                transform: visibleSections.investment
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              {t.investment.description}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {t.investment.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gold-warm/10 rounded-xl backdrop-blur-sm border border-gold-warm/20 hover:bg-gold-warm/15 transition-all duration-300"
                  style={{
                    opacity: visibleSections.investment ? 1 : 0,
                    transform: visibleSections.investment
                      ? "translateY(0px)"
                      : "translateY(20px)",
                    transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                      0.3 + index * 0.1
                    }s`,
                  }}
                >
                  <div className="w-3 h-3 bg-gold-warm rounded-full mr-4 flex-shrink-0" />
                  <span className="text-cream-light text-left">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section
        ref={locationRef}
        className="relative py-24 bg-white"
        style={{
          opacity: visibleSections.location ? 1 : 0,
          transform: visibleSections.location
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-6">
              {t.location.title}
            </h2>
            <h3 className="text-2xl text-gold-warm mb-8">
              {t.location.subtitle}
            </h3>
            <p className="text-taupe-warm text-lg leading-relaxed">
              {t.location.description}
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        ref={footerRef}
        className="relative py-16 bg-brown-dark"
        style={{
          opacity: visibleSections.footer ? 1 : 0,
          transform: visibleSections.footer
            ? "translateY(0px)"
            : "translateY(30px)",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl text-gold-warm font-light">
              {language === "es" ? "¿Listo para invertir?" : "Ready to invest?"}
            </h3>
            <p className="text-cream-light/90">
              {language === "es"
                ? "Contacta con nuestro equipo de expertos para obtener información personalizada sobre Playa Viva."
                : "Contact our expert team for personalized information about Playa Viva."}
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Phone className="mr-2 h-5 w-5" />
                {language === "es" ? "Contactar Ahora" : "Contact Now"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
