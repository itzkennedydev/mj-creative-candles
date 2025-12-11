"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

export function NotificationBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-100 text-gray-600 py-2.5">
      <Container>
        <div className="flex items-center justify-center gap-x-4">
          <p className="text-sm font-semibold">
            <span className="px-1.5 py-0.5 mx-0.5">mobile embroidery services!</span>
            <span className="hidden md:inline">Perfect for sports teams, schools & private events</span>
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-black hover:bg-gray-200 hover:text-black"
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