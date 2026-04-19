import Link from "next/link";
import { Eye } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Eye className="size-4" />
            </span>
            <span className="font-semibold">Veritas Lens</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Transparent fake-news detection with courtroom-style rationales and
            adversarial robustness audits.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Product
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/analyze" className="hover:text-primary">
                Analyze an article
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-primary">
                Model leaderboard
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="hover:text-primary">
                Methodology
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-primary">
                API key settings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Research
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="https://arxiv.org/abs/2405.03371"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                L-Defense (WebConf 2024)
              </Link>
            </li>
            <li>
              <Link
                href="https://arxiv.org/html/2501.18649v1"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                LLM Laundering (2025)
              </Link>
            </li>
            <li>
              <Link
                href="https://arxiv.org/abs/2509.04650"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                Transformers vs Baselines
              </Link>
            </li>
            <li>
              <Link
                href="https://huggingface.co/microsoft/deberta-v3-base"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                DeBERTa-v3-base
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Project
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-primary">
                About this project
              </Link>
            </li>
            <li>
              <Link href="/methodology#reproducibility" className="hover:text-primary">
                Reproduce our results
              </Link>
            </li>
            <li className="text-muted-foreground">
              NeuroLogic ’26 NLP Datathon
            </li>
            <li className="text-muted-foreground">
              Built by Aryan Choudhary
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container py-4 text-xs text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Veritas Lens. For research and educational use.</p>
          <p>
            Headline metric: <span className="text-foreground font-medium">99.42%</span>{" "}
            accuracy · F1 <span className="text-foreground font-medium">0.994</span>{" "}
            · ROC-AUC <span className="text-foreground font-medium">0.9991</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
