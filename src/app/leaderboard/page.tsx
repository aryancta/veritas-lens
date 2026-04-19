import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LEADERBOARD,
  ABLATIONS,
  CONFUSION_MATRIX,
  PER_CLASS_METRICS,
} from "@/lib/leaderboard";
import { ConfusionMatrix } from "@/components/confusion-matrix";
import { Trophy, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Leaderboard",
  description:
    "Full ablation ladder from TF-IDF + LogReg through to a 5-fold DeBERTa-v3 ensemble, with confusion matrix and adversarial paraphrase metrics.",
};

export default function LeaderboardPage() {
  return (
    <div className="container py-10 md:py-14 space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Veritas Lens · Leaderboard
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Five models. One held-out fold. One winner.
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Every row was trained on the same 80/20 stratified split, with the
          same preprocessing and the same calibration head. Headline metric is
          accuracy on the held-out fold; <em>Paraphrase</em> is accuracy after
          re-classifying an LLM-paraphrased copy of every test article (our
          implementation of the arXiv 2501.18649 robustness benchmark).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-warning" />
            Final leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left p-3">Model</th>
                  <th className="text-right p-3">Acc</th>
                  <th className="text-right p-3">F1</th>
                  <th className="text-right p-3">ROC-AUC</th>
                  <th className="text-right p-3">Paraphrase</th>
                  <th className="text-left p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((row) => (
                  <tr
                    key={row.model}
                    className={cn(
                      "border-t border-border/50 align-top",
                      row.highlight && "bg-success/5"
                    )}
                  >
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2 flex-wrap">
                        {row.model}
                        {row.highlight && (
                          <Badge variant="success">Headline</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.family} · {row.params} params
                      </p>
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {(row.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {row.f1.toFixed(4)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {row.rocAuc.toFixed(4)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {(row.paraphraseAccuracy * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-muted-foreground text-sm max-w-md">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Confusion matrix · headline model</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfusionMatrix matrix={CONFUSION_MATRIX} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-class metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left p-3">Class</th>
                  <th className="text-right p-3">Precision</th>
                  <th className="text-right p-3">Recall</th>
                  <th className="text-right p-3">F1</th>
                  <th className="text-right p-3">Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PER_CLASS_METRICS).map(([k, v]) => (
                  <tr key={k} className="border-t border-border/50">
                    <td className="p-3 font-medium">{k}</td>
                    <td className="p-3 text-right tabular-nums">
                      {v.precision.toFixed(4)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {v.recall.toFixed(4)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {v.f1.toFixed(4)}
                    </td>
                    <td className="p-3 text-right tabular-nums">{v.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ablations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ABLATIONS.map((a) => (
            <div
              key={a.name}
              className="rounded-lg border p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-medium text-sm">{a.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.detail}</p>
              </div>
              <Badge
                variant={a.delta < 0 ? "destructive" : a.delta > 0 ? "success" : "outline"}
                className="font-mono shrink-0"
              >
                {a.delta === 0 ? "±0.0000" : `${a.delta > 0 ? "+" : ""}${a.delta.toFixed(4)}`}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reproducing these numbers</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            The training scripts live in <code>ml/</code>. The headline run is{" "}
            <code>ml/notebooks/01_finetune_deberta.ipynb</code>; ablation rows are
            produced by <code>ml/scripts/run_baselines.py</code>. The seed is fixed
            at 42, the optimizer is AdamW (lr 2e-5, cosine schedule, warmup 6%),
            batch size 16 with fp16, 3 epochs, max_len 384.
          </p>
          <p>
            The paraphrase column comes from <code>ml/scripts/audit_paraphrase.py</code>,
            which loops through the held-out fold, asks Llama 3.3 70B (Groq) to
            paraphrase each article, and re-runs the classifier. We report the
            accuracy on the paraphrased copies — the metric the LLM-laundering
            paper recommends.
          </p>
          <p>
            Full instructions, including the Colab T4 budget, live in the{" "}
            <Link href="/methodology#reproducibility" className="not-prose">
              <span className="inline-flex items-center gap-1 underline">
                Methodology page <ArrowUpRight className="size-3" />
              </span>
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
