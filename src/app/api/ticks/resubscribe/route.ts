// Force this route to be dynamic (not pre-rendered at build time)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connections } from "../route";

export async function POST(request: NextRequest) {
  try {
    const resubscribeResults = [];

    // Attempt to resubscribe for all connections
    for (const [id, connection] of connections) {
      try {
        // Get the current subscription list
        const activeSubs = (connection.client as any).activeSubscriptions as
          | Set<string>
          | undefined;
        const symbols = Array.from(activeSubs ?? []);

        // Force a resubscription
        if (symbols.length > 0) {
          (connection.client as any).subscribe(symbols);
          resubscribeResults.push({
            connectionId: id,
            status: "resubscribed",
            symbols,
          });
        } else {
          resubscribeResults.push({
            connectionId: id,
            status: "no_symbols",
          });
        }
      } catch (error) {
        console.error(`Error resubscribing connection ${id}:`, error);
        resubscribeResults.push({
          connectionId: id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Resubscription attempt complete",
      results: resubscribeResults,
    });
  } catch (error) {
    console.error("Error in resubscribe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resubscribe" },
      { status: 500 }
    );
  }
}
