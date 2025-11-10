import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLocalDossierDir,
  resolveS3Config,
  isS3Enabled,
} from "../lib/dossier-storage";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe("getLocalDossierDir", () => {
  it("returns override when DOSSIER_LOCAL_DIR is set", () => {
    const customPath = path.join("D:", "custom", "folder");
    vi.stubEnv("DOSSIER_LOCAL_DIR", customPath);
    expect(getLocalDossierDir()).toBe(customPath);
  });

  it("falls back to Documents/Dossiers_Personalizados_PlayaViva", () => {
    vi.unstubAllEnvs();
    const result = getLocalDossierDir();
    expect(result.endsWith("Dossiers_Personalizados_PlayaViva")).toBe(true);
  });
});

describe("resolveS3Config", () => {
  it("extracts bucket name from path-style endpoints", () => {
    vi.stubEnv("S3_Endpoint", "https://storage.example.com/my-bucket");
    vi.stubEnv("S3_Region_Code", "eu-west-3");
    vi.stubEnv("S3_Access_Key_ID", "key");
    vi.stubEnv("S3_Secret_Access_Key", "secret");
    const config = resolveS3Config();
    expect(config.bucket).toBe("my-bucket");
    expect(config.endpoint).toBe("https://storage.example.com");
  });

  it("prefers explicit bucket env vars when provided", () => {
    vi.stubEnv("S3_Endpoint", "https://s3.example.com");
    vi.stubEnv("S3_BUCKET_NAME", "bespoke-bucket");
    const config = resolveS3Config();
    expect(config.bucket).toBe("bespoke-bucket");
  });
});

describe("isS3Enabled", () => {
  it("returns false when any required variable is missing", () => {
    vi.unstubAllEnvs();
    expect(isS3Enabled()).toBe(false);
  });

  it("returns true when all required variables are defined", () => {
    vi.stubEnv("S3_Endpoint", "https://storage.example.com/bucket");
    vi.stubEnv("S3_Region_Code", "eu-west-3");
    vi.stubEnv("S3_Access_Key_ID", "key");
    vi.stubEnv("S3_Secret_Access_Key", "secret");
    expect(isS3Enabled()).toBe(true);
  });
});
