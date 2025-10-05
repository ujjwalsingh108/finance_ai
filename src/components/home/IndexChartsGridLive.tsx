"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import React from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function parseYahooChart(apiData: any) {
  if (!apiData?.chart?.result?.[0]) return null;
  const meta = apiData.chart.result[0].meta;
  const timestamps = apiData.chart.result[0].timestamp;
  const prices = apiData.chart.result[0].indicators?.quote?.[0]?.close || [];
  // Build chart data array
  const chartData = (timestamps || [])
    .map((t: number, i: number) => ({
      time: new Date(t * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: prices[i],
    }))
    .filter((d: any) => d.price !== null);
  return {
    value: meta.regularMarketPrice + " " + meta.currency,
    change:
      (meta.regularMarketPrice - meta.previousClose).toFixed(2) +
      " (" +
      (
        ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) *
        100
      ).toFixed(2) +
      "%)",
    high: meta.chartHigh || meta.regularMarketDayHigh || "-",
    low: meta.chartLow || meta.regularMarketDayLow || "-",
    open: meta.regularMarketOpen?.toString() || "-",
    vol: (() => {
      const volumes = apiData.chart.result[0].indicators?.quote?.[0]?.volume;
      if (Array.isArray(volumes) && volumes.length > 0) {
        // Show latest volume value
        return volumes[volumes.length - 1]?.toLocaleString() || "-";
      }
      return (
        meta.regularMarketVolume?.toString() ||
        meta.chartVolume?.toString() ||
        "-"
      );
    })(),
    high52: meta.fiftyTwoWeekHigh || "-",
    low52: meta.fiftyTwoWeekLow || "-",
    chartData,
  };
}

export function IndexChartsGridLive() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: nifty } = useSWR("/api/nifty", fetcher, {
    refreshInterval: 60000,
  });
  const { data: sensex } = useSWR("/api/sensex", fetcher, {
    refreshInterval: 60000,
  });

  const niftyData = parseYahooChart(nifty);
  const sensexData = parseYahooChart(sensex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: "Nifty 50 Index", data: niftyData },
        { title: "Sensex Index", data: sensexData },
      ].map((idx, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">{idx.title}</CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold mr-2">
                {idx.data?.value || "-"}
              </span>
              <span className="text-green-600 font-semibold">
                {idx.data?.change || "-"}
              </span>
            </CardDescription>
          </CardHeader>
          <div className="w-full h-48">
            {idx.data?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={idx.data.chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="time" hide={true} />
                  <YAxis domain={["auto", "auto"]} hide={true} />
                  <Tooltip
                    formatter={(value: number) => value.toFixed(2)}
                    labelFormatter={() => ""}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                No chart data
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 text-xs">
            <div>
              High <span className="font-bold">{idx.data?.high || "-"}</span>
            </div>
            <div>
              Low <span className="font-bold">{idx.data?.low || "-"}</span>
            </div>
            <div>
              Open <span className="font-bold">{idx.data?.open || "-"}</span>
            </div>
            <div>
              Vol{" "}
              <span className="font-bold">
                {idx.data?.vol?.toString() || "-"}
              </span>
            </div>
            <div>
              52wk High{" "}
              <span className="font-bold">{idx.data?.high52 || "-"}</span>
            </div>
            <div>
              52wk Low{" "}
              <span className="font-bold">{idx.data?.low52 || "-"}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
