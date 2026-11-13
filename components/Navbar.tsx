"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, BarChart3, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="text-base font-bold">ResumeAI</span>
        </Link>

        {/* Navigation */}
        {session ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              <LayoutDashboard data-icon="inline-start" />
              Dashboard
            </Button>
            <Button
              variant={pathname === "/analytics" ? "secondary" : "ghost"}
              size="sm"
              nativeButton={false}
              render={<Link href="/analytics" />}
            >
              <BarChart3 data-icon="inline-start" />
              Analytics
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            <span className="hidden sm:inline text-xs font-medium text-muted-foreground truncate max-w-[120px]">
              {session.user?.name}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut data-icon="inline-start" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/auth/signin" />}
            >
              <LogIn data-icon="inline-start" />
              Sign In
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/auth/signup" />}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
