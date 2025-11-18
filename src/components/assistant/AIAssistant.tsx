"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  X,
  Send,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BreakoutSignal } from "@/types/breakout-signal";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Hide pulse animation after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm your AI Trading Assistant. I can help you analyze breakout signals and recommend the best stocks based on technical patterns. Ask me anything about the current breakout stocks!",
          timestamp: new Date(),
        },
      ]);
      setShowQuickActions(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchBreakoutSignals = async (): Promise<BreakoutSignal[]> => {
    try {
      const { data, error } = await supabase
        .from("breakout_signals")
        .select("*")
        .gte(
          "created_at",
          new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        )
        .gte("probability", 0.7)
        .order("probability", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching signals:", error);
      return [];
    }
  };

  const analyzeWithAI = async (
    userPrompt: string,
    signals: BreakoutSignal[]
  ) => {
    // Build context from signals
    const signalsContext = signals
      .map((signal, index) => {
        return `${index + 1}. ${signal.symbol}
   - Signal Type: ${signal.signal_type}
   - Confidence: ${(signal.probability * 100).toFixed(1)}%
   - Criteria Met: ${signal.criteria_met}/6
   - Current Price: ₹${signal.current_price?.toFixed(2)}
   - Target: ₹${signal.target_price?.toFixed(2)}
   - Stop Loss: ₹${signal.stop_loss?.toFixed(2)}
   - RSI: ${signal.rsi_value?.toFixed(1)}
   - Volume Ratio: ${signal.volume_ratio?.toFixed(2)}
   - Direction: ${signal.predicted_direction}
   - Daily EMA20: ${signal.daily_ema20?.toFixed(2) || "N/A"}
   - 5min EMA20: ${signal.fivemin_ema20?.toFixed(2) || "N/A"}`;
      })
      .join("\n\n");

    const systemPrompt = `You are an expert technical analyst AI assistant specializing in stock breakout patterns. 
You have access to the following ${signals.length} breakout signals from the last 4 hours:

${signalsContext}

Analyze these signals based on:
- Technical indicators (RSI, EMA, Volume)
- Breakout strength (criteria met, confidence score)
- Risk-reward ratio (target vs stop loss)
- Chart patterns and momentum

Provide clear, actionable recommendations. Be concise but thorough.`;

    // Call your AI API (OpenAI, Anthropic, etc.)
    // For now, return a mock intelligent response
    return generateMockAIResponse(userPrompt, signals);
  };

  // Mock AI response generator (replace with actual AI API call)
  const generateMockAIResponse = (
    prompt: string,
    signals: BreakoutSignal[]
  ): string => {
    const promptLower = prompt.toLowerCase();

    // Find best stocks based on criteria
    const topSignals = signals
      .filter((s) => s.criteria_met >= 5)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    if (
      promptLower.includes("best") ||
      promptLower.includes("recommend") ||
      promptLower.includes("top")
    ) {
      if (topSignals.length === 0) {
        return "Based on current analysis, I don't see any stocks meeting high-confidence criteria (5+ criteria met). Consider waiting for stronger signals.";
      }

      let response = `📊 **Top ${topSignals.length} Breakout Recommendations:**\n\n`;

      topSignals.forEach((signal, index) => {
        const potentialReturn =
          signal.target_price && signal.current_price
            ? (
                ((signal.target_price - signal.current_price) /
                  signal.current_price) *
                100
              ).toFixed(2)
            : "0";

        response += `**${index + 1}. ${signal.symbol}** ${
          signal.signal_type === "BULLISH_BREAKOUT" ? "🟢" : "🔴"
        }\n`;
        response += `   • Confidence: ${(signal.probability * 100).toFixed(
          1
        )}% (${signal.criteria_met}/6 criteria)\n`;
        response += `   • Entry: ₹${signal.current_price?.toFixed(2)}\n`;
        response += `   • Target: ₹${signal.target_price?.toFixed(
          2
        )} (+${potentialReturn}%)\n`;
        response += `   • Stop Loss: ₹${signal.stop_loss?.toFixed(2)}\n`;
        response += `   • Technical: RSI ${signal.rsi_value?.toFixed(
          1
        )}, Volume ${signal.volume_ratio?.toFixed(2)}x\n\n`;
      });

      response += `\n💡 **Analysis:** All recommended stocks show ${
        topSignals[0].signal_type.includes("BULLISH") ? "bullish" : "bearish"
      } momentum with strong technical confirmation.`;

      return response;
    }

    if (
      promptLower.includes("rsi") ||
      promptLower.includes("oversold") ||
      promptLower.includes("overbought")
    ) {
      const oversoldStocks = signals.filter(
        (s) => s.rsi_value && s.rsi_value < 40
      );
      const overboughtStocks = signals.filter(
        (s) => s.rsi_value && s.rsi_value > 60
      );

      return `📈 **RSI Analysis:**\n\n• Oversold stocks (RSI < 40): ${
        oversoldStocks.length === 0
          ? "None"
          : oversoldStocks.map((s) => s.symbol).join(", ")
      }\n• Overbought stocks (RSI > 60): ${
        overboughtStocks.length === 0
          ? "None"
          : overboughtStocks.map((s) => s.symbol).join(", ")
      }\n\n${
        oversoldStocks.length > 0
          ? "Oversold stocks may present buying opportunities."
          : ""
      }`;
    }

    if (promptLower.includes("volume")) {
      const highVolumeStocks = signals
        .filter((s) => s.volume_ratio && s.volume_ratio > 1.5)
        .sort((a, b) => (b.volume_ratio || 0) - (a.volume_ratio || 0))
        .slice(0, 5);

      return `📊 **High Volume Breakouts:**\n\n${highVolumeStocks
        .map(
          (s, i) =>
            `${i + 1}. ${s.symbol}: ${s.volume_ratio?.toFixed(
              2
            )}x average volume`
        )
        .join("\n")}\n\nHigh volume confirms strong breakout momentum.`;
    }

    // Default response
    return `I found ${signals.length} breakout signals. ${
      topSignals.length > 0
        ? `The strongest signal is **${topSignals[0].symbol}** with ${(
            topSignals[0].probability * 100
          ).toFixed(1)}% confidence and ${
            topSignals[0].criteria_met
          }/6 criteria met.`
        : ""
    }\n\nAsk me to:\n• "Show top 3 best stocks"\n• "Analyze RSI levels"\n• "Show high volume breakouts"\n• "What's the best bullish/bearish stock?"`;
  };

  const handleSendMessage = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Fetch current breakout signals
      const signals = await fetchBreakoutSignals();

      if (signals.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't find any breakout signals in the last 4 hours. Please check back during market hours or when new signals are generated.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Analyze with AI
      const aiResponse = await analyzeWithAI(messageText, signals);

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
          {/* Animated Ring Pulse */}
          {showPulse && (
            <>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-50"></div>
            </>
          )}

          <Button
            onClick={() => setIsOpen(true)}
            className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 group transition-all ${
              showPulse ? "animate-bounce" : "hover:scale-110"
            }`}
            size="icon"
          >
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" />
            <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-yellow-300 absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 animate-pulse" />

            {/* Notification Badge */}
            {showPulse && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500 items-center justify-center">
                  <span className="text-[10px] font-bold text-white">!</span>
                </span>
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`fixed bottom-2 right-2 md:bottom-6 md:right-6 shadow-2xl border-2 z-50 flex flex-col transition-all duration-300 p-0 overflow-hidden ${
            isExpanded
              ? "w-[calc(100vw-1rem)] h-[calc(100vh-1rem)] md:w-[700px] md:h-[85vh] md:rounded-lg"
              : "w-[calc(100vw-1rem)] h-[60vh] md:w-[420px] md:h-[550px] md:rounded-lg"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Bot className="h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm md:text-base truncate">
                  AI Trading Assistant
                </h3>
                <p className="text-xs opacity-90 truncate">
                  Breakout Analysis Expert
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 flex-shrink-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 flex-shrink-0"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Messages - Scrollable */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2.5 md:p-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 mb-1 inline-block text-blue-500" />
                    )}
                    <p className="text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                    <span className="text-[10px] md:text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-2.5 md:p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 md:p-4 border-t bg-background flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about breakout stocks..."
                className="min-h-[50px] md:min-h-[60px] resize-none text-xs md:text-sm"
                disabled={isLoading}
                rows={2}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            {showQuickActions && messages.length <= 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => handleQuickAction("Show top 3 best stocks")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isLoading}
                >
                  🏆 Top 3 Stocks
                </Button>
                <Button
                  onClick={() => handleQuickAction("Analyze RSI levels")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isLoading}
                >
                  📊 RSI Analysis
                </Button>
                <Button
                  onClick={() =>
                    handleQuickAction("Show high volume breakouts")
                  }
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isLoading}
                >
                  📈 High Volume
                </Button>
              </div>
            )}

            <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
