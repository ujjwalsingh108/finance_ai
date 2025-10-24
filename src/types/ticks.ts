export interface TickData {
  symbol: string;
  lastTradedPrice: number;
  lastTradedTime: string;
  lastTradedQuantity: number;
  avgTradedPrice: number;
  volume: number;
  bestBid: number;
  bestAsk: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  yearlyHighPrice: number;
  yearlyLowPrice: number;
  change: number;
  percentChange: number;
}

export interface TickMessage {
  type: string;
  symbol?: string;
  ltp?: number;
  time?: string;
  timestamp?: string; // Added for 1-minute bar data
  lastTradedQty?: number;
  avgPrice?: number;
  volume?: number;
  bestBid?: number;
  bestAsk?: number;
  bestBidQty?: number;
  bestAskQty?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  openInterest?: number;
  prevOpenInterest?: number;
  turnover?: number;
  sequence?: number;
  dataType?: string; // Added for distinguishing bar vs tick data
  error?: string;
  success?: boolean;
  message?: string;
  reason?: string; // Added for disconnection reasons
}
