// src/app/api/nifty/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl =
    "https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=5m&range=1d";
  const response = await fetch(apiUrl);
  const data = await response.json();
  return NextResponse.json(data);
}
