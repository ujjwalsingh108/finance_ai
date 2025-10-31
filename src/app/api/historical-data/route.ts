import axios from "axios";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force this route to be dynamic (not pre-rendered at build time)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CORS headers helper
function withCORS(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS() {
  return withCORS(new Response(null, { status: 204 }));
}

function getDateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAndStoreBars(
  symbols: string[],
  fromDate: string,
  toDate: string,
  token: string
) {
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (symbol) => {
        try {
          const url = "https://history.truedata.in/getbars";
          const params = {
            symbol,
            from: `${fromDate.slice(2)}T09:00:00`,
            to: `${toDate.slice(2)}T18:30:00`,
            response: "csv",
            interval: "5min",
          };
          const headers = { Authorization: `Bearer ${token}` };
          const resp = await axios.get(url, { params, headers });
          console.log("response received for symbol:", symbol, "-", resp.data);
          const csv = resp.data;
          const lines = csv.split("\n").slice(1); // skip header
          for (const line of lines) {
            const parts = line.split(",");
            if (parts.length >= 6) {
              await supabase.from("historical_prices").upsert(
                [
                  {
                    symbol,
                    date: parts[0].split("T")[0],
                    time: parts[0].split("T")[1],
                    open: Number(parts[1]),
                    high: Number(parts[2]),
                    low: Number(parts[3]),
                    close: Number(parts[4]),
                    volume: Number(parts[5]),
                    open_interest: Number(parts[6]),
                  },
                ],
                { onConflict: "symbol,date" }
              );
            }
          }
        } catch (err) {
          console.error(`Error for symbol ${symbol}:`, err);
        }
      })
    );
    await sleep(1500); // 1.5s delay between batches
  }
}

export async function POST(request: Request) {
  const user = process.env.TRUEDATA_USER;
  const pwd = process.env.TRUEDATA_PASSWORD;
  if (!user || !pwd) {
    return withCORS(
      NextResponse.json(
        { error: "Missing TrueData credentials" },
        { status: 500 }
      )
    );
  }
  let token: string;
  try {
    const { getAuthToken } = await import("@/lib/truedata/api");
    token = await getAuthToken(user, pwd);
  } catch (err) {
    return withCORS(
      NextResponse.json(
        { error: "Failed to get TrueData token", details: String(err) },
        { status: 500 }
      )
    );
  }
  let symbols: string[] = [];
  try {
    const { getAllSymbols } = await import("@/lib/truedata/api");
    const allSymbols = await getAllSymbols(user, pwd, "eq");
    symbols = allSymbols.slice(0, 50).map((s: any) => s.Symbol);
  } catch (err) {
    return withCORS(
      NextResponse.json(
        { error: "Failed to fetch symbols", details: String(err) },
        { status: 500 }
      )
    );
  }
  const toDate = getDateNDaysAgo(0).replace(/-/g, "");
  const fromDate = getDateNDaysAgo(14).replace(/-/g, "");
  await fetchAndStoreBars(symbols, fromDate, toDate, token);
  return withCORS(
    NextResponse.json({
      message: "Data fetch and store complete",
      symbols,
      from: `${fromDate}T09:00:00`,
      to: `${toDate}T18:30:00`,
    })
  );
}
