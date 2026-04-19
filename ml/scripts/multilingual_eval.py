"""Lightweight Hindi/Hinglish stretch evaluation.

This script translates a small held-out batch of WELFake headlines into Hindi
(via the Helsinki-NLP/opus-mt-en-hi model) and re-scores them with the
``Davlan/xlm-roberta-base`` cross-lingual fallback. It is *not* part of the
headline metric — it is a stretch experiment to demonstrate that the
classifier generalises beyond English.

Usage:
    python ml/scripts/multilingual_eval.py --data ml/data/welfake.csv --limit 50
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.metrics import accuracy_score, f1_score


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="ml/data/welfake.csv")
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--out", default="ml/runs/multilingual.json")
    args = parser.parse_args()

    import torch
    from transformers import (
        AutoTokenizer,
        AutoModelForSeq2SeqLM,
        AutoModelForSequenceClassification,
    )

    df = pd.read_csv(args.data).sample(args.limit, random_state=42).reset_index(drop=True)

    mt_tok = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-hi")
    mt_model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-hi").eval()

    cls_tok = AutoTokenizer.from_pretrained("xlm-roberta-base")
    cls_model = AutoModelForSequenceClassification.from_pretrained(
        "xlm-roberta-base", num_labels=2
    ).eval()

    def translate(texts: list[str]) -> list[str]:
        out = []
        for t in texts:
            enc = mt_tok([t], return_tensors="pt", truncation=True, max_length=384)
            with torch.no_grad():
                gen = mt_model.generate(**enc, max_new_tokens=384)
            out.append(mt_tok.batch_decode(gen, skip_special_tokens=True)[0])
        return out

    en = (df["title"].fillna("") + " [SEP] " + df["body"].fillna("")).tolist()
    hi = translate(en)

    def classify(texts: list[str]) -> np.ndarray:
        enc = cls_tok(texts, padding=True, truncation=True, max_length=384, return_tensors="pt")
        with torch.no_grad():
            logits = cls_model(**enc).logits
        return torch.softmax(logits, dim=-1)[:, 1].numpy()

    proba_en = classify(en)
    proba_hi = classify(hi)
    y = df["label"].astype(int).to_numpy()

    metrics = {
        "n": int(len(df)),
        "english_accuracy": float(accuracy_score(y, (proba_en >= 0.5).astype(int))),
        "english_f1": float(f1_score(y, (proba_en >= 0.5).astype(int))),
        "hindi_accuracy": float(accuracy_score(y, (proba_hi >= 0.5).astype(int))),
        "hindi_f1": float(f1_score(y, (proba_hi >= 0.5).astype(int))),
        "verdict_flip_rate": float(((proba_en >= 0.5) != (proba_hi >= 0.5)).mean()),
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
