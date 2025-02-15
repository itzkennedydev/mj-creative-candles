"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

export function NotificationBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#74CADC] text-white py-2.5">
      <Container>
        <div className="flex items-center justify-center gap-x-4">
          <p className="text-sm font-medium">
            🎉 Get 15% off your first custom order! Use code{" "}
            <span className="font-bold bg-white/10 px-2 py-0.5 rounded">WELCOME15</span>
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-white hover:bg-white/20 hover:text-white"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss notification</span>
          </Button>
        </div>
      </Container>
    </div>
  );
} 