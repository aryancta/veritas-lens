"""5-fold DeBERTa-v3 ensemble training script.

Mirrors the configuration used in the headline leaderboard row:
  - microsoft/deberta-v3-base
  - 5-fold StratifiedKFold (seed 42)
  - max_len=384, batch=16, AdamW lr=2e-5, cosine schedule, warmup=6%, fp16
  - Soft-vote across folds at inference time
  - Isotonic-regression calibration on a held-out validation slice

Usage:
    python ml/scripts/finetune_deberta.py --data ml/data/welfake.csv \
        --output-dir ml/checkpoints/deberta-v3
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="ml/data/welfake.csv")
    parser.add_argument("--output-dir", default="ml/checkpoints/deberta-v3")
    parser.add_argument("--folds", type=int, default=5)
    parser.add_argument("--max-len", type=int, default=384)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=2e-5)
    args = parser.parse_args()

    import torch
    from transformers import (
        AutoTokenizer,
        AutoModelForSequenceClassification,
        Trainer,
        TrainingArguments,
        DataCollatorWithPadding,
    )
    from datasets import Dataset

    df = pd.read_csv(args.data)
    text = (df["title"].fillna("") + " [SEP] " + df["body"].fillna("")).tolist()
    y = df["label"].astype(int).to_numpy()

    skf = StratifiedKFold(n_splits=args.folds, shuffle=True, random_state=42)
    oof_proba = np.zeros(len(y), dtype=np.float32)
    fold_metrics: list[dict] = []

    tokenizer = AutoTokenizer.from_pretrained("microsoft/deberta-v3-base")

    def tok(batch):
        return tokenizer(batch["text"], truncation=True, max_length=args.max_len)

    for fold, (train_idx, val_idx) in enumerate(skf.split(text, y)):
        print(f"\n===== Fold {fold + 1}/{args.folds} =====")
        train_ds = Dataset.from_dict({
            "text": [text[i] for i in train_idx],
            "label": y[train_idx].tolist(),
        }).map(tok, batched=True)
        val_ds = Dataset.from_dict({
            "text": [text[i] for i in val_idx],
            "label": y[val_idx].tolist(),
        }).map(tok, batched=True)

        model = AutoModelForSequenceClassification.from_pretrained(
            "microsoft/deberta-v3-base", num_labels=2
        )
        out_dir = os.path.join(args.output_dir, f"fold{fold}")
        ta = TrainingArguments(
            output_dir=out_dir,
            learning_rate=args.lr,
            per_device_train_batch_size=args.batch,
            per_device_eval_batch_size=args.batch * 2,
            num_train_epochs=args.epochs,
            weight_decay=0.01,
            warmup_ratio=0.06,
            lr_scheduler_type="cosine",
            fp16=torch.cuda.is_available(),
            logging_steps=50,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            save_total_limit=1,
            load_best_model_at_end=True,
            metric_for_best_model="eval_loss",
            greater_is_better=False,
            report_to=[],
            seed=42 + fold,
        )

        trainer = Trainer(
            model=model,
            args=ta,
            train_dataset=train_ds,
            eval_dataset=val_ds,
            data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
            tokenizer=tokenizer,
        )
        trainer.train()
        out = trainer.predict(val_ds)
        proba = torch.softmax(torch.from_numpy(out.predictions), dim=-1)[:, 1].numpy()
        oof_proba[val_idx] = proba

        pred = (proba >= 0.5).astype(int)
        fold_metrics.append({
            "fold": fold,
            "accuracy": float(accuracy_score(y[val_idx], pred)),
            "f1": float(f1_score(y[val_idx], pred)),
            "roc_auc": float(roc_auc_score(y[val_idx], proba)),
        })

    pred = (oof_proba >= 0.5).astype(int)
    print("\n===== OOF =====")
    print(f"acc={accuracy_score(y, pred):.4f}  f1={f1_score(y, pred):.4f}  "
          f"roc_auc={roc_auc_score(y, oof_proba):.4f}")

    print("Fitting isotonic calibration ...")
    iso = IsotonicRegression(out_of_bounds="clip")
    iso.fit(oof_proba, y)

    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    np.save(os.path.join(args.output_dir, "oof_proba.npy"), oof_proba)
    Path(os.path.join(args.output_dir, "fold_metrics.json")).write_text(
        json.dumps(fold_metrics, indent=2)
    )
    import joblib
    joblib.dump(iso, os.path.join(args.output_dir, "isotonic.joblib"))


if __name__ == "__main__":
    main()
