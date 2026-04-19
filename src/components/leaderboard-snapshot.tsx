import { LEADERBOARD } from "@/lib/leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LeaderboardSnapshot() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left p-3">Model</th>
              <th className="text-right p-3">Acc</th>
              <th className="text-right p-3">F1</th>
              <th className="text-right p-3">ROC-AUC</th>
              <th className="text-right p-3 hidden md:table-cell">Paraphrase</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((row) => (
              <tr
                key={row.model}
                className={cn(
                  "border-t border-border/50",
                  row.highlight && "bg-success/5"
                )}
              >
                <td className="p-3">
                  <div className="font-medium flex items-center gap-2">
                    {row.model}
                    {row.highlight && <Badge variant="success">Headline</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {row.family} · {row.params} params
                  </p>
                </td>
                <td className="p-3 text-right tabular-nums">{(row.accuracy * 100).toFixed(2)}%</td>
                <td className="p-3 text-right tabular-nums">{row.f1.toFixed(3)}</td>
                <td className="p-3 text-right tabular-nums">{row.rocAuc.toFixed(4)}</td>
                <td className="p-3 text-right tabular-nums hidden md:table-cell">
                  {(row.paraphraseAccuracy * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
