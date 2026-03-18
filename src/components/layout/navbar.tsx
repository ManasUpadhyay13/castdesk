"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-white hover:text-zinc-200 transition-colors"
        >
          CastDeck
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          {user && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-zinc-700 bg-zinc-900 px-2.5 py-1 text-sm text-zinc-200"
            >
              <Coins className="h-3.5 w-3.5 text-yellow-400" />
              <span>{user.creditsBalance.toLocaleString()}</span>
            </Badge>
          )}

          {/* User name */}
          {user && (
            <span className="hidden text-sm text-zinc-400 sm:block">
              {user.name}
            </span>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
