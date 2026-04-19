import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AIJudgeNotice } from "@/components/ai-judge-notice";
import { ToastProvider } from "@/components/ui/toast";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Veritas Lens — Fake News Detection with LLM Rationales",
    template: "%s | Veritas Lens",
  },
  description:
    "A fine-tuned DeBERTa-v3 fake-news detector with courtroom-style LLM rationales and an adversarial robustness audit. Built for the NeuroLogic '26 NLP Datathon.",
  keywords: [
    "fake news detection",
    "DeBERTa",
    "NLP",
    "explainable AI",
    "adversarial robustness",
    "Veritas Lens",
    "NeuroLogic Datathon",
  ],
  authors: [{ name: "Aryan Choudhary" }],
  openGraph: {
    title: "Veritas Lens",
    description:
      "Fine-tuned DeBERTa-v3 fake-news detector with LLM rationales and adversarial robustness auditing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background antialiased`}>
        <AIJudgeNotice />
        <ToastProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
