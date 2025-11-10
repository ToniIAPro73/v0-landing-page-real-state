import { NextRequest, NextResponse } from 'next/server';

// Tipos
interface LeadSubmitPayload {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: 'es' | 'en';
  hubspotutk: string;
  pageUri: string;
  utm: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  recaptchaToken: string; // NUEVO: Token de reCAPTCHA Enterprise
}

// Configuración
const HUB_ID = '147219365';
const FORM_GUID = '34afefab-a031-4516-838e-f0edf0b98bc7';
const HUB_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUB_ID}/${FORM_GUID}`;

// NUEVO: Configuración reCAPTCHA Enterprise
const RECAPTCHA_PROJECT_ID = 'gen-lang-client-0093228508';
const RECAPTCHA_SITE_KEY = '6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm';
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY; // Variable de entorno

/**
 * NUEVO: Verificar token de reCAPTCHA Enterprise con Google Cloud API
 */
async function verifyRecaptchaToken(token: string, expectedAction: string): Promise<{
  success: boolean;
  score: number;
  reasons: string[];
}> {
  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${RECAPTCHA_PROJECT_ID}/assessments?key=${RECAPTCHA_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token: token,
            expectedAction: expectedAction,
            siteKey: RECAPTCHA_SITE_KEY,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('reCAPTCHA verification failed:', errorData);
      throw new Error(`reCAPTCHA API error: ${response.status}`);
    }

    const data = await response.json();

    // Extraer información del assessment
    const tokenProperties = data.tokenProperties || {};
    const riskAnalysis = data.riskAnalysis || {};

    // Validar que el token es válido y la acción coincide
    const isValid = tokenProperties.valid === true;
    const actionMatches = tokenProperties.action === expectedAction;
    const score = riskAnalysis.score || 0;
    const reasons = riskAnalysis.reasons || [];

    return {
      success: isValid && actionMatches && score >= 0.5, // Score mínimo: 0.5
      score: score,
      reasons: reasons,
    };
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return {
      success: false,
      score: 0,
      reasons: ['verification_error'],
    };
  }
}

/**
 * Enviar lead a HubSpot usando Forms API
 */
async function submitToHubSpot(payload: LeadSubmitPayload): Promise<any> {
  const hubspotPayload = {
    fields: [
      { name: 'email', value: payload.email },
      { name: 'firstname', value: payload.firstName },
      { name: 'lastname', value: payload.lastName },
      { name: 'mercado_de_origen', value: payload.language === 'es' ? 'España' : 'International' },
      { name: 'lead_partner_source', value: 'Partner_Landing_ES_Playa_Viva' },
    ],
    context: {
      hutk: payload.hubspotutk,
      pageUri: payload.pageUri,
      pageName: 'Playa Viva Dossier Download',
    },
  };

  const response = await fetch(HUB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(hubspotPayload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HubSpot API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Personalizar PDF (placeholder - implementar según necesidad)
 */
async function personalizePDF(payload: LeadSubmitPayload): Promise<any> {
  console.log('Personalización PDF pendiente para:', payload.fullName);
  
  return {
    success: true,
    pdf_path: `/dossiers/Dossier_Playa_Viva_${payload.firstName}_${payload.lastName}.pdf`,
    pdf_delivery_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dossiers/Dossier_Playa_Viva_${payload.firstName}_${payload.lastName}.pdf`,
  };
}

/**
 * Enviar email con dossier
 */
async function sendDossierEmail(payload: LeadSubmitPayload, pdfUrl: string): Promise<void> {
  const emailContent = {
    to: payload.email,
    from: 'inversiones@uniestate.co.uk',
    subject: payload.language === 'es' 
      ? `📊 Tu Dossier Exclusivo de Playa Viva, ${payload.firstName}` 
      : `📊 Your Exclusive Playa Viva Dossier, ${payload.firstName}`,
    html: `
      <h2>${payload.language === 'es' ? 'Hola' : 'Hello'} ${payload.firstName},</h2>
      <p>${payload.language === 'es' 
        ? 'Gracias por tu interés en Playa Viva. Tu dossier personalizado está listo.' 
        : 'Thank you for your interest in Playa Viva. Your personalized dossier is ready.'}</p>
      <p><a href="${pdfUrl}" style="background: linear-gradient(135deg, #d4af37 0%, #c4a037 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
        ${payload.language === 'es' ? 'Descargar Dossier' : 'Download Dossier'}
      </a></p>
      <p><small>Uniestate UK Ltd | inversiones@uniestate.co.uk</small></p>
    `,
  };

  console.log('Email simulado:', emailContent);
}

/**
 * Endpoint principal
 */
export async function POST(request: NextRequest) {
  try {
    const payload: LeadSubmitPayload = await request.json();

    // Validar campos obligatorios
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.hubspotutk || !payload.recaptchaToken) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // NUEVO: Verificar reCAPTCHA Enterprise token
    console.log('Verificando reCAPTCHA token...');
    const recaptchaResult = await verifyRecaptchaToken(
      payload.recaptchaToken,
      'DOSSIER_DOWNLOAD'
    );

    if (!recaptchaResult.success) {
      console.error('reCAPTCHA verification failed:', {
        score: recaptchaResult.score,
        reasons: recaptchaResult.reasons,
      });

      return NextResponse.json(
        { 
          error: 'Verificación de seguridad fallida',
          details: {
            score: recaptchaResult.score,
            reasons: recaptchaResult.reasons,
          }
        },
        { status: 403 }
      );
    }

    console.log('reCAPTCHA verified successfully. Score:', recaptchaResult.score);

    // Procesos paralelos (HubSpot + PDF)
    const [hubspotResult, pdfResult] = await Promise.allSettled([
      submitToHubSpot(payload),
      personalizePDF(payload),
    ]);

    // Verificar resultados
    const hubspotSuccess = hubspotResult.status === 'fulfilled';
    const pdfSuccess = pdfResult.status === 'fulfilled';

    if (!hubspotSuccess) {
      console.error('Error HubSpot:', hubspotResult.reason);
    }

    if (!pdfSuccess) {
      console.error('Error PDF:', pdfResult.reason);
    }

    // Enviar email solo si PDF se generó correctamente
    if (pdfSuccess && pdfResult.value.pdf_delivery_url) {
      await sendDossierEmail(payload, pdfResult.value.pdf_delivery_url);
    }

    // Respuesta
    return NextResponse.json({
      success: hubspotSuccess && pdfSuccess,
      hubspot_success: hubspotSuccess,
      pdf_success: pdfSuccess,
      pdf_url: pdfSuccess ? pdfResult.value.pdf_delivery_url : null,
      recaptcha_score: recaptchaResult.score,
      message: hubspotSuccess && pdfSuccess
        ? 'Lead procesado correctamente. Revisa tu email.'
        : 'Lead parcialmente procesado. Revisa logs.',
    });

  } catch (error) {
    console.error('Error procesando lead:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido. Usa POST.' },
    { status: 405 }
  );
}
