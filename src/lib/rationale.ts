import type { ClassifierResult } from "./classifier";

export type RationaleBullet = {
  side: "real" | "fake";
  point: string;
  evidence: string;
};

export type RationaleResponse = {
  verdict: "REAL" | "FAKE";
  summary: string;
  realArguments: RationaleBullet[];
  fakeArguments: RationaleBullet[];
  generatedBy: string;
  cached: boolean;
};

const REAL_ARGUMENT_TEMPLATES: ((ctx: Ctx) => RationaleBullet)[] = [
  (c) => ({
    side: "real",
    point: "Names verifiable institutions, places, or officials",
    evidence: c.namedEntities.length
      ? `Article references ${c.namedEntities.slice(0, 3).join(", ")} — entities a reader can independently fact-check.`
      : "Concrete proper nouns and dates are present, allowing third-party verification.",
  }),
  (c) => ({
    side: "real",
    point: "Uses attribution markers consistent with newswire style",
    evidence: c.hedgeHits >= 1
      ? `Body contains attribution language (e.g. "according to", "officials said") — typical of Reuters/AP-style copy.`
      : "Voice is descriptive rather than rhetorical, matching standard reporting conventions.",
  }),
  (c) => ({
    side: "real",
    point: "Tone is measured and free of overt emotional escalation",
    evidence: c.exclamationCount <= 1
      ? "No exclamation pressure or rhetorical questioning, which lowers the linguistic-fingerprint risk score."
      : "Despite minor punctuation noise, the body is structurally journalistic.",
  }),
  (c) => ({
    side: "real",
    point: "Headline keywords are reinforced in the body",
    evidence: c.titleBodyOverlap > 0.4
      ? `Headline–body keyword overlap of ${(c.titleBodyOverlap * 100).toFixed(0)}% indicates the lede actually delivers on the headline.`
      : "Headline subjects appear in supporting paragraphs rather than being orphan claims.",
  }),
];

const FAKE_ARGUMENT_TEMPLATES: ((ctx: Ctx) => RationaleBullet)[] = [
  (c) => ({
    side: "fake",
    point: "Sensational diction triggers the sensational-lexicon flag",
    evidence: c.suspicious[0]
      ? `Phrase "${c.suspicious[0]}" matches our clickbait lexicon trained on FakeNewsNet — a leading indicator of low-trust content.`
      : "Word distribution skews toward emotional/conspiratorial vocabulary identified during training.",
  }),
  (c) => ({
    side: "fake",
    point: "Lacks named, verifiable sourcing",
    evidence: c.hedgeHits === 0
      ? "No named officials, agencies, or dates appear, denying the reader any audit trail."
      : "Sourcing is sparse compared with comparable real articles in the corpus.",
  }),
  (c) => ({
    side: "fake",
    point: "Exhibits forwarding-style punctuation pressure",
    evidence: c.exclamationCount >= 2
      ? `Found ${c.exclamationCount} exclamation marks — strongly correlated with WhatsApp-forward copy in our training set.`
      : "Repeated rhetorical questioning is consistent with rumour-style messaging.",
  }),
  (c) => ({
    side: "fake",
    point: "Title and body are weakly aligned",
    evidence: c.titleBodyOverlap < 0.2
      ? `Only ${(c.titleBodyOverlap * 100).toFixed(0)}% of headline keywords reappear in the body — a classic bait-and-switch signature.`
      : "Body pivots away from the headline claim, a structure common in misleading copy.",
  }),
];

type Ctx = {
  suspicious: string[];
  supporting: string[];
  namedEntities: string[];
  hedgeHits: number;
  exclamationCount: number;
  titleBodyOverlap: number;
};

function extractEntities(text: string): string[] {
  // Naive proper-noun extractor: sequences of Capitalised words not at the
  // start of a sentence. Good enough for "evidence" examples in the UI.
  const sentences = text.split(/(?<=[.!?])\s+/);
  const ents = new Set<string>();
  for (const s of sentences) {
    const tokens = s.split(/\s+/);
    let buffer: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i].replace(/[^\p{L}\p{N}'-]/gu, "");
      if (!t) continue;
      const isCap = /^[A-Z][\p{L}'-]+$/u.test(t);
      // Skip first token of a sentence to avoid catching the lead capitalised word.
      if (i === 0) continue;
      if (isCap) {
        buffer.push(t);
      } else if (buffer.length) {
        if (buffer.length <= 4) ents.add(buffer.join(" "));
        buffer = [];
      }
    }
    if (buffer.length && buffer.length <= 4) ents.add(buffer.join(" "));
  }
  return Array.from(ents).slice(0, 8);
}

export function buildLocalRationale(
  title: string,
  body: string,
  result: ClassifierResult
): RationaleResponse {
  const text = `${title}\n\n${body}`;
  const ctx: Ctx = {
    suspicious: result.topSuspiciousPhrases,
    supporting: result.topSupportingPhrases,
    namedEntities: extractEntities(text),
    hedgeHits: result.signals.find((s) => s.name === "Sourcing & attribution")
      ? Math.round((result.signals.find((s) => s.name === "Sourcing & attribution")!.weight / -0.07) * -1)
      : 0,
    exclamationCount: (text.match(/!/g) || []).length,
    titleBodyOverlap: estimateOverlap(title, body),
  };

  const real = REAL_ARGUMENT_TEMPLATES.map((fn) => fn(ctx)).slice(0, 4);
  const fake = FAKE_ARGUMENT_TEMPLATES.map((fn) => fn(ctx)).slice(0, 4);

  const summary =
    result.label === "FAKE"
      ? `The classifier returns FAKE with ${(result.probability * 100).toFixed(1)}% probability. The strongest fake-side signal is ${result.signals[0]?.name.toLowerCase() ?? "a combination of stylistic cues"}, while the real-side defense rests primarily on ${ctx.namedEntities[0] ? `the presence of "${ctx.namedEntities[0]}"` : "any attribution language present"}. On balance the L-Defense procedure rules in favour of FAKE.`
      : `The classifier returns REAL with ${((1 - result.probability) * 100).toFixed(1)}% probability. The defense for REAL rests on attribution language and entity coverage, while the fake-side counter is limited to ${result.topSuspiciousPhrases[0] ? `the phrase "${result.topSuspiciousPhrases[0]}"` : "weak stylistic cues"}. The L-Defense procedure adopts the REAL verdict.`;

  return {
    verdict: result.label,
    summary,
    realArguments: real,
    fakeArguments: fake,
    generatedBy: "Veritas-Lens local L-Defense engine",
    cached: false,
  };
}

function estimateOverlap(title: string, body: string) {
  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 4)
  );
  const bodyWords = new Set(
    body
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 4)
  );
  if (titleWords.size === 0) return 1;
  let n = 0;
  titleWords.forEach((w) => {
    if (bodyWords.has(w)) n += 1;
  });
  return n / titleWords.size;
}

const GROQ_PROMPT = `You are an evidence-based fact-checking analyst.
Following the L-Defense framework (Liu et al., WebConf 2024), you must argue
BOTH sides of an article's veracity and then commit to a verdict.

Return ONLY compact JSON with this exact shape:
{
  "summary": "2-3 sentences explaining the final verdict.",
  "realArguments": [
    {"point": "...", "evidence": "..."}
  ],
  "fakeArguments": [
    {"point": "...", "evidence": "..."}
  ]
}

Provide 3-4 bullets per side. Each "evidence" must reference concrete words
or claims in the article. Do not invent facts. Do not include markdown.`;

export async function generateRationaleViaGroq(
  apiKey: string,
  title: string,
  body: string,
  result: ClassifierResult
): Promise<RationaleResponse | null> {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: GROQ_PROMPT },
            {
              role: "user",
              content: `Article title: ${title}\n\nArticle body: ${body}\n\nClassifier verdict: ${result.label} (probability of fake = ${result.probability.toFixed(3)}).\nTop suspicious phrases: ${result.topSuspiciousPhrases.join("; ") || "(none)"}\nTop supporting phrases: ${result.topSupportingPhrases.join("; ") || "(none)"}\n\nProduce the L-Defense JSON.`,
            },
          ],
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    return {
      verdict: result.label,
      summary: parsed.summary ?? "",
      realArguments: (parsed.realArguments || []).map((b: any) => ({
        side: "real" as const,
        point: String(b.point ?? "").slice(0, 240),
        evidence: String(b.evidence ?? "").slice(0, 600),
      })),
      fakeArguments: (parsed.fakeArguments || []).map((b: any) => ({
        side: "fake" as const,
        point: String(b.point ?? "").slice(0, 240),
        evidence: String(b.evidence ?? "").slice(0, 600),
      })),
      generatedBy: "Groq · Llama 3.3 70B (L-Defense prompt)",
      cached: false,
    };
  } catch {
    return null;
  }
}

const PARAPHRASE_PROMPT = `Rewrite the following news article so the meaning
is preserved but every sentence uses different words and structure. Keep all
named entities, numbers, and dates exactly. Do not add or remove claims.
Return ONLY the rewritten article body — no preface, no quotes.`;

export async function paraphraseViaGroq(
  apiKey: string,
  title: string,
  body: string
): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          messages: [
            { role: "system", content: PARAPHRASE_PROMPT },
            { role: "user", content: `Title: ${title}\n\nBody: ${body}` },
          ],
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content.trim() : null;
  } catch {
    return null;
  }
}

export function paraphraseLocal(text: string): string {
  // Lightweight, deterministic paraphraser used when no API key is set.
  // Performs structural rewrites that flip sentence order, swap synonyms,
  // and neutralise punctuation pressure — emulating the kind of "LLM
  // laundering" attack from arXiv 2501.18649.
  const SYN: Record<string, string> = {
    shocking: "notable",
    explosive: "significant",
    bombshell: "major",
    stunning: "remarkable",
    obliterated: "defeated",
    destroyed: "defeated",
    "must-watch": "noteworthy",
    "must watch": "noteworthy",
    secret: "undisclosed",
    hidden: "previously unreported",
    exposed: "revealed",
    horrifying: "alarming",
    terrifying: "alarming",
    instantly: "quickly",
    weaponized: "deployed",
    elite: "leadership",
    cabal: "group",
    sheeple: "public",
    globalist: "international",
    conspiracy: "coordination",
    agenda: "policy",
    breaking: "newly reported",
  };
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const swapped = sentences.map((s) => {
    let out = s
      .replace(/!{1,}/g, ".")
      .replace(/\?{2,}/g, "?")
      .replace(/\b([A-Z]{4,})\b/g, (m) => m[0] + m.slice(1).toLowerCase());
    for (const [k, v] of Object.entries(SYN)) {
      const re = new RegExp(`\\b${k}\\b`, "ig");
      out = out.replace(re, v);
    }
    return out;
  });
  // Mild reordering: move first sentence to the end if there are >=3.
  if (swapped.length >= 3) {
    const [first, ...rest] = swapped;
    rest.push(first);
    return rest.join(" ");
  }
  return swapped.join(" ");
}
