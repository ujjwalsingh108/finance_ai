/**
 * 🧪 TEST SCRIPT - Verify Scanner Setup Locally
 *
 * Run this before deploying to check:
 * - Supabase connection
 * - Database tables exist
 * - Historical data available
 * - Technical calculations work
 *
 * Usage:
 *   node test-scanner.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗"
  );
  console.log("║                                                            ║");
  console.log("║         🧪 Breakout Scanner - Test Suite                  ║");
  console.log("║                                                            ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  let passedTests = 0;
  let failedTests = 0;

  // ===============================================
  // Test 1: Environment Variables
  // ===============================================
  console.log("📋 Test 1: Checking environment variables...");

  if (!process.env.SUPABASE_URL) {
    log("   ❌ SUPABASE_URL not found in .env", "red");
    failedTests++;
  } else {
    log(`   ✅ SUPABASE_URL: ${process.env.SUPABASE_URL}`, "green");
    passedTests++;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log("   ❌ SUPABASE_SERVICE_ROLE_KEY not found in .env", "red");
    failedTests++;
  } else {
    log("   ✅ SUPABASE_SERVICE_ROLE_KEY found", "green");
    passedTests++;
  }

  if (failedTests > 0) {
    log(
      "\n❌ Environment variable test failed. Please check your .env file.",
      "red"
    );
    process.exit(1);
  }

  // ===============================================
  // Test 2: Supabase Connection
  // ===============================================
  console.log("\n📡 Test 2: Testing Supabase connection...");

  let supabase;
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    log("   ✅ Supabase client created", "green");
    passedTests++;
  } catch (error) {
    log(`   ❌ Failed to create Supabase client: ${error.message}`, "red");
    failedTests++;
    process.exit(1);
  }

  // ===============================================
  // Test 3: Symbols Table
  // ===============================================
  console.log("\n📊 Test 3: Checking symbols table...");

  try {
    const { data, error } = await supabase
      .from("symbols")
      .select("symbol, name, exchange")
      .eq("exchange", "NSE")
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      log("   ⚠️  Warning: No NSE symbols found in symbols table", "yellow");
      log("      Please populate the symbols table with NSE stocks", "yellow");
      failedTests++;
    } else {
      log(`   ✅ Found ${data.length} NSE symbols (showing first 10)`, "green");
      log(
        `      Sample: ${data
          .slice(0, 3)
          .map((s) => s.symbol)
          .join(", ")}`,
        "blue"
      );
      passedTests++;
    }
  } catch (error) {
    log(`   ❌ Error accessing symbols table: ${error.message}`, "red");
    failedTests++;
  }

  // ===============================================
  // Test 4: Historical Prices Table
  // ===============================================
  console.log("\n📈 Test 4: Checking historical_prices table...");

  try {
    const { data, error } = await supabase
      .from("historical_prices")
      .select("symbol, date, close, volume")
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {
      log("   ⚠️  Warning: No data in historical_prices table", "yellow");
      log("      Scanner needs historical price data to work", "yellow");
      failedTests++;
    } else {
      log(`   ✅ Found historical price data`, "green");
      log(`      Latest: ${data[0].symbol} on ${data[0].date}`, "blue");
      passedTests++;
    }
  } catch (error) {
    log(
      `   ❌ Error accessing historical_prices table: ${error.message}`,
      "red"
    );
    failedTests++;
  }

  // ===============================================
  // Test 5: Breakout Signals Table
  // ===============================================
  console.log("\n🎯 Test 5: Checking breakout_signals table...");

  try {
    const { data, error } = await supabase
      .from("breakout_signals")
      .select("id")
      .limit(1);

    if (error) throw error;

    log("   ✅ breakout_signals table accessible", "green");
    passedTests++;
  } catch (error) {
    log(
      `   ❌ Error accessing breakout_signals table: ${error.message}`,
      "red"
    );
    log("      Please create the table using the schema provided", "yellow");
    failedTests++;
  }

  // ===============================================
  // Test 6: Auto Fetch Logs Table
  // ===============================================
  console.log("\n📝 Test 6: Checking auto_fetch_logs table...");

  try {
    const { data, error } = await supabase
      .from("auto_fetch_logs")
      .select("id")
      .limit(1);

    if (error) throw error;

    log("   ✅ auto_fetch_logs table accessible", "green");
    passedTests++;
  } catch (error) {
    log(`   ❌ Error accessing auto_fetch_logs table: ${error.message}`, "red");
    failedTests++;
  }

  // ===============================================
  // Test 7: Technical Calculations
  // ===============================================
  console.log("\n🧮 Test 7: Testing technical calculations...");

  try {
    // Test EMA calculation
    const prices = [
      100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 110, 111, 109, 112, 114,
      113, 115, 116, 115, 117, 118,
    ];

    const ema = calculateEMA(prices, 20);

    if (ema && ema > 0) {
      log(
        `   ✅ EMA calculation works (20-period EMA: ${ema.toFixed(2)})`,
        "green"
      );
      passedTests++;
    } else {
      log("   ❌ EMA calculation failed", "red");
      failedTests++;
    }
  } catch (error) {
    log(`   ❌ Technical calculation error: ${error.message}`, "red");
    failedTests++;
  }

  // ===============================================
  // Test 8: Test Signal Insert
  // ===============================================
  console.log("\n💾 Test 8: Testing signal insertion...");

  try {
    const testSignal = {
      symbol: "TEST",
      signal_type: "BULLISH_BREAKOUT",
      probability: 0.85,
      criteria_met: 5,
      daily_ema20: 100.5,
      fivemin_ema20: 101.25,
      rsi_value: 65.5,
      volume_ratio: 1.2,
      predicted_direction: "UP",
      target_price: 105.0,
      stop_loss: 99.5,
      confidence: 0.85,
      current_price: 102.0,
      created_by: "test",
      is_public: false,
    };

    const { data, error } = await supabase
      .from("breakout_signals")
      .insert([testSignal])
      .select();

    if (error) throw error;

    log("   ✅ Test signal inserted successfully", "green");
    passedTests++;

    // Clean up test data
    if (data && data[0]) {
      await supabase.from("breakout_signals").delete().eq("id", data[0].id);
      log("   ✅ Test signal deleted", "green");
    }
  } catch (error) {
    log(`   ❌ Signal insertion failed: ${error.message}`, "red");
    log("      Check RLS policies and table permissions", "yellow");
    failedTests++;
  }

  // ===============================================
  // Test 9: Data Quality Check
  // ===============================================
  console.log("\n🔍 Test 9: Checking data quality...");

  try {
    // Check if we have recent data
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from("historical_prices")
      .select("symbol, date")
      .gte("date", threeDaysAgo.toISOString().split("T")[0])
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      log("   ⚠️  Warning: No recent data (last 3 days)", "yellow");
      log(
        "      Scanner needs recent historical data to work properly",
        "yellow"
      );
    } else {
      log(
        `   ✅ Found recent data for ${
          new Set(data.map((d) => d.symbol)).size
        } symbols`,
        "green"
      );
      passedTests++;
    }
  } catch (error) {
    log(`   ⚠️  Could not check data quality: ${error.message}`, "yellow");
  }

  // ===============================================
  // Final Summary
  // ===============================================
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗"
  );
  console.log("║                                                            ║");
  console.log("║                    📊 Test Results                         ║");
  console.log("║                                                            ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  const totalTests = passedTests + failedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(0);

  log(`✅ Passed: ${passedTests}`, "green");
  log(`❌ Failed: ${failedTests}`, failedTests > 0 ? "red" : "green");
  log(
    `📊 Success Rate: ${successRate}%\n`,
    successRate >= 80 ? "green" : "red"
  );

  if (failedTests === 0) {
    log("🎉 All tests passed! You're ready to deploy the scanner.", "green");
    log("\nNext steps:", "blue");
    log("  1. Upload files to DigitalOcean server", "blue");
    log("  2. Run deploy.sh on the server", "blue");
    log("  3. Monitor with: pm2 logs breakout-scanner\n", "blue");
  } else if (failedTests <= 2) {
    log("⚠️  Some tests failed, but scanner might still work.", "yellow");
    log("   Review the errors above and fix if possible.\n", "yellow");
  } else {
    log(
      "❌ Multiple tests failed. Please fix the issues before deploying.",
      "red"
    );
    log("\nCommon issues:", "yellow");
    log("  - Check Supabase credentials in .env", "yellow");
    log("  - Ensure all tables exist in database", "yellow");
    log("  - Populate symbols table with NSE stocks", "yellow");
    log("  - Add historical price data\n", "yellow");
  }
}

// Helper function: Calculate EMA
function calculateEMA(prices, period = 20) {
  if (prices.length < period) return null;

  const multiplier = 2 / (period + 1);
  let ema =
    prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

// Run tests
runTests().catch((error) => {
  console.error("\n❌ Fatal error during tests:", error);
  process.exit(1);
});
