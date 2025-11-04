"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { BreakoutSignal } from "@/types/breakout-signal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Target,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { BreakoutSignalCard } from "@/components/screener/BreakoutDashboard";

export default function StockStrategyPage() {
  const router = useRouter();
  const params = useParams();
  const [signals, setSignals] = useState<BreakoutSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  const supabase = createClient();

  // Initialize strategy based on URL parameter
  useEffect(() => {
    if (params.symbol) {
      setSelectedStrategy(decodeURIComponent(params.symbol as string));
    }
  }, [params.symbol]);

  // Load breakout signals based on strategy
  const loadBreakoutSignals = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get signals from last 4 hours for the selected strategy type
      const { data: signalsData, error } = await supabase
        .from("breakout_signals")
        .select("*")
        .gte(
          "created_at",
          new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        )
        .gte("probability", 0.6) // Show signals with 60%+ confidence
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading signals:", error);
        return;
      }

      if (signalsData) {
        // Filter signals based on strategy type
        let filteredSignals = signalsData;

        if (selectedStrategy.toLowerCase().includes("bullish")) {
          filteredSignals = signalsData.filter(
            (s) => s.signal_type === "BULLISH_BREAKOUT"
          );
        } else if (selectedStrategy.toLowerCase().includes("bearish")) {
          filteredSignals = signalsData.filter(
            (s) => s.signal_type === "BEARISH_BREAKDOWN"
          );
        } else if (selectedStrategy.toLowerCase().includes("breakout")) {
          filteredSignals = signalsData.filter(
            (s) => s.signal_type !== "NEUTRAL"
          );
        }

        setSignals(filteredSignals);
      }
    } catch (error) {
      console.error("Error loading breakout signals:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedStrategy]);

  // Set up real-time subscription for new signals
  useEffect(() => {
    loadBreakoutSignals();

    const subscription = supabase
      .channel("strategy_signals_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "breakout_signals",
          filter: "probability.gte.0.6",
        },
        (payload) => {
          const newSignal = payload.new as BreakoutSignal;

          // Filter based on current strategy
          let shouldAdd = true;
          if (
            selectedStrategy.toLowerCase().includes("bullish") &&
            newSignal.signal_type !== "BULLISH_BREAKOUT"
          ) {
            shouldAdd = false;
          } else if (
            selectedStrategy.toLowerCase().includes("bearish") &&
            newSignal.signal_type !== "BEARISH_BREAKDOWN"
          ) {
            shouldAdd = false;
          } else if (
            selectedStrategy.toLowerCase().includes("breakout") &&
            newSignal.signal_type === "NEUTRAL"
          ) {
            shouldAdd = false;
          }

          if (shouldAdd) {
            setSignals((prev) => [newSignal, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadBreakoutSignals, selectedStrategy]);

  // Helper functions
  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case "BULLISH_BREAKOUT":
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case "BEARISH_BREAKDOWN":
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case "BULLISH_BREAKOUT":
        return "border-green-200 bg-green-50";
      case "BEARISH_BREAKDOWN":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStrategyDescription = (strategy: string) => {
    const lowerStrategy = strategy.toLowerCase();
    if (lowerStrategy.includes("bullish")) {
      return "Stocks showing strong upward momentum with bullish breakout patterns. All 6 technical criteria favor upward price movement.";
    } else if (lowerStrategy.includes("bearish")) {
      return "Stocks showing downward pressure with bearish breakdown patterns. Technical indicators suggest potential price decline.";
    } else if (lowerStrategy.includes("breakout")) {
      return "Stocks at critical breakout points with high probability directional moves. Advanced technical screening using 6-criteria analysis.";
    }
    return "AI-powered stock analysis using 6-criteria technical screening for optimal entry and exit points.";
  };

  // Calculate strategy stats
  const strategyStats = {
    totalSignals: signals.length,
    highConfidenceSignals: signals.filter((s) => s.probability >= 0.8).length,
    avgConfidence:
      signals.length > 0
        ? (
            (signals.reduce((sum, s) => sum + s.probability, 0) /
              signals.length) *
            100
          ).toFixed(1)
        : "0",
    recentSignals: signals.filter(
      (s) => new Date(s.scan_timestamp) > new Date(Date.now() - 60 * 60 * 1000)
    ).length,
  };

  return (
    <Card className="min-h-screen bg-background text-foreground mt-6 md:mt-6 p-4 md:p-8 rounded shadow-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => router.back()}
        >
          &larr; Back
        </Button>
        <div className="flex gap-2 md:gap-4">
          <Button variant="default">Download</Button>
          <Button variant="default">Get Today&apos;s picks</Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <span className="inline-block bg-blue-500 rounded-full p-2">
            <Zap className="w-5 h-5 text-white" />
          </span>
          {selectedStrategy || "Breakout Strategy"}
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Live Updates" : "Disconnected"}
            </span>
          </div>

          <Button
            onClick={loadBreakoutSignals}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-base md:text-md mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-gray-700 mb-3">
          {getStrategyDescription(selectedStrategy)}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>
              <b>6-Criteria Analysis:</b> NIFTY 500, EMA, Volume, RSI screening
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>
              <b>Real-time Updates:</b> Every 30 seconds during market hours
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>
              <b>Smart Alerts:</b> High-confidence signals with stop-loss
            </span>
          </div>
        </div>
      </div>

      {/* Strategy Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <div className="text-xs text-gray-400 mb-1">Total Signals (4h)</div>
          <div className="text-2xl font-bold text-blue-600">
            {strategyStats.totalSignals}
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-gray-400 mb-1">High Confidence</div>
          <div className="text-2xl font-bold text-green-600">
            {strategyStats.highConfidenceSignals}
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-gray-400 mb-1">Avg Confidence</div>
          <div className="text-2xl font-bold text-gray-700">
            {strategyStats.avgConfidence}%
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-gray-400 mb-1">Recent (1h)</div>
          <div className="text-2xl font-bold text-orange-600">
            {strategyStats.recentSignals}
          </div>
        </Card>
      </div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Target className="w-6 h-6 text-blue-600" />
        Live Breakout Signals
        <Badge variant="outline" className="ml-2">
          {signals.length} active
        </Badge>
      </h2>

      {/* Breakout Signals Grid */}
      <div className="mb-8">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading breakout signals...</p>
          </div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              No breakout signals found for this strategy
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Signals are generated every 30 seconds during market hours
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {signals.slice(0, 12).map((signal, index) => (
              <BreakoutSignalCard key={signal.id || index} signal={signal} />
            ))}
          </div>
        )}
      </div>
      {/* Real-time Signal Feed */}
      {signals.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Latest Signal Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {signals.slice(0, 8).map((signal, index) => (
                <div
                  key={signal.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getSignalIcon(signal.signal_type)}
                    <div>
                      <span className="font-semibold">{signal.symbol}</span>
                      <div className="text-sm text-gray-500">
                        {new Date(signal.scan_timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ₹{signal.current_price?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(signal.probability * 100).toFixed(1)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
