import { NextResponse } from "next/server";
import { classifyLocal } from "@/lib/classifier";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.title !== "string" || typeof body.body !== "string") {
      return NextResponse.json(
        { error: "Request body must include `title` (string) and `body` (string)." },
        { status: 400 }
      );
    }
    const title = body.title.trim();
    const text = body.body.trim();
    if (!title && !text) {
      return NextResponse.json(
        { error: "At least one of `title` or `body` must be non-empty." },
        { status: 400 }
      );
    }

    const result = classifyLocal(title || "(no title)", text || "(no body)");
    return NextResponse.json({
      result,
      backend: "veritas-lens-local",
      message:
        "Veritas Lens local L-Defense scorer. Add a Hugging Face Inference key in Settings to route through the fine-tuned DeBERTa-v3 ensemble.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected classifier failure.", detail: String(err) },
      { status: 500 }
    );
  }
}
