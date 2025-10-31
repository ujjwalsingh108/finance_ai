import axios from "axios";

interface TrueDataSymbol {
  Symbol: string;
  SymbolId: string;
  Segment: string;
  ExchCode: string;
  LotSize: number;
  TickSize: number;
  Multiplier: number;
  TokenId: number;
  CompanyName: string;
}

interface TrueDataAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const TRUEDATA_API_BASE = "https://api.truedata.in";
const TRUEDATA_AUTH_BASE = "https://auth.truedata.in";

export async function getAllSymbols(
  user: string,
  password: string,
  segment: "eq" | "fut" | "fo" | "mcx" = "eq"
): Promise<TrueDataSymbol[]> {
  try {
    const response = await axios.get(`${TRUEDATA_API_BASE}/getAllSymbols`, {
      params: {
        user,
        password,
        segment,
        token: true,
      },
    });

    // Log the raw response structure for debugging
    console.log(
      "Raw symbols response structure:",
      typeof response.data,
      response.data?.status
    );

    // Check for the expected response structure
    if (
      response.data?.status !== "Success" ||
      !Array.isArray(response.data?.Records)
    ) {
      console.error("Unexpected response format:", response.data);
      throw new Error("API response is not in expected format");
    }

    // Now we know we have the Records array
    if (response.data.Records.length > 0) {
      // Based on the response format, map array elements to TrueDataSymbol
      const symbols: TrueDataSymbol[] = response.data.Records.filter(
        (item: unknown): item is any[] =>
          Array.isArray(item) && item.length >= 13
      )
        .map((item: any[]) => {
          // Parse based on actual array structure:
          // [tokenId, symbol, segment, isin, exchange, lotSize, _, __, tradingSymbol, displaySymbol, ...]
          const [
            tokenId, // index 0
            symbol, // index 1
            segment, // index 2
            isin, // index 3
            exchange, // index 4
            lotSize, // index 5 // index 6 (unused) // index 7 (unused)
            ,
            ,
            tradingSymbol, // index 8
            displaySymbol, // index 9 // index 10 (unused) // index 11 (unused)
            ,
            ,
            companyName, // index 12
          ] = item;

          return {
            Symbol: tradingSymbol,
            SymbolId: tradingSymbol,
            // Only include equity segment symbols
            Segment: segment === "EQ" ? "NSE_EQ" : segment,
            ExchCode: exchange,
            LotSize: Number(lotSize) || 1,
            TickSize: 0.05,
            Multiplier: 1,
            TokenId: tokenId,
            CompanyName: companyName,
          };
        })
        .filter(
          (sym: TrueDataSymbol) =>
            sym.Segment === "NSE_EQ" && sym.ExchCode === "NSE"
        );

      return symbols;
    }

    console.error(
      "Unexpected response format:",
      Array.isArray(response.data)
        ? "Array of length " + response.data.length
        : typeof response.data
    );
    throw new Error("Unexpected response format from getAllSymbols API");
  } catch (error) {
    console.error("Error fetching symbols:", error);
    throw error;
  }
}

export async function getAuthToken(
  username: string,
  password: string
): Promise<string> {
  try {
    const response = await axios.post<TrueDataAuthResponse>(
      `${TRUEDATA_AUTH_BASE}/token`,
      new URLSearchParams({
        username,
        password,
        grant_type: "password",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
}
