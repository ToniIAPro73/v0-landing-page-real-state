import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getLocalDossierDir,
  resolveS3Config,
  shouldUseS3Storage,
} from "@/lib/dossier-storage";

export const runtime = "nodejs";

type LeadSubmitPayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: "es" | "en";
  hubspotutk: string;
  pageUri: string;
  utm?: Record<string, string>;
};

const HUB_ID =
  process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? "147219365";
const FORM_GUID =
  process.env.HUBSPOT_FORM_GUID ?? "34afefab-a031-4516-838e-f0edf0b98bc7";
const HUB_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUB_ID}/${FORM_GUID}`;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://landing-page-playa-viva.vercel.app";
const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const PDF_BASE_PATH = path.join(
  process.cwd(),
  "public",
  "assets",
  "dossier",
  "Dossier-Personalizado.pdf",
);
const LOCAL_PDF_OUTPUT_DIR = getLocalDossierDir();
const s3Config = resolveS3Config();
const useS3Storage = shouldUseS3Storage(s3Config);
const s3Client = useS3Storage && s3Config.bucket
  ? new S3Client({
      region: s3Config.region as string,
      endpoint: s3Config.endpoint,
      credentials: {
        accessKeyId: s3Config.accessKeyId as string,
        secretAccessKey: s3Config.secretAccessKey as string,
      },
      forcePathStyle: true,
    })
  : null;
const PDF_FIELD_NAME = "nombre_personalizacion_lead";
const PDF_STORAGE_PREFIX = "dossiers";

async function submitToHubSpot(payload: LeadSubmitPayload) {
  const fields = [
    { name: "email", value: payload.email },
    { name: "firstname", value: payload.firstName },
    { name: "lastname", value: payload.lastName },
    {
      name: "mercado_de_origen",
      value: payload.language === "es" ? "España" : "International",
    },
    { name: "lead_partner_source", value: "Partner_Landing_ES_Playa_Viva" },
  ];

  if (payload.utm) {
    Object.entries(payload.utm).forEach(([key, value]) => {
      if (value) {
        fields.push({ name: key, value });
      }
    });
  }

  const hubspotPayload = {
    fields,
    context: {
      hutk: payload.hubspotutk,
      pageUri: payload.pageUri,
      pageName: "Playa Viva Dossier Download",
    },
  };

  const response = await fetch(HUB_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hubspotPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `HubSpot API error: ${
        typeof errorData === "string" ? errorData : JSON.stringify(errorData)
      }`,
    );
  }

  return response.json();
}

const sanitizeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_{2,}/g, "_")
    .trim()
    .slice(0, 60) || "lead";

async function personalizePDF(payload: LeadSubmitPayload) {
  try {
    await fs.access(PDF_BASE_PATH);
  } catch {
    console.error(`[personalizePDF] Base PDF not found at ${PDF_BASE_PATH}`);
    return { success: false, pdf_delivery_url: null };
  }

  const displayName =
    payload.fullName?.trim() ||
    `${payload.firstName} ${payload.lastName}`.trim() ||
    "Inversor Playa Viva";
  const safeName = sanitizeFileName(displayName);
  const uniqueId = randomUUID();
  const outputFilename = `Dossier_Playa_Viva_${safeName}_${uniqueId}.pdf`;
  const outputPath = path.join(PDF_OUTPUT_DIR, outputFilename);

  try {
    const basePdfBytes = await fs.readFile(PDF_BASE_PATH);
    const pdfDoc = await PDFDocument.load(basePdfBytes);
    const form = pdfDoc.getForm();
    let fieldFilled = false;

    try {
      const personalizationField = form.getTextField(PDF_FIELD_NAME);
      personalizationField.setText(displayName);
      fieldFilled = true;
    } catch (error) {
      console.warn(
        `[personalizePDF] Could not find field "${PDF_FIELD_NAME}". Drawing text instead.`,
        error,
      );
    }

    if (!fieldFilled) {
      const firstPage = pdfDoc.getPage(0);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const text = `Personalizado para ${displayName}`;
      const textSize = 16;
      const textWidth = font.widthOfTextAtSize(text, textSize);
      firstPage.drawText(text, {
        x: (firstPage.getWidth() - textWidth) / 2,
        y: 64,
        size: textSize,
        font,
        color: rgb(0.63, 0.55, 0.4),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    if (useS3Storage && s3Client && s3Config.bucket) {
      const key = `${PDF_STORAGE_PREFIX}/${outputFilename}`;
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: s3Config.bucket,
            Key: key,
            Body: pdfBuffer,
            ContentType: "application/pdf",
          }),
        );

        const signedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: s3Config.bucket,
            Key: key,
          }),
          { expiresIn: 60 * 60 * 24 },
        );

        return {
          success: true,
          pdf_delivery_url: signedUrl,
        };
      } catch (error) {
        console.error(
          "[personalizePDF] Error uploading dossier to S3:",
          error,
        );
        return { success: false, pdf_delivery_url: null };
      }
    }

    try {
      await fs.mkdir(LOCAL_PDF_OUTPUT_DIR, { recursive: true });
    } catch (error) {
      console.error(
        "[personalizePDF] Cannot create local dossier directory:",
        error,
      );
      return { success: false, pdf_delivery_url: null };
    }

    try {
      const outputPath = path.join(LOCAL_PDF_OUTPUT_DIR, outputFilename);
      await fs.writeFile(outputPath, pdfBuffer);
      console.info(
        `[personalizePDF] Saved dossier locally at ${outputPath}`,
      );

      return {
        success: true,
        pdf_delivery_url: `/api/local-dossiers/${encodeURIComponent(
          outputFilename,
        )}`,
      };
    } catch (error) {
      console.error(
        "[personalizePDF] Error writing dossier locally:",
        error,
      );
      return { success: false, pdf_delivery_url: null };
    }
  } catch (error) {
    console.error("[personalizePDF] Error customizing PDF:", error);
    return { success: false, pdf_delivery_url: null };
  }
}

async function sendDossierEmail(
  payload: LeadSubmitPayload,
  pdfUrl: string | null,
) {
  if (!pdfUrl) return;

  const siteOrigin = (() => {
    if (payload.pageUri) {
      try {
        return new URL(payload.pageUri).origin;
      } catch {
        return SITE_URL;
      }
    }
    return SITE_URL;
  })();

  const absoluteUrl = pdfUrl.startsWith("http")
    ? pdfUrl
    : `${siteOrigin}${pdfUrl}`;
  const logoUrl = (() => {
    try {
      return new URL("/logo-playa-viva.png", siteOrigin).toString();
    } catch {
      return `${SITE_URL}/logo-playa-viva.png`;
    }
  })();
  const compositionUrl = (() => {
    const assetPath = "/composicion%20fondo%20transparente.png";
    try {
      return new URL(assetPath, siteOrigin).toString();
    } catch {
      return `${SITE_URL}${assetPath}`;
    }
  })();

  if (!resendClient) {
    console.warn("[sendDossierEmail] RESEND_API_KEY not configured.");
    console.warn(
      "[sendDossierEmail] Dossier download link:",
      absoluteUrl,
    );
    return;
  }

  const emailCopy = {
    es: {
      subject: "Tu Dossier Personalizado de Playa Viva | Siguiente Paso",
      greeting: `Hola ${payload.firstName},`,
      intro:
        "Es un placer. Puedes descargar tu dossier personalizado de Playa Viva con el botón inferior, tal como solicitaste en nuestra web.",
      effect:
        "Confío en que este análisis te mostrará la oportunidad única que representa el “Efecto Wynn” y el potencial de Al Marjan Island.",
      nextStepTitle: "Tu siguiente paso",
      nextStepBody:
        "Cuando hayas revisado el dossier, el siguiente paso lógico es una consulta privada de 15 minutos para analizar cómo esta inversión encaja con tus objetivos.",
      instructions:
        "Para agendar tu consulta sin compromiso, simplemente responde a este email (tony@uniestate.co.uk) con los siguientes detalles y mi equipo se pondrá en contacto contigo:",
      fields: [
        "Tu número de teléfono (incluyendo prefijo de país).",
        "Tipo de apartamento de interés (ej. Estudio, 1 Habitación, 2 Habitaciones, 3 Habitaciones).",
        "Método de contacto preferido (Email, Teléfono, WhatsApp, Zoom).",
        "Franja horaria preferida (ej. Mañana 9-12h, Mediodía 12-15h, Tarde 15-18h, a cualquier hora).",
      ],
      closing: "Quedo a tu disposición.",
      signature: "Tony · Agente Oficial, Uniestate UK · tony@uniestate.co.uk",
      buttonLabel: "Descargar dossier",
    },
    en: {
      subject: "Your Playa Viva Personalised Dossier | Next Step",
      greeting: `Hello ${payload.firstName},`,
      intro:
        "It’s my pleasure. You can download your personalised Playa Viva dossier with the button below, exactly as requested on our site.",
      effect:
        "I trust this briefing will showcase the unique opportunity behind the “Wynn Effect” and the potential of Al Marjan Island.",
      nextStepTitle: "Your next step",
      nextStepBody:
        "Once you’ve reviewed the dossier, the logical next step is a private 15-minute consultation to explore how this investment aligns with your goals.",
      instructions:
        "To book your consultation with no obligation, simply reply to this email (tony@uniestate.co.uk) with the details below and my team will reach out:",
      fields: [
        "Your phone number (including country code).",
        "Apartment type of interest (e.g., Studio, 1 Bedroom, 2 Bedrooms, 3 Bedrooms).",
        "Preferred contact method (Email, Phone, WhatsApp, Zoom).",
        "Preferred time window (e.g., Morning 9-12h, Midday 12-15h, Afternoon 15-18h, anytime).",
      ],
      closing: "I remain at your disposal.",
      signature: "Tony · Official Agent, Uniestate UK · tony@uniestate.co.uk",
      buttonLabel: "Download dossier",
    },
  }[payload.language];

  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family: sans-serif;">
      <tr>
        <td>
          <p style="margin-bottom:24px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
            <img
              src="${logoUrl}"
              alt="Playa Viva"
              width="168"
              style="display:block;width:168px;max-width:60%;height:auto;"
            />
            <img
              src="${compositionUrl}"
              alt="Playa Viva vista aérea"
              width="132"
              style="display:block;width:132px;max-width:40%;height:auto;opacity:0.9;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.08);"
            />
          </p>
          <p>${emailCopy.greeting}</p>
          <p>${emailCopy.intro}</p>
          <p>${emailCopy.effect}</p>
          <p style="text-transform:uppercase;font-size:13px;letter-spacing:0.1em;color:#c2a46d;margin-top:28px;margin-bottom:8px;">
            ${emailCopy.nextStepTitle}
          </p>
          <p>${emailCopy.nextStepBody}</p>
          <p>${emailCopy.instructions}</p>
          <ul style="padding-left:18px;color:#4e4332;">
            ${emailCopy.fields
              .map((item) => `<li style="margin-bottom:4px;">${item}</li>`)
              .join("")}
          </ul>
          <p>${emailCopy.closing}</p>
          <p style="margin-bottom:28px;">${emailCopy.signature}</p>
          <p>
            <a href="${absoluteUrl}" style="background:linear-gradient(135deg,#d4af37,#c4a037);color:#1f1509;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              ${emailCopy.buttonLabel}
            </a>
          </p>
          <p style="font-size:13px;color:#6e5f46">
            ${
              payload.language === "es"
                ? "Si el botón no funciona, copia y pega este enlace en tu navegador:"
                : "If the button does not work, copy and paste this link into your browser:"
            }<br/>
            <a href="${absoluteUrl}">${absoluteUrl}</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  try {
    await resendClient.emails.send({
      from: "Uniestate Playa Viva <inversiones@uniestate.co.uk>",
      to: payload.email,
      subject: emailCopy.subject,
      html,
    });
  } catch (error) {
    console.error("[sendDossierEmail] Failed to send email via Resend:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LeadSubmitPayload;

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.hubspotutk
    ) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 },
      );
    }

    const [hubspotResult, pdfResult] = await Promise.allSettled([
      submitToHubSpot(payload),
      personalizePDF(payload),
    ]);

    const hubspotSuccess = hubspotResult.status === "fulfilled";
    const pdfSuccess = pdfResult.status === "fulfilled";
    const pdfUrl =
      pdfSuccess && pdfResult.value?.pdf_delivery_url
        ? (pdfResult.value.pdf_delivery_url as string)
        : null;

    if (pdfSuccess && pdfUrl) {
      await sendDossierEmail(payload, pdfUrl);
    }

    return NextResponse.json({
      success: hubspotSuccess && pdfSuccess,
      hubspot_success: hubspotSuccess,
      pdf_success: pdfSuccess,
      pdf_url: pdfUrl,
      message:
        hubspotSuccess && pdfSuccess
          ? "Lead procesado correctamente. Revisa tu email."
          : "Lead parcialmente procesado. Revisa los registros para más detalle.",
    });
  } catch (error) {
    console.error("[submit-lead] Error:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Método no permitido. Usa POST." },
    { status: 405 },
  );
}
