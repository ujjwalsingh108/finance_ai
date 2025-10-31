import { NextResponse } from "next/server";
import { oneMinuteAggregator } from "@/lib/truedata/aggregator";

// Force this route to be dynamic (not pre-rendered at build time)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const status = oneMinuteAggregator.getBarStatus();

    return NextResponse.json({
      success: true,
      activeBars: status.length,
      bars: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting aggregator status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get aggregator status",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Force save all pending bars (useful for testing)
    await oneMinuteAggregator.saveAllPendingBars();

    return NextResponse.json({
      success: true,
      message: "All pending bars saved to database",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving pending bars:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save pending bars",
      },
      { status: 500 }
    );
  }
}
