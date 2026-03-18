"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { Coins, Shield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, isLoaded } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch("/api/credits/balance")
      .then((res) => res.json())
      .then((data) => {
        setCredits(data.creditsBalance ?? 0);
        if (data.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
  }, [isLoaded, user]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">CD</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">CastDeck</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Shield className="size-3.5" />
                Admin
              </Button>
            </Link>
          )}

          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
            <Coins className="size-3.5 text-primary" />
            {credits !== null ? credits.toLocaleString() : (
              <Loader2 className="size-3 animate-spin" />
            )}
          </Badge>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
