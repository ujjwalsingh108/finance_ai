// Alternative: Simple Node.js Script for Local/Server Cron
// Use this if you prefer running on your own server with cron
// Run with: node trigger-edge-function.js
// Or add to crontab: */5 * * * * cd /path/to/project && node scripts/trigger-edge-function.js

// For Node.js < 18, install node-fetch: npm install node-fetch
// For Node.js >= 18, fetch is built-in

const SUPABASE_URL = "https://kowxpazskkigzwdwzwyq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3hwYXpza2tpZ3p3ZHd6d3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwNjA2OSwiZXhwIjoyMDcwNDgyMDY5fQ.K6Z9uMXOmAGNKPUN4tKdjFLtqUIJa-KSCe3H1ustti4";

function isWithinTradingHours() {
  // Get current time in IST
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const day = istTime.getDay(); // 0=Sunday, 6=Saturday
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();

  // Check if weekday
  if (day === 0 || day === 6) {
    console.log("⏭️ Skipped: Weekend");
    return false;
  }

  // Check if within trading hours (9:05 AM to 6:30 PM IST)
  if (hour < 9 || hour > 18) {
    console.log(`⏭️ Skipped: Outside trading hours (${hour}:${minute})`);
    return false;
  }

  if (hour === 9 && minute < 5) {
    console.log(`⏭️ Skipped: Before 9:05 AM (${hour}:${minute})`);
    return false;
  }

  if (hour === 18 && minute > 30) {
    console.log(`⏭️ Skipped: After 6:30 PM (${hour}:${minute})`);
    return false;
  }

  return true;
}

async function callEdgeFunction() {
  if (!isWithinTradingHours()) {
    return;
  }

  console.log(`🚀 Calling Edge Function at ${new Date().toISOString()}`);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/auto-fetch-historical`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          trigger: "node_script",
          timestamp: new Date().toISOString(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Edge Function call failed:`, data);
      process.exit(1);
    }

    console.log("✅ Edge Function executed successfully");
    console.log("📊 Summary:", data.summary);

    if (data.errors && data.errors.length > 0) {
      console.log("⚠️ Errors:", data.errors);
    }
  } catch (error) {
    console.error("❌ Error calling Edge Function:", error.message);
    process.exit(1);
  }
}

// Run the function
callEdgeFunction();
