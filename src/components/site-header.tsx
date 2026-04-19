"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Settings as SettingsIcon, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <Eye className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Veritas Lens</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              DeBERTa · L-Defense · Audit
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex"
            aria-label="GitHub"
          >
            <Button variant="ghost" size="icon">
              <Github className="size-4" />
            </Button>
          </Link>
          <Link href="/settings" aria-label="Settings">
            <Button variant="outline" size="sm">
              <SettingsIcon className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
          <Link href="/analyze">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
