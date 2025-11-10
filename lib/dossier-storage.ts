import os from "os";
import path from "path";

const DEFAULT_WINDOWS_USER =
  process.env.USERPROFILE ??
  path.join("C:", "Users", "Usuario");

const documentsDir =
  process.platform === "win32"
    ? path.join(DEFAULT_WINDOWS_USER, "Documents")
    : path.join(os.homedir(), "Documents");

const DEFAULT_LOCAL_DIR = path.join(
  documentsDir,
  "Dossiers_Personalizados_PlayaViva",
);

export const getLocalDossierDir = () =>
  process.env.DOSSIER_LOCAL_DIR ?? DEFAULT_LOCAL_DIR;

type ResolvedS3Config = {
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

const sanitizeBucketName = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/(^\/+|\/+$)/g, "");
  return trimmed || undefined;
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
    sanitizeBucketName(bucketEnv),
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

export const isS3Enabled = () => {
  const config = resolveS3Config();
  return Boolean(
    config.endpoint &&
      config.bucket &&
      config.region &&
      config.accessKeyId &&
      config.secretAccessKey,
  );
};
