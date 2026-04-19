import { SettingsPanel } from "@/components/settings-panel";

export const metadata = {
  title: "Settings",
  description:
    "Connect your free-tier API keys for Groq, Gemini, and Hugging Face. Keys live only in your browser.",
};

export default function SettingsPage() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <header className="space-y-2 mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Veritas Lens · Settings
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Bring your own keys.
        </h1>
        <p className="text-muted-foreground">
          Veritas Lens runs end-to-end without any keys — the local L-Defense
          engine handles rationale generation and the deterministic paraphraser
          handles the audit. Add a free-tier API key below to upgrade either
          module to a hosted LLM. Keys are stored only in your browser and are
          never sent to our servers.
        </p>
      </header>
      <SettingsPanel />
    </div>
  );
}
