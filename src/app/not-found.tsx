import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 text-center space-y-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        404 · Page not found
      </p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        That page hasn’t been published yet.
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Veritas Lens ships with five core pages — Home, Analyze, Dashboard,
        Leaderboard, Methodology, About, and Settings. Pick one of them below.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/"><Button>Home</Button></Link>
        <Link href="/analyze"><Button variant="outline">Analyzer</Button></Link>
        <Link href="/leaderboard"><Button variant="outline">Leaderboard</Button></Link>
      </div>
    </div>
  );
}
