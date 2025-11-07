"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Home, Star, Users, Phone, TrendingUp, Calendar, DollarSign, Award, CheckCircle2, Download, Mail } from "lucide-react";

export default function PlayaVivaLanding() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [animationStates, setAnimationStates] = useState({
    backgroundImage: false,
    logo: false,
    subtitle: false,
    description: false,
    priceBox: false,
    ctaButtons: false,
    scrollIndicator: false,
    logoBlur: true,
  });
  const [visibleSections, setVisibleSections] = useState({
    wynnEffect: false,
    investment: false,
    features: false,
    leadForm: false,
    location: false,
    footer: false,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  // Fit hero to viewport height (especially for mobile landscape)
  const heroStackRef = useRef<HTMLDivElement>(null);
  const [heroScale, setHeroScale] = useState(1);

  const fitHeroToViewport = () => {
    const el = heroStackRef.current;
    if (!el) return;
    const available = window.innerHeight - 24;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, available / rect.height);
    setHeroScale(scale > 0 ? scale : 1);
  };

  useEffect(() => {
    const startAnimationSequence = () => {
      setAnimationStates((prev) => ({ ...prev, backgroundImage: true }));
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, logo: true }));
      }, 500);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, logoBlur: false }));
      }, 1200);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, subtitle: true }));
      }, 1000);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, description: true }));
      }, 1500);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, priceBox: true }));
      }, 2000);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, ctaButtons: true }));
      }, 2500);
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, scrollIndicator: true }));
      }, 3000);
    };
    startAnimationSequence();
  }, []);

  useEffect(() => {
    fitHeroToViewport();
  }, []);
  useEffect(() => {
    const onResize = () => fitHeroToViewport();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  useEffect(() => {
    if (animationStates.ctaButtons) {
      setTimeout(() => fitHeroToViewport(), 0);
    }
  }, [animationStates.ctaButtons]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const checkSectionVisibility = (
        ref: React.RefObject<HTMLDivElement | null>,
        sectionKey: keyof typeof visibleSections
      ) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          setVisibleSections((prev) => ({
            ...prev,
            [sectionKey]: isVisible || currentScroll > 300,
          }));
        }
      };
      checkSectionVisibility(wynnEffectRef, "wynnEffect");
      checkSectionVisibility(investmentRef, "investment");
      checkSectionVisibility(featuresRef, "features");
      checkSectionVisibility(leadFormRef, "leadForm");
      checkSectionVisibility(locationRef, "location");
      checkSectionVisibility(footerRef, "footer");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const wynnEffectRef = useRef<HTMLDivElement>(null);
  const investmentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const leadFormRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const content = {
    es: {
      hero: {
        title: "Playa Viva",
        subtitle: "AL MARJAN ISLAND, RAS AL KHAIMAH",
        description:
          "Invierta en lujo frente al mar junto al nuevo Wynn Casino de $5.1B. Rentabilidades del 7-8%",
        price: "Desde €170.000",
        payment: "Pague solo 1% mensual durante 5 años",
        handover: "Entrega Junio 2026",
        cta1: "Descargar Dossier",
        cta2: "Reservar Ahora",
      },
      menu: {
        wynnEffect: "El Efecto Wynn",
        investment: "Inversión",
        features: "Características",
        dossier: "Dossier",
        location: "Ubicación",
        contact: "Contacto",
      },
      wynnEffect: {
        title: "El Efecto Wynn",
        subtitle: "La oportunidad que está transformando Ras Al Khaimah",
        description:
          "El Wynn Resort & Casino de $5.1 mil millones será el primer casino en la historia de los EAU. Su apertura en 2027 está catalizando una revalorización histórica en Al Marjan Island.",
        stats: [
          {
            icon: TrendingUp,
            value: "+50%",
            label: "Incremento en alquileres",
            sublabel: "Q1 2023 - Q1 2025",
          },
          {
            icon: DollarSign,
            value: "$5.1B",
            label: "Inversión Wynn Resort",
            sublabel: "Primer casino de los EAU",
          },
          {
            icon: Calendar,
            value: "Q2 2027",
            label: "Apertura del Casino",
            sublabel: "Momento de máxima revalorización",
          },
        ],
        urgency: {
          title: "¿Por qué invertir AHORA?",
          description:
            "Los inversores sofisticados están posicionándose antes de la apertura del Wynn en 2027. Playa Viva se entrega en Q2 2026, permitiéndole capitalizar el efecto completo.",
          countdown: "Entrega: Q2 2026 • Wynn apertura: Q2 2027",
        },
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
        subtitle: "Rendimientos reales impulsados por el Efecto Wynn",
        description:
          "Playa Viva representa una oportunidad única de inversión en Al Marjan Island, epicentro de la transformación inmobiliaria de Ras Al Khaimah. Con un plan de financiamiento flexible del 1% mensual y entrega en Q2 2026, posiciónese antes de la apertura del Wynn.",
        stats: [
          {
            icon: TrendingUp,
            value: "7-8%",
            label: "Rendimientos brutos de alquiler",
            description: "Yields actuales en Al Marjan Island",
          },
          {
            icon: TrendingUp,
            value: "+50%",
            label: "Incremento en alquileres",
            description: "Entre Q1 2023 y Q1 2025",
          },
          {
            icon: Award,
            value: "Q2 2026",
            label: "Entrega del proyecto",
            description: "12 meses antes de la apertura del Wynn",
          },
          {
            icon: DollarSign,
            value: "1%",
            label: "Pago mensual durante 5 años",
            description: "Plan de financiamiento flexible",
          },
        ],
        benefits: [
          "Rendimientos brutos del 7-8% en alquileres",
          "Proximidad al Wynn Resort ($5.1B)",
          "Entrega totalmente amueblado y con Smart Home",
          "Potencial de revalorización post-apertura casino",
        ],
      },
      leadForm: {
        title: "Dossier de Inversión Exclusivo",
        subtitle: "Análisis financiero completo y proyecciones del Efecto Wynn",
        description:
          "Acceda al análisis detallado de la inversión, incluyendo proyecciones de rentabilidad, planos, especificaciones técnicas y el impacto financiero del Wynn Resort en Al Marjan Island.",
        features: [
          "Proyecciones de rentabilidad 2026-2030",
          "Análisis del Efecto Wynn en precios de alquiler",
          "Planos y renders de alta resolución",
          "Plan de pago detallado y opciones de financiamiento",
        ],
        form: {
          namePlaceholder: "Nombre completo",
          emailPlaceholder: "Email",
          ctaButton: "Descargar Dossier Exclusivo",
          privacy: "Sus datos están protegidos. No compartimos información personal.",
        },
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
        subtitle: "AL MARJAN ISLAND, RAS AL KHAIMAH",
        description:
          "Invest in beachfront luxury next to the new $5.1B Wynn Casino. 7-8% rental yields",
        price: "Starting from £150,000",
        payment: "Pay Just 1% Per Month for 5 Years",
        handover: "Handover June 2026",
        cta1: "Download Dossier",
        cta2: "Book Now",
      },
      menu: {
        wynnEffect: "The Wynn Effect",
        investment: "Investment",
        features: "Features",
        dossier: "Dossier",
        location: "Location",
        contact: "Contact",
      },
      wynnEffect: {
        title: "The Wynn Effect",
        subtitle: "The opportunity transforming Ras Al Khaimah",
        description:
          "The $5.1 billion Wynn Resort & Casino will be the first casino in UAE history. Its 2027 opening is catalyzing historic appreciation in Al Marjan Island.",
        stats: [
          {
            icon: TrendingUp,
            value: "+50%",
            label: "Rental increase",
            sublabel: "Q1 2023 - Q1 2025",
          },
          {
            icon: DollarSign,
            value: "$5.1B",
            label: "Wynn Resort Investment",
            sublabel: "First casino in the UAE",
          },
          {
            icon: Calendar,
            value: "Q2 2027",
            label: "Casino Opening",
            sublabel: "Peak appreciation moment",
          },
        ],
        urgency: {
          title: "Why invest NOW?",
          description:
            "Sophisticated investors are positioning themselves before the Wynn opens in 2027. Playa Viva delivers in Q2 2026, allowing you to capitalize on the full effect.",
          countdown: "Delivery: Q2 2026 • Wynn opening: Q2 2027",
        },
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
        subtitle: "Real yields driven by the Wynn Effect",
        description:
          "Playa Viva represents a unique investment opportunity in Al Marjan Island, the epicenter of Ras Al Khaimah's real estate transformation. With a flexible 1% monthly financing plan and Q2 2026 delivery, position yourself before the Wynn opening.",
        stats: [
          {
            icon: TrendingUp,
            value: "7-8%",
            label: "Gross rental yields",
            description: "Current yields in Al Marjan Island",
          },
          {
            icon: TrendingUp,
            value: "+50%",
            label: "Rental increase",
            description: "Between Q1 2023 and Q1 2025",
          },
          {
            icon: Award,
            value: "Q2 2026",
            label: "Project delivery",
            description: "12 months before Wynn opening",
          },
          {
            icon: DollarSign,
            value: "1%",
            label: "Monthly payment for 5 years",
            description: "Flexible financing plan",
          },
        ],
        benefits: [
          "7-8% gross rental yields",
          "Proximity to Wynn Resort ($5.1B)",
          "Fully furnished delivery with Smart Home",
          "Post-casino opening appreciation potential",
        ],
      },
      leadForm: {
        title: "Exclusive Investment Dossier",
        subtitle: "Complete financial analysis and Wynn Effect projections",
        description:
          "Access detailed investment analysis, including profitability projections, floor plans, technical specifications, and the financial impact of Wynn Resort on Al Marjan Island.",
        features: [
          "2026-2030 profitability projections",
          "Wynn Effect analysis on rental prices",
          "High-resolution floor plans and renders",
          "Detailed payment plan and financing options",
        ],
        form: {
          namePlaceholder: "Full name",
          emailPlaceholder: "Email",
          ctaButton: "Download Exclusive Dossier",
          privacy: "Your data is protected. We don't share personal information.",
        },
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
  const priceString = language === "es" ? "170.000€" : "£150,000";
  const pricePrefix = language === "es" ? "Desde" : "Starting from";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Language Toggle - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="bg-white/95 backdrop-blur-sm border-brown-dark/20 hover:bg-cream-light text-brown-dark shadow-lg rounded-full px-4"
        >
          <Globe className="mr-2 h-4 w-4" />
          {language === "es" ? "EN" : "ES"}
        </Button>
      </div>

      {/* Sticky Navigation Menu - Uniestate UK Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-light/98 backdrop-blur-md border-b border-brown-dark/10 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Uniestate */}
            <div className="flex-shrink-0">
              <span className="text-brown-dark text-lg md:text-xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
                UNIESTATE
              </span>
            </div>

            {/* Desktop Menu - Centered */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              <button
                onClick={() => scrollToSection("wynn-effect")}
                className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal px-4 py-2"
              >
                {t.menu.wynnEffect}
              </button>
              <button
                onClick={() => scrollToSection("investment")}
                className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal px-4 py-2"
              >
                {t.menu.investment}
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal px-4 py-2"
              >
                {t.menu.features}
              </button>
              <button
                onClick={() => scrollToSection("dossier")}
                className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal px-4 py-2"
              >
                {t.menu.dossier}
              </button>
              <button
                onClick={() => scrollToSection("location")}
                className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal px-4 py-2"
              >
                {t.menu.location}
              </button>
            </div>

            {/* Book Now Button - Desktop */}
            <div className="hidden md:block flex-shrink-0">
              <Button
                onClick={() => scrollToSection("dossier")}
                className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-6 py-2 text-sm rounded-md shadow-md transition-all duration-200"
              >
                {language === "es" ? "Reservar Ahora" : "Book Now"}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-brown-dark hover:text-gold-warm p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMenu ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMenu && (
            <div className="md:hidden py-4 border-t border-brown-dark/10 bg-cream-light">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("wynn-effect")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal text-left py-2"
                >
                  {t.menu.wynnEffect}
                </button>
                <button
                  onClick={() => scrollToSection("investment")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal text-left py-2"
                >
                  {t.menu.investment}
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal text-left py-2"
                >
                  {t.menu.features}
                </button>
                <button
                  onClick={() => scrollToSection("dossier")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal text-left py-2"
                >
                  {t.menu.dossier}
                </button>
                <button
                  onClick={() => scrollToSection("location")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-colors duration-200 text-sm font-normal text-left py-2"
                >
                  {t.menu.location}
                </button>
                <Button
                  onClick={() => scrollToSection("dossier")}
                  className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-6 py-2 text-sm rounded-md shadow-md w-full mt-2"
                >
                  {language === "es" ? "Reservar Ahora" : "Book Now"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-svh overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 transition-all duration-700 ease-out"
          style={{
            opacity: animationStates.backgroundImage ? 1 : 0,
            transform: animationStates.backgroundImage
              ? "scale(1)"
              : "scale(1.05)",
            filter: animationStates.logo
              ? animationStates.logoBlur
                ? "brightness(1) saturate(1)"
                : "brightness(0.6) saturate(0.8) blur(1px)"
              : "brightness(1) saturate(1)",
          }}
        >
          <img
            src="/hero-background.png"
            alt="Playa Viva Al Marjan Island"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="sync"
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/fixed-hero-background.png";
            }}
          />
          <div
            className="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/30"
            style={{ opacity: animationStates.backgroundImage ? 0.2 : 0 }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div
            ref={heroStackRef}
            className="container max-w-6xl mx-auto"
            style={{
              transform: heroScale < 1 ? `scale(${heroScale})` : undefined,
              transformOrigin: "top center",
            }}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-5 mt-0">
              {/* Logo */}
              <div
                className="transition-all duration-1000 ease-out"
                style={{
                  opacity: animationStates.logo ? 1 : 0,
                  transform: animationStates.logo
                    ? "translateY(30px) scale(1.1)"
                    : "translateY(50px) scale(1.0)",
                }}
              >
                <div className="flex justify-center">
                  <img
                    src="/logo-playa-viva.png"
                    alt="Playa Viva Logo"
                    className="w-auto h-28 sm:h-40 md:h-48 lg:h-56 xl:h-64 drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] filter brightness-110 contrast-110"
                    style={{
                      filter: `brightness(110%) contrast(110%) ${
                        animationStates.logoBlur ? "blur(4px)" : "blur(0px)"
                      }`,
                      transition: "filter 1.5s ease-out",
                    }}
                  />
                </div>
              </div>

              {/* Subtitle pill: stronger background for readability + gold halo */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: animationStates.subtitle ? 1 : 0,
                  transform: animationStates.subtitle
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <div className="inline-block bg-black/65 sm:bg-black/55 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-gold-warm/60 ring-2 ring-gold-warm/75 shadow-[0_0_40px_rgba(162,144,96,0.7)]">
                  <p className="font-arabic text-gold-warm text-xl sm:text-2xl md:text-3xl lg:text-[2.4rem] font-semibold tracking-[0.04em] sm:tracking-[0.06em] uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]">
                    {t.hero.subtitle}
                  </p>
                </div>
              </div>

              {/* Description - Sophisticated styling and legibility */}
              <div
                className="transition-all duration-700 ease-out max-w-4xl"
                style={{
                  opacity: animationStates.description ? 1 : 0,
                  transform: animationStates.description
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <div className="relative max-w-[94vw] sm:max-w-3xl mx-auto px-2">
                  <div className="absolute inset-0 bg-black/40 rounded-lg" />
                  <p className="relative text-[#FFFFFF] text-[clamp(0.85rem,3.2vw,1.15rem)] font-medium leading-relaxed px-3 sm:px-6 py-2 sm:py-3 tracking-[0.01em] text-center">
                    {t.hero.description}
                  </p>
                </div>
              </div>

              {/* Price Card: solid background enforced + stronger gold halo on hover */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: animationStates.priceBox ? 1 : 0,
                  transform: animationStates.priceBox
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <div className="relative">
                  <div
                    className="rounded-2xl p-5 sm:p-6 shadow-2xl max-w-[90vw] sm:max-w-160 mx-auto transition-all duration-200 border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 hover:-translate-y-[3px] hover:ring-gold-warm/85 hover:shadow-[0_24px_52px_rgba(0,0,0,0.6),0_0_56px_rgba(162,144,96,0.7)]"
                    style={{ backgroundColor: "#6E5F46" }} // sólido y opaco garantizado
                  >
                    <div className="space-y-2 sm:space-y-3 text-center">
                      <div className="text-gold-warm text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap [text-shadow:1px_1px_3px_rgba(0,0,0,0.9)]">
                        {pricePrefix}
                        {"\u00A0"}
                        {priceString}
                      </div>
                      <div className="text-cream-light text-sm sm:text-base md:text-lg font-medium [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                        {t.hero.payment}
                      </div>
                      <div className="text-cream-light text-xs sm:text-sm md:text-base font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                        {t.hero.handover}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button: Single Dossier download button centered */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: animationStates.ctaButtons ? 1 : 0,
                  transform: animationStates.ctaButtons
                    ? "translateY(0px)"
                    : "translateY(30px)",
                }}
              >
                <div className="flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => scrollToSection("dossier")}
                    size="lg"
                    className="bg-gold-warm text-brown-dark font-bold antialiased tracking-wide px-10 py-4 text-base sm:text-lg rounded-xl border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 shadow-2xl transition-all duration-200 hover:bg-gold-warm/80 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.55),0_0_48px_rgba(162,144,96,0.65)] hover:ring-gold-warm/85 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">⬇️</span>
                      <span>{language === "es" ? "Dossier Exclusivo" : "Exclusive Dossier"}</span>
                    </span>
                  </Button>

                  {/* Scroll Indicator (sm+) */}
                  <div
                    className="mt-2 hidden sm:flex justify-center pointer-events-none animate-bounce"
                    style={{
                      opacity: animationStates.scrollIndicator ? 1 : 0,
                      transform: animationStates.scrollIndicator
                        ? "translateY(0px)"
                        : "translateY(20px)",
                    }}
                  >
                    <div className="w-6 h-10 border-2 border-yellow-400/70 rounded-full flex items-start justify-center p-2">
                      <div className="w-1.5 h-3 bg-yellow-400/80 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Wynn Effect - CRITICAL SECTION */}
      <section
        id="wynn-effect"
        ref={wynnEffectRef}
        className="relative py-20 md:py-32 bg-gradient-to-br from-brown-dark via-brown-dark to-olive-brown overflow-hidden"
        style={{
          opacity: visibleSections.wynnEffect ? 1 : 0,
          transform: visibleSections.wynnEffect
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${`var(--gold-warm)`} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <div className="bg-gold-warm/20 border border-gold-warm/40 rounded-full px-6 py-2">
                <p className="text-gold-warm text-sm font-semibold tracking-widest uppercase">
                  {language === "es" ? "Oportunidad Histórica" : "Historic Opportunity"}
                </p>
              </div>
            </div>
            <h2
              className="text-4xl md:text-6xl font-light text-cream-light mb-6 font-arabic"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            >
              {t.wynnEffect.title}
            </h2>
            <h3
              className="text-xl md:text-2xl text-gold-warm mb-8"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              {t.wynnEffect.subtitle}
            </h3>
            <p
              className="text-cream-light/90 text-base md:text-lg leading-relaxed"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
              }}
            >
              {t.wynnEffect.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-6xl mx-auto">
            {t.wynnEffect.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gold-warm/10 to-gold-warm/5 backdrop-blur-sm border-2 border-gold-warm/30 rounded-2xl p-8 text-center hover:border-gold-warm/60 hover:shadow-2xl hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-2"
                style={{
                  opacity: visibleSections.wynnEffect ? 1 : 0,
                  transform: visibleSections.wynnEffect
                    ? "translateY(0px)"
                    : "translateY(30px)",
                  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                    0.4 + index * 0.1
                  }s`,
                }}
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-gold-warm/20 p-4 rounded-full">
                    <stat.icon className="h-10 w-10 text-gold-warm" />
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-gold-warm mb-3">
                  {stat.value}
                </div>
                <h4 className="text-cream-light text-lg md:text-xl font-semibold mb-2">
                  {stat.label}
                </h4>
                <p className="text-cream-light/70 text-sm">
                  {stat.sublabel}
                </p>
              </div>
            ))}
          </div>

          {/* Urgency Banner */}
          <div
            className="max-w-4xl mx-auto bg-gradient-to-r from-gold-warm/20 via-gold-warm/30 to-gold-warm/20 border-2 border-gold-warm rounded-2xl p-8 md:p-12"
            style={{
              opacity: visibleSections.wynnEffect ? 1 : 0,
              transform: visibleSections.wynnEffect
                ? "translateY(0px)"
                : "translateY(30px)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s",
            }}
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-cream-light mb-4">
                {t.wynnEffect.urgency.title}
              </h3>
              <p className="text-cream-light/90 text-base md:text-lg leading-relaxed mb-6">
                {t.wynnEffect.urgency.description}
              </p>
              <div className="inline-block bg-brown-dark/50 rounded-lg px-6 py-3 border border-gold-warm/40">
                <p className="text-gold-warm font-semibold text-sm md:text-base tracking-wide">
                  {t.wynnEffect.urgency.countdown}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
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

      {/* Investment */}
      <section
        id="investment"
        ref={investmentRef}
        className="relative py-24 bg-white"
        style={{
          opacity: visibleSections.investment ? 1 : 0,
          transform: visibleSections.investment
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-light text-brown-dark mb-6"
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
                className="text-taupe-warm text-base md:text-lg leading-relaxed max-w-3xl mx-auto"
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
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {t.investment.stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-cream-light border-2 border-gold-warm/30 rounded-2xl p-6 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-2"
                  style={{
                    opacity: visibleSections.investment ? 1 : 0,
                    transform: visibleSections.investment
                      ? "translateY(0px)"
                      : "translateY(30px)",
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                      0.3 + index * 0.1
                    }s`,
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-gold-warm/20 p-3 rounded-full">
                      <stat.icon className="h-8 w-8 text-gold-warm" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gold-warm mb-2 text-center">
                    {stat.value}
                  </div>
                  <h4 className="text-brown-dark font-semibold mb-2 text-center text-sm md:text-base">
                    {stat.label}
                  </h4>
                  <p className="text-taupe-warm text-xs md:text-sm text-center leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {t.investment.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start p-5 bg-cream-light/50 rounded-xl border border-gold-warm/20 hover:bg-cream-light hover:border-gold-warm/40 transition-all duration-300"
                  style={{
                    opacity: visibleSections.investment ? 1 : 0,
                    transform: visibleSections.investment
                      ? "translateY(0px)"
                      : "translateY(20px)",
                    transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                      0.7 + index * 0.1
                    }s`,
                  }}
                >
                  <CheckCircle2 className="h-6 w-6 text-gold-warm mr-3 shrink-0 mt-0.5" />
                  <span className="text-brown-dark text-left text-sm md:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet - Exclusive Dossier Form */}
      <section
        id="dossier"
        ref={leadFormRef}
        className="relative py-20 md:py-32 bg-gradient-to-br from-brown-dark via-olive-brown to-brown-dark overflow-hidden"
        style={{
          opacity: visibleSections.leadForm ? 1 : 0,
          transform: visibleSections.leadForm
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(45deg, transparent 48%, var(--gold-warm) 49%, var(--gold-warm) 51%, transparent 52%)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Value Proposition */}
              <div>
                <div className="inline-block mb-6">
                  <div className="bg-gold-warm/20 border border-gold-warm/40 rounded-full px-6 py-2">
                    <p className="text-gold-warm text-sm font-semibold tracking-widest uppercase">
                      {language === "es" ? "Exclusivo para Inversores" : "Exclusive for Investors"}
                    </p>
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-light text-cream-light mb-6 font-arabic">
                  {t.leadForm.title}
                </h2>
                <p className="text-xl text-gold-warm mb-8">
                  {t.leadForm.subtitle}
                </p>
                <p className="text-cream-light/90 text-base leading-relaxed mb-8">
                  {t.leadForm.description}
                </p>

                {/* Features List */}
                <div className="space-y-4">
                  {t.leadForm.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start"
                      style={{
                        opacity: visibleSections.leadForm ? 1 : 0,
                        transform: visibleSections.leadForm
                          ? "translateX(0px)"
                          : "translateX(-20px)",
                        transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                          0.3 + index * 0.1
                        }s`,
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-gold-warm mr-3 shrink-0 mt-0.5" />
                      <span className="text-cream-light text-sm md:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Form */}
              <div
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-2xl border-2 border-gold-warm/30"
                style={{
                  opacity: visibleSections.leadForm ? 1 : 0,
                  transform: visibleSections.leadForm
                    ? "translateY(0px)"
                    : "translateY(30px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // UTM Parameters capture
                    const urlParams = new URLSearchParams(window.location.search);
                    const utmData = {
                      utm_source: urlParams.get('utm_source') || '',
                      utm_medium: urlParams.get('utm_medium') || '',
                      utm_campaign: urlParams.get('utm_campaign') || '',
                      utm_term: urlParams.get('utm_term') || '',
                      utm_content: urlParams.get('utm_content') || '',
                    };

                    // HubSpot Integration Ready
                    const leadData = {
                      name: formData.name,
                      email: formData.email,
                      ...utmData,
                      timestamp: new Date().toISOString(),
                      language: language,
                      page: 'Playa Viva Landing',
                    };

                    console.log('Lead captured:', leadData);
                    // TODO: Send to HubSpot API
                    // Example: fetch('/api/hubspot/submit', { method: 'POST', body: JSON.stringify(leadData) })

                    alert(language === "es"
                      ? "¡Gracias! El dossier se enviará a su email."
                      : "Thank you! The dossier will be sent to your email.");
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-brown-dark font-medium mb-2 text-sm">
                      {t.leadForm.form.namePlaceholder}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-brown-dark/20 rounded-xl focus:border-gold-warm focus:ring-2 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white text-brown-dark"
                      placeholder={t.leadForm.form.namePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-brown-dark font-medium mb-2 text-sm">
                      {t.leadForm.form.emailPlaceholder}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-dark/40" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border-2 border-brown-dark/20 rounded-xl focus:border-gold-warm focus:ring-2 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white text-brown-dark"
                        placeholder={t.leadForm.form.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-base md:text-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {t.leadForm.form.ctaButton}
                  </Button>

                  <p className="text-taupe-warm text-xs text-center leading-relaxed">
                    {t.leadForm.form.privacy}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section
        id="location"
        ref={locationRef}
        className="relative py-24 bg-cream-light"
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
