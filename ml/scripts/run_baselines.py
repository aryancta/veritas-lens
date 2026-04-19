"""Run the classical and small-transformer baselines on the same split.

This is the script behind the TF-IDF + Logistic Regression, DistilBERT, and
RoBERTa rows of the leaderboard. It is intentionally short and dependency-
light so it can be reproduced inside a free Colab T4 session.

Usage:
    python ml/scripts/run_baselines.py --data ml/data/welfake.csv

Expected CSV columns: title, body, label (0=REAL, 1=FAKE).
"""
from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    import numpy as np
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import (
        accuracy_score,
        f1_score,
        roc_auc_score,
        classification_report,
        confusion_matrix,
    )
    from sklearn.model_selection import StratifiedKFold, train_test_split
except Exception:  # pragma: no cover - optional dependency at training time
    print(
        "[veritas-lens] sklearn / pandas not installed. Run `pip install -r "
        "ml/requirements.txt` before this script."
    )
    raise


@dataclass
class Result:
    name: str
    accuracy: float
    f1: float
    roc_auc: float
    confusion: list[list[int]]


def run_tfidf_lr(df: pd.DataFrame) -> Result:
    text = (df["title"].fillna("") + " " + df["body"].fillna("")).tolist()
    y = df["label"].astype(int).to_numpy()
    X_train, X_test, y_train, y_test = train_test_split(
        text, y, test_size=0.2, stratify=y, random_state=42
    )
    vec = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=3,
        max_df=0.95,
        sublinear_tf=True,
        strip_accents="unicode",
        max_features=400_000,
    )
    Xtr = vec.fit_transform(X_train)
    Xte = vec.transform(X_test)
    clf = LogisticRegression(
        C=4.0, max_iter=2000, solver="liblinear", class_weight="balanced"
    )
    clf.fit(Xtr, y_train)
    proba = clf.predict_proba(Xte)[:, 1]
    pred = (proba >= 0.5).astype(int)
    return Result(
        name="TF-IDF + Logistic Regression",
        accuracy=float(accuracy_score(y_test, pred)),
        f1=float(f1_score(y_test, pred)),
        roc_auc=float(roc_auc_score(y_test, proba)),
        confusion=confusion_matrix(y_test, pred).tolist(),
    )


def run_transformer(df: pd.DataFrame, model_name: str, label: str) -> Result:
    """Fine-tune a HuggingFace transformer on the same split.

    Lazily imports torch + transformers so the script doesn't crash if the
    user only wants to run the TF-IDF baseline.
    """
    import torch
    from transformers import (
        AutoTokenizer,
        AutoModelForSequenceClassification,
        Trainer,
        TrainingArguments,
        DataCollatorWithPadding,
    )
    from datasets import Dataset

    text = (df["title"].fillna("") + " [SEP] " + df["body"].fillna("")).tolist()
    y = df["label"].astype(int).to_numpy()
    X_train, X_test, y_train, y_test = train_test_split(
        text, y, test_size=0.2, stratify=y, random_state=42
    )

    tokenizer = AutoTokenizer.from_pretrained(model_name)
    train_ds = Dataset.from_dict({"text": X_train, "label": y_train.tolist()})
    test_ds = Dataset.from_dict({"text": X_test, "label": y_test.tolist()})

    def tok(batch):
        return tokenizer(batch["text"], truncation=True, max_length=384)

    train_ds = train_ds.map(tok, batched=True)
    test_ds = test_ds.map(tok, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    args = TrainingArguments(
        output_dir=f"ml/runs/{label}",
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        num_train_epochs=3,
        weight_decay=0.01,
        warmup_ratio=0.06,
        fp16=torch.cuda.is_available(),
        logging_steps=50,
        evaluation_strategy="epoch",
        save_strategy="no",
        report_to=[],
        seed=42,
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        tokenizer=tokenizer,
    )
    trainer.train()

    out = trainer.predict(test_ds)
    proba = torch.softmax(torch.from_numpy(out.predictions), dim=-1)[:, 1].numpy()
    pred = (proba >= 0.5).astype(int)
    return Result(
        name=label,
        accuracy=float(accuracy_score(y_test, pred)),
        f1=float(f1_score(y_test, pred)),
        roc_auc=float(roc_auc_score(y_test, proba)),
        confusion=confusion_matrix(y_test, pred).tolist(),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Veritas Lens baselines")
    parser.add_argument(
        "--data",
        default="ml/data/welfake.csv",
        help="Path to the corpus CSV (columns: title, body, label).",
    )
    parser.add_argument(
        "--out", default="ml/runs/baselines.json", help="JSON output path."
    )
    parser.add_argument(
        "--skip-transformer",
        action="store_true",
        help="Only run the TF-IDF + LR row (useful for CPU-only runs).",
    )
    args = parser.parse_args()

    df = pd.read_csv(args.data)
    results: list[Result] = [run_tfidf_lr(df)]

    if not args.skip_transformer:
        for model_name, label in [
            ("distilbert-base-uncased", "DistilBERT-base"),
            ("roberta-base", "RoBERTa-base"),
            ("microsoft/deberta-v3-base", "DeBERTa-v3-base (single fold)"),
        ]:
            print(f"=== {label} ===")
            results.append(run_transformer(df, model_name, label))

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    Path(args.out).write_text(json.dumps([asdict(r) for r in results], indent=2))
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
