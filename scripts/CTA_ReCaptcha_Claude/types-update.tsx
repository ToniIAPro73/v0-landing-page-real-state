/**
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 
 * REEMPLAZAR el tipo LeadAutomationPayload (línea 27-38)
 * con esta versión actualizada
 */

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
  recaptchaToken: string; // NUEVO: Token de reCAPTCHA Enterprise
};
