"use client";

import React from "react";
import { AIScreenerSection } from "@/components/screener/AIScreenerSection";
import { Button } from "@/components/ui/button";

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

function handleExcelUpload(file: File) {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  fetch("/api/upload-historical", {
    method: "POST",
    body: formData,
  }).then(() => {
    // Optionally handle response
  });
}

export default function Screener() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    await handleExcelUpload(file);
    setUploading(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Discover Your Next Winning Trades
        </h1>
        <input
          type="file"
          accept=".xlsx,.xls,.NSE"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="default"
          className="mb-4 cursor-pointer"
          onClick={handleButtonClick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Import Stocks"}
        </Button>
        <span className="ml-2 text-xs text-gray-500">
          {fileName ? fileName : "No file chosen"}
        </span>
      </div>
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
