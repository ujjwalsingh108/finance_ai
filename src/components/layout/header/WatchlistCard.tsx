import React from "react";
import Image from "next/image";

export interface WatchlistCardProps {
  title?: string;
  items: WatchlistItem[];
  darkMode?: boolean;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  afterChange?: number;
  logo: string;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({
  title = "My Watchlist",
  items,
  darkMode = false,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div
      className={`shadow-2xl border w-full h-full p-4 md:p-6 ${
        darkMode ? "bg-black/90 border-gray-800" : "bg-white border-gray-200"
      }`}
      style={{ overflowY: "auto", minHeight: "100vh" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          {title}
        </h2>
        <button
          className={`${
            darkMode
              ? "text-white/70 hover:text-white"
              : "text-black/70 hover:text-black"
          } text-2xl`}
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-400 mr-2"
        >
          <path d="M3 3v18h18" />
        </svg>
        <span className="text-purple-400 font-semibold">Stocks & ETFs</span>
        <button
          className="ml-auto text-gray-400 hover:text-white"
          onClick={() => setCollapsed((c) => !c)}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={collapsed ? "rotate-180 transition" : "transition"}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <th className="py-2">Symbol</th>
                <th className="py-2">Price</th>
                <th className="py-2">% Change</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: WatchlistItem) => (
                <tr
                  key={item.symbol}
                  className={`border-b last:border-none ${
                    darkMode ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <td className="py-2 flex items-center gap-2">
                    <Image
                      src={item.logo}
                      alt={item.symbol}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-sm ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        {item.symbol}
                      </span>
                      <span
                        className={`text-xs truncate max-w-[120px] ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`py-2 font-semibold text-sm ${
                      darkMode ? "text-white" : "text-black"
                    }`}
                  >
                    ${item.price.toFixed(3)}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold ${
                          item.change < 0 ? "text-red-400" : "text-green-600"
                        }`}
                      >
                        {item.change > 0 ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </span>
                      {typeof item.afterChange === "number" && (
                        <span
                          className={`mt-1 text-xs font-semibold ${
                            item.afterChange < 0
                              ? "text-red-400"
                              : "text-green-600"
                          } ${
                            darkMode
                              ? "bg-gray-800 text-green-400"
                              : "bg-gray-200 text-green-600"
                          } rounded px-1`}
                        >
                          {item.afterChange > 0 ? "+" : ""}
                          {item.afterChange.toFixed(2)}% aft
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WatchlistCard;
