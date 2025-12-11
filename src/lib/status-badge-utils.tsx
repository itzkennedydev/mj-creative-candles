"use client";

import React from "react";
import { Tag } from "lucide-react";
import { cn } from "../app/sca-dashboard/utils";

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "border-yellow-300 bg-yellow-100 text-yellow-600",
    processing: "border-blue-300 bg-blue-100 text-blue-600",
    ready_for_pickup: "border-purple-300 bg-purple-100 text-purple-600",
    shipped: "border-indigo-300 bg-indigo-100 text-indigo-600",
    delivered: "border-green-300 bg-green-100 text-green-600",
    cancelled: "border-red-300 bg-red-100 text-red-600",
    paid: "border-green-300 bg-green-100 text-green-600",
    payment_failed: "border-red-300 bg-red-100 text-red-600",
  };
  return colors[status] || "border-gray-300 bg-gray-100 text-gray-600";
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "my-auto whitespace-nowrap rounded-md border text-sm flex items-center gap-x-1.5 p-1.5 sm:rounded-md sm:p-1.5",
      getStatusColor(status),
      className
    )}>
      <Tag className="h-3 w-3 shrink-0" />
      <span>{formatStatusLabel(status)}</span>
    </span>
  );
}

