import { NextResponse } from "next/server";
import { classifyLocal } from "@/lib/classifier";
import {
  buildLocalRationale,
  generateRationaleViaGroq,
} from "@/lib/rationale";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.title !== "string" || typeof body.body !== "string") {
      return NextResponse.json(
        { error: "Request body must include `title` and `body`." },
        { status: 400 }
      );
    }
    const result = classifyLocal(body.title || "(no title)", body.body || "(no body)");

    const groqKey = req.headers.get("x-user-groq-key") || "";
    if (groqKey) {
      const live = await generateRationaleViaGroq(
        groqKey,
        body.title,
        body.body,
        result
      );
      if (live) {
        return NextResponse.json({ rationale: live, backend: "groq" });
      }
    }
    const rationale = buildLocalRationale(body.title, body.body, result);
    return NextResponse.json({
      rationale,
      backend: "local-l-defense",
      message: groqKey
        ? "Groq returned an error or rate limit — falling back to the local L-Defense rationale engine."
        : "No Groq key supplied — using the deterministic local L-Defense rationale engine.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Rationale generation failed.", detail: String(err) },
      { status: 500 }
    );
  }
}
