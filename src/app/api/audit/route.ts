import { NextResponse } from "next/server";
import { classifyLocal } from "@/lib/classifier";
import { paraphraseLocal, paraphraseViaGroq } from "@/lib/rationale";

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

    const original = classifyLocal(body.title, body.body);

    const groqKey = req.headers.get("x-user-groq-key") || "";
    let paraphrasedBody: string;
    let paraphraseSource: string;

    if (groqKey) {
      const live = await paraphraseViaGroq(groqKey, body.title, body.body);
      if (live) {
        paraphrasedBody = live;
        paraphraseSource = "groq · llama-3.3-70b";
      } else {
        paraphrasedBody = paraphraseLocal(body.body);
        paraphraseSource = "local-paraphraser (groq fallback)";
      }
    } else {
      paraphrasedBody = paraphraseLocal(body.body);
      paraphraseSource = "local-paraphraser";
    }

    const paraphrased = classifyLocal(body.title, paraphrasedBody);
    const flipped = original.label !== paraphrased.label;
    const probabilityDelta = paraphrased.probability - original.probability;

    let badge: "STABLE" | "DRIFTED" | "FLIPPED";
    if (flipped) badge = "FLIPPED";
    else if (Math.abs(probabilityDelta) > 0.15) badge = "DRIFTED";
    else badge = "STABLE";

    return NextResponse.json({
      original: {
        label: original.label,
        probability: original.probability,
        confidence: original.confidence,
      },
      paraphrased: {
        label: paraphrased.label,
        probability: paraphrased.probability,
        confidence: paraphrased.confidence,
      },
      paraphrasedBody,
      flipped,
      probabilityDelta,
      badge,
      paraphraseSource,
      cite: "arXiv 2501.18649 — Fake News Detection After LLM Laundering",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Adversarial audit failed.", detail: String(err) },
      { status: 500 }
    );
  }
}
