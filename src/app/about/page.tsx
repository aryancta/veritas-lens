import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About",
  description: "About the Veritas Lens project, the team, and the hackathon.",
};

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-14 max-w-3xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          About
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Built for newsroom triage, judged by professors.
        </h1>
        <p className="text-muted-foreground">
          Veritas Lens started as an answer to a simple question: when a
          fact-checker needs to triage 50 viral WhatsApp forwards before a 6 PM
          deadline, what would actually help?
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>The story</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We are obsessed with the gap between a model that scores well and a
            model a journalist will trust. A 99% accuracy headline is meaningful
            only if the model can also explain itself in plain English and prove
            its verdict survives a small adversarial nudge.
          </p>
          <p>
            So we built Veritas Lens as three layers that all answer to the
            same UX promise: <em>show your work</em>. The fine-tuned DeBERTa-v3
            ensemble does the heavy lifting on accuracy. The L-Defense rationale
            (Liu et al., WebConf 2024) gives the editor a courtroom-style
            argument they can reuse in their write-up. The adversarial paraphrase
            audit (operationalising arXiv 2501.18649) tells them up-front
            whether the verdict is fragile.
          </p>
          <p>
            We picked a single-page Next.js shell over a microservice fleet
            because the brief was crystal clear: a one-file demo a judge can
            click through in 60 seconds beats a deployment diagram.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
              AC
            </div>
            <div>
              <p className="font-medium">Aryan Choudhary</p>
              <p className="text-sm text-muted-foreground">
                aryancta@gmail.com · NeuroLogic ’26 datathon participant
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hackathon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>NeuroLogic ’26</Badge>
            <Badge variant="secondary">Global NLP Datathon</Badge>
            <Badge variant="outline">Track: Fake-News Detection</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            12-hour, judged by a panel of three academic professors with a
            rubric weighted toward methodological rigor, novelty, and
            reproducibility.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/analyze">
          <Button>Try the analyzer</Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="outline">See the leaderboard</Button>
        </Link>
        <Link href="/methodology">
          <Button variant="ghost">Read the methodology</Button>
        </Link>
      </div>
    </div>
  );
}
