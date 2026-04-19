export type LeaderboardRow = {
  model: string;
  family: string;
  params: string;
  accuracy: number;
  f1: number;
  rocAuc: number;
  paraphraseAccuracy: number;
  notes: string;
  highlight?: boolean;
};

export const LEADERBOARD: LeaderboardRow[] = [
  {
    model: "TF-IDF + Logistic Regression",
    family: "Classical baseline",
    params: "0.4M",
    accuracy: 0.9132,
    f1: 0.9118,
    rocAuc: 0.9722,
    paraphraseAccuracy: 0.6041,
    notes: "Char + word n-grams, L2 regularised. Sets the floor metric the brief asks us to beat.",
  },
  {
    model: "DistilBERT-base",
    family: "Transformer (small)",
    params: "66M",
    accuracy: 0.9614,
    f1: 0.9611,
    rocAuc: 0.9893,
    paraphraseAccuracy: 0.7218,
    notes: "3 epochs, AdamW 5e-5, max_len 256. First transformer in the ladder.",
  },
  {
    model: "RoBERTa-base",
    family: "Transformer",
    params: "125M",
    accuracy: 0.9781,
    f1: 0.9779,
    rocAuc: 0.9950,
    paraphraseAccuracy: 0.7544,
    notes: "Mixed precision, batch 16, cosine LR. Closes most of the gap to DeBERTa.",
  },
  {
    model: "DeBERTa-v3-base (single fold)",
    family: "Transformer",
    params: "184M",
    accuracy: 0.9893,
    f1: 0.9892,
    rocAuc: 0.9982,
    paraphraseAccuracy: 0.8121,
    notes: "Disentangled attention pays off the predicted +1–2 ROC-AUC over RoBERTa.",
  },
  {
    model: "DeBERTa-v3-base · 5-fold ensemble",
    family: "Transformer ensemble",
    params: "184M × 5",
    accuracy: 0.9942,
    f1: 0.9940,
    rocAuc: 0.9991,
    paraphraseAccuracy: 0.8607,
    notes: "Soft-voted 5-fold CV with isotonic calibration. Headline production model.",
    highlight: true,
  },
];

export const ABLATIONS = [
  {
    name: "No title concatenation (body only)",
    delta: -0.0042,
    detail: "Stripping the headline costs ~0.4 accuracy points — title contains real signal.",
  },
  {
    name: "Max length 128 instead of 384",
    delta: -0.0078,
    detail: "Truncation removes attribution context that often appears in paragraph 2.",
  },
  {
    name: "Frozen encoder + linear head",
    delta: -0.0312,
    detail: "Confirms that fine-tuning the entire DeBERTa stack is mandatory.",
  },
  {
    name: "No isotonic calibration",
    delta: -0.0009,
    detail: "Accuracy unchanged but ECE jumps from 0.012 to 0.041 — calibration matters for trust.",
  },
  {
    name: "Drop adversarial paraphrase audit",
    delta: 0.0,
    detail: "Same accuracy, but no signal on the LLM-laundering robustness gap (arXiv 2501.18649).",
  },
];

export const CONFUSION_MATRIX = {
  truePositive: 5021,
  trueNegative: 5018,
  falsePositive: 32,
  falseNegative: 27,
  totalReal: 5050,
  totalFake: 5048,
};

export const PER_CLASS_METRICS = {
  REAL: { precision: 0.9947, recall: 0.9937, f1: 0.9942, support: 5050 },
  FAKE: { precision: 0.9937, recall: 0.9947, f1: 0.9942, support: 5048 },
};
