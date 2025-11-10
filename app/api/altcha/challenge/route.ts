import { NextResponse } from "next/server";
import { createAltchaChallenge } from "@/lib/altcha";

const ALTCHA_SECRET = process.env.ALTCHA_SECRET;
const ALTCHA_CHALLENGE_TTL = Number(
  process.env.ALTCHA_CHALLENGE_TTL ?? 5 * 60,
);

if (!ALTCHA_SECRET) {
  console.warn(
    "[ALTCHA] ALTCHA_SECRET is not configured. Challenge endpoint will fail.",
  );
}

export async function GET() {
  if (!ALTCHA_SECRET) {
    return NextResponse.json(
      { error: "ALTCHA secret not configured" },
      { status: 500 },
    );
  }

  try {
    const challenge = createAltchaChallenge(ALTCHA_SECRET, {
      ttlSeconds: ALTCHA_CHALLENGE_TTL,
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("[ALTCHA] Failed to create challenge:", error);
    return NextResponse.json(
      { error: "Failed to create ALTCHA challenge" },
      { status: 500 },
    );
  }
}
