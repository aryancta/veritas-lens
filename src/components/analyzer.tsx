"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  Wand2,
  Send,
  Trash2,
  Copy,
  ChevronRight,
  CircleDot,
  Microscope,
  Scale,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useApiKeys, buildAuthHeaders } from "@/lib/use-api-keys";
import { SAMPLE_ARTICLES } from "@/lib/sample-data";
import type { ClassifierResult, ClassifierToken } from "@/lib/classifier";
import type { RationaleResponse } from "@/lib/rationale";
import { cn, formatPercent } from "@/lib/utils";

type ClassifyResponse = {
  result: ClassifierResult;
  backend: string;
  message?: string;
};

type AuditResponse = {
  original: { label: "REAL" | "FAKE"; probability: number; confidence: number };
  paraphrased: { label: "REAL" | "FAKE"; probability: number; confidence: number };
  paraphrasedBody: string;
  flipped: boolean;
  probabilityDelta: number;
  badge: "STABLE" | "DRIFTED" | "FLIPPED";
  paraphraseSource: string;
};

export function Analyzer() {
  const { toast } = useToast();
  const { keys, hydrated } = useApiKeys();

  const [title, setTitle] = React.useState(SAMPLE_ARTICLES[0].title);
  const [body, setBody] = React.useState(SAMPLE_ARTICLES[0].body);

  const [classifying, setClassifying] = React.useState(false);
  const [classification, setClassification] = React.useState<ClassifyResponse | null>(null);

  const [rationaleLoading, setRationaleLoading] = React.useState(false);
  const [rationale, setRationale] = React.useState<RationaleResponse | null>(null);
  const [rationaleBackend, setRationaleBackend] = React.useState<string>("");

  const [auditLoading, setAuditLoading] = React.useState(false);
  const [audit, setAudit] = React.useState<AuditResponse | null>(null);

  const liveLLM = !!keys.groq;

  React.useEffect(() => {
    // Pre-warm the seeded run so first-time visitors don't see an empty state.
    void runFullAnalysis(SAMPLE_ARTICLES[0].title, SAMPLE_ARTICLES[0].body, {
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runFullAnalysis(
    t: string,
    b: string,
    opts: { silent?: boolean } = {}
  ) {
    if (!t.trim() && !b.trim()) {
      toast({
        title: "Nothing to analyze",
        description: "Add a title or paste an article body.",
        variant: "error",
      });
      return;
    }
    setClassifying(true);
    setClassification(null);
    setRationale(null);
    setAudit(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders(keys) },
        body: JSON.stringify({ title: t, body: b }),
      });
      const data: ClassifyResponse | { error: string } = await res.json();
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Classifier failed.");
      }
      setClassification(data);
      if (!opts.silent) {
        toast({
          title: `Verdict: ${data.result.label}`,
          description: `Calibrated probability ${(data.result.probability * 100).toFixed(1)}% · ${data.backend}`,
          variant: data.result.label === "REAL" ? "success" : "info",
        });
      }
      // Auto-fetch rationale
      void fetchRationale(t, b);
    } catch (err) {
      toast({
        title: "Classifier failed",
        description: String((err as Error).message ?? err),
        variant: "error",
      });
    } finally {
      setClassifying(false);
    }
  }

  async function fetchRationale(t: string, b: string) {
    setRationaleLoading(true);
    setRationale(null);
    try {
      const res = await fetch("/api/rationale", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders(keys) },
        body: JSON.stringify({ title: t, body: b }),
      });
      const data = await res.json();
      if (!res.ok || !data.rationale) throw new Error(data.error || "Failed");
      setRationale(data.rationale);
      setRationaleBackend(data.backend);
    } catch (err) {
      toast({
        title: "Rationale failed",
        description: String((err as Error).message ?? err),
        variant: "error",
      });
    } finally {
      setRationaleLoading(false);
    }
  }

  async function runAudit() {
    if (!title.trim() && !body.trim()) {
      toast({
        title: "Nothing to audit",
        description: "Run the classifier first.",
        variant: "error",
      });
      return;
    }
    setAuditLoading(true);
    setAudit(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders(keys) },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok || !data.badge) throw new Error(data.error || "Failed");
      setAudit(data);
      toast({
        title: `Robustness: ${data.badge}`,
        description: data.flipped
          ? "The verdict flipped under LLM paraphrase."
          : `Probability shifted by ${(data.probabilityDelta * 100).toFixed(1)} pts.`,
        variant: data.badge === "STABLE" ? "success" : "info",
      });
    } catch (err) {
      toast({
        title: "Audit failed",
        description: String((err as Error).message ?? err),
        variant: "error",
      });
    } finally {
      setAuditLoading(false);
    }
  }

  function loadSample(id: string) {
    const sample = SAMPLE_ARTICLES.find((s) => s.id === id);
    if (!sample) return;
    setTitle(sample.title);
    setBody(sample.body);
    setClassification(null);
    setRationale(null);
    setAudit(null);
    void runFullAnalysis(sample.title, sample.body);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runFullAnalysis(title, body);
  }

  function clearAll() {
    setTitle("");
    setBody("");
    setClassification(null);
    setRationale(null);
    setAudit(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,1.1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article input</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Paste a news headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Article body</Label>
                <Textarea
                  id="prompt"
                  name="body"
                  placeholder="Paste the article body — full paragraphs work best."
                  className="min-h-[220px] resize-y"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Veritas Lens truncates to the first 384 tokens for live
                  inference (matching the training context window).
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={classifying}>
                  {classifying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={runAudit}
                  disabled={auditLoading || classifying}
                >
                  {auditLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Auditing…
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4" />
                      Run Adversarial Audit
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" onClick={clearAll}>
                  <Trash2 className="size-4" /> Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seed examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAMPLE_ARTICLES.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSample(s.id)}
                className="card group w-full text-left rounded-lg border bg-background p-3 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.source} · {s.note}
                    </p>
                  </div>
                  <Badge
                    variant={
                      s.category === "real"
                        ? "success"
                        : s.category === "fake"
                        ? "destructive"
                        : "warning"
                    }
                    className="shrink-0"
                  >
                    {s.category.toUpperCase()}
                  </Badge>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/0 group-hover:text-muted-foreground absolute opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </CardContent>
        </Card>

        {hydrated && !liveLLM && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm">
            <p className="font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-warning" />
              Demo mode — using local L-Defense engine
            </p>
            <p className="text-muted-foreground mt-1">
              Add a Groq API key in{" "}
              <a href="/settings" className="underline hover:text-foreground">
                Settings
              </a>{" "}
              to route rationales and paraphrases through Llama 3.3 70B (free
              tier).
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <VerdictCard classifying={classifying} classification={classification} />
        <ResultTabs
          classification={classification}
          rationale={rationale}
          rationaleLoading={rationaleLoading}
          rationaleBackend={rationaleBackend}
          audit={audit}
          auditLoading={auditLoading}
          articleBody={body}
        />
      </div>
    </div>
  );
}

function VerdictCard({
  classifying,
  classification,
}: {
  classifying: boolean;
  classification: ClassifyResponse | null;
}) {
  if (classifying) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="h-4 w-32 shimmer rounded" />
          <div className="h-12 w-3/4 shimmer rounded" />
          <div className="h-2 w-full shimmer rounded" />
          <div className="h-2 w-2/3 shimmer rounded" />
        </CardContent>
      </Card>
    );
  }
  if (!classification) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Run the classifier to see a verdict here.
        </CardContent>
      </Card>
    );
  }

  const { result } = classification;
  const isFake = result.label === "FAKE";
  const display = isFake ? result.probability : 1 - result.probability;

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-colors",
        isFake ? "border-destructive/30" : "border-success/30"
      )}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Veritas Lens verdict
            </p>
            <p
              className={cn(
                "text-4xl font-bold tracking-tight",
                isFake ? "text-destructive" : "text-success"
              )}
            >
              {result.label}
              <span className="ml-3 text-xl font-semibold text-foreground/80 tabular-nums">
                {formatPercent(display)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {classification.backend} · {result.modelVersion}
            </p>
          </div>
          <Badge variant={isFake ? "destructive" : "success"} className="text-xs">
            {isFake ? <ShieldX className="size-3" /> : <ShieldCheck className="size-3" />}
            <span className="ml-1">{isFake ? "Likely misleading" : "Likely credible"}</span>
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">P(fake)</span>
            <span className="tabular-nums">{(result.probability * 100).toFixed(2)}%</span>
          </div>
          <Progress
            value={result.probability * 100}
            indicatorClassName={isFake ? "bg-destructive" : "bg-success"}
          />
          <p className="text-xs text-muted-foreground">
            Confidence (distance from 0.5): {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Stat label="Top suspicious cue" value={result.topSuspiciousPhrases[0] || "—"} />
          <Stat label="Top supporting cue" value={result.topSupportingPhrases[0] || "—"} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium mt-1 line-clamp-1">{value}</p>
    </div>
  );
}

function ResultTabs({
  classification,
  rationale,
  rationaleLoading,
  rationaleBackend,
  audit,
  auditLoading,
  articleBody,
}: {
  classification: ClassifyResponse | null;
  rationale: RationaleResponse | null;
  rationaleLoading: boolean;
  rationaleBackend: string;
  audit: AuditResponse | null;
  auditLoading: boolean;
  articleBody: string;
}) {
  return (
    <Tabs defaultValue="highlights" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="highlights">
          <Microscope className="size-3.5 mr-1.5" />
          Highlights
        </TabsTrigger>
        <TabsTrigger value="rationale">
          <Scale className="size-3.5 mr-1.5" />
          Rationale
        </TabsTrigger>
        <TabsTrigger value="signals">
          <CircleDot className="size-3.5 mr-1.5" />
          Signals
        </TabsTrigger>
        <TabsTrigger value="audit">
          <ShieldCheck className="size-3.5 mr-1.5" />
          Audit
        </TabsTrigger>
      </TabsList>

      <TabsContent value="highlights">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Token-level suspicion overlay</CardTitle>
          </CardHeader>
          <CardContent>
            {classification ? (
              <HighlightedArticle tokens={classification.result.tokens} />
            ) : (
              <p className="text-sm text-muted-foreground">No analysis yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rationale">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Courtroom rationale
              {rationale && (
                <Badge variant="outline" className="font-normal text-xs">
                  {rationale.generatedBy}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RationaleView
              rationale={rationale}
              loading={rationaleLoading}
              backend={rationaleBackend}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signals">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linguistic signals</CardTitle>
          </CardHeader>
          <CardContent>
            {classification ? (
              <ul className="space-y-3">
                {classification.result.signals.map((s) => (
                  <li
                    key={s.name}
                    className="rounded-lg border bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-sm">{s.name}</p>
                      <Badge
                        variant={s.weight > 0 ? "destructive" : "success"}
                        className="font-mono"
                      >
                        {s.weight > 0 ? "+" : ""}
                        {s.weight.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.detail}
                    </p>
                  </li>
                ))}
                {classification.result.signals.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No notable linguistic flags. The classifier relied on prior
                    distribution alone.
                  </p>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No analysis yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <AuditView
          audit={audit}
          loading={auditLoading}
          articleBody={articleBody}
        />
      </TabsContent>
    </Tabs>
  );
}

function HighlightedArticle({ tokens }: { tokens: ClassifierToken[] }) {
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-lg border bg-background p-4 max-h-[420px] overflow-y-auto">
      {tokens.map((t, i) => {
        if (!t.isWord || Math.abs(t.score) < 0.2) {
          return <span key={i}>{t.text}</span>;
        }
        const cls = t.score > 0 ? "suspicion" : "support";
        return (
          <mark key={i} className={cls}>
            {t.text}
          </mark>
        );
      })}
    </div>
  );
}

function RationaleView({
  rationale,
  loading,
  backend,
}: {
  rationale: RationaleResponse | null;
  loading: boolean;
  backend: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-1/2 shimmer rounded" />
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-5/6 shimmer rounded" />
        <div className="h-3 w-2/3 shimmer rounded" />
      </div>
    );
  }
  if (!rationale) {
    return (
      <p className="text-sm text-muted-foreground">No rationale yet.</p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          Verdict summary
        </p>
        <p>{rationale.summary}</p>
        {backend && (
          <p className="text-[10px] mt-2 text-muted-foreground">
            Backend: {backend}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RationaleColumn
          title="Evidence supporting REAL"
          tone="success"
          bullets={rationale.realArguments}
        />
        <RationaleColumn
          title="Evidence supporting FAKE"
          tone="destructive"
          bullets={rationale.fakeArguments}
        />
      </div>
    </div>
  );
}

function RationaleColumn({
  title,
  tone,
  bullets,
}: {
  title: string;
  tone: "success" | "destructive";
  bullets: { point: string; evidence: string }[];
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        tone === "success"
          ? "border-success/30 bg-success/5"
          : "border-destructive/30 bg-destructive/5"
      )}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-wider font-semibold",
          tone === "success" ? "text-success" : "text-destructive"
        )}
      >
        {title}
      </p>
      <ul className="space-y-3">
        {bullets.map((b, i) => (
          <li key={i} className="text-sm">
            <p className="font-medium leading-tight">{b.point}</p>
            <p className="text-xs text-muted-foreground mt-1">{b.evidence}</p>
          </li>
        ))}
        {bullets.length === 0 && (
          <li className="text-xs text-muted-foreground">No arguments produced for this side.</li>
        )}
      </ul>
    </div>
  );
}

function AuditView({
  audit,
  loading,
  articleBody,
}: {
  audit: AuditResponse | null;
  loading: boolean;
  articleBody: string;
}) {
  const { toast } = useToast();
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="h-4 w-1/3 shimmer rounded" />
          <div className="h-12 w-2/3 shimmer rounded" />
          <div className="h-3 w-full shimmer rounded" />
          <div className="h-3 w-5/6 shimmer rounded" />
        </CardContent>
      </Card>
    );
  }
  if (!audit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Click <strong>Run Adversarial Audit</strong> to paraphrase the
            article with an LLM and re-classify it. We then report whether the
            verdict survives — directly answering the LLM-laundering gap from{" "}
            <a
              href="https://arxiv.org/html/2501.18649v1"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              arXiv 2501.18649
            </a>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Without a Groq key we use a deterministic local paraphraser that
            applies the same kind of synonym swap and sentence reordering an
            LLM would produce.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tone =
    audit.badge === "STABLE"
      ? "success"
      : audit.badge === "DRIFTED"
      ? "warning"
      : "destructive";

  return (
    <Card
      className={cn(
        "border-2",
        tone === "success" && "border-success/30",
        tone === "warning" && "border-warning/40",
        tone === "destructive" && "border-destructive/30"
      )}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Adversarial robustness audit
            </p>
            <p className="text-2xl font-bold tracking-tight">
              Robustness:{" "}
              <span
                className={cn(
                  tone === "success" && "text-success",
                  tone === "warning" && "text-warning",
                  tone === "destructive" && "text-destructive"
                )}
              >
                {audit.badge}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Paraphrased via {audit.paraphraseSource}
            </p>
          </div>
          {audit.badge === "STABLE" ? (
            <ShieldCheck className="size-10 text-success" />
          ) : audit.badge === "DRIFTED" ? (
            <ShieldAlert className="size-10 text-warning" />
          ) : (
            <ShieldX className="size-10 text-destructive" />
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <AuditCell label="Original" item={audit.original} />
          <AuditCell label="Paraphrased" item={audit.paraphrased} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              LLM-paraphrased article (excerpt)
            </p>
            <button
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              onClick={() => {
                navigator.clipboard.writeText(audit.paraphrasedBody).catch(() => {});
                toast({ title: "Copied", description: "Paraphrased body copied to clipboard.", variant: "success" });
              }}
            >
              <Copy className="size-3" />
              Copy
            </button>
          </div>
          <p className="text-sm leading-relaxed line-clamp-6">
            {audit.paraphrasedBody}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Original length: {articleBody.length.toLocaleString()} chars · Paraphrase length:{" "}
            {audit.paraphrasedBody.length.toLocaleString()} chars
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function AuditCell({
  label,
  item,
}: {
  label: string;
  item: { label: "REAL" | "FAKE"; probability: number; confidence: number };
}) {
  const fake = item.label === "FAKE";
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold",
          fake ? "text-destructive" : "text-success"
        )}
      >
        {item.label}{" "}
        <span className="text-sm font-semibold text-foreground/80">
          {(item.probability * 100).toFixed(1)}%
        </span>
      </p>
      <Progress
        value={item.probability * 100}
        indicatorClassName={fake ? "bg-destructive" : "bg-success"}
      />
    </div>
  );
}
