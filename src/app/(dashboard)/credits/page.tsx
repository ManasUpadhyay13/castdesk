"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Zap, CheckCircle2, ArrowUpRight, Loader2, History } from "lucide-react";
import { toast } from "sonner";

const PACKS = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    credits: 100,
    description: "First-time user, try with real deck",
    features: [
      "1 deck upload & narration",
      "1 roleplay session",
      "Basic feedback report",
    ],
    popular: false,
  },
  {
    id: "founder",
    name: "Founder",
    price: 1499,
    credits: 400,
    description: "Full fundraising prep sprint",
    features: [
      "4 deck uploads",
      "4 roleplay sessions",
      "Voice cloning",
      "Detailed reports",
    ],
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: 3499,
    credits: 1200,
    description: "Accelerators, coaches, bulk use",
    features: [
      "10+ deck uploads",
      "10+ sessions",
      "All voices",
      "Team access",
      "Priority processing",
    ],
    popular: false,
  },
];

const ACTION_LABELS: Record<string, string> = {
  DECK_UPLOAD: "Deck Upload",
  ROLEPLAY_SESSION: "Roleplay Session",
  PURCHASE_STARTER: "Purchased Starter Pack",
  PURCHASE_FOUNDER: "Purchased Founder Pack",
  PURCHASE_STUDIO: "Purchased Studio Pack",
  ADMIN_GRANT: "Admin Grant",
  REFUND: "Refund",
};

interface Transaction {
  id: string;
  action: string;
  amount: number;
  createdAt: string;
  deckTitle?: string | null;
}

export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/credits/balance")
      .then((res) => res.json())
      .then((data) => setBalance(data.creditsBalance ?? 0))
      .catch(() => {});

    fetch("/api/credits/history")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions ?? []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Failed to start purchase");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Purchase credits to upload decks and run roleplay sessions.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3">
          <Coins className="size-5 text-primary" />
          <span className="text-2xl font-bold tabular-nums">
            {balance !== null ? balance.toLocaleString() : (
              <Loader2 className="size-5 animate-spin" />
            )}
          </span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
      </div>

      <Separator />

      {/* Credit packs */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          Purchase Credits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`relative flex flex-col ${
                pack.popular
                  ? "border-primary ring-1 ring-primary"
                  : "border-border"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-0.5 text-xs font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{pack.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{pack.description}</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <div>
                  <span className="text-3xl font-bold">₹{pack.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    / {pack.credits} credits
                  </span>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full gap-1.5"
                  variant={pack.popular ? "default" : "outline"}
                  disabled={purchasing !== null}
                  onClick={() => handlePurchase(pack.id)}
                >
                  {purchasing === pack.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Buy
                      <ArrowUpRight className="size-3.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Transaction history */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <History className="size-4 text-primary" />
          Transaction History
        </h2>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Action</th>
                    <th className="text-left px-4 py-3 font-medium">Deck</th>
                    <th className="text-right px-4 py-3 font-medium">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {ACTION_LABELS[tx.action] ?? tx.action}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {tx.deckTitle ?? "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium tabular-nums ${
                          tx.amount > 0 ? "text-emerald-400" : ""
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
