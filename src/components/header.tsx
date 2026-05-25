"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-aws-orange" />
          <span className="font-bold text-lg">AWS Masterclass</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/course"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Course
          </Link>
          <Link
            href="/certificate"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Certificate
          </Link>
          <Link
            href="/credits"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Credits
          </Link>
        </nav>
      </div>
    </header>
  );
}
