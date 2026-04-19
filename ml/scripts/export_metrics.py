"""Export the leaderboard JSON consumed by the web frontend.

The web app reads numbers from `src/lib/leaderboard.ts`. This script generates
the JSON the team commits as the source of truth for those numbers, joining
the outputs of `run_baselines.py`, `finetune_deberta.py`, and
`audit_paraphrase.py`.

Usage:
    python ml/scripts/export_metrics.py
"""
from __future__ import annotations

import json
from pathlib import Path


BASELINES_PATH = Path("ml/runs/baselines.json")
FOLDS_PATH = Path("ml/checkpoints/deberta-v3/fold_metrics.json")
AUDIT_PATH = Path("ml/runs/paraphrase_audit.json")
OUT_PATH = Path("ml/runs/leaderboard.json")


def main() -> None:
    rows = []
    if BASELINES_PATH.exists():
        for r in json.loads(BASELINES_PATH.read_text()):
            rows.append({
                "model": r["name"],
                "accuracy": r["accuracy"],
                "f1": r["f1"],
                "rocAuc": r["roc_auc"],
            })
    else:
        print(f"warn: {BASELINES_PATH} missing — run run_baselines.py first.")

    if FOLDS_PATH.exists():
        folds = json.loads(FOLDS_PATH.read_text())
        avg = {
            "model": "DeBERTa-v3-base · 5-fold ensemble",
            "accuracy": sum(f["accuracy"] for f in folds) / len(folds),
            "f1": sum(f["f1"] for f in folds) / len(folds),
            "rocAuc": sum(f["roc_auc"] for f in folds) / len(folds),
        }
        rows.append(avg)
    else:
        print(f"warn: {FOLDS_PATH} missing — run finetune_deberta.py first.")

    if AUDIT_PATH.exists():
        audit = json.loads(AUDIT_PATH.read_text())
        for row in rows:
            row["paraphraseAccuracy"] = audit["paraphrased_accuracy"]

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(rows, indent=2))
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
