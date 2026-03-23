"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CREDIT_PACKS } from "@/types";
import { Zap, CheckCircle2 } from "lucide-react";

type Currency = "INR" | "USD";

const TIER_FEATURES: Record<string, string[]> = {
  starter: [
    "1 deck upload",
    "Unlimited roleplay sessions",
    "All 8 investor personas",
    "Debrief report with feedback",
  ],
  founder: [
    "6 deck uploads",
    "Unlimited roleplay sessions",
    "All 8 investor personas",
    "Detailed feedback & transcripts",
  ],
  studio: [
    "20 deck uploads",
    "Unlimited roleplay sessions",
    "All 8 investor personas",
    "Priority processing",
    "Team-friendly",
  ],
};

function CreditLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="size-4 text-primary flex-shrink-0 mt-px" />
      <span>{children}</span>
    </li>
  );
}

export function LandingPricing() {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") {
      setCurrency("INR");
    }
  }, []);

  return (
    <div>
      {/* Currency toggle */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setCurrency("INR")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            currency === "INR"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          ₹ INR
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            currency === "USD"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          $ USD
        </button>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Free Demo tier */}
        <Card className="relative flex flex-col border border-dashed border-border/50 bg-muted/10 hover:border-border/80 transition-all duration-200">
          <CardHeader className="pb-4 pt-8">
            <div className="mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Free Demo
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {currency === "INR" ? "₹" : "$"}
              </span>
              <span className="text-4xl font-bold tracking-tight text-muted-foreground">
                0
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="size-3.5 text-muted-foreground/60" />
              <span className="text-sm font-semibold text-muted-foreground/70">
                No signup needed
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 pt-0 gap-5">
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              See what CastDeck can do
            </p>
            <ul className="space-y-2.5 flex-1">
              <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                <span>Pre-loaded sample startup deck</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                <span>Text-only roleplay (5 turns)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                <span>1 investor persona (Marcus Reid)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground/70">
                <CheckCircle2 className="size-4 text-muted-foreground/40 flex-shrink-0 mt-px" />
                <span>Blurred debrief report preview</span>
              </li>
            </ul>
            <Button className="w-full mt-2" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {CREDIT_PACKS.map((pack) => {
          const isPopular = pack.id === "founder";
          const features = TIER_FEATURES[pack.id] ?? [];
          const displayPrice =
            currency === "INR" ? pack.priceInr : pack.priceUsd;
          const symbol = currency === "INR" ? "₹" : "$";
          const locale = currency === "INR" ? "en-IN" : "en-US";

          return (
            <Card
              key={pack.id}
              className={`relative flex flex-col border transition-all duration-200 ${
                isPopular
                  ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border/50 bg-card/50 hover:border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <div className="mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {pack.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {symbol}
                  </span>
                  <span className="text-4xl font-bold tracking-tight">
                    {displayPrice.toLocaleString(locale)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Zap className="size-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {pack.credits.toLocaleString()} credits
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 pt-0 gap-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pack.description}
                </p>

                <ul className="space-y-2.5 flex-1">
                  {features.map((feature) => (
                    <CreditLine key={feature}>{feature}</CreditLine>
                  ))}
                </ul>

                <Link href="/sign-up" className="w-full">
                  <Button
                    className={`w-full mt-2 ${
                      isPopular
                        ? ""
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    variant={isPopular ? "default" : "secondary"}
                  >
                    Get {pack.credits} credits
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit cost reference */}
      <div className="mt-10 rounded-xl border border-border/40 bg-muted/20 px-6 py-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
          What do credits cost?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { action: "Deck upload", cost: "60 credits" },
            { action: "Roleplay sessions", cost: "Free" },
            { action: "Debrief reports", cost: "Free" },
          ].map(({ action, cost }) => (
            <div key={action} className="space-y-1">
              <div className="text-sm font-semibold">{cost}</div>
              <div className="text-xs text-muted-foreground">{action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
