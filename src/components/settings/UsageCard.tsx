"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const usageData = [
  { label: "AI Prompts/Day", used: 0, total: 3 },
  { label: "Gift AI Prompts", used: 0, total: 0 },
  { label: "Transcript Summary", used: 0, total: 2 },
  { label: "Earning Trade", locked: true },
  { label: "AI Stock Picker", locked: true },
  { label: "Swing Trade", locked: true },
  { label: "Pattern Detection", locked: true },
  { label: "Earnings Prediction", locked: true },
];

export function UsageCard() {
  return (
    <Card className="w-full mt-4 bg-muted/40">
      <CardContent className="py-6 px-4 sm:px-6">
        <div className="space-y-6">
          {usageData.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-row items-center justify-between flex-wrap gap-2"
            >
              {/* Left: Label */}
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>

              {/* Right: Usage or Unlock */}
              {!item.locked &&
              item.used !== undefined &&
              item.total !== undefined ? (
                <div className="flex items-center gap-4 min-w-[120px]">
                  <Progress
                    value={
                      item.total === 0 ? 0 : (item.used / item.total) * 100
                    }
                    className="w-24 sm:w-48 h-2 bg-muted"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.used} / {item.total}
                  </span>
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className="text-sm text-teal-400 hover:underline whitespace-nowrap"
                >
                  Upgrade to Unlock
                </Link>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
