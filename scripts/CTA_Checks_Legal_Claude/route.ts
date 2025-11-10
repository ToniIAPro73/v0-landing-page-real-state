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
}

// Configuración HubSpot
const HUB_ID = '147219365';
const FORM_GUID = '34afefab-a031-4516-838e-f0edf0b98bc7';
const HUB_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUB_ID}/${FORM_GUID}`;

/**
 * Enviar lead a HubSpot usando Forms API
 * Garantiza atribución correcta con hubspotutk
 */
async function submitToHubSpot(payload: LeadSubmitPayload): Promise<any> {
  const hubspotPayload = {
    fields: [
      { name: 'email', value: payload.email },
      { name: 'firstname', value: payload.firstName },
      { name: 'lastname', value: payload.lastName },
      // Campos personalizados
      { name: 'mercado_de_origen', value: payload.language === 'es' ? 'España' : 'International' },
      { name: 'lead_partner_source', value: 'Partner_Landing_ES_Playa_Viva' },
    ],
    context: {
      hutk: payload.hubspotutk, // CRÍTICO para atribución
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
 * Llamar script Python para personalización PDF
 * NOTA: Requiere servidor con Python instalado
 * Alternativa: Reescribir lógica en TypeScript con pdf-lib
 */
async function personalizePDF(payload: LeadSubmitPayload): Promise<any> {
  // OPCIÓN 1: Llamar script Python (requiere Python en servidor)
  // const { spawn } = require('child_process');
  // return new Promise((resolve, reject) => {
  //   const python = spawn('python3', ['personalizar_dossier.py', JSON.stringify(payload)]);
  //   python.stdout.on('data', (data) => resolve(JSON.parse(data)));
  //   python.stderr.on('data', (data) => reject(new Error(data.toString())));
  // });

  // OPCIÓN 2: Simulación temporal (reemplazar con lógica real)
  console.log('Personalización PDF pendiente para:', payload.fullName);
  
  return {
    success: true,
    pdf_path: `/dossiers/Dossier_Playa_Viva_${payload.firstName}_${payload.lastName}.pdf`,
    pdf_delivery_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dossiers/Dossier_Playa_Viva_${payload.firstName}_${payload.lastName}.pdf`,
  };
}

/**
 * Enviar email con dossier personalizado
 */
async function sendDossierEmail(payload: LeadSubmitPayload, pdfUrl: string): Promise<void> {
  // Integrar con Resend, SendGrid o servicio de email
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

  // Implementar envío real aquí
  console.log('Email simulado:', emailContent);
}

/**
 * Endpoint principal
 */
export async function POST(request: NextRequest) {
  try {
    const payload: LeadSubmitPayload = await request.json();

    // Validar campos obligatorios
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.hubspotutk) {
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

    // Procesos paralelos
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
