"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" className="h-10" onClick={() => window.print()}>
      <Printer /> Print / Save PDF
    </Button>
  );
}
