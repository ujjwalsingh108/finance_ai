"use client";

import { useCallback } from "react";

export function useTickControls() {
  const reconnectWebSocket = useCallback(async () => {
    try {
      const response = await fetch("/api/ticks/reconnect", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Reconnection response:", data);
      return data;
    } catch (error) {
      console.error("Error reconnecting:", error);
      throw error;
    }
  }, []);

  const resubscribeSymbols = useCallback(async () => {
    try {
      const response = await fetch("/api/ticks/resubscribe", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Resubscription response:", data);
      return data;
    } catch (error) {
      console.error("Error resubscribing:", error);
      throw error;
    }
  }, []);

  return {
    reconnectWebSocket,
    resubscribeSymbols,
  };
}
