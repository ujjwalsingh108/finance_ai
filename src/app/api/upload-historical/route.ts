import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role to bypass RLS
);

export const runtime = "nodejs"; // Required for file parsing

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read Excel workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Excel file is empty" },
        { status: 400 }
      );
    }

    // --- STEP 1: Upsert Symbols ---
    const symbolsMap = new Map<string, any>();

    rows.forEach((row) => {
      const symbol = row["Ticker"];
      if (!symbol) return;

      if (!symbolsMap.has(symbol)) {
        symbolsMap.set(symbol, {
          symbol,
          name: symbol,
          exchange: "NSE",
          type: "STOCK",
          sector: null,
        });
      }
    });

    const symbolsArray = Array.from(symbolsMap.values());

    if (symbolsArray.length > 0) {
      const { error: symbolError } = await supabase
        .from("symbols")
        .upsert(symbolsArray, { onConflict: "symbol" });

      if (symbolError) {
        console.error(symbolError);
        return NextResponse.json(
          { error: symbolError.message },
          { status: 500 }
        );
      }
    }

    // --- STEP 2: Insert Historical Prices ---
    const priceData = rows
      .filter((row) => row["Ticker"] && row["Date"])
      .map((row) => {
        let formattedDate: string;
        if (typeof row["Date"] === "number") {
          const d = XLSX.SSF.parse_date_code(row["Date"]);
          formattedDate = new Date(d.y, d.m - 1, d.d)
            .toISOString()
            .split("T")[0];
        } else {
          formattedDate = new Date(row["Date"]).toISOString().split("T")[0];
        }

        return {
          symbol: row["Ticker"],
          date: formattedDate,
          time: row["Time"] || null,
          open: parseFloat(row["BuyPrice"]),
          high: Math.max(
            parseFloat(row["BuyPrice"]),
            parseFloat(row["SellPrice"])
          ),
          low: Math.min(
            parseFloat(row["BuyPrice"]),
            parseFloat(row["SellPrice"])
          ),
          close: parseFloat(row["LTP"]),
          buy_qty: row["BuyQty"] ? parseInt(row["BuyQty"], 10) : null,
          sell_qty: row["SellQty"] ? parseInt(row["SellQty"], 10) : null,
          sell_price: row["SellPrice"] ? parseFloat(row["SellPrice"]) : null,
          ltq: row["LTQ"] ? parseInt(row["LTQ"], 10) : null,
          open_interest: row["OpenInterest"]
            ? parseInt(row["OpenInterest"], 10)
            : null,
          volume:
            (row["BuyQty"] ? parseInt(row["BuyQty"], 10) : 0) +
            (row["SellQty"] ? parseInt(row["SellQty"], 10) : 0),
        };
      });

    // Chunk the inserts to avoid hitting payload limits
    const chunkSize = 5000;
    for (let i = 0; i < priceData.length; i += chunkSize) {
      const chunk = priceData.slice(i, i + chunkSize);
      const { error: priceError } = await supabase
        .from("historical_prices")
        .upsert(chunk, {
          onConflict:
            "symbol, date, time, open, high, low, close, volume, buy_qty, sell_qty, sell_price, ltq, open_interest",
        });

      if (priceError) {
        console.error(priceError);
        return NextResponse.json(
          { error: priceError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: `✅ Imported ${symbolsArray.length} symbols and ${priceData.length} historical records`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
