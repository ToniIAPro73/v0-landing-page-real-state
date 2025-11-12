import os from "os";
import path from "path";

/**
 * Detecta automáticamente la ruta correcta para almacenar PDFs según el entorno
 * - Vercel/Producción: /tmp/dossiers (directorio temporal en Linux)
 * - Local/Development: C:\Users\Usuario\Documents\Dossiers_Personalizados_PlayaViva (Windows)
 */
export const getLocalDossierDir = () => {
  // Detectar si estamos en Vercel o entorno de producción
  const isVercel = Boolean(process.env.VERCEL);
  const isProduction = process.env.NODE_ENV === "production";

  // En Vercel o producción, usar directorio temporal de Linux
  if (isVercel || isProduction) {
    return "/tmp/dossiers";
  }

  // En desarrollo local (Windows), usar la carpeta de documentos del usuario
  const documentsDir = path.join(os.homedir(), "Documents");
  return path.join(documentsDir, "Dossiers_Personalizados_PlayaViva");
};

export type ResolvedS3Config = {
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

const normalizeBucketName = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/(^\/+|\/+$)/g, "");
  if (!trimmed) return undefined;
  return trimmed
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
};

const splitEndpoint = (rawEndpoint?: string, bucket?: string) => {
  if (!rawEndpoint) {
    return { endpoint: undefined, bucket };
  }

  try {
    const url = new URL(rawEndpoint);

    // Path-style endpoint e.g. https://s3.example.com/my-bucket
    if (!bucket && url.pathname && url.pathname !== "/") {
      const [firstSegment] = url.pathname
        .replace(/^\/+/, "")
        .split("/");
      if (firstSegment) {
        return {
          endpoint: `${url.protocol}//${url.host}`,
          bucket: firstSegment,
        };
      }
    }

    // Virtual-hosted-style endpoint e.g. https://my-bucket.s3.amazonaws.com
    if (!bucket) {
      const hostParts = url.hostname.split(".");
      if (hostParts.length > 3) {
        const [maybeBucket, ...rest] = hostParts;
        return {
          endpoint: `${url.protocol}//${rest.join(".")}${
            url.port ? `:${url.port}` : ""
          }`,
          bucket: maybeBucket,
        };
      }
    }

    return {
      endpoint: rawEndpoint,
      bucket,
    };
  } catch {
    return {
      endpoint: rawEndpoint,
      bucket,
    };
  }
};

export const resolveS3Config = (): ResolvedS3Config => {
  const rawEndpoint = process.env.S3_Endpoint ?? process.env.S3_ENDPOINT;
  const bucketEnv =
    process.env.S3_Bucket ??
    process.env.S3_BUCKET ??
    process.env.S3_BUCKET_NAME;

  const { endpoint, bucket } = splitEndpoint(
    rawEndpoint,
    normalizeBucketName(bucketEnv),
  );

  return {
    endpoint,
    bucket,
    region: process.env.S3_Region_Code ?? process.env.S3_REGION_CODE,
    accessKeyId:
      process.env.S3_Access_Key_ID ?? process.env.S3_ACCESS_KEY_ID,
    secretAccessKey:
      process.env.S3_Secret_Access_Key ??
      process.env.S3_SECRET_ACCESS_KEY,
  };
};

export const isS3Enabled = (config?: ResolvedS3Config) => {
  const resolved = config ?? resolveS3Config();
  return Boolean(
    resolved.endpoint &&
      resolved.bucket &&
      resolved.region &&
      resolved.accessKeyId &&
      resolved.secretAccessKey,
  );
};

export const shouldUseS3Storage = (config?: ResolvedS3Config) => {
  const resolved = config ?? resolveS3Config();
  const disabled =
    (process.env.DISABLE_S3_STORAGE ?? "").toLowerCase() === "true";
  if (disabled) return false;

  const enabled =
    (process.env.FORCE_S3_STORAGE ?? "").toLowerCase() === "true";
  const hasConfig = isS3Enabled(resolved);
  if (enabled) return hasConfig;

  const runningOnVercel = Boolean(process.env.VERCEL);
  const nodeEnv = (process.env.NODE_ENV ?? "").toLowerCase();
  const runningInProduction = nodeEnv === "production";

  if (!hasConfig) return false;
  if (runningOnVercel || runningInProduction) {
    return true;
  }

  return false;
};
