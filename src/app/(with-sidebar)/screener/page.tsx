import React from "react";
import { AIScreenerSection } from "@/components/screener/AIScreenerSection";

const screenerData = [
  {
    title: "Stocks",
    items: [
      {
        label: "Stocks Bullish Tomorrow",
        tags: ["Bullish"],
        symbols: 20,
        image: "/images/stocks-bullish-tomorrow.jpg",
      },
      {
        label: "Stocks Bullish for a Week",
        tags: ["Bullish"],
        symbols: 222,
        image: "/images/stocks-bullish-week.jpg",
      },
      {
        label: "Stocks Bullish for a Month",
        tags: ["Bullish"],
        symbols: 524,
        image: "/images/stocks-bullish-month.jpg",
      },
      {
        label: "Bearish Stocks for Daytrading",
        tags: ["Bearish"],
        symbols: 10,
        image: "/images/stocks-bearish-daytrading.jpg",
      },
    ],
  },
  {
    title: "Cryptos",
    items: [
      {
        label: "Cryptos Bullish Tomorrow",
        tags: ["Bullish"],
        symbols: 7,
        image: "/images/cryptos-bullish-tomorrow.jpg",
      },
      {
        label: "Bearish Cryptos for Daytrading",
        tags: ["Bearish"],
        symbols: 327,
        image: "/images/cryptos-bearish-daytrading.jpg",
      },
      {
        label: "Cryptos Bullish Tomorrow",
        tags: ["Bullish"],
        symbols: 7,
        image: "/images/cryptos-bullish-tomorrow.jpg",
      },
      {
        label: "Bearish Cryptos for Daytrading",
        tags: ["Bearish"],
        symbols: 327,
        image: "/images/cryptos-bearish-daytrading.jpg",
      },
    ],
  },
  {
    title: "ETFs",
    items: [
      {
        label: "Bond ETFs",
        tags: [],
        symbols: 216,
        image: "/images/bond-etfs.jpg",
      },
      {
        label: "ETFs with Bullish Trend",
        tags: ["Bullish"],
        symbols: 68,
        image: "/images/etfs-bullish.jpg",
      },
      {
        label: "Bond ETFs",
        tags: [],
        symbols: 216,
        image: "/images/bond-etfs.jpg",
      },
      {
        label: "ETFs with Bullish Trend",
        tags: ["Bullish"],
        symbols: 68,
        image: "/images/etfs-bullish.jpg",
      },
    ],
  },
  {
    title: "Thematic Investment",
    items: [
      {
        label: "Web3",
        symbols: 18,
        change: "+9.58%",
        image: "/images/web3.jpg",
      },
      {
        label: "AI Beneficiary",
        symbols: 18,
        change: "+2.56%",
        image: "/images/ai-beneficiary.jpg",
      },
      {
        label: "Web3",
        symbols: 18,
        change: "+9.58%",
        image: "/images/web3.jpg",
      },
      {
        label: "AI Beneficiary",
        symbols: 18,
        change: "+2.56%",
        image: "/images/ai-beneficiary.jpg",
      },
    ],
  },
];

export default function Screener() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Discover Your Next Winning Trades</h1>
      {screenerData.map((section, idx) => (
        <AIScreenerSection
          key={idx}
          title={section.title}
          items={section.items}
        />
      ))}
    </div>
  );
}
