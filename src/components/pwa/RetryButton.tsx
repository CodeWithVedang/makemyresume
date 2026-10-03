"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RetryButton() {
  return (
    <Button className="mt-6 h-11" onClick={() => window.location.reload()}>
      <RefreshCw /> Try Again
    </Button>
  );
}
