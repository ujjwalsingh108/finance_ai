"use client";

import { Moon, Sun, Menu } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import WatchlistCard, {
  WatchlistItem,
} from "@/components/layout/header/WatchlistCard";

interface HeaderProps {
  sidebarWidth?: number;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function Header({
  sidebarWidth = 240,
  isMobile = false,
  onMenuClick,
}: HeaderProps) {
  const [showWatchlist, setShowWatchlist] = useState(false);

  // Example watchlist data
  const watchlistItems: WatchlistItem[] = [
    {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 429.83,
      change: -1.42,
      afterChange: 0.03,
      logo: "/images/tsla.png",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 187.62,
      change: -0.67,
      afterChange: 0.03,
      logo: "/images/nvda.png",
    },
    {
      symbol: "MSFT",
      name: "Microsoft...",
      price: 517.35,
      change: 0.31,
      afterChange: -0.08,
      logo: "/images/msft.png",
    },
    {
      symbol: "META",
      name: "Meta Platforms, Inc.",
      price: 710.56,
      change: -2.27,
      afterChange: 0.21,
      logo: "/images/meta.png",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 245.35,
      change: -0.14,
      afterChange: -0.13,
      logo: "/images/googl.png",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com, Inc.",
      price: 219.51,
      change: -1.3,
      afterChange: 0.15,
      logo: "/images/amzn.png",
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 258.02,
      change: 0.35,
      afterChange: -0.05,
      logo: "/images/aapl.png",
    },
  ];
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header
      className={`h-16 flex items-center justify-between px-3 md:px-6 shadow-md fixed top-0 z-40 w-full max-w-full overflow-hidden transition-all duration-300 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
      style={{
        left: isMobile ? 0 : sidebarWidth,
        width: isMobile ? "100vw" : `calc(100vw - ${sidebarWidth}px)`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Menu */}
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-muted/80 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          className={`hidden md:inline-flex px-4 py-2 cursor-pointer rounded-full font-semibold transition whitespace-nowrap ${
            darkMode
              ? "bg-primary text-black hover:bg-blue-300"
              : "bg-primary text-white hover:bg-blue-400"
          }`}
        >
          Download
        </button>
        <button
          className={
            "p-2 md:px-4 md:py-2 rounded-full font-semibold transition cursor-pointer"
          }
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
        <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
        >
          <span className="relative">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-bell"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
          </span>
        </button>
        {/* <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-file"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </button> */}
        <button
          className={`bg-transparent cursor-pointer ${
            darkMode ? "text-white" : "text-black"
          } p-2 rounded-full hover:bg-white/10 transition`}
          onClick={() => setShowWatchlist(true)}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-heart"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </button>
        {/* Watchlist Sheet/Modal using shadcn/ui */}
        <Sheet open={showWatchlist} onOpenChange={setShowWatchlist}>
          <SheetContent
            side="right"
            className="max-w-md w-full p-0 bg-black/90 dark:bg-black/90 border-none"
          >
            <WatchlistCard items={watchlistItems} darkMode={darkMode} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
