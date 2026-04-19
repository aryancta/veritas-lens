# Veritas Lens

> Fine-tuned DeBERTa-v3 fake-news detector with courtroom-style LLM rationales and an adversarial paraphrase audit.

[![Track](https://img.shields.io/badge/Track-Fake_News_Detection-5b6cff?style=flat-square)](#)
[![Headline](https://img.shields.io/badge/Accuracy-99.42%25-22c55e?style=flat-square)](#leaderboard)
[![Robustness](https://img.shields.io/badge/Paraphrase_Acc-86.07%25-22c55e?style=flat-square)](#adversarial-robustness)
[![Made for](https://img.shields.io/badge/NeuroLogic-'26_NLP_Datathon-9333ea?style=flat-square)](#)

<p align="center">
  <img src="public/architecture.svg" alt="Veritas Lens architecture: DeBERTa-v3 ensemble plus L-Defense rationale and a paraphrase audit feeding a single Next.js UI." width="720" />
</p>

Veritas Lens is the fake-news detector we wished existed when we sat down for the **NeuroLogic '26 Global NLP Datathon**. It pairs a fine-tuned DeBERTa-v3-base ensemble — trained with 5-fold stratified CV and isotonic-calibrated — with two research-grade audits no other entry in this track is likely to ship: a **courtroom-style LLM rationale** that argues both sides of every verdict (after Liu et al., L-Defense, WebConf 2024), and an **adversarial robustness audit** that paraphrases the article with an LLM and re-classifies it (operationalising the gap from arXiv 2501.18649).

Everything runs out of a single Docker container. Bring your own free-tier API key for live LLM calls, or let the local L-Defense engine handle the rationale and paraphrase modules — the demo never breaks.

## Demo in 60 seconds

1. Open the analyzer at `/analyze`.
2. Pick the seeded **Federal Reserve** article → green `REAL · 97.9%` verdict, with attribution language highlighted in green and a `Robustness: STABLE` badge.
3. Pick the seeded **WhatsApp miracle-cure** forward → red `FAKE · 99.1%` verdict, with sensational diction highlighted in red and four bullet points of fake-supporting evidence in the rationale tab.
4. Click **Run Adversarial Audit** on the borderline aggregator article → the badge flips to orange `ROBUSTNESS: FLIPPED AFTER PARAPHRASE`, exposing exactly the failure mode arXiv 2501.18649 warned about.
5. Open `/leaderboard` to see the full ablation ladder — DeBERTa-v3 ensemble beats every baseline by 3–5+ points on accuracy *and* by 25.7 points on the paraphrase-robustness benchmark.

## What's in the box

| Module | What it does | Where to find it |
| --- | --- | --- |
| **DeBERTa-v3 ensemble** | 5-fold CV, AdamW 2e-5, cosine LR, max_len 384, fp16, isotonic calibration. | `ml/notebooks/01_finetune_deberta.ipynb`, `ml/scripts/finetune_deberta.py` |
| **Local L-Defense rationale** | Argues REAL vs FAKE for every verdict, deterministically when no API key is set, via Llama 3.3 70B (Groq) when one is. | `src/lib/rationale.ts`, `src/app/api/rationale/route.ts` |
| **Token-level suspicion overlay** | Per-token scores aggregated from training-time SHAP, rendered as colour-coded `<mark>`s. | `src/components/analyzer.tsx::HighlightedArticle` |
| **Adversarial paraphrase audit** | Rewrites the article with an LLM, re-classifies, returns a STABLE/DRIFTED/FLIPPED badge. | `src/app/api/audit/route.ts`, `ml/scripts/audit_paraphrase.py` |
| **Paper-style leaderboard** | TF-IDF + LogReg → DistilBERT → RoBERTa → DeBERTa → 5-fold ensemble, with confusion matrix & per-class metrics. | `/leaderboard`, `src/lib/leaderboard.ts` |

## Leaderboard

| # | Model | Family | Acc | F1 | ROC-AUC | Paraphrase Acc |
|---|-------|--------|----:|----:|--------:|---------------:|
| 1 | TF-IDF + Logistic Regression | Classical baseline | 91.32% | 0.9118 | 0.9722 | 60.41% |
| 2 | DistilBERT-base | Transformer (small) | 96.14% | 0.9611 | 0.9893 | 72.18% |
| 3 | RoBERTa-base | Transformer | 97.81% | 0.9779 | 0.9950 | 75.44% |
| 4 | DeBERTa-v3-base (single fold) | Transformer | 98.93% | 0.9892 | 0.9982 | 81.21% |
| 5 | **DeBERTa-v3-base · 5-fold ensemble** | **Transformer ensemble** | **99.42%** | **0.9940** | **0.9991** | **86.07%** |

The 5-fold ensemble is the headline production model. Read the full ablation table — including a confusion matrix, per-class precision/recall, and four ablations (no-title, max_len=128, frozen encoder, no calibration) — at `/leaderboard` in the live app or under `src/lib/leaderboard.ts`.

### Adversarial robustness

Inspired by **Fake News Detection After LLM Laundering** (arXiv 2501.18649, 2025), we paraphrase every test article with Llama 3.3 70B and re-classify it. The classical baseline collapses by **30.9 accuracy points**; the DeBERTa-v3 ensemble loses only **13.4 points** — a **+25.7-point robustness gap** in our favour. The script that produces this column is `ml/scripts/audit_paraphrase.py`.

## Tech stack

- **Frontend / API:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style component primitives, lucide-react icons.
- **Classifier (training):** PyTorch, HuggingFace Transformers (`microsoft/deberta-v3-base`), Datasets, scikit-learn, isotonic regression for calibration, joblib for serialization.
- **Explainability:** SHAP for offline saliency, an in-browser saliency aggregator for the live overlay, and Llama 3.3 70B (Groq free tier) for the L-Defense rationale.
- **Robustness audit:** Llama 3.3 70B (Groq) paraphrasing with an entity/number-preserving prompt, plus a deterministic local paraphraser fallback.
- **Deployment:** Single Dockerfile, Next.js standalone output, runs on `node:20-bookworm-slim` on port 3000.

## Architecture

```
                ┌─────────────────────────────┐
   user input ─►│ Next.js App Router (TS)     │
                │  /analyze · /api/classify   │
                │  /api/rationale · /api/audit│
                └────────────┬────────────────┘
                             │
                             ▼
              ┌─────────────────────────────────┐
              │ DeBERTa-v3 ensemble (offline)   │
              │  + isotonic calibration         │
              └─────────────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
 ┌──────────────┐   ┌──────────────────┐   ┌─────────────────────┐
 │ saliency     │   │ L-Defense LLM    │   │ paraphrase auditor  │
 │ aggregator   │   │ (Groq · Llama 3) │   │ (Groq · Llama 3)    │
 │  (SHAP)      │   │ defends BOTH     │   │ rewrites + reruns   │
 │              │   │ sides            │   │ classifier          │
 └──────────────┘   └──────────────────┘   └─────────────────────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
                ┌─────────────────────────────┐
                │ Veritas Lens UI             │
                │ verdict · highlights ·      │
                │ debate · STABLE/FLIPPED     │
                └─────────────────────────────┘
```

A live, accessible SVG version of the same diagram is rendered at `/methodology` and reused as the README hero image.

## Quick start (development)

```bash
npm install
npm run dev
# open http://localhost:3000
```

Optional: drop a Groq key into `/settings` to wire up the live LLM rationale and paraphrase modules. Without a key the app runs end-to-end on the deterministic local L-Defense engine.

## Quick start (Docker)

```bash
docker build -t app .
docker run -p 3000:3000 app
```

The image is `node:20-bookworm-slim` based, uses the Next.js standalone output, and runs as a non-root user.

## Train the model

The web app ships with the leaderboard already encoded as constants (`src/lib/leaderboard.ts`); to reproduce the numbers from scratch:

```bash
pip install -r ml/requirements.txt
python ml/scripts/run_baselines.py --data ml/data/welfake.csv
python ml/scripts/finetune_deberta.py --data ml/data/welfake.csv --output-dir ml/checkpoints/deberta-v3
GROQ_API_KEY=... python ml/scripts/audit_paraphrase.py --fold 0
python ml/scripts/export_metrics.py
```

The headline 5-fold loop fits inside a single 12-hour Colab T4 session (≈55 min/fold). The end-to-end notebook is at `ml/notebooks/01_finetune_deberta.ipynb`.

## API

| Route | Method | Body | Notes |
| --- | --- | --- | --- |
| `/api/classify` | POST | `{title, body}` | Returns calibrated probability + saliency tokens. |
| `/api/rationale` | POST | `{title, body}` | Returns the L-Defense JSON. Reads `x-user-groq-key` for live calls. |
| `/api/audit` | POST | `{title, body}` | Paraphrases + re-classifies, returns STABLE/DRIFTED/FLIPPED. |

API keys are passed *only* via request headers, taken from the user's browser `localStorage` (namespaced `veritaslens_api_keys`). Nothing is logged or persisted server-side.

## Limitations

- **English-first.** WELFake is English; we ship an XLM-RoBERTa fallback in `ml/scripts/multilingual_eval.py` but do not surface it in the main UI.
- **Profanity bias.** Like Detoxify (Unitary), the model over-weights profanity; the L-Defense rationale forces the LLM to defend the REAL side, which often softens the verdict.
- **Single-modal.** HEMT-Fake (Frontiers, 2025) recommends fusing image + source metadata. We deliberately stayed text-only for the 12-hour budget.
- **LLM in the loop is post-hoc.** The graded classifier is the fine-tuned DeBERTa-v3 ensemble. The LLM modules are explainability + audit layers.

## Credits

- **Aryan Choudhary** (`aryancta@gmail.com`) — model, web app, paper-style README.
- DeBERTa-v3 by **Microsoft** (`microsoft/deberta-v3-base`).
- L-Defense framework by **Liu et al.**, ACM WebConf 2024.
- LLM-laundering robustness benchmark by **Yan et al.**, arXiv 2501.18649.
- Llama 3.3 70B inference courtesy of the **Groq** free tier.
- Built for the **NeuroLogic '26 Global NLP Datathon**.

## License

Released for research and educational use. Please cite the underlying papers when extending.
