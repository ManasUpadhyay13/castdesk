"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PROMO_CUTOFF_DATE, PROMO_CREDITS } from "@/lib/constants/promo";

const STORAGE_KEY = "promo-banner-dismissed";

export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const now = new Date();
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (now < PROMO_CUTOFF_DATE && !dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="relative z-[60] bg-primary text-primary-foreground text-center text-sm py-2 px-4">
      <span>
        Sign up before April 10th and get{" "}
        <strong>{PROMO_CREDITS} free credits</strong>!
      </span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-primary-foreground/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
