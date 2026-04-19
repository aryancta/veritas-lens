"""Reproduce the `Paraphrase` accuracy column in the leaderboard.

For every article in a given fold:
  1. Ask Llama 3.3 70B (Groq) to paraphrase the body. We keep the named
     entities, numbers, and dates intact (the same instruction we serve in the
     web app's `/api/audit` route).
  2. Re-classify the paraphrased copy with the cached fold checkpoint.
  3. Aggregate accuracy on the paraphrased set vs the original set.

The intent is to operationalise the "LLM-laundering" gap from
arXiv 2501.18649. We expect classical baselines to lose 25-35 points; the
fine-tuned DeBERTa-v3 ensemble should retain >85% of original accuracy.

Usage:
    GROQ_API_KEY=... python ml/scripts/audit_paraphrase.py --fold 0
"""
from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.metrics import accuracy_score, f1_score


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
PARAPHRASE_PROMPT = (
    "Rewrite the following news article so the meaning is preserved but every"
    " sentence uses different words and structure. Keep all named entities,"
    " numbers, and dates exactly. Do not add or remove claims. Return ONLY"
    " the rewritten article body."
)


def paraphrase_with_groq(api_key: str, title: str, body: str) -> str:
    response = requests.post(
        GROQ_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "temperature": 0.7,
            "messages": [
                {"role": "system", "content": PARAPHRASE_PROMPT},
                {"role": "user", "content": f"Title: {title}\n\nBody: {body}"},
            ],
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="ml/data/welfake.csv")
    parser.add_argument("--checkpoint", default="ml/checkpoints/deberta-v3/fold0")
    parser.add_argument("--limit", type=int, default=200, help="How many test articles to audit.")
    parser.add_argument("--out", default="ml/runs/paraphrase_audit.json")
    args = parser.parse_args()

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise SystemExit("Set GROQ_API_KEY in your environment.")

    df = pd.read_csv(args.data).sample(args.limit, random_state=42).reset_index(drop=True)

    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification

    tokenizer = AutoTokenizer.from_pretrained(args.checkpoint)
    model = AutoModelForSequenceClassification.from_pretrained(args.checkpoint).eval()
    if torch.cuda.is_available():
        model.cuda()

    def classify(texts: list[str]) -> np.ndarray:
        out = []
        for chunk in [texts[i : i + 16] for i in range(0, len(texts), 16)]:
            enc = tokenizer(chunk, padding=True, truncation=True, max_length=384, return_tensors="pt")
            if torch.cuda.is_available():
                enc = {k: v.cuda() for k, v in enc.items()}
            with torch.no_grad():
                logits = model(**enc).logits
            proba = torch.softmax(logits, dim=-1)[:, 1].cpu().numpy()
            out.append(proba)
        return np.concatenate(out)

    original_text = (df["title"].fillna("") + " [SEP] " + df["body"].fillna("")).tolist()
    y = df["label"].astype(int).to_numpy()
    proba_orig = classify(original_text)
    pred_orig = (proba_orig >= 0.5).astype(int)

    paraphrased_bodies: list[str] = []
    for i, row in df.iterrows():
        try:
            paraphrased_bodies.append(
                paraphrase_with_groq(api_key, row["title"] or "", row["body"] or "")
            )
        except Exception as exc:
            print(f"[{i}] paraphrase failed: {exc}")
            paraphrased_bodies.append(row["body"] or "")
        time.sleep(0.3)  # be polite to the free tier

    paraphrased_text = (
        df["title"].fillna("") + " [SEP] " + pd.Series(paraphrased_bodies)
    ).tolist()
    proba_para = classify(paraphrased_text)
    pred_para = (proba_para >= 0.5).astype(int)

    metrics = {
        "n": int(len(df)),
        "original_accuracy": float(accuracy_score(y, pred_orig)),
        "paraphrased_accuracy": float(accuracy_score(y, pred_para)),
        "original_f1": float(f1_score(y, pred_orig)),
        "paraphrased_f1": float(f1_score(y, pred_para)),
        "verdict_flip_rate": float((pred_orig != pred_para).mean()),
        "mean_probability_drift": float(np.mean(np.abs(proba_orig - proba_para))),
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
