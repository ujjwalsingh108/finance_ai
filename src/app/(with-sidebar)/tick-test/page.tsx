"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTickControls } from "@/hooks/use-tick-controls";

interface TickData {
  type: string;
  symbol: string;
  ltp?: number;
  time: string;
  lastTradedQty?: number;
  avgPrice?: number;
  volume?: number;
  bestBid?: number;
  bestAsk?: number;
}

export default function TickTestPage() {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");
  const [ticks, setTicks] = useState<TickData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      console.log("Initiating connection...");
      setConnectionStatus("Connecting");
      setError(null);

      // Create SSE connection
      eventSource = new EventSource("/api/ticks");

      eventSource.onopen = () => {
        console.log("SSE Connection opened");
        setConnectionStatus("Connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received data:", data);

          if (data.type === "connected") {
            console.log("WebSocket connected with info:", data);
            setConnectionStatus("WebSocket Connected");
          } else if (data.type === "tick") {
            setTicks((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 ticks
          } else if (data.type === "error") {
            console.error("Error from server:", data.error);
            setError(data.error);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
          setError("Error parsing message");
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Connection error:", error);
        setConnectionStatus("Error");
        setError("Connection error");
        eventSource?.close();
      };
    };

    connect();

    // Cleanup
    return () => {
      if (eventSource) {
        console.log("Closing SSE connection");
        eventSource.close();
      }
    };
  }, []);

  const { reconnectWebSocket, resubscribeSymbols } = useTickControls();

  const handleReconnect = async () => {
    try {
      await reconnectWebSocket();
      setError(null);
      setConnectionStatus("Connecting");
    } catch (error) {
      setError("Failed to reconnect");
    }
  };

  const handleResubscribe = async () => {
    try {
      await resubscribeSymbols();
      setError(null);
    } catch (error) {
      setError("Failed to resubscribe");
    }
  };

  return (
    <div className="p-3 md:p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            TrueData Tick Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Status:</strong>{" "}
            <span
              className={
                connectionStatus === "WebSocket Connected"
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {connectionStatus}
            </span>
            {error && (
              <div className="text-red-500 mt-2 text-sm">Error: {error}</div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 md:space-x-4">
              <button
                onClick={handleReconnect}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reconnect
              </button>
              <button
                onClick={handleResubscribe}
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resubscribe
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 md:px-4 py-2 text-left">Time</th>
                  <th className="px-2 md:px-4 py-2 text-left">Symbol</th>
                  <th className="px-2 md:px-4 py-2 text-right">LTP</th>
                  <th className="px-2 md:px-4 py-2 text-right hidden sm:table-cell">
                    Qty
                  </th>
                  <th className="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                    Bid
                  </th>
                  <th className="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                    Ask
                  </th>
                  <th className="px-2 md:px-4 py-2 text-right hidden lg:table-cell">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticks.map((tick, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                      {new Date(tick.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-2 md:px-4 py-2 font-medium">
                      {tick.symbol}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-right">
                      {tick.ltp?.toFixed(2) || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-right hidden sm:table-cell">
                      {tick.lastTradedQty || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                      {tick.bestBid?.toFixed(2) || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-right hidden md:table-cell">
                      {tick.bestAsk?.toFixed(2) || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2 text-right hidden lg:table-cell">
                      {tick.volume || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
