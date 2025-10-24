import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connections } from "../route";

export async function POST(request: NextRequest) {
  try {
    // Get all current connections
    for (const [id, connection] of connections) {
      // Close the existing connection
      connection.client.disconnect();

      // Remove from connections map
      connections.delete(id);
    }

    return NextResponse.json({
      success: true,
      message: "All connections closed for reconnect",
    });
  } catch (error) {
    console.error("Error in reconnect:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reconnect" },
      { status: 500 }
    );
  }
}
