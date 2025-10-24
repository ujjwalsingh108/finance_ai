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
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>TrueData Tick Test</CardTitle>
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
            {error && <div className="text-red-500 mt-2">Error: {error}</div>}
            <div className="mt-4 space-x-4">
              <button
                onClick={handleReconnect}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reconnect
              </button>
              <button
                onClick={handleResubscribe}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resubscribe
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">LTP</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Bid</th>
                  <th className="px-4 py-2">Ask</th>
                  <th className="px-4 py-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                {ticks.map((tick, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(tick.time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">{tick.symbol}</td>
                    <td className="px-4 py-2">{tick.ltp?.toFixed(2) || "-"}</td>
                    <td className="px-4 py-2">{tick.lastTradedQty || "-"}</td>
                    <td className="px-4 py-2">
                      {tick.bestBid?.toFixed(2) || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {tick.bestAsk?.toFixed(2) || "-"}
                    </td>
                    <td className="px-4 py-2">{tick.volume || "-"}</td>
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
