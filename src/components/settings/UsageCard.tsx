"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";

const supabase = createClient();

const METRIC_MAP = [
  { key: "ai_prompts_day", label: "AI Prompts/Day", total: 3 },
  { key: "gift_ai_prompts", label: "Gift AI Prompts", total: 0 },
  { key: "transcript_summary", label: "Transcript Summary", total: 2 },
  { key: "earning_trade", label: "Earning Trade", locked: true },
  { key: "ai_stock_picker", label: "AI Stock Picker", locked: true },
  { key: "swing_trade", label: "Swing Trade", locked: true },
  { key: "pattern_detection", label: "Pattern Detection", locked: true },
  { key: "earnings_prediction", label: "Earnings Prediction", locked: true },
];

export function UsageCard() {
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // find organization for the logged-in user
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) {
        setLoading(false);
        return;
      }

      // fetch today's usage for that org
      const { data, error } = await supabase
        .from("usage_metrics")
        .select("metric, value")
        .eq("organization_id", membership.organization_id)
        .gte(
          "recorded_at",
          new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        );

      if (error) {
        console.error("Error fetching usage:", error);
        setLoading(false);
        return;
      }

      // aggregate values by metric
      const aggregated: Record<string, number> = {};
      data?.forEach((row) => {
        aggregated[row.metric] =
          (aggregated[row.metric] || 0) + Number(row.value);
      });

      setUsage(aggregated);
      setLoading(false);
    };

    fetchUsage();
  }, []);

  return (
    <Card className="w-full mt-4 bg-muted/40">
      <CardContent className="py-6 px-4 sm:px-6">
        {loading ? (
          <Loading message="Loading usage..." />
        ) : (
          <div className="space-y-6">
            {METRIC_MAP.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-row items-center justify-between flex-wrap gap-2"
              >
                {/* Left: Label */}
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>

                {/* Right: Usage or Unlock */}
                {!item.locked && item.total !== undefined ? (
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <Progress
                      value={
                        item.total === 0
                          ? 0
                          : ((usage[item.key] || 0) / item.total) * 100
                      }
                      className="w-24 sm:w-48 h-2 bg-muted"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {usage[item.key] || 0} / {item.total}
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
        )}
      </CardContent>
    </Card>
  );
}
