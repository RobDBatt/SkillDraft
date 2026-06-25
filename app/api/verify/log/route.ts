import { NextRequest, NextResponse } from "next/server";
import { recordVerifyEvent } from "@/lib/verifyEvents";

export const runtime = "nodejs";

/**
 * Append-only logging of /verify *page* runs. Accepts pre-computed anonymous
 * metadata (never skill content) and records it for the in-app /stats view.
 * Fire-and-forget from the client; always returns quickly.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  await recordVerifyEvent({
    source: "web",
    score: Number(body.score) || 0,
    passed: Boolean(body.passed),
    band: String(body.band ?? ""),
    flaggedFor: body.flaggedFor == null ? null : String(body.flaggedFor),
    hasFrontmatter: Boolean(body.hasFrontmatter),
    lengthBand: String(body.length ?? body.lengthBand ?? "unknown"),
  });

  return new NextResponse(null, { status: 204 });
}
