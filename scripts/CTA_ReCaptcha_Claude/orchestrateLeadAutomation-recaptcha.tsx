/**
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 
 * REEMPLAZAR la función orchestrateLeadAutomation
 * con esta versión actualizada
 */

const orchestrateLeadAutomation = async (payload: LeadAutomationPayload) => {
  // Capturar cookie hubspotutk de HubSpot
  const getHubSpotCookie = (): string => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'hubspotutk') {
        return value;
      }
    }
    // Si no existe la cookie, generar timestamp como fallback
    return `generated_${Date.now()}`;
  };

  const hubspotutk = getHubSpotCookie();
  const pageUri = window.location.href;

  // Preparar payload para API
  const apiPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName: payload.fullName,
    email: payload.email,
    language: payload.language,
    hubspotutk,
    pageUri,
    utm: payload.utm,
    recaptchaToken: payload.recaptchaToken, // NUEVO: Pasar token de reCAPTCHA
  };

  // Llamar API route
  const response = await fetch('/api/submit-lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error procesando lead');
  }

  return await response.json();
};
