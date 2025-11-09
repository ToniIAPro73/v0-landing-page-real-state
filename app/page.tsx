"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Home, Star, Users, Phone, TrendingUp, Calendar, DollarSign, Award, CheckCircle2, Download, Mail, ArrowUpRight } from "lucide-react";

const SITE_URL = "https://landing-page-playa-viva.vercel.app";

type LeadAutomationPayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: "es" | "en";
  page: string;
  timestamp: string;
  dossierFileName: string;
  utm: Record<string, string>;
  workflow: string;
};

export default function PlayaVivaLanding() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [activeGalleryTab, setActiveGalleryTab] = useState<"servicios" | "interior" | "sitios" | "video">("servicios");
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
    wynnEffect: false,
    investment: false,
    features: false,
    gallery: false,
    apartments: false,
    trust: false,
    location: false,
    faq: false,
    leadForm: false,
    footer: false,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [automationFeedback, setAutomationFeedback] = useState<{ type: "success" | "error"; userName: string } | null>(null);
  const [activeApartment, setActiveApartment] = useState<"studio" | "oneBed" | "twoBed" | "threeBed">("studio");
  const [locationView, setLocationView] = useState<"map" | "collage">("map");

  // Fit hero to viewport height (especially for mobile landscape)
  const heroStackRef = useRef<HTMLDivElement>(null);
  const [heroScale, setHeroScale] = useState(1);

  const fitHeroToViewport = () => {
    const el = heroStackRef.current;
    if (!el) return;
    const navOffset = window.innerHeight <= 500 ? 80 : 24;
    const available = window.innerHeight - navOffset;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, available / rect.height);
    setHeroScale(scale > 0 ? scale : 1);
  };

  useEffect(() => {
    const startAnimationSequence = () => {
      // Background aparece inmediatamente y se espera 3seg
      setAnimationStates((prev) => ({ ...prev, backgroundImage: true }));

      // Logo aparece después de 3seg de espera, dura 2.5seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, logo: true }));
      }, 3000);

      // Subtítulo (AL MARJAN ISLAND) - empieza después del logo (3+2.5=5.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, subtitle: true }));
      }, 5500);

      // Descripción - empieza después del subtítulo (5.5+2=7.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, description: true }));
      }, 7500);

      // Price box - empieza después de descripción (7.5+2=9.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, priceBox: true }));
      }, 9500);

      // Botón CTA - empieza después de price box (9.5+2=11.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, ctaButtons: true }));
      }, 11500);

      // Scroll indicator - empieza después del botón (11.5+2=13.5seg)
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, scrollIndicator: true }));
      }, 13500);
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
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Calculate scroll progress for hero section (0 to 1)
      const heroHeight = window.innerHeight;
      const progress = Math.min(currentScroll / heroHeight, 1);
      setScrollProgress(progress);

      // Show navbar after scrolling past hero section
      setShowNavbar(currentScroll > window.innerHeight * 0.8);

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
      checkSectionVisibility(galleryRef, "gallery");
      checkSectionVisibility(apartmentsRef, "apartments");
      checkSectionVisibility(trustRef, "trust");
      checkSectionVisibility(locationRef, "location");
      checkSectionVisibility(faqRef, "faq");
      checkSectionVisibility(leadFormRef, "leadForm");
      checkSectionVisibility(footerRef, "footer");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const wynnEffectRef = useRef<HTMLDivElement>(null);
  const investmentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const apartmentsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
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
        gallery: "Galería",
        apartments: "Apartamentos",
        location: "Ubicación",
        faq: "FAQ",
        dossier: "Dossier",
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
      gallery: {
        title: "El Proyecto",
        subtitle: "Diseño arquitectónico excepcional en Al Marjan Island",
        description: "Explore la elegancia y sofisticación de Playa Viva a través de renders de alta resolución y fotografías del entorno.",
      },
      apartments: {
        title: "Colección de Apartamentos",
        subtitle: "Espacios diseñados para cada etapa de inversión",
        description:
          "Desde estudios boutique hasta áticos de tres dormitorios, cada tipología ofrece vistas al mar, entrega llave en mano y acceso al plan de pago del 1% mensual.",
        note: "Los precios son estimaciones orientativas basadas en el tipo de cambio vigente y pueden variar sin previo aviso.",
        tabs: {
          studio: {
            label: "Estudio",
            headline: "Estudios boutique frente al mar",
            description: "Distribución abierta con cocina integrada, ventanales de piso a techo y balcón privado hacia el Golfo.",
            highlights: [
              "Entrega totalmente amueblada con domótica y electrodomésticos premium",
              "Baño hotelero con acabados de piedra natural",
              "Ideal para renta corporativa o pied-à-terre en Ras Al Khaimah",
            ],
            parking: "Opción de aparcacoches gratuito para residentes",
          },
          oneBed: {
            label: "1 Habitación",
            headline: "Suite residencial con sala independiente",
            description: "Salón comedor con cocina lineal, dormitorio en suite y balcón profundo para disfrutar del skyline.",
            highlights: [
              "Vestidor cerrado y baño principal con doble lavabo",
              "Zona de lavandería y almacenamiento oculto",
              "Elegible para paquete de gestión de rentas llave en mano",
            ],
            parking: "1 plaza de parking (aprox. 11.750€)",
          },
          twoBed: {
            label: "2 Habitaciones",
            headline: "Plantas angulares con vistas duales",
            description: "Dos dormitorios en suite, cocina con isla y sala envolvente que accede a dos balcones panorámicos.",
            highlights: [
              "Dormitorio principal tipo master con lounge privado",
              "Baño secundario con ventilación natural y tocador doble",
              "Espacio flexible para despacho o family room",
            ],
            parking: "1 plaza de parking incluida",
          },
          threeBed: {
            label: "3 Habitaciones",
            headline: "Residencias familiares con terraza envolvente",
            description: "Amplia zona social, cocina cerrada y tres suites con acceso directo a una terraza de más de 25 m².",
            highlights: [
              "Habitación principal con baño spa y walk-in closet de 6 metros",
              "Cuarto de servicio con baño independiente",
              "Vistas de 180° hacia el mar y el skyline de Wynn Resort",
            ],
            parking: "2 plazas de parking incluidas",
          },
        },
      },      trust: {
        title: "Respaldado por Líderes Inmobiliarios",
        subtitle: "Uniestate y partners de confianza",
        description:
          "Comercializado por Uniestate.co.uk con sede en Londres y Dubai, y respaldado por las principales firmas del sector inmobiliario de lujo.",
        partners: "Cobertura en medios especializados",
        readMore: "Leer en el medio",
        articles: [
          {
            image: "/assets/imagenes/news1.png",
            alt: "Gulf News - Wynn Resort",
            source: "Gulf News",
            title: "Wynn Resort impulsa USD 5.1B en Ras Al Khaimah",
            summary:
              "El emirato aprueba el primer resort con casino de la región, detonando demanda residencial y hotelera en Al Marjan Island.",
            url: "https://gulfnews.com/business/property/wynn-resort-ras-al-khaimah-gets-green-light-1.96136123",
          },
          {
            image: "/assets/imagenes/news2.png",
            alt: "Arabian Business - Tourism",
            source: "Arabian Business",
            title: "RAK recibe 1.2M de visitantes de alto gasto",
            summary:
              "El turismo premium del emirato crece 24% interanual apoyado por el efecto Wynn y nuevos desarrollos residenciales.",
            url: "https://www.arabianbusiness.com/industries/travel-hospitality/ras-al-khaimah-tourism-records-1-2-million-visitors",
          },
          {
            image: "/assets/imagenes/news3.png",
            alt: "Fitch Ratings - RAK",
            source: "Fitch Ratings",
            title: "Fitch reafirma a Ras Al Khaimah en AA-",
            summary:
              "La calificación soberana subraya la solidez fiscal del emirato y refuerza la seguridad jurídica para los proyectos inmobiliarios.",
            url: "https://www.fitchratings.com/research/sovereigns/fitch-affirms-ras-al-khaimah-at-aa-outlook-stable-06-07-2023",
          },
        ],
      },
      specifications: {
        title: "Especificaciones",
        subtitle: "Unidades diseñadas para el inversor sofisticado",
        description: "Desde estudios compactos hasta amplios apartamentos de 3 dormitorios, todas las unidades incluyen acabados premium, domótica y entrega totalmente amueblada.",
        units: [
          {
            type: "Studio",
            size: "37-45 m²",
            price: "Desde €170,000",
            features: ["Smart Home", "Totalmente amueblado", "Balcón privado", "Cocina equipada"],
          },
          {
            type: "1 Dormitorio",
            size: "65-75 m²",
            price: "Desde €240,000",
            features: ["Smart Home", "Totalmente amueblado", "Balcón amplio", "Dormitorio principal en-suite"],
          },
          {
            type: "2 Dormitorios",
            size: "95-110 m²",
            price: "Desde €350,000",
            features: ["Smart Home", "Totalmente amueblado", "2 Balcones", "Dormitorios en-suite"],
          },
          {
            type: "3 Dormitorios",
            size: "135-160 m²",
            price: "Desde €480,000",
            features: ["Smart Home", "Totalmente amueblado", "Terraza amplia", "3 Baños completos"],
          },
        ],
      },
      paymentPlan: {
        title: "Plan de Pago Flexible",
        subtitle: "Solo 1% mensual durante 5 años",
        description: "Un esquema de financiamiento diseñado para inversores internacionales, permitiéndole posicionarse en Al Marjan Island con pagos mensuales mínimos.",
        timeline: [
          { stage: "Reserva", amount: "€5,000", description: "Reserva tu unidad" },
          { stage: "Contrato", amount: "15%", description: "Al firmar contrato" },
          { stage: "Durante construcción", amount: "1% mensual", description: "60 meses (5 años)" },
          { stage: "Entrega Q2 2026", amount: "Saldo", description: "Balance al entregar llaves" },
        ],
        note: "* Plan sujeto a aprobación. Consulte con nuestro equipo para opciones personalizadas.",
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
        badge: "Dossier de Inversión Exclusivo",
        intro: "Análisis financiero completo y proyecciones del Efecto Wynn",
        description:
          "Acceda al análisis más completo de la inversión, con proyecciones de rentabilidad, planos arquitectónicos, especificaciones de alto nivel y el impacto financiero del emblemático Wynn Resort en Al Marjan Island. Forme parte de una comunidad exclusiva que anticipa las oportunidades antes que el resto del mercado.",
        features: [
          "Escenarios de rentabilidad y salida 2026-2032",
          "Simulación de cashflow con el plan 1% mensual",
          "Plano maestro, tipologías y memorias de calidades",
          "Calendario de hitos, licencias y soporte postventa",
        ],
        form: {
          firstNamePlaceholder: "Nombre",
          lastNamePlaceholder: "Apellidos",
          emailPlaceholder: "Email",
          ctaButton: "Descargar Dossier Exclusivo",
          sending: "Personalizando dossier...",
          privacy: "Usamos tus datos solo para enviar el dossier personalizado y activar la automatización descrita.",
          successMessage: "Gracias, {{name}}. Tu dossier personalizado se está enviando a tu bandeja.",
          errorMessage: "No pudimos completar el envío. Inténtalo de nuevo o contáctanos.",
        },
      },
      location: {
        title: "Al Marjan Island",
        subtitle: "El futuro de la vida de lujo en los EAU",
        description:
          "Situada en las costas de Ras Al Khaimah, Al Marjan Island es una nueva joya arquitectónica que redefine el concepto de vida de lujo. Con más de 7 kilómetros de playas vírgenes, esta isla artificial combina belleza natural con sofisticación moderna.",
      },
      faq: {
        eyebrow: "Preguntas estratégicas",
        title: "Preguntas Frecuentes",
        subtitle:
          "Respuestas detalladas basadas en conversaciones con inversores internacionales.",
        highlights: [
          "Información validada junto a marketing, legal y ventas",
          "Datos actualizados trimestralmente según el avance comercial",
          "Disponible en español e inglés bajo solicitud",
        ],
        cta: "Hablar con un especialista",
        questions: [
          {
            question: "¿Qué es Playa Viva?",
            answer:
              "Playa Viva es un desarrollo residencial de lujo en Al Marjan Island (Ras Al Khaimah, EAU) compuesto por tres torres con estudios y apartamentos amueblados de 1, 2 y 3 dormitorios orientados a la vida costera moderna.",
          },
          {
            question: "¿Qué tipologías de apartamentos hay disponibles?",
            answer:
              "Hay estudios y apartamentos de 1, 2 y 3 dormitorios que van de 30 a 170 m² (300-1.800 sq ft) con precios desde £150.000. Todas las residencias ofrecen planos abiertos, vistas panorámicas al mar, balcones privados y sistemas de smart home.",
          },
          {
            question: "¿Qué amenidades ofrece Playa Viva?",
            answer:
              "Gimnasio de última generación, spa de lujo, piscinas interiores y exteriores, cine rooftop, áreas infantiles, playa privada, circuitos de jogging y ciclismo, canchas de tenis, retail en planta baja y concierge/seguridad 24/7.",
          },
          {
            question: "¿Cuándo se entregará Playa Viva?",
            answer:
              "La finalización y entrega están previstas para el Q3 2026. Todas las unidades se entregarán totalmente amuebladas para ocupación inmediata o renta.",
          },
          {
            question: "¿Es una buena oportunidad de inversión?",
            answer:
              "Sí. La proximidad al futuro Wynn Resort de $5.1B, las amenidades resort y el crecimiento acelerado de Al Marjan Island respaldan rentabilidades del 7-8% y una elevada apreciación de capital.",
          },
          {
            question: "¿Quién es el desarrollador?",
            answer:
              "Uniestate Properties, firma fundada en 1995 con 30 años de experiencia, más de 3.000 unidades entregadas y 3,5 millones de pies cuadrados desarrollados entre EAU y Reino Unido.",
          },
          {
            question: "¿Cómo funciona el plan de pagos?",
            answer:
              "20% de entrada, 20% durante la construcción, 1% al entregar llaves y el 59% restante con pagos del 1% mensual durante cinco años. Uniestate ofrece financiación interna de aprobación ágil.",
          },
          {
            question: "¿Dónde está ubicado?",
            answer:
              "En Al Marjan Island, Ras Al Khaimah, a 12 minutos del centro de RAK, 25 minutos de RAK Mall y 34 minutos del Aeropuerto Internacional de RAK, con acceso directo a la autopista hacia Dubái.",
          },
          {
            question: "¿Cuáles son las cuotas de servicio?",
            answer: "Las cuotas de servicio se estiman en 18 AED por pie cuadrado.",
          },
        ],
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
        gallery: "Gallery",
        apartments: "Apartments",
        location: "Location",
        faq: "FAQ",
        dossier: "Dossier",
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
      gallery: {
        title: "The Project",
        subtitle: "Exceptional architectural design in Al Marjan Island",
        description: "Explore the elegance and sophistication of Playa Viva through high-resolution renders and environmental photography.",
      },
      apartments: {
        title: "Apartment Collection",
        subtitle: "Layouts tailored to every investment thesis",
        description:
          "From boutique studios to three-bedroom residences, each typology delivers sea views, turnkey interiors, and access to the 1% monthly payment plan.",
        note: "Prices are indicative estimates based on prevailing FX and may adjust at the time of reservation.",
        tabs: {
          studio: {
            label: "Studio",
            headline: "Boutique studios facing the sea",
            description: "Open-plan living with integrated kitchen, floor-to-ceiling glazing, and a private balcony overlooking the Gulf.",
            highlights: [
              "Fully furnished delivery with smart-home package and premium appliances",
              "Hotel-inspired bathroom wrapped in natural stone",
              "Perfect for corporate leasing or a pied-à-terre in Ras Al Khaimah",
            ],
            parking: "Complimentary valet option for residents",
          },
          oneBed: {
            label: "1 Bedroom",
            headline: "One-bedroom suite with defined living zones",
            description: "Separate living/dining area, en-suite bedroom, and a deep balcony to capture the skyline.",
            highlights: [
              "Walk-in wardrobe plus primary bathroom with double vanity",
              "Dedicated laundry and concealed storage",
              "Eligible for turnkey rental management",
            ],
            parking: "1 parking space (approx. £10,380)",
          },
          twoBed: {
            label: "2 Bedrooms",
            headline: "Corner layouts with dual-aspect views",
            description: "Two en-suite bedrooms, island kitchen, and wraparound living room opening onto twin panoramic balconies.",
            highlights: [
              "Primary suite with private lounge corner",
              "Secondary bath with natural ventilation and twin vanity",
              "Flexible den for office or family room use",
            ],
            parking: "1 parking space included",
          },
          threeBed: {
            label: "3 Bedrooms",
            headline: "Family residences with sweeping terrace",
            description: "Expansive great room, closed kitchen, and three suites that spill onto a 25 m² terrace.",
            highlights: [
              "Owner's suite with spa bathroom and 6-metre walk-in wardrobe",
              "Maid's room with dedicated bathroom",
              "180° views across the sea and Wynn Resort skyline",
            ],
            parking: "2 parking spaces included",
          },
        },
      },
      trust: {
        title: "Backed by Real Estate Leaders",
        subtitle: "Uniestate and trusted partners",
        description:
          "Marketed by Uniestate.co.uk based in London and Dubai, and supported by leading luxury real estate firms.",
        partners: "Featured in regional media",
        readMore: "Read full article",
        articles: [
          {
            image: "/assets/imagenes/news1.png",
            alt: "Gulf News - Wynn Resort",
            source: "Gulf News",
            title: "Wynn Resort drives a $5.1B push in Ras Al Khaimah",
            summary:
              "Authorities approve the UAE's first integrated resort with gaming on Al Marjan Island, unlocking premium residential demand.",
            url: "https://gulfnews.com/business/property/wynn-resort-ras-al-khaimah-gets-green-light-1.96136123",
          },
          {
            image: "/assets/imagenes/news2.png",
            alt: "Arabian Business - Tourism",
            source: "Arabian Business",
            title: "RAK welcomes 1.2M high-spending visitors",
            summary:
              "Tourism arrivals jumped 24% year-on-year as the Wynn Effect and new luxe developments put the emirate on global radars.",
            url: "https://www.arabianbusiness.com/industries/travel-hospitality/ras-al-khaimah-tourism-records-1-2-million-visitors",
          },
          {
            image: "/assets/imagenes/news3.png",
            alt: "Fitch Ratings - RAK",
            source: "Fitch Ratings",
            title: "Fitch reaffirms Ras Al Khaimah at AA- Stable",
            summary:
              "The sovereign rating highlights robust public finances and underpins investor confidence in long-term real estate projects.",
            url: "https://www.fitchratings.com/research/sovereigns/fitch-affirms-ras-al-khaimah-at-aa-outlook-stable-06-07-2023",
          },
        ],
      },
      specifications: {
        title: "Specifications",
        subtitle: "Units designed for the sophisticated investor",
        description: "From compact studios to spacious 3-bedroom apartments, all units include premium finishes, home automation and fully furnished delivery.",
        units: [
          {
            type: "Studio",
            size: "37-45 m²",
            price: "From £150,000",
            features: ["Smart Home", "Fully furnished", "Private balcony", "Equipped kitchen"],
          },
          {
            type: "1 Bedroom",
            size: "65-75 m²",
            price: "From £210,000",
            features: ["Smart Home", "Fully furnished", "Spacious balcony", "Master bedroom en-suite"],
          },
          {
            type: "2 Bedrooms",
            size: "95-110 m²",
            price: "From £310,000",
            features: ["Smart Home", "Fully furnished", "2 Balconies", "En-suite bedrooms"],
          },
          {
            type: "3 Bedrooms",
            size: "135-160 m²",
            price: "From £420,000",
            features: ["Smart Home", "Fully furnished", "Large terrace", "3 Full bathrooms"],
          },
        ],
      },
      paymentPlan: {
        title: "Flexible Payment Plan",
        subtitle: "Only 1% monthly for 5 years",
        description: "A financing scheme designed for international investors, allowing you to position yourself in Al Marjan Island with minimum monthly payments.",
        timeline: [
          { stage: "Booking", amount: "£5,000", description: "Reserve your unit" },
          { stage: "Contract", amount: "15%", description: "Upon signing contract" },
          { stage: "During construction", amount: "1% monthly", description: "60 months (5 years)" },
          { stage: "Handover Q2 2026", amount: "Balance", description: "Balance upon key handover" },
        ],
        note: "* Plan subject to approval. Consult with our team for custom options.",
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
        badge: "Exclusive Investment Dossier",
        intro: "Comprehensive financial analysis and Wynn Effect projections",
        description:
          "Access the most complete investment analysis with profitability projections, architectural plans, specification sheets, and the financial impact of the emblematic Wynn Resort on Al Marjan Island. Join an exclusive community that anticipates opportunities ahead of the market.",
        features: [
          "2026-2032 return scenarios and exit strategies",
          "Cash-flow simulation with the 1% monthly plan",
          "Masterplan, unit typologies, and delivered specs",
          "Milestone calendar, permits, and after-sales support",
        ],
        form: {
          firstNamePlaceholder: "First name",
          lastNamePlaceholder: "Last name",
          emailPlaceholder: "Email",
          ctaButton: "Download Exclusive Dossier",
          sending: "Preparing your dossier...",
          privacy: "We only use your details to personalize the dossier and trigger the described automation.",
          successMessage: "Thank you, {{name}}. Your personalized dossier is on its way to your inbox.",
          errorMessage: "We couldn't finalize the send. Please try again or contact our team.",
        },
      },
      location: {
        title: "Al Marjan Island",
        subtitle: "The future of luxury living in the UAE",
        description:
          "Located on the coast of Ras Al Khaimah, Al Marjan Island is a new architectural jewel that redefines the concept of luxury living. With over 7 kilometers of pristine beaches, this artificial island combines natural beauty with modern sophistication.",
      },
      faq: {
        eyebrow: "Strategic Questions",
        title: "Frequently Asked Questions",
        subtitle:
          "Detailed answers based on conversations with international investors",
        highlights: [
          "Information validated alongside marketing, legal, and sales",
          "Data updated quarterly according to commercial progress",
          "Available in Spanish and English upon request",
        ],
        cta: "Speak with a specialist",
        questions: [
          {
            question: "What is Playa Viva?",
            answer:
              "Playa Viva is a luxury residential development on Al Marjan Island, Ras Al Khaimah. Three elegant towers offer fully furnished studios plus 1, 2, and 3-bedroom apartments tailored to contemporary beachfront living.",
          },
          {
            question: "What types of apartments are available?",
            answer:
              "Studios plus 1, 2, and 3-bedroom apartments ranging from 300 to 1,800 sq. ft. with starting prices from £150,000. Every residence features open layouts, panoramic sea views, private balconies, and integrated smart-home systems.",
          },
          {
            question: "What amenities does Playa Viva offer?",
            answer:
              "A state-of-the-art fitness center, luxury spa, indoor and outdoor pools, rooftop cinema, children's play areas, private beach access, jogging and cycling tracks, tennis courts, ground-floor retail, and 24/7 concierge and security.",
          },
          {
            question: "When will Playa Viva be completed?",
            answer:
              "Completion and handover are scheduled for Q3 2026. All apartments will be delivered fully furnished and ready for immediate occupancy or rental.",
          },
          {
            question: "Is Playa Viva a good investment opportunity?",
            answer:
              "Yes. Its prime location beside the upcoming $5.1B Wynn Resort & Casino, resort-grade amenities, and the rapid growth of Al Marjan Island support 7-8% rental yields and compelling capital appreciation.",
          },
          {
            question: "Who is the developer of Playa Viva?",
            answer:
              "Uniestate Properties develops Playa Viva. Established in 1995, the developer has 30 years of experience, more than 3,000 delivered units across 3.5 million sq. ft., and over 50,000 satisfied clients.",
          },
          {
            question: "What are the payment terms?",
            answer:
              "A flexible structure with 20% down payment, 20% during construction, 1% at handover, and the remaining 59% through convenient 1% monthly payments over five years via Uniestate's in-house financing.",
          },
          {
            question: "Where is Playa Viva located?",
            answer:
              "On Al Marjan Island in Ras Al Khaimah, 12 minutes from RAK Central, 25 minutes from RAK Mall, and 34 minutes from RAK International Airport, with direct highway access to Dubai.",
          },
          {
            question: "What are the service fees at Playa Viva?",
            answer: "Service fees are charged at AED 18 per square foot.",
          },
        ],
      },
    },
  };

  const t = content[language];
  const priceString = language === "es" ? "192.000€" : "£172,000";
  const pricePrefix = language === "es" ? "Desde" : "Starting from";
  const mobileMenuLabels =
    language === "es"
      ? { open: "Abrir menú de navegación", close: "Cerrar menú de navegación" }
      : { open: "Open navigation menu", close: "Close navigation menu" };

  const apartmentConfigs = {
    studio: {
      image: "/assets/imagenes/studio.webp",
      sizeSqftRange: [300, 462],
      bedrooms: 0,
      bathrooms: 1,
    },
    oneBed: {
      image: "/assets/imagenes/1-bedroom.webp",
      sizeSqftRange: [600, 850],
      bedrooms: 1,
      bathrooms: 1,
    },
    twoBed: {
      image: "/assets/imagenes/2-bedroom.webp",
      sizeSqftRange: [1100, 1200],
      bedrooms: 2,
      bathrooms: 1,
    },
    threeBed: {
      image: "/assets/imagenes/3-bedroom.png",
      sizeSqftRange: [1700, 1800],
      bedrooms: 3,
      bathrooms: 2,
    },
  } as const;

  const apartmentPrices = {
    studio: { en: "£172,000", es: "192.000€" },
    oneBed: { en: "£325,000", es: "370.000€" },
    twoBed: { en: "£526,000", es: "598.000€" },
    threeBed: { en: "£795,000", es: "905.000€" },
  } as const;

  const formatSizeRange = (range: [number, number]) => {
    if (language === "es") {
      const sqm = range.map((value) => Math.round(value / 10.7639));
      return `${sqm[0]}-${sqm[1]} m²`;
    }
    return `${range[0]}-${range[1]} sq ft`;
  };

  const formatBedroomValue = (count: number) => {
    if (count === 0) {
      return language === "es" ? "Estudio" : "Studio";
    }
    const plural = count > 1;
    return language === "es"
      ? `${count} ${plural ? "habitaciones" : "habitación"}`
      : `${count} ${plural ? "bedrooms" : "bedroom"}`;
  };

  const formatBathroomValue = (count: number) => {
    const valueString =
      language === "es"
        ? count.toString().replace(".", ",")
        : count.toString();
    const plural = count > 1;
    return language === "es"
      ? `${valueString} ${plural ? "baños" : "baño"}`
      : `${valueString} ${plural ? "baths" : "bath"}`;
  };

  const infoLabels = {
    size: language === "es" ? "Superficie" : "Interior size",
    price: language === "es" ? "Desde" : "From",
    bedrooms: language === "es" ? "Dormitorios" : "Bedrooms",
    bathrooms: language === "es" ? "Baños" : "Bathrooms",
    parking: "Parking",
  };

  const statCardBaseClasses =
    "rounded-2xl border border-gold-warm/30 p-4 shadow-sm bg-gradient-to-br from-[#fdf9f3] via-[#f7ede1] to-[#f1e2d3] text-brown-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:brightness-95";

  const apartmentCopy = t.apartments.tabs[activeApartment];
  const activeApartmentConfig = apartmentConfigs[activeApartment];
  const activeApartmentPrice = apartmentPrices[activeApartment][language];
  const highlightItems = [...apartmentCopy.highlights, t.apartments.note];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: "Playa Viva Residences",
    description:
      language === "es"
        ? "Residencias frente al mar en Al Marjan Island con entrega llave en mano y plan 1% mensual."
        : "Seafront residences in Al Marjan Island with turnkey delivery and a 1% monthly plan.",
    url: SITE_URL,
    image: `${SITE_URL}/assets/imagenes/hero-image.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Marjan Island",
      addressLocality: "Ras Al Khaimah",
      addressCountry: "AE",
    },
    offers: [
      {
        "@type": "AggregateOffer",
        priceCurrency: "GBP",
        lowPrice: "172000",
        highPrice: "795000",
        offerCount: 4,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "192000",
        highPrice: "905000",
        offerCount: 4,
        availability: "https://schema.org/InStock",
      },
    ],
    seller: {
      "@type": "Organization",
      name: "Uniestate",
      url: "https://www.uniestate.co.uk",
    },
  };
  const featureColumns = [
    t.leadForm.features.slice(0, 2),
    t.leadForm.features.slice(2),
  ];
  const nameLabel = language === "es" ? "Nombre completo" : "Full name";
  const emailLabel = "Email";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowMenu(false);
    }
  };

  const orchestrateLeadAutomation = async (payload: LeadAutomationPayload) => {
    const simulateCall = (label: string, delay = 650) =>
      new Promise<void>((resolve) => {
        console.log(`[Automation] ${label}`, payload);
        setTimeout(resolve, delay);
      });

    await Promise.all([
      simulateCall("HubSpot API Dispatch", 700),
      simulateCall("Python Dossier Personalization", 900),
      simulateCall("Internal Metrics Storage", 550),
    ]);

    await simulateCall("Email confirmation & gratitude message", 600);
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {
      utm_source: urlParams.get("utm_source") || "",
      utm_medium: urlParams.get("utm_medium") || "",
      utm_campaign: urlParams.get("utm_campaign") || "",
      utm_term: urlParams.get("utm_term") || "",
      utm_content: urlParams.get("utm_content") || "",
    };

    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const fallbackName = language === "es" ? "inversor" : "investor";

    const dossierFileNameBase = `Playa-Viva-Dossier-${trimmedFirstName || "Investor"}-${
      trimmedLastName || "Lead"
    }`
      .trim()
      .replace(/\s+/g, "-");

    const leadData: LeadAutomationPayload = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      email: formData.email.trim(),
      language,
      page: "Playa Viva Landing",
      timestamp: new Date().toISOString(),
      dossierFileName: `${dossierFileNameBase}.pdf`,
      utm: utmData,
      workflow: "hubspot+python-dossier+internal-db",
    };

    setIsSubmitting(true);
    setAutomationFeedback(null);

    try {
      await orchestrateLeadAutomation(leadData);
      setAutomationFeedback({
        type: "success",
        userName: trimmedFirstName || fallbackName,
      });
      setFormData({ firstName: "", lastName: "", email: "" });

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setAutomationFeedback(null);
      }, 5000);
    } catch (error) {
      console.error("Lead automation failed", error);
      setAutomationFeedback({
        type: "error",
        userName: "",
      });

      // Ocultar mensaje de error después de 5 segundos
      setTimeout(() => {
        setAutomationFeedback(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Language Toggle - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <Button
          size="sm"
          onClick={() => scrollToSection("hero")}
          aria-label={language === "es" ? "Volver al hero" : "Back to hero section"}
          className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-4 py-2 text-xs rounded-md shadow-[0_8px_18px_rgba(0,0,0,0.25)] transition-all duration-200 flex items-center gap-2 border border-brown-dark/20"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span className="tracking-wide">
            {language === "es" ? "Subir al Hero" : "Back to Hero"}
          </span>
        </Button>
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
      <nav className={`landing-nav fixed top-0 left-0 right-0 z-50 bg-cream-light/98 backdrop-blur-md border-b border-brown-dark/10 shadow-sm transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="landing-nav__inner container mx-auto px-4 md:px-6">
          <div className="landing-nav__bar flex items-center justify-between h-14 md:h-16">
            {/* Logo Uniestate */}
            <div className="flex-shrink-0">
              <span className="text-brown-dark text-base md:text-lg font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
                UNIESTATE
              </span>
            </div>

            {/* Desktop Menu - Centered (shows on tablet landscape and up) */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              <button
                onClick={() => scrollToSection("wynn-effect")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.wynnEffect}
              </button>
              <button
                onClick={() => scrollToSection("investment")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.investment}
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.features}
              </button>
              <button
                onClick={() => scrollToSection("gallery")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.gallery}
              </button>
              <button
                onClick={() => scrollToSection("apartments")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.apartments}
              </button>
              <button
                onClick={() => scrollToSection("location")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.location}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.faq}
              </button>
              <button
                onClick={() => scrollToSection("dossier")}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.dossier}
              </button>
            </div>

            {/* Book Now Button - Desktop */}
            <div className="hidden md:block flex-shrink-0">
              <Button
                onClick={() => scrollToSection("dossier")}
                className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === "es" ? "Dossier Exclusivo" : "Exclusive Dossier"}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-brown-dark hover:text-gold-warm p-2"
              aria-label={showMenu ? mobileMenuLabels.close : mobileMenuLabels.open}
              aria-expanded={showMenu}
              aria-controls="mobile-nav-menu"
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
            <div
              id="mobile-nav-menu"
              className="md:hidden py-4 border-t border-brown-dark/10 bg-cream-light"
            >
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("wynn-effect")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.wynnEffect}
                </button>
                <button
                  onClick={() => scrollToSection("investment")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.investment}
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.features}
                </button>
                <button
                  onClick={() => scrollToSection("gallery")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.gallery}
                </button>
                <button
                  onClick={() => scrollToSection("apartments")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.apartments}
                </button>
                <button
                  onClick={() => scrollToSection("location")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.location}
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.faq}
                </button>
                <button
                  onClick={() => scrollToSection("dossier")}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.dossier}
                </button>
                <Button
                  onClick={() => scrollToSection("dossier")}
                  size="sm"
                  className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-4 py-1.5 text-xs rounded-md shadow-md w-full mt-2 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {language === "es" ? "Dossier Exclusivo" : "Exclusive Dossier"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section relative min-h-svh overflow-hidden pt-14 md:pt-0">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 transition-all ease-out"
          style={{
            opacity: animationStates.backgroundImage ? 1 : 0,
            transform: animationStates.backgroundImage
              ? "scale(1)"
              : "scale(1.05)",
            filter: animationStates.logo
              ? `brightness(${0.55 + (scrollProgress * 0.45)}) saturate(${0.4 + (scrollProgress * 0.6)}) blur(${3 - (scrollProgress * 3)}px)`
              : "brightness(1) saturate(1) blur(0px)",
            transitionDuration: animationStates.logo ? "2000ms" : "700ms",
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
        </div>

        {/* Content */}
        <div
          className="hero-content relative z-10 h-full flex flex-col items-center justify-center px-4"
          style={{
            opacity: 1 - scrollProgress,
            transition: "opacity 0.1s linear",
          }}
        >
          <div
            ref={heroStackRef}
            className="hero-container container max-w-6xl mx-auto"
            style={{
              transform: heroScale < 1 ? `scale(${heroScale})` : undefined,
              transformOrigin: "top center",
            }}
          >
            <div className="hero-stack flex flex-col items-center justify-center text-center space-y-2 mt-0">
              {/* Logo */}
              <div
                className="transition-all ease-out mt-12"
                style={{
                  opacity: animationStates.logo ? 1 : 0,
                  transform: animationStates.logo ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.logo ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2500ms",
                }}
              >
                <div className="flex justify-center">
                  <img
                    src="/logo-playa-viva.png"
                    alt="Playa Viva Logo"
                    className="w-auto h-36 sm:h-48 md:h-56 lg:h-64 xl:h-72 drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] filter brightness-110 contrast-110"
                  />
                </div>
              </div>

              {/* Subtitle pill: stronger background for readability + gold halo */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.subtitle ? 1 : 0,
                  transform: animationStates.subtitle ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.subtitle ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="hero-subtitle inline-block bg-black/65 sm:bg-black/55 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-gold-warm/60 ring-2 ring-gold-warm/75 shadow-[0_0_40px_rgba(162,144,96,0.7)]">
                  <p className="font-arabic text-gold-warm text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-[0.02em] sm:tracking-[0.04em] md:tracking-[0.06em] uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.65)] whitespace-nowrap">
                    {t.hero.subtitle}
                  </p>
                </div>
              </div>

              {/* Description - Sophisticated styling and legibility */}
              <div
                className="transition-all ease-out max-w-5xl"
                style={{
                  opacity: animationStates.description ? 1 : 0,
                  transform: animationStates.description ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.description ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="hero-description relative mx-auto px-2">
                  <p className="relative text-[#FFFFFF] text-sm sm:text-base md:text-lg font-medium px-3 sm:px-6 py-2 sm:py-3 tracking-[0.01em] text-center whitespace-nowrap [@media(max-width:768px)]:whitespace-normal">
                    {t.hero.description}
                  </p>
                </div>
              </div>

              {/* Price Card: solid background enforced + stronger gold halo on hover */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.priceBox ? 1 : 0,
                  transform: animationStates.priceBox ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.priceBox ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="relative">
                  <div
                    className="hero-price-card rounded-2xl p-3 sm:p-4 shadow-2xl max-w-[90vw] sm:max-w-160 mx-auto transition-all duration-200 border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 hover:-translate-y-[3px] hover:ring-gold-warm/85 hover:shadow-[0_24px_52px_rgba(0,0,0,0.6),0_0_56px_rgba(162,144,96,0.7)]"
                    style={{ backgroundColor: "#6E5F46" }} // sólido y opaco garantizado
                  >
                    <div className="space-y-1.5 sm:space-y-2 text-center">
                      <div className="hero-price-value text-gold-warm text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap [text-shadow:1px_1px_3px_rgba(0,0,0,0.9)]">
                        {pricePrefix}
                        {"\u00A0"}
                        {priceString}
                      </div>
                      <div className="hero-price-payment text-cream-light text-xs sm:text-sm md:text-base font-medium [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                        {t.hero.payment}
                      </div>
                      <div className="hero-price-handover text-cream-light text-xs sm:text-xs md:text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                        {t.hero.handover}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button: Single Dossier download button centered */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.ctaButtons ? 1 : 0,
                  transform: animationStates.ctaButtons ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.ctaButtons ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => scrollToSection("dossier")}
                    size="lg"
                    className="hero-cta bg-gold-warm text-brown-dark font-bold antialiased tracking-wide px-10 py-4 text-base sm:text-lg rounded-xl border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 shadow-2xl transition-all duration-200 hover:bg-gold-warm/80 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.55),0_0_48px_rgba(162,144,96,0.65)] hover:ring-gold-warm/85 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <Download className="h-5 w-5" />
                      <span>{language === "es" ? "Dossier Exclusivo" : "Exclusive Dossier"}</span>
                    </span>
                  </Button>

                  {/* Scroll Indicator (sm+) */}
                  <div
                    className="hero-scroll-indicator mt-2 hidden sm:flex justify-center pointer-events-none animate-bounce"
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
            <div className="inline-flex justify-center mb-4">
              <div className="relative px-10 py-3.5 rounded-full border-2 border-[#A29060] bg-gradient-to-br from-[#f5f1ea]/95 via-white/90 to-[#ede8df]/95 text-[#A29060] font-bold tracking-[0.35em] shadow-[0_8px_32px_rgba(162,144,96,0.3),0_0_0_1px_rgba(162,144,96,0.2)_inset,0_1px_2px_rgba(255,255,255,0.8)_inset] backdrop-blur-md overflow-hidden group transition-all duration-500 hover:shadow-[0_16px_48px_rgba(162,144,96,0.6),0_0_60px_rgba(162,144,96,0.3),0_0_0_2px_rgba(162,144,96,0.5)_inset,0_2px_4px_rgba(255,255,255,1)_inset] hover:scale-105 hover:border-[#d4b876] cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A29060]/60 to-transparent group-hover:via-[#d4b876] transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#A29060]/0 via-[#A29060]/0 to-[#A29060]/0 group-hover:from-[#A29060]/10 group-hover:via-white/20 group-hover:to-[#d4b876]/10 transition-all duration-500"></div>
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500"
                  style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #A29060 1px, transparent 0)", backgroundSize: "16px 16px" }}
                ></div>
                <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(162,144,96,0.4)] transition-all duration-500 uppercase tracking-[0.35em] text-xs md:text-sm">
                  {language === "es" ? "Oportunidad Histórica" : "Historic Opportunity"}
                </span>
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
                className="bg-white border-2 border-gold-warm/40 rounded-2xl p-8 text-center shadow-xl hover:border-gold-warm hover:shadow-2xl hover:shadow-gold-warm/30 transition-all duration-300 hover:-translate-y-2"
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
                <h4 className="text-brown-dark text-lg md:text-xl font-semibold mb-2">
                  {stat.label}
                </h4>
                <p className="text-taupe-warm text-sm">
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

      {/* Gallery */}
      <section
        id="gallery"
        ref={galleryRef}
        className="relative py-24 bg-white"
        style={{
          opacity: visibleSections.gallery ? 1 : 0,
          transform: visibleSections.gallery
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-6">
              {t.gallery.title}
            </h2>
            <h3 className="text-2xl text-gold-warm mb-6">
              {t.gallery.subtitle}
            </h3>
            <p className="text-taupe-warm text-base md:text-lg leading-relaxed">
              {t.gallery.description}
            </p>
          </div>

          {/* Gallery Tabs */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button
              onClick={() => setActiveGalleryTab("servicios")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "servicios"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Servicios e Instalaciones" : "Services & Facilities"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("interior")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "interior"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Interiores" : "Interiors"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("sitios")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "sitios"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Sitios de Interés" : "Points of Interest"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("video")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "video"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Video" : "Video"}
            </button>
          </div>

          {/* Servicios e Instalaciones */}
          {activeGalleryTab === "servicios" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300">
                <img
                  src="/assets/imagenes/Collage-servicios-instalaciones.png"
                  alt="Servicios e Instalaciones - Playa Viva"
                  className="w-full h-auto"
                  width={1210}
                  height={968}
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Interior */}
          {activeGalleryTab === "interior" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {[
                { src: "/assets/imagenes/studio.webp", span: "md:col-span-2 md:row-span-2" },
                { src: "/assets/imagenes/1-bedroom.webp", span: "" },
                { src: "/assets/imagenes/2-bedroom.webp", span: "" },
                { src: "/assets/imagenes/foto%20galeria%201.jpg", span: "" },
                { src: "/assets/imagenes/foto%20galeria%202.jpg", span: "" },
                { src: "/assets/imagenes/foto%20galeria%203.jpg", span: "" },
              ].map((image, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${image.span}`}
                >
                  <div className="aspect-square">
                    <img
                      src={image.src}
                      alt={`Interior ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}

          {/* Sitios de Interés */}
          {activeGalleryTab === "sitios" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300">
                <img
                  src="/assets/imagenes/Collage_sitios_interes.png"
                  alt="Sitios de interes cercanos a Playa Viva"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Video */}
          {activeGalleryTab === "video" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border-2 border-gold-warm/40 shadow-2xl bg-black aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/KbazzvTtRkY?rel=0&modestbranding=1"
                  title="Playa Viva Overview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Apartments */}
      <section
        id="apartments"
        ref={apartmentsRef}
        className="relative py-24 bg-gradient-to-br from-cream-light via-white to-cream-light"
        style={{
          opacity: visibleSections.apartments ? 1 : 0,
          transform: visibleSections.apartments ? "translateY(0px)" : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-light text-brown-dark mb-4">
                {t.apartments.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.apartments.subtitle}
              </h3>
              <p className="text-taupe-warm text-base md:text-lg max-w-3xl mx-auto">
                {t.apartments.description}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {(["studio", "oneBed", "twoBed", "threeBed"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveApartment(key)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                    activeApartment === key
                      ? "bg-gold-warm text-brown-dark shadow-lg"
                      : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
                  }`}
                >
                  {t.apartments.tabs[key].label}
                </button>
              ))}
            </div>

            <div className="space-y-10">
              <div
                className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
                style={{
                  opacity: visibleSections.apartments ? 1 : 0,
                  transform: visibleSections.apartments ? undefined : "translateY(30px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <img
                  src={activeApartmentConfig.image}
                  alt={apartmentCopy.headline}
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6">
                  <p className="text-sm text-white uppercase tracking-[0.3em]">
                    {apartmentCopy.label}
                  </p>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border border-brown-dark/10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-brown-dark/60">
                    {apartmentCopy.label}
                  </p>
                  <h3 className="text-2xl md:text-4xl font-light text-brown-dark">
                    {apartmentCopy.headline}
                  </h3>
                  <p className="text-brown-dark/80 text-base md:text-lg">
                    {apartmentCopy.description}
                  </p>
                  <div className="space-y-3 pt-4">
                    {highlightItems.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-gold-warm/20 rounded-full p-1 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-gold-warm" />
                        </div>
                        <p className="text-brown-dark/80 text-sm">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.size}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatSizeRange(activeApartmentConfig.sizeSqftRange)}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.price}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {activeApartmentPrice}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.bedrooms}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatBedroomValue(activeApartmentConfig.bedrooms)}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.bathrooms}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatBathroomValue(activeApartmentConfig.bathrooms)}
                    </p>
                  </div>
                  <div className={`${statCardBaseClasses} sm:col-span-2`}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.parking}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {apartmentCopy.parking}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section
        ref={trustRef}
        className="relative py-20 bg-cream-light"
        style={{
          opacity: visibleSections.trust ? 1 : 0,
          transform: visibleSections.trust
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-brown-dark mb-4">
                {t.trust.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.trust.subtitle}
              </h3>
              <p className="text-taupe-warm text-base md:text-lg max-w-3xl mx-auto">
                {t.trust.description}
              </p>
            </div>

            {/* Press Coverage */}
            <div className="mb-12">
              <p className="text-center text-sm text-taupe-warm mb-6 uppercase tracking-wider">
                {t.trust.partners}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-items-center">
                {t.trust.articles.map((article, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-1 w-full max-w-xs flex flex-col"
                    style={{
                      opacity: visibleSections.trust ? 1 : 0,
                      transform: visibleSections.trust
                        ? "translateY(0px)"
                        : "translateY(30px)",
                      transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                        index * 0.15
                      }s`,
                    }}
                  >
                    <img
                      src={article.image}
                      alt={article.alt}
                      className="w-full h-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300 rounded-xl"
                    />
                    <div className="mt-4 space-y-2 flex-1 flex flex-col">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-dark/60">
                        {article.source}
                      </p>
                      <h4 className="text-lg font-semibold text-brown-dark leading-snug">
                        {article.title}
                      </h4>
                      <p className="text-sm text-brown-dark/70 flex-1">
                        {article.summary}
                      </p>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gold-warm hover:underline"
                      >
                        {t.trust.readMore}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 17 17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.location.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.location.subtitle}
              </h3>
              <p className="text-taupe-warm text-base leading-relaxed max-w-4xl mx-auto">
                {t.location.description}
              </p>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setLocationView("collage")}
                className={`px-8 py-3.5 rounded-[20px] font-medium text-sm transition-all duration-300 shadow-md ${
                  locationView === "collage"
                    ? "bg-[#9d8c5f] text-[#3a2f1f] shadow-lg"
                    : "bg-[#e3ded4] text-[#5a4f3d] hover:bg-[#d8d3c9]"
                }`}
              >
                Al Marjan Island
              </button>
              <button
                onClick={() => setLocationView("map")}
                className={`px-8 py-3.5 rounded-[20px] font-medium text-sm transition-all duration-300 shadow-md ${
                  locationView === "map"
                    ? "bg-[#9d8c5f] text-[#3a2f1f] shadow-lg"
                    : "bg-[#e3ded4] text-[#5a4f3d] hover:bg-[#d8d3c9]"
                }`}
              >
                {language === "es" ? "Mapa del Área" : "Area Map"}
              </button>
            </div>

            {/* Vista condicional */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-warm/30">
              {locationView === "map" ? (
                <img
                  src="/assets/imagenes/areamap.webp"
                  alt="Al Marjan Island Area Map"
                  className="w-full h-auto"
                  width={1200}
                  height={704}
                  loading="lazy"
                />
              ) : (
                <img
                  src="/assets/imagenes/Collage_Al_Marjan_Island.png"
                  alt="Al Marjan Island Collage"
                  className="w-full h-auto"
                  width={1200}
                  height={900}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        ref={faqRef}
        className="relative py-12 md:py-16 bg-[#d4c5a8]"
        style={{
          opacity: visibleSections.faq ? 1 : 0,
          transform: visibleSections.faq ? "translateY(0px)" : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(162,144,96,0.3) 1px, transparent 0)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Títulos centrados */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-brown-dark mb-3 md:mb-4">
              {t.faq.title}
            </h2>
            <p className="text-base md:text-lg text-[#6d5d42] font-medium">
              {t.faq.subtitle}
            </p>
          </div>

          {/* Card con preguntas - centrado y más estrecho */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-[#f5f1ea]/95 via-white/90 to-[#ede8df]/95 border-2 border-[#A29060]/40 shadow-[0_16px_48px_rgba(162,144,96,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset] divide-y divide-[#A29060]/15 overflow-hidden">
              {t.faq.questions.map((qa, index) => (
                <div
                  key={qa.question}
                  className={`px-4 md:px-5 py-3 md:py-4 transition-all duration-300 cursor-default group/item relative ${
                    activeFaq === index
                      ? "bg-[#e8dcc8] shadow-[0_4px_16px_rgba(162,144,96,0.2)] scale-[1.02] z-10"
                      : "hover:bg-gradient-to-r hover:from-[#A29060]/5 hover:to-transparent"
                  }`}
                  onMouseEnter={() => setActiveFaq(index)}
                  onMouseLeave={() => setActiveFaq(null)}
                  onFocus={() => setActiveFaq(index)}
                  onBlur={() => setActiveFaq(null)}
                  tabIndex={0}
                >
                  <p
                    className={`text-xs md:text-sm font-semibold transition-colors duration-300 ${
                      activeFaq === index ? "text-[#271c13]" : "text-[#6E5F46]"
                    }`}
                  >
                    {qa.question}
                  </p>
                  <div
                    className={`text-[11px] md:text-xs text-[#4a3f30] leading-relaxed transition-all duration-300 ${
                      activeFaq === index
                        ? "max-h-40 opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0 pointer-events-none"
                    }`}
                  >
                    {qa.answer}
                  </div>
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
        className="relative py-20 bg-gradient-to-b from-brown-dark via-[#22170f] to-brown-dark overflow-hidden"
        style={{
          opacity: visibleSections.leadForm ? 1 : 0,
          transform: visibleSections.leadForm ? "translateY(0px)" : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 50%, transparent 60%, rgba(255,255,255,0.08) 100%)",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-3">
            <div className="inline-flex">
              <div className="relative px-10 py-3.5 rounded-full border-2 border-[#A29060] bg-gradient-to-br from-[#f5f1ea]/95 via-white/90 to-[#ede8df]/95 text-[#A29060] font-bold tracking-[0.35em] shadow-[0_8px_32px_rgba(162,144,96,0.3),0_0_0_1px_rgba(162,144,96,0.2)_inset,0_1px_2px_rgba(255,255,255,0.8)_inset] backdrop-blur-md overflow-hidden group transition-all duration-500 hover:shadow-[0_16px_48px_rgba(162,144,96,0.6),0_0_60px_rgba(162,144,96,0.3),0_0_0_2px_rgba(162,144,96,0.5)_inset,0_2px_4px_rgba(255,255,255,1)_inset] hover:scale-105 hover:border-[#d4b876] cursor-pointer">
                {/* Brillo dorado superior */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A29060]/60 to-transparent group-hover:via-[#d4b876] transition-all duration-500"></div>
                {/* Efecto de brillo animado intenso */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
                {/* Resplandor de fondo al hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#A29060]/0 via-[#A29060]/0 to-[#A29060]/0 group-hover:from-[#A29060]/10 group-hover:via-white/20 group-hover:to-[#d4b876]/10 transition-all duration-500"></div>
                {/* Textura sutil */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #A29060 1px, transparent 0)', backgroundSize: '16px 16px'}}></div>
                <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(162,144,96,0.4)] transition-all duration-500">
                  {language === "es" ? "Dossier de Inversión Exclusivo" : "Exclusive Investment Dossier"}
                </span>
              </div>
            </div>
            <p className="text-[#271c13] text-base md:text-lg leading-relaxed font-medium">
              {t.leadForm.intro}
            </p>
          </div>

          {/* Texto descriptivo debajo del subtítulo */}
          <div className="mt-5 max-w-3xl mx-auto">
            <p className="text-cream-light text-sm leading-relaxed text-center">
              {t.leadForm.description}
            </p>
          </div>

          {/* Checks en dos columnas FUERA del card */}
          <div className="mt-5 w-full max-w-2xl mx-auto grid md:[grid-template-columns:0.85fr_1.15fr] gap-3">
            {featureColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="space-y-2.5 text-left">
                {column.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="bg-gold-warm/25 rounded-full p-1.5 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold-warm" />
                    </div>
                    <p className="text-[#c9b896] text-sm leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Card del CTA con efectos premium */}
          <div className="mt-8 w-full flex justify-center">
            <div className="w-full max-w-[500px] rounded-3xl border-2 border-gold-warm/40 bg-gradient-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] shadow-[0_20px_60px_rgba(162,144,96,0.35),0_0_80px_rgba(162,144,96,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-sm px-6 md:px-8 py-6 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_28px_80px_rgba(162,144,96,0.6),0_0_120px_rgba(162,144,96,0.35),0_0_0_2px_rgba(162,144,96,0.5)_inset,0_2px_4px_rgba(255,255,255,1)_inset] hover:scale-[1.02] hover:border-[#d4b876]">
              {/* Brillo dorado superior */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#A29060]/60 to-transparent group-hover:via-[#d4b876] transition-all duration-500"></div>
              {/* Efecto de brillo animado intenso que cruza el card */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1200 ease-out"></div>
              {/* Efecto de brillo dorado animado en el borde superior */}
              <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity duration-500"
                   style={{
                     background: 'radial-gradient(circle at top right, rgba(162,144,96,0.25), transparent 60%)',
                   }}
              />
              {/* Efecto de brillo secundario inferior */}
              <div className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-500"
                   style={{
                     background: 'radial-gradient(circle at bottom left, rgba(184,166,115,0.2), transparent 50%)',
                   }}
              />
              {/* Resplandor de fondo al hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#A29060]/0 via-[#A29060]/0 to-[#A29060]/0 group-hover:from-[#A29060]/8 group-hover:via-white/15 group-hover:to-[#d4b876]/8 transition-all duration-500"></div>
              {/* Textura sutil de puntos */}
              <div className="absolute inset-0 rounded-3xl opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #A29060 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
              <form onSubmit={handleLeadSubmit} className="space-y-4 text-left relative z-10">
                <div className="grid md:[grid-template-columns:0.7fr_1.3fr] gap-3">
                  <div>
                    <label className="block text-brown-dark/80 font-medium mb-1.5 text-xs">
                      {t.leadForm.form.firstNamePlaceholder} <span className="text-brown-dark/80">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-dark/15 rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md"
                      placeholder={t.leadForm.form.firstNamePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-brown-dark/80 font-medium mb-1.5 text-xs">
                      {t.leadForm.form.lastNamePlaceholder} <span className="text-brown-dark/80">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-dark/15 rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md"
                      placeholder={t.leadForm.form.lastNamePlaceholder}
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-brown-dark/80 font-medium mb-1.5 text-xs">
                    {t.leadForm.form.emailPlaceholder} <span className="text-brown-dark/80">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-brown-dark/15 rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md"
                    placeholder={t.leadForm.form.emailPlaceholder}
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
                    className="bg-gradient-to-r from-[#8a7a4f] to-[#9a8a60] hover:from-[#9a8a60] hover:to-[#8a7a4f] text-[#1f1509] font-semibold py-2 px-6 rounded-xl shadow-[0_4px_16px_rgba(162,144,96,0.4)] hover:shadow-[0_6px_20px_rgba(162,144,96,0.5)] transition-all duration-300 text-sm disabled:cursor-not-allowed disabled:opacity-70 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    <span className="relative flex items-center justify-center">
                      <Download className={`mr-2 h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                      {isSubmitting ? t.leadForm.form.sending : t.leadForm.form.ctaButton}
                    </span>
                  </Button>
                </div>

                {automationFeedback && (
                  <div
                    className={`text-xs rounded-xl border px-3 py-2 text-left ${
                      automationFeedback.type === "success"
                        ? "border-brown-dark/20 text-[#5a4f3d] bg-[#ddd4c6]"
                        : "border-red-400 text-red-600 bg-red-50"
                    }`}
                  >
                    {automationFeedback.type === "success"
                      ? t.leadForm.form.successMessage.replace("{{name}}", automationFeedback.userName)
                      : t.leadForm.form.errorMessage}
                  </div>
                )}

                <p className="text-brown-dark/60 text-[11px] text-center leading-relaxed mt-2">
                  {t.leadForm.form.privacy}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>


      {/* Uniestate Section */}
      <section
        ref={footerRef}
        className="relative py-16 md:py-20 bg-[#f8f5f0]"
        style={{
          opacity: visibleSections.footer ? 1 : 0,
          transform: visibleSections.footer
            ? "translateY(0px)"
            : "translateY(30px)",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Logo Uniestate centrado */}
            <div className="flex flex-col items-center mb-4 md:mb-6 space-y-2">
              <img
                src="/assets/imagenes/uniestate.png"
                alt="Uniestate"
                className="h-40 md:h-52 lg:h-64 object-contain"
              />
            </div>

            <div className="text-center mb-4 md:mb-5">
              <h2 className="text-2xl md:text-3xl font-medium text-[#5a4f3d] tracking-[0.15em] uppercase">
                UNIESTATE
              </h2>
            </div>

            {/* Textos descriptivos */}
            <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
              <p className="text-sm md:text-base text-[#6E5F46] leading-relaxed">
                {language === "es"
                  ? "Desde 1995, Uniestate ha sido un nombre líder en el desarrollo inmobiliario, creando espacios de alta calidad e innovadores que se convierten en hogares preciados y comunidades vibrantes. Nuestro compromiso con la calidad y la innovación garantiza que superemos las expectativas de los clientes, ofreciendo espacios residenciales y comerciales excepcionales."
                  : "Since 1995, Uniestate has been a leading name in real estate development, creating high-quality, innovative living spaces that become cherished homes and vibrant communities. Our commitment to quality and innovation ensures we exceed client expectations, delivering exceptional residential and commercial spaces."}
              </p>
              <p className="text-sm md:text-base text-[#6E5F46] leading-relaxed">
                {language === "es"
                  ? "Durante 30 años, nuestro éxito ha sido impulsado por una estrategia clara: identificar y asegurar ubicaciones privilegiadas para maximizar el crecimiento del capital."
                  : "For 30 years, our success has been driven by a clear strategy: identifying and securing prime locations to maximize capital growth."}
              </p>
            </div>

            {/* Franja con tagline y stats */}
            <div className="bg-[#e8dcc8] py-10 md:py-12 px-6 md:px-8 rounded-2xl">
              {/* Tagline */}
              <div className="text-center mb-10 md:mb-12">
                <h3 className="text-xl md:text-2xl font-light text-[#271c13] tracking-wide uppercase">
                  {language === "es"
                    ? "Experiencia. Profesionalismo. Dedicación."
                    : "Expertise. Professionalism. Dedication."}
                </h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-light text-[#A29060] mb-1">+ 50,000</p>
                  <p className="text-xs md:text-sm text-[#6E5F46]">
                    {language === "es" ? "Clientes Satisfechos" : "Satisfied Clients"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-light text-[#A29060] mb-1">+ 3,000</p>
                  <p className="text-xs md:text-sm text-[#6E5F46]">
                    {language === "es" ? "Unidades" : "Units"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-light text-[#A29060] mb-1">
                    {language === "es" ? "+ 325.000 m²" : "+ 3.5 MM SQ.FT"}
                  </p>
                  <p className="text-xs md:text-sm text-[#6E5F46]">
                    {language === "es" ? "Metros Cuadrados" : "Square Feet"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-light text-[#A29060] mb-1">30 {language === "es" ? "AÑOS" : "YEARS"}</p>
                  <p className="text-xs md:text-sm text-[#6E5F46]">
                    {language === "es" ? "Desde 1995" : "Since 1995"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
