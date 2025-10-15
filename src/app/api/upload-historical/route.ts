import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import AdmZip from "adm-zip";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const zipFile = formData.get("file") as File;

    if (!zipFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await zipFile.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const symbolUpserts: any[] = [];
    const priceUpserts: any[] = [];

    // Track processed symbols to avoid duplicates
    const processedSymbols = new Set<string>();

    for (const entry of entries) {
      if (entry.isDirectory) {
        console.log(`Skipping directory: ${entry.entryName}`);
        continue;
      }

      const ext = path.extname(entry.entryName).toLowerCase();
      if (ext !== ".nse" && ext !== ".csv") {
        console.log(`Skipping non-nse/csv file: ${entry.entryName}`);
        continue;
      }

      // Support nested directories, get symbol from filename
      const symbol = path
        .basename(entry.entryName, ext)
        .split(".")[0]
        .toUpperCase();

      if (processedSymbols.has(symbol)) {
        console.log(
          `Skipping duplicate symbol file for: ${symbol} (${entry.entryName})`
        );
        continue;
      }
      processedSymbols.add(symbol);
      console.log(`Processing symbol: ${symbol} from file: ${entry.entryName}`);

      // Read CSV or Excel
      let rows: any[] = [];
      if (ext === ".csv") {
        const csvString = entry.getData().toString("utf8");
        const workbook = XLSX.read(csvString, { type: "string" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      } else {
        const workbook = XLSX.read(entry.getData(), { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      }
      if (rows.length === 0) {
        console.log(`No rows found in file: ${entry.entryName}`);
        continue;
      }

      // --- SYMBOL upsert ---
      symbolUpserts.push({
        symbol,
        name: symbol,
        exchange: "NSE",
        type: "STOCK",
        sector: null,
      });

      // --- AGGREGATE BY DATE ---
      const dailyMap: Record<
        string,
        {
          open: number | null;
          close: number | null;
          high: number;
          low: number;
          volume: number;
          buyQtyTotal: number;
          sellQtyTotal: number;
          lastTradedQty: number | null;
          lastSellPrice: number | null;
          lastOpenInterest: number | null;
          time: string | null;
        }
      > = {};

      rows.forEach((row, idx) => {
        // Only log if field is truly missing (undefined or null)
        const requiredFields = ["Date", "BuyPrice", "SellPrice"];
        const missing = requiredFields.filter(
          (f) => row[f] === undefined || row[f] === null
        );
        if (missing.length > 0) {
          console.log(
            `Row ${idx} in ${entry.entryName} missing required fields:`,
            row
          );
        }

        // Parse date
        let tradeDate: string | null = null;
        if (typeof row["Date"] === "number") {
          const d = XLSX.SSF.parse_date_code(row["Date"]);
          tradeDate = new Date(d.y, d.m - 1, d.d).toISOString().split("T")[0];
        } else if (row["Date"]) {
          tradeDate = new Date(row["Date"]).toISOString().split("T")[0];
        }
        if (!tradeDate) return;

        if (!dailyMap[tradeDate]) {
          dailyMap[tradeDate] = {
            open: null,
            close: null,
            high: -Infinity,
            low: Infinity,
            volume: 0,
            buyQtyTotal: 0,
            sellQtyTotal: 0,
            lastTradedQty: null,
            lastSellPrice: null,
            lastOpenInterest: null,
            time: null,
          };
        }
        const daily = dailyMap[tradeDate];

        const buy = parseFloat(row["BuyPrice"]) || 0;
        const sell = parseFloat(row["SellPrice"]) || 0;
        const ltp = parseFloat(row["LTP"]) || 0;
        const price = ltp || buy || sell;

        if (daily.open === null) daily.open = price;
        daily.close = price;
        daily.high = Math.max(daily.high, buy, sell, ltp);
        daily.low = Math.min(
          daily.low,
          buy || daily.low,
          sell || daily.low,
          ltp || daily.low
        );

        const buyQty = row["BuyQty"] ? parseInt(row["BuyQty"], 10) : 0;
        const sellQty = row["SellQty"] ? parseInt(row["SellQty"], 10) : 0;
        daily.volume += buyQty + sellQty;
        daily.buyQtyTotal += buyQty;
        daily.sellQtyTotal += sellQty;

        daily.lastTradedQty = row["LTQ"]
          ? parseInt(row["LTQ"], 10)
          : daily.lastTradedQty;
        daily.lastSellPrice = row["SellPrice"]
          ? parseFloat(row["SellPrice"])
          : daily.lastSellPrice;
        daily.lastOpenInterest = row["OpenInterest"]
          ? parseInt(row["OpenInterest"], 10)
          : daily.lastOpenInterest;
        daily.time = row["Time"] || daily.time;
      });

      // Push one upsert per symbol/date
      Object.entries(dailyMap).forEach(([tradeDate, daily]) => {
        priceUpserts.push({
          symbol,
          date: tradeDate,
          open: daily.open,
          high: daily.high,
          low: daily.low,
          close: daily.close,
          volume: daily.volume,
          buy_qty: daily.buyQtyTotal,
          sell_qty: daily.sellQtyTotal,
          sell_price: daily.lastSellPrice,
          ltq: daily.lastTradedQty,
          open_interest: daily.lastOpenInterest,
          time: daily.time,
        });
      });
    }

    // --- Insert Symbols ---
    if (symbolUpserts.length > 0) {
      const { error: symbolError } = await supabase
        .from("symbols")
        .upsert(symbolUpserts, { onConflict: "symbol" });
      if (symbolError) throw symbolError;
    }

    // --- Insert Historical Prices ---
    const chunkSize = 500;
    for (let i = 0; i < priceUpserts.length; i += chunkSize) {
      const chunk = priceUpserts.slice(i, i + chunkSize);
      const { error: priceError } = await supabase
        .from("historical_prices")
        .upsert(chunk, { onConflict: "symbol,date" });
      if (priceError) throw priceError;
    }

    return NextResponse.json({
      message: `✅ Imported ${symbolUpserts.length} symbols and ${priceUpserts.length} daily records`,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
