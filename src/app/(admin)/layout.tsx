"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Users, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/workspaces")
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setIsAdmin(false);
          router.push("/dashboard");
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(false);
        router.push("/dashboard");
      });
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-48 flex-shrink-0 hidden md:block">
            <nav className="space-y-1">
              <Link href="/admin/workspaces">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                  <Users className="size-4" />
                  Workspaces
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                  <LayoutDashboard className="size-4" />
                  Overview
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
