import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { Resend } from "resend";
import nodemailer from "nodemailer";
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
import { verifyAltchaPayload } from "@/lib/altcha";

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
  altchaPayload?: string;
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

const PDF_BASE_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "dossier",
);
const PDF_BASE_FILES = {
  es: "Dossier-Playa-Viva-ES.pdf",
  en: "Dossier-Playa-Viva-EN.pdf",
};
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
const PDF_FIELD_NAME = "Nombre_Personalizacion_Lead";
const PDF_STORAGE_PREFIX = "dossiers";
const ALTCHA_SECRET = process.env.ALTCHA_SECRET;
const DOSSIER_ALERT_RECIPIENTS = {
  es: {
    email: process.env.DOSSIER_ALERT_EMAIL_ES ?? "tony@uniestate.co.uk",
    name: "Toni",
    subject: "Playa Viva • Dossier base no disponible",
  },
  en: {
    email: process.env.DOSSIER_ALERT_EMAIL_EN ?? "michael@uniestate.co.uk",
    name: "Michael",
    subject: "Playa Viva • Missing dossier base",
  },
};

if (!ALTCHA_SECRET) {
  console.warn("[ALTCHA] ALTCHA_SECRET is not configured. Verification will fail.");
}

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

async function resolveBasePdfPath(language: "es" | "en"): Promise<string | null> {
  const fileName = PDF_BASE_FILES[language];
  if (!fileName) {
    console.error(`[resolveBasePdfPath] No PDF configured for language: ${language}`);
    return null;
  }

  const pdfPath = path.join(PDF_BASE_DIR, fileName);

  try {
    await fs.access(pdfPath);
    console.info(`[resolveBasePdfPath] Using PDF for language '${language}': ${fileName}`);
    return pdfPath;
  } catch (error) {
    console.error(`[resolveBasePdfPath] PDF not found for language '${language}': ${pdfPath}`, error);
    return null;
  }
}

type PdfResult = {
  success: boolean;
  pdf_delivery_url: string | null;
  local_path?: string | null;
  pdf_buffer?: Buffer | null;
  pdf_filename?: string | null;
  error?: string;
  missingBase?: boolean;
};

async function personalizePDF(payload: LeadSubmitPayload): Promise<PdfResult> {
  const language = payload.language || "es";
  const basePdfPath = await resolveBasePdfPath(language);
  if (!basePdfPath) {
    console.error(`[personalizePDF] Base PDF not found for language: ${language}`);
    return {
      success: false,
      pdf_delivery_url: null,
      error: `Base PDF not found for language: ${language}`,
      missingBase: true,
    };
  }

  if (useS3Storage && s3Client && s3Config.bucket) {
    console.info(
      `[personalizePDF] Storage mode: S3 bucket "${s3Config.bucket}" (region ${s3Config.region})`,
    );
  } else {
    console.info(
      `[personalizePDF] Storage mode: local directory ${JSON.stringify(LOCAL_PDF_OUTPUT_DIR)}`,
    );
  }

  const displayName =
    payload.fullName?.trim() ||
    `${payload.firstName} ${payload.lastName}`.trim() ||
    "Inversor Playa Viva";
  const safeName = sanitizeFileName(displayName);
  const outputFilename = `Dossier_${safeName}.pdf`;

  try {
    const basePdfBytes = await fs.readFile(basePdfPath);
    const pdfDoc = await PDFDocument.load(basePdfBytes);

    // Registrar fontkit para usar fuentes personalizadas
    pdfDoc.registerFontkit(fontkit);

    // Verificar que el PDF tenga al menos 2 páginas
    if (pdfDoc.getPageCount() < 2) {
      console.error(`[personalizePDF] PDF only has ${pdfDoc.getPageCount()} page(s), need at least 2`);
      return {
        success: false,
        pdf_delivery_url: null,
        error: `PDF must have at least 2 pages`,
      };
    }

    // Obtener la segunda página (índice 1)
    const secondPage = pdfDoc.getPage(1);

    // Cargar la fuente Allura personalizada
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Allura-Regular.ttf');
    const fontBytes = await fs.readFile(fontPath);
    const font = await pdfDoc.embedFont(fontBytes);

    // Formatear el nombre con iniciales en mayúsculas y coma al final
    const nameParts = displayName.split(' ');
    const formattedName = nameParts
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + ',';

    const textSize = 92; // Altura de texto especificada
    const pageHeight = secondPage.getHeight();
    const pageWidth = secondPage.getWidth();

    // Ajustar posición: el texto debe estar más arriba (reducir fieldTopY)
    const fieldTopY = 150; // Ajustado para mejor posicionamiento visual
    const fieldHeight = 143.3;

    // Convertir Y de "desde arriba" a "desde abajo" (sistema de coordenadas PDF)
    const fieldBottomY = pageHeight - fieldTopY - fieldHeight;

    console.info(`[personalizePDF] Page: ${pageWidth}x${pageHeight}, Field Y from top: ${fieldTopY}, Field Y from bottom: ${fieldBottomY}`);

    // Calcular el ancho del texto
    const fullTextWidth = font.widthOfTextAtSize(formattedName, textSize);

    // Determinar si necesita dividirse en 2 líneas
    let line1 = formattedName;
    let line2 = '';

    if (fullTextWidth > pageWidth * 0.8) { // Si ocupa más del 80% del ancho de la página
      // Dividir: nombre en línea 1, apellidos + coma en línea 2
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      line1 = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      line2 = lastName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') + ',';

      console.info(`[personalizePDF] Text split into 2 lines: "${line1}" / "${line2}"`);
    } else {
      console.info(`[personalizePDF] Text fits in 1 line: "${line1}"`);
    }

    // Calcular posición centrada horizontalmente para cada línea (centrado en la página completa)
    const line1Width = font.widthOfTextAtSize(line1, textSize);
    const line1X = (pageWidth - line1Width) / 2;

    // Offset vertical para ajustar la posición (positivo = sube el texto)
    const verticalOffset = 30;

    // Color dorado-bronce oscuro #8B7355 (tono intermedio entre dorado y bronce, muy premium)
    // RGB calculado: 139/255 = 0.545, 115/255 = 0.451, 85/255 = 0.333
    const textColor = rgb(0.545, 0.451, 0.333);
    const opacity = 1.0;

    // Color de sombra: negro con opacidad media para máxima legibilidad
    const shadowColor = rgb(0, 0, 0);
    const shadowOpacity = 0.65; // Sombra más intensa para mejor contraste
    const shadowOffsetX = 3; // Desplazamiento horizontal de la sombra (aumentado)
    const shadowOffsetY = -3; // Desplazamiento vertical de la sombra (aumentado)

    if (line2) {
      // Dos líneas: centrar verticalmente ambas
      const lineSpacing = textSize * 1.2; // Espacio entre líneas
      const totalHeight = textSize * 2 + (lineSpacing - textSize);
      const startY = fieldBottomY + (fieldHeight - totalHeight) / 2 + verticalOffset;

      // Calcular posición centrada para línea 2 (también en la página completa)
      const line2Width = font.widthOfTextAtSize(line2, textSize);
      const line2X = (pageWidth - line2Width) / 2;

      // Calcular posiciones para el texto
      const line1Y = startY + textSize + (lineSpacing - textSize);
      const line2Y = startY;

      // SOMBRA para Línea 1
      secondPage.drawText(line1, {
        x: line1X + shadowOffsetX,
        y: line1Y + shadowOffsetY,
        size: textSize,
        font,
        color: shadowColor,
        opacity: shadowOpacity,
      });

      // TEXTO PRINCIPAL Línea 1 (nombre)
      secondPage.drawText(line1, {
        x: line1X,
        y: line1Y,
        size: textSize,
        font,
        color: textColor,
        opacity: opacity,
      });

      // SOMBRA para Línea 2
      secondPage.drawText(line2, {
        x: line2X + shadowOffsetX,
        y: line2Y + shadowOffsetY,
        size: textSize,
        font,
        color: shadowColor,
        opacity: shadowOpacity,
      });

      // TEXTO PRINCIPAL Línea 2 (apellidos + coma)
      secondPage.drawText(line2, {
        x: line2X,
        y: line2Y,
        size: textSize,
        font,
        color: textColor,
        opacity: opacity,
      });
    } else {
      // Una línea: centrar vertical y horizontalmente
      const textY = fieldBottomY + (fieldHeight - textSize) / 2 + verticalOffset;

      // SOMBRA para texto de una línea
      secondPage.drawText(line1, {
        x: line1X + shadowOffsetX,
        y: textY + shadowOffsetY,
        size: textSize,
        font,
        color: shadowColor,
        opacity: shadowOpacity,
      });

      // TEXTO PRINCIPAL de una línea
      secondPage.drawText(line1, {
        x: line1X,
        y: textY,
        size: textSize,
        font,
        color: textColor,
        opacity: opacity,
      });
    }

    console.info(`[personalizePDF] Text drawn on page 2 at Y position: ${fieldBottomY}`);

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

        console.info(
          `[personalizePDF] Uploaded dossier to S3 bucket "${s3Config.bucket}"`,
        );

        return {
          success: true,
          pdf_delivery_url: signedUrl,
          local_path: null,
          pdf_buffer: pdfBuffer,
          pdf_filename: outputFilename,
        };
      } catch (error) {
        console.error(
          "[personalizePDF] Error uploading dossier to S3, falling back to local storage:",
          error,
        );
        if (!LOCAL_PDF_OUTPUT_DIR) {
          return {
            success: false,
            pdf_delivery_url: null,
            error:
              error instanceof Error
                ? error.message
                : "S3 upload failed without fallback directory",
          };
        }
      }
    }

    try {
      await fs.mkdir(LOCAL_PDF_OUTPUT_DIR, { recursive: true });
    } catch (error) {
      console.error(
        "[personalizePDF] Cannot create local dossier directory:",
        error,
      );
      return {
        success: false,
        pdf_delivery_url: null,
        error:
          error instanceof Error
            ? error.message
            : "Cannot create dossier directory",
      };
    }

    try {
      const outputPath = path.join(LOCAL_PDF_OUTPUT_DIR, outputFilename);
      console.info(
        `[personalizePDF] Writing dossier to ${JSON.stringify(outputPath)}`,
      );
      await fs.writeFile(outputPath, pdfBuffer);
      console.info(
        `[personalizePDF] Saved dossier locally at ${JSON.stringify(outputPath)}`,
      );

      return {
        success: true,
        pdf_delivery_url: `/api/local-dossiers/${encodeURIComponent(
          outputFilename,
        )}`,
        local_path: outputPath,
        pdf_buffer: pdfBuffer,
        pdf_filename: outputFilename,
      };
    } catch (error) {
      console.error(
        "[personalizePDF] Error writing dossier locally:",
        error,
      );
      return {
        success: false,
        pdf_delivery_url: null,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error writing dossier",
      };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown PDF error";
    console.error("[personalizePDF] Error customizing PDF:", message);
    return { success: false, pdf_delivery_url: null, error: message };
  }
}

async function sendDossierEmail(
  payload: LeadSubmitPayload,
  pdfUrl: string | null,
) {
  if (!pdfUrl) {
    console.warn("[sendDossierEmail] No PDF URL provided, skipping email");
    return;
  }

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

  // Check SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "465");
  const smtpSecure = process.env.SMTP_SECURE === "true";

  if (!smtpHost) {
    console.warn("[sendDossierEmail] SMTP not configured.");
    console.warn("[sendDossierEmail] Dossier download link:", absoluteUrl);
    return;
  }

  console.info("[sendDossierEmail] ===== EMAIL DEBUG START =====");
  console.info("[sendDossierEmail] Recipient:", payload.email);
  console.info("[sendDossierEmail] Language:", payload.language);
  console.info("[sendDossierEmail] PDF URL:", absoluteUrl);
  console.info("[sendDossierEmail] SMTP Host:", smtpHost);
  console.info("[sendDossierEmail] SMTP Port:", smtpPort);

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

  // Determinar remitente y credenciales según idioma
  const senderEmail = payload.language === "es"
    ? "tony@uniestate.co.uk"
    : "michael@uniestate.co.uk";
  const senderName = payload.language === "es"
    ? "Tony - Uniestate Playa Viva"
    : "Michael - Uniestate Playa Viva";
  const smtpUser = payload.language === "es"
    ? process.env.SMTP_USER_ES
    : process.env.SMTP_USER_EN;
  const smtpPass = payload.language === "es"
    ? process.env.SMTP_PASS_ES
    : process.env.SMTP_PASS_EN;

  if (!smtpUser || !smtpPass) {
    console.error(`[sendDossierEmail] SMTP credentials missing for language: ${payload.language}`);
    return;
  }

  try {
    // Crear transporte SMTP con Nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.info(`[sendDossierEmail] Attempting to send email via SMTP...`);
    console.info(`[sendDossierEmail] From: ${senderName} <${senderEmail}>`);
    console.info(`[sendDossierEmail] To: ${payload.email}`);
    console.info(`[sendDossierEmail] Subject: ${emailCopy.subject}`);

    const result = await transporter.sendMail({
      from: `${senderName} <${senderEmail}>`,
      to: payload.email,
      subject: emailCopy.subject,
      html,
    });

    console.info(`[sendDossierEmail] ✓ Email sent successfully via SMTP!`);
    console.info(`[sendDossierEmail] Message ID:`, result.messageId);
    console.info(`[sendDossierEmail] Response:`, result.response);
    console.info("[sendDossierEmail] ===== EMAIL DEBUG END =====");
  } catch (error) {
    console.error("[sendDossierEmail] ✗ Failed to send email via SMTP");
    console.error("[sendDossierEmail] Error details:", error);
    if (error instanceof Error) {
      console.error("[sendDossierEmail] Error message:", error.message);
      console.error("[sendDossierEmail] Error stack:", error.stack);
    }
    console.error("[sendDossierEmail] ===== EMAIL DEBUG END (WITH ERROR) =====");
  }
}

async function sendMissingBaseAlert(payload: LeadSubmitPayload) {
  if (!resendClient) {
    console.info(
      "[sendMissingBaseAlert] RESEND_API_KEY not configured; skipping dossier alert",
    );
    return;
  }

  const language = payload.language === "en" ? "en" : "es";
  const recipient = DOSSIER_ALERT_RECIPIENTS[language];
  const leadName =
    payload.fullName?.trim() ||
    `${payload.firstName} ${payload.lastName}`.trim() ||
    "Lead no identificado";

  const greeting = language === "en" ? "Hi" : "Hola";
  const explanation =
    language === "en"
      ? "A dossier request reached the server but the base PDF was missing."
      : "Se ha recibido una solicitud del dossier personalizado pero el PDF base no estaba disponible.";
  const footer =
    language === "en"
      ? "Please restore `Dossier-Personalizado.pdf` (or `Dossier-Playa-Viva-ES.pdf`) inside `public/assets/dossier/` immediately."
      : "Por favor, coloca el PDF base `Dossier-Personalizado.pdf` (o `Dossier-Playa-Viva-ES.pdf`) dentro de `public/assets/dossier/` cuanto antes.";

  try {
    await resendClient.emails.send({
      from: `Uniestate Playa Viva <${recipient.email}>`,
      to: recipient.email,
      subject: recipient.subject,
      html: `
        <p>${greeting} ${recipient.name},</p>
        <p>${explanation}</p>
        <ul>
          <li><strong>Nombre:</strong> ${leadName}</li>
          <li><strong>Email:</strong> ${payload.email}</li>
          <li><strong>Idioma:</strong> ${language === "en" ? "English" : "Español"}</li>
          <li><strong>Página:</strong> ${payload.pageUri || "https://landing-page-playa-viva.vercel.app"}</li>
        </ul>
        <p>${footer}</p>
        <p>Cualquiera de los dos PDFs debe estar disponible para que el lead reciba su dossier.</p>
      `,
    });
  } catch (error) {
    console.error("[sendMissingBaseAlert] Failed to send alert:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as LeadSubmitPayload & {
      altcha_payload?: string;
    };

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

    const altchaPayload =
      payload.altchaPayload ?? payload.altcha_payload ?? null;

    if (!altchaPayload) {
      return NextResponse.json(
        { error: "Falta la verificación ALTCHA" },
        { status: 400 },
      );
    }

    if (!ALTCHA_SECRET) {
      return NextResponse.json(
        { error: "ALTCHA no está configurado en el backend" },
        { status: 500 },
      );
    }

    try {
      const isValid = verifyAltchaPayload(altchaPayload, ALTCHA_SECRET);
      if (!isValid) {
        return NextResponse.json(
          { error: "Verificación ALTCHA inválida" },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("[ALTCHA] Error verificando payload:", error);
      return NextResponse.json(
        { error: "No se pudo verificar ALTCHA" },
        { status: 400 },
      );
    }

    const [hubspotResult, pdfResult] = await Promise.allSettled([
      submitToHubSpot(payload),
      personalizePDF(payload),
    ]);

    const hubspotSuccess = hubspotResult.status === "fulfilled";
    const pdfSuccess = pdfResult.status === "fulfilled";
    const pdfValue =
      pdfSuccess && pdfResult.value ? pdfResult.value : null;
    const pdfUrl = pdfValue?.pdf_delivery_url ?? null;
    const pdfLocalPath = pdfValue?.local_path ?? null;
    const pdfBuffer = pdfValue?.pdf_buffer ?? null;
    const pdfFilename = pdfValue?.pdf_filename ?? null;
    const pdfError =
      pdfSuccess && pdfValue?.error
        ? pdfValue.error
        : pdfResult.status === "rejected"
          ? pdfResult.reason instanceof Error
            ? pdfResult.reason.message
            : String(pdfResult.reason)
          : pdfValue?.error ?? null;
    const basePdfMissing = pdfValue?.missingBase ?? false;

    if (basePdfMissing) {
      void sendMissingBaseAlert(payload);
    }

    if (pdfSuccess && pdfUrl) {
      await sendDossierEmail(payload, pdfUrl);
    }

    const message = basePdfMissing
      ? "Nuestro dossier personalizado se encuentra en mejora, vuelve a intentarlo en unos minutos."
      : hubspotSuccess && pdfSuccess
        ? "Lead procesado correctamente. Revisa tu email."
        : "Lead parcialmente procesado. Revisa los registros para más detalle.";

    return NextResponse.json({
      success: hubspotSuccess && pdfSuccess,
      hubspot_success: hubspotSuccess,
      pdf_success: pdfSuccess,
      pdf_url: pdfUrl,
      pdf_local_path: pdfLocalPath,
      pdf_error: pdfError,
      message,
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
