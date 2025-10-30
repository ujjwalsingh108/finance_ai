"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OHLCVRow {
  symbol: string;
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  open_interest: number;
}

export default function HistoricalAvailabilityPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<OHLCVRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/historical-data", {
        method: "POST",
      });
      const json = await res.json();
      // Parse CSV for each symbol
      const allRows: OHLCVRow[] = [];
      for (const symbol of json.symbols) {
        const csv = json.data[symbol];
        if (typeof csv === "string") {
          const lines = csv.split("\n");
          for (const line of lines.slice(1)) {
            const parts = line.split(",");
            if (parts.length >= 6) {
              allRows.push({
                symbol,
                date: parts[0].split("T")[0],
                time: parts[0].split("T")[1],
                open: Number(parts[1]),
                high: Number(parts[2]),
                low: Number(parts[3]),
                close: Number(parts[4]),
                volume: Number(parts[5]),
                open_interest: Number(parts[6]),
              });
            }
          }
        }
      }
      setRows(allRows);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <Card className="mb-4 p-4">
        <h2 className="text-xl font-bold mb-2">
          NSE EQ 5-Min OHLCV (Last 15 Days)
        </h2>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Open</TableHead>
            <TableHead>High</TableHead>
            <TableHead>Low</TableHead>
            <TableHead>Close</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Open Interest</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.time}</TableCell>
              <TableCell>{row.open}</TableCell>
              <TableCell>{row.high}</TableCell>
              <TableCell>{row.low}</TableCell>
              <TableCell>{row.close}</TableCell>
              <TableCell>{row.volume}</TableCell>
              <TableCell>{row.open_interest}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right">
              Showing {rows.length} rows
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
