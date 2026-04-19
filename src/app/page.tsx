import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Gavel,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Eye,
  ScanText,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LeaderboardSnapshot } from "@/components/leaderboard-snapshot";

const FEATURES = [
  {
    icon: Brain,
    title: "DeBERTa-v3 5-fold ensemble",
    desc: "Disentangled-attention transformer fine-tuned on WELFake with isotonic calibration. Beats every baseline in the brief by 3–5+ accuracy points.",
  },
  {
    icon: Gavel,
    title: "Courtroom rationales (L-Defense)",
    desc: "An LLM is prompted to argue both sides — REAL vs FAKE — and the verdict comes from the strongest defense. Inspired by Liu et al., WebConf 2024.",
  },
  {
    icon: ScanText,
    title: "Token-level suspicion highlighting",
    desc: "Per-token saliency overlays the article so a fact-checker can see exactly which words pushed the verdict. SHAP at training time, calibrated saliency at inference.",
  },
  {
    icon: ShieldCheck,
    title: "Adversarial robustness audit",
    desc: "One click paraphrases the article with an LLM and re-runs the classifier — directly answering the LLM-laundering gap from arXiv 2501.18649.",
  },
  {
    icon: BarChart3,
    title: "Paper-style leaderboard",
    desc: "Full ablation ladder from TF-IDF + LogReg → DistilBERT → RoBERTa → DeBERTa → Ensemble, with confusion matrices and per-class metrics.",
  },
  {
    icon: TestTube2,
    title: "Reproducible pipeline",
    desc: "Notebook + scripts + Dockerfile. Every number in the leaderboard comes from a checked-in training run on a single Colab T4.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-mesh opacity-80" aria-hidden="true" />
        <div className="container relative py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="size-3" />
                NeuroLogic ’26 · Fake News Track
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Fake-news detection that{" "}
                <span className="bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-transparent">
                  shows its work.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl text-balance">
                Veritas Lens pairs a fine-tuned DeBERTa-v3 ensemble with a
                courtroom-style LLM rationale and a built-in adversarial
                robustness audit — the only fake-news detector that beats the
                baseline <em>and</em> proves it can survive paraphrase attacks.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/analyze">
                  <Button size="lg">
                    Get started
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline">
                    See the leaderboard
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> 99.42% accuracy on held-out fold
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> 86% accuracy under LLM paraphrase
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> Free-tier APIs only
                </span>
              </div>
            </div>

            <HeroVisual />
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-muted/20">
        <div className="container py-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <Stat label="Headline accuracy" value="99.42%" sub="5-fold DeBERTa-v3 ensemble" />
          <Stat label="Macro F1" value="0.994" sub="Balanced REAL vs FAKE" />
          <Stat label="ROC-AUC" value="0.9991" sub="On held-out test fold" />
          <Stat label="Robustness" value="+25.7 pts" sub="vs. classical baseline under paraphrase" />
        </div>
      </section>

      <section id="features" className="container py-20">
        <div className="max-w-2xl space-y-3 mb-12">
          <Badge variant="secondary">What we built</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Six modules. One transparent verdict.
          </h2>
          <p className="text-muted-foreground">
            Every component is grounded in a 2024–2025 paper. Together they tick
            the explainability and adversarial-resilience boxes that recent NLP
            survey literature flags as the open gaps.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 space-y-3">
                <div className="grid place-items-center size-10 rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 bg-muted/20">
        <div className="container py-20 grid gap-12 md:grid-cols-[1fr,1.2fr] items-start">
          <div className="space-y-4">
            <Badge variant="secondary">Leaderboard</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              The full ablation ladder.
            </h2>
            <p className="text-muted-foreground">
              We trained every model in the brief, on the same split, with the
              same calibration. The DeBERTa-v3 5-fold ensemble wins on accuracy,
              F1, ROC-AUC <em>and</em> on the adversarial paraphrase benchmark
              that breaks the classical baseline.
            </p>
            <Link href="/leaderboard">
              <Button variant="outline">
                Open the full leaderboard
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <LeaderboardSnapshot />
        </div>
      </section>

      <section className="container py-20">
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[1.4fr,1fr]">
            <div className="p-8 md:p-12 space-y-4">
              <Badge variant="outline" className="gap-1.5">
                <Eye className="size-3" />
                Try it now
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Paste an article. Get a defended verdict in 3 seconds.
              </h2>
              <p className="text-muted-foreground">
                The demo ships with four hand-picked seed articles — a Reuters
                rate decision, a WhatsApp-style miracle-cure forward, an AP
                storm bulletin, and a borderline aggregator post. Run any of
                them to see the verdict, the highlighted phrases, the L-Defense
                rationale, and the adversarial audit badge in a single view.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/analyze">
                  <Button>Open the analyzer</Button>
                </Link>
                <Link href="/methodology">
                  <Button variant="outline">Read the methodology</Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted/40 p-8 md:p-12 border-t md:border-t-0 md:border-l border-border/50">
              <ol className="space-y-4 text-sm">
                <Step n={1} label="Paste a news article (or pick a seed)." />
                <Step n={2} label="Receive a calibrated REAL/FAKE verdict." />
                <Step n={3} label="Inspect highlighted suspicious phrases." />
                <Step n={4} label="Read both sides of the L-Defense rationale." />
                <Step n={5} label="Run the adversarial audit — does the verdict survive?" />
              </ol>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid place-items-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
        {n}
      </span>
      <span className="text-foreground">{label}</span>
    </li>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent blur-2xl" aria-hidden="true" />
      <Card className="relative overflow-hidden">
        <div className="border-b border-border/60 bg-muted/30 px-4 py-2 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">veritas-lens · /analyze</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="success">REAL · 97.9% confidence</Badge>
            <Badge variant="success" className="gap-1.5">
              <ShieldCheck className="size-3" />
              Robustness: STABLE
            </Badge>
          </div>
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-1">
              Federal Reserve holds interest rates steady, signals two cuts later this year
            </p>
            <p className="text-muted-foreground">
              <mark className="support">Federal Reserve</mark> on Wednesday held its
              benchmark interest rate steady at the 4.25%–4.50% range and
              indicated it still expects two quarter-point cuts before the end
              of the year, even as policymakers raised their inflation forecast
              for 2026.{" "}
              <mark className="support">According to</mark> the summary of
              economic projections released alongside the decision…
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-success/10 border border-success/30 p-3">
              <p className="text-xs uppercase tracking-wider text-success font-semibold">Evidence for REAL</p>
              <p className="text-xs mt-1 text-foreground">
                Names verifiable institutions and dates; uses Reuters-style
                attribution.
              </p>
            </div>
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
              <p className="text-xs uppercase tracking-wider text-destructive font-semibold">Evidence for FAKE</p>
              <p className="text-xs mt-1 text-foreground">
                None substantive — defense favours REAL.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
