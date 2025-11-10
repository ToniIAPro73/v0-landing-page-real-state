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
const useS3Storage = Boolean(
  s3Config.endpoint &&
    s3Config.bucket &&
    s3Config.region &&
    s3Config.accessKeyId &&
    s3Config.secretAccessKey,
);
const s3Client = useS3Storage
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

  if (!resendClient) {
    console.warn("[sendDossierEmail] RESEND_API_KEY not configured.");
    console.warn(
      "[sendDossierEmail] Dossier download link:",
      absoluteUrl,
    );
    return;
  }

  const subject =
    payload.language === "es"
      ? `Tu dossier exclusivo de Playa Viva, ${payload.firstName}`
      : `Your exclusive Playa Viva dossier, ${payload.firstName}`;
  const greeting = payload.language === "es" ? "Hola" : "Hello";
  const intro =
    payload.language === "es"
      ? "Gracias por tu interés en Playa Viva. Tu dossier personalizado está listo."
      : "Thank you for your interest in Playa Viva. Your personalised dossier is ready.";
  const buttonLabel =
    payload.language === "es" ? "Descargar dossier" : "Download dossier";

  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family: sans-serif;">
      <tr>
        <td>
          <p>${greeting} ${payload.firstName},</p>
          <p>${intro}</p>
          <p>
            <a href="${absoluteUrl}" style="background:linear-gradient(135deg,#d4af37,#c4a037);color:#1f1509;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              ${buttonLabel}
            </a>
          </p>
          <p style="font-size:13px;color:#6e5f46">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <a href="${absoluteUrl}">${absoluteUrl}</a>
          </p>
          <p style="font-size:12px;color:#9c8a6a">Uniestate UK · inversiones@uniestate.co.uk</p>
        </td>
      </tr>
    </table>
  `;

  try {
    await resendClient.emails.send({
      from: "Uniestate Playa Viva <inversiones@uniestate.co.uk>",
      to: payload.email,
      subject,
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
