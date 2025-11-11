import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  getLocalDossierDir,
  shouldUseS3Storage,
} from "@/lib/dossier-storage";

export const runtime = "nodejs";

const filenameIsValid = (value: string) =>
  /^[a-zA-Z0-9._-]+$/.test(value);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  if (shouldUseS3Storage()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resolvedParams = await params;
  const rawParam = resolvedParams.file ?? "";
  const decoded = decodeURIComponent(rawParam);

  if (!decoded || !filenameIsValid(decoded)) {
    return NextResponse.json(
      { error: "Nombre de archivo inválido" },
      { status: 400 },
    );
  }

  const localPath = path.join(getLocalDossierDir(), path.basename(decoded));

  try {
    const data = await fs.readFile(localPath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${decoded}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[local-dossiers] Unable to read file:", error);
    return NextResponse.json(
      { error: "Dossier no disponible" },
      { status: 404 },
    );
  }
}
