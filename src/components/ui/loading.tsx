"use client";

import { Loader2 } from "lucide-react";

type LoadingProps = {
  message?: string;
  height?: string; // allow customizing height
};

export function Loading({
  message = "Loading...",
  height = "h-32",
}: LoadingProps) {
  return (
    <div className={`flex justify-center items-center ${height}`}>
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
