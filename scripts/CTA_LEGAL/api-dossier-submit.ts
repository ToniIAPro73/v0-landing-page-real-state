import { NextRequest, NextResponse } from 'next/server';

// Tipos
interface DossierSubmitPayload {
  nombre: string;
  email: string;
  telefono: string;
  privacyPolicy: boolean;
  marketingConsent: boolean;
  recaptchaToken: string;
  source: string;
  utm_campaign: string;
  timestamp: string;
}

// Verificar reCAPTCHA con Google
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return false;
  }
}

// Enviar datos a HubSpot
async function submitToHubSpot(payload: DossierSubmitPayload): Promise<any> {
  const hubspotPayload = {
    properties: {
      firstname: payload.nombre.split(' ')[0],
      lastname: payload.nombre.split(' ').slice(1).join(' ') || '',
      email: payload.email,
      phone: payload.telefono || '',
      hs_lead_status: 'NEW',
      lifecyclestage: 'subscriber',
      // Custom fields para campaña
      utm_campaign: payload.utm_campaign,
      utm_source: payload.source,
      marketing_consent: payload.marketingConsent ? 'true' : 'false',
      privacy_policy_accepted: payload.privacyPolicy ? 'true' : 'false',
      lead_source: 'Landing Page - Playa Viva',
      acquisition_date: payload.timestamp,
    },
    context: {
      hutk: '', // Cookie de HubSpot (opcional)
      pageUri: 'https://landing-page-playa-viva.vercel.app',
      pageName: 'Playa Viva - Dossier Download',
    },
  };

  const response = await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
      },
      body: JSON.stringify(hubspotPayload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HubSpot API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

// Enviar email de notificación al equipo de ventas
async function sendSalesNotification(payload: DossierSubmitPayload): Promise<void> {
  // Implementar con tu servicio de email preferido (SendGrid, Resend, etc.)
  const emailContent = {
    to: ['sales@uniestate.co.uk', 'tony@uniestate.co.uk', 'michael@uniestate.co.uk'],
    from: 'noreply@uniestate.co.uk',
    subject: `🔥 Nuevo Lead: ${payload.nombre} - Playa Viva`,
    html: `
      <h2>Nuevo Lead Generado</h2>
      <p><strong>Nombre:</strong> ${payload.nombre}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Teléfono:</strong> ${payload.telefono || 'No proporcionado'}</p>
      <p><strong>Campaña:</strong> Playa Viva</p>
      <p><strong>Fecha:</strong> ${new Date(payload.timestamp).toLocaleString('es-ES')}</p>
      <p><strong>Consintió Marketing:</strong> ${payload.marketingConsent ? 'Sí' : 'No'}</p>
      <hr>
      <p><a href="https://app-eu1.hubspot.com/contacts/147219365/contact/${payload.email}">Ver en HubSpot</a></p>
    `,
  };

  // Aquí implementarías el envío real según tu proveedor
  console.log('Email de notificación:', emailContent);
}

// Enviar dossier al lead
async function sendDossierEmail(payload: DossierSubmitPayload): Promise<void> {
  // Implementar con tu servicio de email
  const emailContent = {
    to: payload.email,
    from: 'inversiones@uniestate.co.uk',
    subject: '📊 Tu Dossier Exclusivo de Playa Viva',
    html: `
      <h2>Hola ${payload.nombre.split(' ')[0]},</h2>
      <p>Gracias por tu interés en Playa Viva.</p>
      <p>Adjunto encontrarás el dossier completo con:</p>
      <ul>
        <li>Análisis de rentabilidades verificadas (7-8% bruto anual)</li>
        <li>Planos y especificaciones técnicas</li>
        <li>Comparativa RAK vs Dubai</li>
        <li>Estrategia del "Wynn Effect"</li>
      </ul>
      <p><a href="https://uniestate.co.uk/dossiers/playa-viva-es.pdf">Descargar Dossier</a></p>
      <p>Un asesor se pondrá en contacto contigo en las próximas 24-48 horas.</p>
      <hr>
      <p><small>Uniestate UK Ltd | inversiones@uniestate.co.uk | +44 20 xxxx xxxx</small></p>
    `,
  };

  console.log('Dossier email:', emailContent);
}

// Endpoint principal
export async function POST(request: NextRequest) {
  try {
    const payload: DossierSubmitPayload = await request.json();

    // Validar campos obligatorios
    if (!payload.nombre || !payload.email || !payload.privacyPolicy) {
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

    // Verificar reCAPTCHA
    const recaptchaValid = await verifyRecaptcha(payload.recaptchaToken);
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: 'Verificación reCAPTCHA fallida' },
        { status: 400 }
      );
    }

    // Enviar a HubSpot
    let hubspotResult;
    try {
      hubspotResult = await submitToHubSpot(payload);
    } catch (error) {
      console.error('Error enviando a HubSpot:', error);
      // Continuar aunque HubSpot falle (para no perder el lead)
    }

    // Enviar emails
    await Promise.allSettled([
      sendSalesNotification(payload),
      sendDossierEmail(payload),
    ]);

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Dossier enviado correctamente',
      hubspotContactId: hubspotResult?.id || null,
    });

  } catch (error) {
    console.error('Error procesando solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Manejar otros métodos HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
