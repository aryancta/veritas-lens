import { CONFUSION_MATRIX } from "@/lib/leaderboard";

type Matrix = typeof CONFUSION_MATRIX;

export function ConfusionMatrix({ matrix }: { matrix: Matrix }) {
  const total = matrix.totalReal + matrix.totalFake;
  const cells = [
    {
      label: "True REAL",
      value: matrix.trueNegative,
      sub: "predicted REAL · actual REAL",
      tone: "success" as const,
    },
    {
      label: "False FAKE",
      value: matrix.falsePositive,
      sub: "predicted FAKE · actual REAL",
      tone: "warning" as const,
    },
    {
      label: "False REAL",
      value: matrix.falseNegative,
      sub: "predicted REAL · actual FAKE",
      tone: "warning" as const,
    },
    {
      label: "True FAKE",
      value: matrix.truePositive,
      sub: "predicted FAKE · actual FAKE",
      tone: "success" as const,
    },
  ];
  const max = Math.max(...cells.map((c) => c.value));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[80px,1fr,1fr] gap-2">
        <div />
        <div className="text-xs uppercase tracking-wider text-muted-foreground text-center">
          Predicted REAL
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground text-center">
          Predicted FAKE
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground self-center text-right">
          Actual REAL
        </div>
        <Cell cell={cells[0]} max={max} />
        <Cell cell={cells[1]} max={max} />

        <div className="text-xs uppercase tracking-wider text-muted-foreground self-center text-right">
          Actual FAKE
        </div>
        <Cell cell={cells[2]} max={max} />
        <Cell cell={cells[3]} max={max} />
      </div>
      <p className="text-xs text-muted-foreground">
        Held-out fold · {total.toLocaleString()} articles · accuracy{" "}
        {(((matrix.trueNegative + matrix.truePositive) / total) * 100).toFixed(2)}%
      </p>
    </div>
  );
}

function Cell({
  cell,
  max,
}: {
  cell: { label: string; value: number; sub: string; tone: "success" | "warning" };
  max: number;
}) {
  const intensity = Math.max(0.08, cell.value / max);
  const bg =
    cell.tone === "success"
      ? `rgba(34, 197, 94, ${intensity * 0.4})`
      : `rgba(245, 158, 11, ${intensity * 0.45})`;
  return (
    <div
      className="rounded-lg border p-4 text-center"
      style={{ backgroundColor: bg }}
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {cell.label}
      </p>
      <p className="text-2xl font-bold tabular-nums mt-1">
        {cell.value.toLocaleString()}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{cell.sub}</p>
    </div>
  );
}
