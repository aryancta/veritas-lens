import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEEDED_RUNS } from "@/lib/sample-data";
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description:
    "Recent classifications and aggregate metrics for the Veritas Lens demo run.",
};

export default function DashboardPage() {
  const fakeRate =
    SEEDED_RUNS.filter((r) => r.label === "FAKE").length / SEEDED_RUNS.length;
  const flipRate =
    SEEDED_RUNS.filter((r) => r.robustness === "FLIPPED").length /
    SEEDED_RUNS.length;

  return (
    <div className="container py-10 md:py-14 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Veritas Lens · Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Results view
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            A read-only snapshot of the most recent runs through the analyzer,
            including the L-Defense rationale verdict and the adversarial
            robustness badge.
          </p>
        </div>
        <Link href="/analyze">
          <Button>
            <Activity className="size-4" />
            New analysis
          </Button>
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Articles analysed" value={SEEDED_RUNS.length.toString()} sub="Demo session" />
        <KPI label="Predicted FAKE" value={`${(fakeRate * 100).toFixed(0)}%`} sub="of runs" />
        <KPI label="Robustness flips" value={`${(flipRate * 100).toFixed(0)}%`} sub="under paraphrase audit" />
        <KPI label="Median latency" value="2.4s" sub="end-to-end (verdict + rationale)" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Recent runs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {SEEDED_RUNS.map((run, i) => (
              <li
                key={run.id}
                className="card flex items-center gap-4 border-t first:border-t-0 border-border/50 p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="grid place-items-center size-10 rounded-lg bg-muted shrink-0">
                  {run.label === "FAKE" ? (
                    <ShieldX className="size-5 text-destructive" />
                  ) : (
                    <ShieldCheck className="size-5 text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{run.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Run #{i + 1} · {run.timestamp}
                  </p>
                </div>
                <Badge variant={run.label === "FAKE" ? "destructive" : "success"}>
                  {run.label} · {(run.probability * 100).toFixed(1)}%
                </Badge>
                <Badge
                  variant={
                    run.robustness === "STABLE"
                      ? "success"
                      : run.robustness === "FLIPPED"
                      ? "destructive"
                      : "warning"
                  }
                  className="gap-1.5 hidden sm:inline-flex"
                >
                  {run.robustness === "STABLE" ? (
                    <ShieldCheck className="size-3" />
                  ) : run.robustness === "FLIPPED" ? (
                    <ShieldX className="size-3" />
                  ) : (
                    <ShieldAlert className="size-3" />
                  )}
                  {run.robustness}
                </Badge>
                <Link href="/analyze" aria-label="Open analyzer">
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-bold tracking-tight mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
