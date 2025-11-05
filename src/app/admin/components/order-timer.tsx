"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatTimeElapsed } from "./utils";

export function OrderTimer({ createdAt }: { createdAt: Date | string }) {
  const [timeElapsed, setTimeElapsed] = useState(formatTimeElapsed(createdAt));

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeElapsed(formatTimeElapsed(createdAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const hours = timeElapsed.hours;
  const progress = Math.min((hours / 48) * 100, 100); // 48 hours = 100%

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Clock className={`h-3.5 w-3.5 ${timeElapsed.color}`} />
        <span className={`text-xs font-medium ${timeElapsed.color}`}>
          {timeElapsed.text}
        </span>
      </div>
      {/* Burndown progress bar */}
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            hours >= 48 ? 'bg-red-500' :
            hours >= 24 ? 'bg-orange-500' :
            hours >= 12 ? 'bg-yellow-500' :
            'bg-[#74CADC]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

