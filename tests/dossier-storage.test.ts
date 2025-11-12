import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getLocalDossierDir,
  resolveS3Config,
  isS3Enabled,
  shouldUseS3Storage,
} from "../lib/dossier-storage";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe("getLocalDossierDir", () => {
  it("returns /tmp/dossiers when running on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    expect(getLocalDossierDir()).toBe("/tmp/dossiers");
  });

  it("falls back to Documents/Dossiers_Personalizados_PlayaViva locally", () => {
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
    vi.stubEnv("S3_BUCKET_NAME", "Bespoke Bucket 01");
    const config = resolveS3Config();
    expect(config.bucket).toBe("bespoke-bucket-01");
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

describe("shouldUseS3Storage", () => {
  const seedValidConfig = () => {
    vi.stubEnv("S3_Endpoint", "https://storage.example.com/bucket");
    vi.stubEnv("S3_Region_Code", "eu-west-3");
    vi.stubEnv("S3_Access_Key_ID", "key");
    vi.stubEnv("S3_Secret_Access_Key", "secret");
  };

  it("returns false locally even with config", () => {
    seedValidConfig();
    expect(shouldUseS3Storage()).toBe(false);
  });

  it("returns true on Vercel when config exists", () => {
    seedValidConfig();
    vi.stubEnv("VERCEL", "1");
    expect(shouldUseS3Storage()).toBe(true);
  });

  it("respects FORCE_S3_STORAGE override", () => {
    seedValidConfig();
    vi.stubEnv("FORCE_S3_STORAGE", "true");
    expect(shouldUseS3Storage()).toBe(true);
  });

  it("respects DISABLE_S3_STORAGE override", () => {
    seedValidConfig();
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("DISABLE_S3_STORAGE", "true");
    expect(shouldUseS3Storage()).toBe(false);
  });
});
