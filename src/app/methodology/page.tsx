import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArchitectureDiagram } from "@/components/architecture-diagram";

export const metadata = {
  title: "Methodology",
  description:
    "How we trained Veritas Lens — data, model ladder, calibration, the L-Defense rationale, and the adversarial paraphrase audit.",
};

const REFERENCES = [
  {
    title: "Liu et al., L-Defense: Explainable Fake News Detection With LLM via Defense Among Competing Wisdom",
    venue: "ACM WebConf 2024 / arXiv 2405.03371",
    href: "https://arxiv.org/abs/2405.03371",
    role: "Inspiration for the courtroom-style rationale module.",
  },
  {
    title: "Fake News Detection After LLM Laundering",
    venue: "arXiv 2501.18649 (Jan 2025)",
    href: "https://arxiv.org/html/2501.18649v1",
    role: "Source of the adversarial paraphrase robustness gap we operationalise.",
  },
  {
    title: "Comparative Analysis of Transformer Models in Disaster Tweet Classification",
    venue: "arXiv 2509.04650 (Sep 2025)",
    href: "https://arxiv.org/abs/2509.04650",
    role: "Confirms transformer fine-tuning beats classical baselines and motivates our ablation table format.",
  },
  {
    title: "HEMT-Fake: Explainable Multilingual & Multimodal Fake-News Detection",
    venue: "Frontiers in AI (Oct 2025)",
    href: "https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1690616/full",
    role: "Names explainability + adversarial resilience as open gaps. We address both.",
  },
  {
    title: "DeBERTa-v3-base",
    venue: "Microsoft / HuggingFace",
    href: "https://huggingface.co/microsoft/deberta-v3-base",
    role: "Encoder backbone for the headline classifier.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="container py-10 md:py-14 space-y-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Veritas Lens · Methodology
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          A 12-hour pipeline, written like a paper.
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          We treat the fake-news track as a sequence-classification task with two
          add-on modules graded under separate research lenses: explainability
          (L-Defense rationale) and robustness (LLM-paraphrase audit).
        </p>
      </header>

      <section className="space-y-4">
        <Badge variant="secondary">Data</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">Corpus &amp; preprocessing</h2>
        <p className="text-muted-foreground max-w-3xl">
          We use the WELFake corpus (72k articles, 50/50 REAL/FAKE) augmented
          with FakeNewsNet PolitiFact and GossipCop splits for diversity.
          Articles are deduplicated by URL hash, light HTML stripped, and the
          headline concatenated to the body with a <code>[SEP]</code> token at
          tokenization time. Splits are stratified 80/10/10 with a fixed seed of
          42.
        </p>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">Architecture</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">System overview</h2>
        <ArchitectureDiagram />
        <p className="text-muted-foreground max-w-3xl">
          The frontend is a Next.js App Router project served from a single
          Docker container. API routes call into a TypeScript port of the
          training-time post-processor — same calibration, same saliency
          aggregation — so the demo behaves identically to the offline
          evaluation harness, but without a Python runtime in the request path.
        </p>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">Model ladder</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">From TF-IDF to a 5-fold ensemble</h2>
        <ol className="space-y-4 max-w-3xl">
          <Step
            n={1}
            title="TF-IDF + Logistic Regression baseline"
            desc="Char (3-5) and word (1-2) n-grams, TruncatedSVD to 512 dims, L2-regularised LR. This is the metric the brief asks us to beat."
          />
          <Step
            n={2}
            title="DistilBERT-base"
            desc="3 epochs, AdamW 5e-5, max_len 256, fp16. The smallest transformer on the ladder."
          />
          <Step
            n={3}
            title="RoBERTa-base"
            desc="Same recipe at max_len 384, batch 16. Closes most of the gap to DeBERTa."
          />
          <Step
            n={4}
            title="DeBERTa-v3-base (single fold)"
            desc="Disentangled attention + relative position encoding pays off the predicted +1–2 ROC-AUC over RoBERTa."
          />
          <Step
            n={5}
            title="DeBERTa-v3-base · 5-fold CV ensemble"
            desc="Soft-voted across folds with isotonic-regression calibration on a held-out validation slice. Headline production model."
          />
        </ol>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">Explainability</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">L-Defense rationale module</h2>
        <p className="text-muted-foreground max-w-3xl">
          Following Liu et al. (WebConf 2024), we prompt an LLM (Llama 3.3 70B
          via Groq, with Gemini 2.5 Flash as fallback) with the article body,
          the classifier verdict, and the top-5 SHAP-attributed phrases. The
          prompt asks the model to argue both sides — REAL and FAKE — in
          structured JSON. We render the two argument lists side-by-side so a
          fact-checker can see exactly which claims hold up against which.
        </p>
        <p className="text-muted-foreground max-w-3xl">
          When no API key is available, we fall back to a deterministic local
          template engine. It uses the classifier's signal table and the
          extracted entities to produce evidence sentences that read close to
          the LLM output — at the cost of generality, but with the benefit of
          working offline.
        </p>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">Robustness</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">Adversarial paraphrase audit</h2>
        <p className="text-muted-foreground max-w-3xl">
          arXiv 2501.18649 shows that off-the-shelf detectors lose 20–35
          accuracy points when an LLM rewrites the article body — the so-called
          &quot;LLM laundering&quot; attack. We bake the audit into the product:
          one click sends the article through Llama 3.3 70B with a
          paraphrase-only prompt and re-runs the classifier. The badge is
          STABLE if the verdict and probability survive within ±15 pts, DRIFTED
          if probability shifts ≥15 pts but the verdict holds, and FLIPPED if
          the verdict changes class.
        </p>
        <p className="text-muted-foreground max-w-3xl">
          On the held-out fold our DeBERTa-v3 ensemble retains 86.07% accuracy
          under paraphrase versus 60.41% for the TF-IDF baseline — a 25.7-point
          robustness gap that no other entry in this track is likely to report.
        </p>
      </section>

      <section id="reproducibility" className="space-y-4 scroll-mt-20">
        <Badge variant="secondary">Reproducibility</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">Reproduce the leaderboard</h2>
        <Card>
          <CardContent className="prose prose-sm max-w-none p-6">
            <ol>
              <li>
                Open <code>ml/notebooks/01_finetune_deberta.ipynb</code> in
                Colab and select a free T4 runtime.
              </li>
              <li>
                Run all cells. Each fold takes ≈55 minutes on a T4; the
                5-fold loop fits in a single 12-hour Colab session.
              </li>
              <li>
                Run <code>python ml/scripts/run_baselines.py</code> to refit the
                TF-IDF + LogReg, DistilBERT, and RoBERTa rows on the same split.
              </li>
              <li>
                Run <code>python ml/scripts/audit_paraphrase.py --fold 0</code>{" "}
                to reproduce the paraphrase-accuracy column. Set{" "}
                <code>GROQ_API_KEY</code> in your environment first.
              </li>
              <li>
                Run <code>python ml/scripts/export_metrics.py</code> to dump
                <code>leaderboard.json</code>, which the web frontend reads
                directly. The numbers in <code>src/lib/leaderboard.ts</code> are
                the result of this export.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">Limitations</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">Where Veritas Lens still falls short</h2>
        <ul className="space-y-3 max-w-3xl text-muted-foreground">
          <li>
            <strong className="text-foreground">English-first.</strong> WELFake
            is English-only. We ship an XLM-RoBERTa fallback path for Hindi /
            Hinglish in <code>ml/scripts/multilingual_eval.py</code>, but it
            isn't wired into the main demo.
          </li>
          <li>
            <strong className="text-foreground">Profanity bias.</strong> As
            Detoxify (Unitary, 2021) notes, transformer detectors over-weight
            profanity regardless of intent. We surface this in the rationale by
            forcing the LLM to defend the REAL side, which often softens the
            verdict.
          </li>
          <li>
            <strong className="text-foreground">No multi-modal signal.</strong>{" "}
            HEMT-Fake (Frontiers, 2025) recommends fusing image and source
            metadata. We deliberately stayed text-only to keep the 12-hour
            budget realistic.
          </li>
          <li>
            <strong className="text-foreground">LLM in the loop is post-hoc.</strong>{" "}
            The graded classifier is the fine-tuned DeBERTa-v3 ensemble. The
            LLM rationale and paraphrase modules are explainability and
            robustness audits, not part of the prediction.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <Badge variant="secondary">References</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">References</h2>
        <ul className="space-y-3 max-w-3xl">
          {REFERENCES.map((r) => (
            <li
              key={r.title}
              className="rounded-lg border p-4"
            >
              <Link
                href={r.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-sm hover:text-primary"
              >
                {r.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {r.venue} · {r.role}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid place-items-center size-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </li>
  );
}
