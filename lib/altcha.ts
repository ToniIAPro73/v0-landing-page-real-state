import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";

const DEFAULT_ALGORITHM = "SHA-256";
const DEFAULT_MAX_NUMBER = 1_000_000;
const DEFAULT_TTL_SECONDS = 5 * 60;

export type AltchaChallenge = {
  algorithm: string;
  challenge: string;
  salt: string;
  signature: string;
};

export type AltchaPayload = {
  algorithm: string;
  challenge: string;
  number: number;
  salt: string;
  signature: string;
  test?: boolean;
  took?: number;
};

type ChallengeOptions = {
  algorithm?: string;
  ttlSeconds?: number;
  maxNumber?: number;
};

const SALT_SEPARATOR = "?";

function buildSalt(ttlSeconds: number) {
  const entropy = randomBytes(16).toString("hex");
  const expiresAt = Math.floor((Date.now() + ttlSeconds * 1000) / 1000);
  return `${entropy}${SALT_SEPARATOR}expires=${expiresAt}`;
}

function hashValue(algorithm: string, value: string) {
  const normalizedAlgorithm = algorithm.toLowerCase().replace(/-/g, "");
  return createHash(normalizedAlgorithm).update(value).digest("hex");
}

function computeSignature(
  hmacKey: string,
  payload: string,
) {
  return createHmac("sha256", hmacKey).update(payload).digest("hex");
}

export function createAltchaChallenge(
  hmacKey: string,
  options: ChallengeOptions = {},
): AltchaChallenge {
  const algorithm = options.algorithm ?? DEFAULT_ALGORITHM;
  const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const maxNumber = options.maxNumber ?? DEFAULT_MAX_NUMBER;

  const salt = buildSalt(ttlSeconds);
  const number = randomInt(0, maxNumber);
  const challenge = hashValue(algorithm, `${salt}${number}`);
  const signature = computeSignature(hmacKey, `${challenge}:${salt}`);

  return {
    algorithm,
    challenge,
    salt,
    signature,
  };
}

function parsePayload(rawPayload: string): AltchaPayload | null {
  try {
    const decoded = Buffer.from(rawPayload, "base64").toString("utf8");
    const data = JSON.parse(decoded) as AltchaPayload;

    if (
      typeof data.algorithm !== "string" ||
      typeof data.challenge !== "string" ||
      typeof data.salt !== "string" ||
      typeof data.signature !== "string" ||
      typeof data.number !== "number"
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function extractExpires(salt: string): number | null {
  const [, query = ""] = salt.split(SALT_SEPARATOR);
  if (!query) {
    return null;
  }

  const params = new URLSearchParams(query);
  const expires = Number(params.get("expires") ?? params.get("expire"));

  if (!Number.isFinite(expires)) {
    return null;
  }

  return expires;
}

function safeEqual(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export function verifyAltchaPayload(
  payload: string,
  hmacKey: string,
  options: { maxSkewSeconds?: number } = {},
) {
  const parsed = parsePayload(payload);
  if (!parsed) {
    return false;
  }

  const algorithm = parsed.algorithm?.toUpperCase() ?? DEFAULT_ALGORITHM;
  if (algorithm !== DEFAULT_ALGORITHM) {
    return false;
  }

  const expires = extractExpires(parsed.salt);
  if (!expires) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxSkew = options.maxSkewSeconds ?? 5;
  if (expires + maxSkew < nowSeconds) {
    return false;
  }

  const expectedChallenge = hashValue(
    algorithm,
    `${parsed.salt}${parsed.number}`,
  );
  if (!safeEqual(expectedChallenge, parsed.challenge)) {
    return false;
  }

  const expectedSignature = computeSignature(
    hmacKey,
    `${parsed.challenge}:${parsed.salt}`,
  );
  return safeEqual(expectedSignature, parsed.signature);
}
