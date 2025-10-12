"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function StockStrategyPage({
  params,
}: {
  params: { symbol: string };
}) {
  const router = useRouter();
  // TODO: Fetch stock data for params.symbol

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
      <h1 className="text-2xl md:text-2xl font-bold flex items-center gap-3 mb-2">
        <span className="inline-block bg-yellow-500 rounded-full p-2">
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black"
          >
            <path d="M13 2v8h8" />
            <path d="M3 12a9 9 0 1 0 9-9" />
          </svg>
        </span>
        AI Stock Picker Strategy
      </h1>
      <div className="text-base md:text-md mb-4">
        <p>
          <b>Every morning at 8 AM EST</b>, check the AI-recommended stocks.
        </p>
        <p>
          <b>Before market open</b>, <span className="text-green-400">buy</span>{" "}
          (bullish) or <span className="text-red-400">short</span> (bearish),
          allocating 20% of funds per stock.
        </p>
        <p>
          <b>Before market close</b>,{" "}
          <span className="text-green-400">sell</span> (bullish) or{" "}
          <span className="text-red-400">buy back</span> (bearish) to complete
          the trade! (exclusively available to Pro, Max and Expert Plan
          subscribers.)
        </p>
        <p>
          Each stock includes a <b>stop-loss</b> price; Exit at the stop-loss
          price if triggered.
        </p>
      </div>
      <h2 className="text-2xl font-bold mb-4">Today&apos;s Top Picks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Example Card - Replace with dynamic data */}
        <Card className="flex flex-col gap-3 rounded-xl p-4 md:p-6 shadow-lg bg-background">
          <div className="flex items-center justify-between mb-2 w-full">
            <div className="flex items-center gap-2">
              {/* Avatar with logo and stock name */}
              <div className="flex items-center gap-2">
                <span className="inline-block">
                  {/* Replace with dynamic src for real data */}
                  <Image
                    src="/images/aigoat_logo_trans.svg"
                    alt="ESTC Logo"
                    width={32}
                    height={32}
                    className="rounded-full bg-white"
                  />
                </span>
                <span className="font-bold text-xs md:text-base text-black dark:text-white">
                  ESTC.N
                </span>
              </div>
            </div>
            <span className="text-green-400 font-bold text-xs md:text-base">
              Bullish
            </span>
          </div>
          <div className="text-xs md:text-sm text-gray-600 mb-2 text-justify">
            Elastic (ESTC) demonstrates bullish potential with increased revenue
            guidance ($1.697B-$1.703B for FY26), ...
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mb-2">
            <div>
              <div className="text-xs text-gray-500">Entry</div>
              <div className="font-bold">$88.92</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Stop Loss</div>
              <div className="font-bold flex items-center gap-1">
                $86.75{" "}
                <Badge className="px-1 py-0 text-xs bg-green-500 text-white">
                  <span>&#10003;</span>
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Current</div>
              <div className="font-bold">$86.48</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Return</div>
              <div className="font-bold text-red-400">-2.44%</div>
            </div>
          </div>
          <Card className="rounded-lg p-2 mt-2 bg-background shadow-lg">
            {/* Example Chart - Replace with real chart */}
            <svg width="100%" height="60" viewBox="0 0 200 60">
              <polyline
                points="0,40 20,35 40,30 60,25 80,30 100,35 120,30 140,25 160,30 180,35 200,30"
                fill="none"
                stroke="#00FFD0"
                strokeWidth="2"
              />
              <circle cx="100" cy="35" r="4" fill="#00FFD0" />
              <path
                d="M110,25 Q120,10 130,25"
                stroke="#00FFD0"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="0"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00FFD0" />
                </marker>
              </defs>
            </svg>
          </Card>
        </Card>
        {/* ...repeat for other cards... */}
      </div>
      <h2 className="text-2xl font-bold mb-4">Strategy Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="rounded-xl p-4 md:p-6 shadow-lg text-center bg-background">
          <div className="text-xs text-gray-400 mb-1">Total Return</div>
          <div className="text-xl md:text-3xl font-bold text-green-400">
            258.74%
          </div>
        </Card>
        <Card className="rounded-xl p-4 md:p-6 shadow-lg text-center bg-background">
          <div className="text-xs text-gray-400 mb-1">Annualized Return</div>
          <div className="text-xl md:text-3xl font-bold text-green-400">
            238.50%
          </div>
        </Card>
        <Card className="rounded-xl p-4 md:p-6 shadow-lg text-center bg-background">
          <div className="text-xs text-gray-400 mb-1">Maximum Drawdown</div>
          <div className="text-xl md:text-3xl font-bold text-red-400">
            -10.78%
          </div>
        </Card>
        <Card className="rounded-xl p-4 md:p-6 shadow-lg text-center bg-background">
          <div className="text-xs text-gray-400 mb-1">Sharpe</div>
          <div className="text-xl md:text-3xl font-bold text-gray-500">
            3.66
          </div>
        </Card>
      </div>
      <Card className="rounded-lg p-2 shadow-lg md:p-4 bg-background">
        {/* Example Performance Chart - Replace with real chart */}
        <svg width="100%" height="120" viewBox="0 0 400 120">
          <polyline
            points="0,100 50,90 100,80 150,70 200,60 250,80 300,100 350,110 400,100"
            fill="none"
            stroke="#00FFD0"
            strokeWidth="3"
          />
          <circle cx="350" cy="110" r="6" fill="#00FFD0" />
        </svg>
      </Card>
    </Card>
  );
}
