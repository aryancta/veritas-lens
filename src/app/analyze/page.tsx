import { Analyzer } from "@/components/analyzer";

export const metadata = {
  title: "Analyze an article",
  description:
    "Paste a news article and receive a calibrated REAL/FAKE verdict, an L-Defense rationale, token-level highlights, and an adversarial robustness audit.",
};

export default function AnalyzePage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="space-y-2 mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Veritas Lens · Analyzer
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Paste an article. Defend the verdict.
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          The classifier returns in under 3 seconds with a calibrated confidence
          score, highlighted suspicious phrases, a courtroom-style L-Defense
          rationale, and an optional adversarial robustness audit.
        </p>
      </div>
      <Analyzer />
    </div>
  );
}
