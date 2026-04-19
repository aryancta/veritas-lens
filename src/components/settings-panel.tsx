"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Save, Trash2, ExternalLink, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useApiKeys, type ApiKeys } from "@/lib/use-api-keys";

const PROVIDERS: {
  id: keyof ApiKeys;
  label: string;
  description: string;
  signupUrl: string;
  badge: string;
  placeholder: string;
}[] = [
  {
    id: "groq",
    label: "Groq API key",
    description:
      "Powers the L-Defense rationale and the adversarial paraphrase audit via Llama 3.3 70B. Sub-second latency on the free tier.",
    signupUrl: "https://console.groq.com/keys",
    badge: "Free tier",
    placeholder: "gsk_...",
  },
  {
    id: "gemini",
    label: "Google Gemini API key",
    description:
      "Backup rationale + paraphrase generator (Gemini 2.5 Flash). Used automatically if Groq rate-limits during the demo.",
    signupUrl: "https://aistudio.google.com/apikey",
    badge: "Free tier",
    placeholder: "AIza...",
  },
  {
    id: "huggingface",
    label: "Hugging Face access token",
    description:
      "Optional — when set, classification routes through the hosted DeBERTa-v3 inference endpoint instead of the local L-Defense scorer.",
    signupUrl: "https://huggingface.co/settings/tokens",
    badge: "Free tier",
    placeholder: "hf_...",
  },
];

export function SettingsPanel() {
  const { keys, save, clear, hydrated } = useApiKeys();
  const { toast } = useToast();
  const [draft, setDraft] = React.useState<ApiKeys>(keys);
  const [show, setShow] = React.useState<Record<keyof ApiKeys, boolean>>({
    groq: false,
    gemini: false,
    huggingface: false,
  });

  React.useEffect(() => {
    if (hydrated) setDraft(keys);
  }, [keys, hydrated]);

  function persist() {
    save(draft);
    toast({
      title: "Keys saved",
      description: "Stored in your browser only — not sent to our servers.",
      variant: "success",
    });
  }

  function reset() {
    setDraft({ groq: "", gemini: "", huggingface: "" });
    clear();
    toast({
      title: "Keys cleared",
      description: "Veritas Lens fell back to the local L-Defense engine.",
      variant: "info",
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex items-start gap-3">
        <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Privacy by default</p>
          <p className="text-xs text-muted-foreground mt-1">
            Keys are stored in <code>localStorage</code> under{" "}
            <code>veritaslens_api_keys</code>. They are sent to our API routes
            as request headers (e.g. <code>x-user-groq-key</code>) so the
            server can proxy your call, but they are never written to disk or
            logs. Clear them at any time with the button below.
          </p>
        </div>
      </div>

      {PROVIDERS.map((p) => (
        <Card key={p.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <KeyRound className="size-4" />
                {p.label}
              </span>
              <Badge variant={draft[p.id] ? "success" : "secondary"}>
                {draft[p.id] ? "Connected" : "Not connected"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{p.description}</p>
            <div className="space-y-2">
              <Label htmlFor={p.id}>API key</Label>
              <div className="relative">
                <Input
                  id={p.id}
                  type={show[p.id] ? "text" : "password"}
                  placeholder={p.placeholder}
                  autoComplete="off"
                  value={draft[p.id]}
                  onChange={(e) =>
                    setDraft((cur) => ({ ...cur, [p.id]: e.target.value }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShow((cur) => ({ ...cur, [p.id]: !cur[p.id] }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={show[p.id] ? "Hide key" : "Show key"}
                >
                  {show[p.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Link
                href={p.signupUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Get a free key at {p.signupUrl}
                <ExternalLink className="size-3" />
              </Link>
              <p className="text-xs text-muted-foreground">
                {p.badge} · stored in your browser only
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap gap-3 sticky bottom-4 bg-background/80 backdrop-blur p-3 rounded-lg border">
        <Button onClick={persist}>
          <Save className="size-4" />
          Save keys
        </Button>
        <Button variant="outline" onClick={reset}>
          <Trash2 className="size-4" />
          Clear all keys
        </Button>
        <Link href="/analyze" className="ml-auto">
          <Button variant="ghost">Back to analyzer</Button>
        </Link>
      </div>
    </div>
  );
}
